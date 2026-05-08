/**
 * pantheon-guard · epistemology rule pack (v0.0.1-scaffold)
 *
 * Detects epistemic-mode violations beyond the urgency/fear/clickbait axis.
 * Three theoretical anchors:
 *   - Frankfurt's "On Bullshit" — indifference to truth as a regime of speech
 *   - Baudrillard's "Simulacra" — vague citation as simulacrum of a source
 *   - Holiday's "Trust Me, I'm Lying" — broken source-trace cascade
 *
 * Architecture differs from healthcare pack: detection happens via
 * `requirements` (condition + check) rather than `detectionPatterns`,
 * because epistemic violations are context-dependent — the same lexical
 * marker (e.g. "известно, что") is a violation when alone but neutral
 * when accompanied by uncertainty markers ("гипотеза", "(Author, year)").
 *
 * Three detectors, each routed to a mahā-vrata rule via the message field:
 *   1. indifference_to_truth → satya  (Frankfurt)
 *   2. simulacrum_of_source  → asteya (Baudrillard)
 *   3. source_trace_break    → asteya + satya (Holiday)
 *
 * Calibrator override: lowered noise floor and strong-threshold reflect the
 * higher cost of confidently-false epistemic claims (vs marketing copy).
 *
 * Acceptance metric (from test corpus spec):
 *   ≥ 5/5 negative-control pass-rate AND ≥ 4/5 positive-control catch-rate
 *
 * Status: SCAFFOLD. Patterns are seeded from the Shemshuk case study
 * + 5 paired fixtures. Will need expansion before v0.1.0 release.
 */

// JS `\b` only treats [A-Za-z0-9_] as word chars — does NOT match Cyrillic
// boundaries even under `/u`. Use unicode-aware lookbehind/lookahead. Same
// approach as detect-patterns.js / packs/healthcare.js.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');
const W_ANY = '[\\p{L}\\p{N}_]';
const W_STAR = W_ANY + '*';

// ─────────────────────────────────────────────
// Trigger patterns — assertions made WITHOUT source/uncertainty
// ─────────────────────────────────────────────

// catalogue (pattern-array cluster): bg-asuri-epistemology-16-8
// catalogue (pattern-array cluster): bg-asuri-epistemology-16-8
const CERTAINTY_PATTERNS = [
  re('на\\s+самом\\s+деле'),
  re('истин[а-яё]+\\s+в\\s+том,?\\s+что'),
  re('однозначно\\s+следует'),
  re('прямо\\s+сказано'),
  re('это\\s+очевидно'),
  re('общеизвестно'),
  re('бесспорно'),
  re('несомненно'),
  re('тождественн[а-яё]+\\s+(?:английскому|немецкому|латинскому|санскритскому|русскому)'),
  re('факт[а-яё]*\\s+известн[а-яё]+'),
  re('эти?\\s+факты?\\s+известны?'),
  re('эта\\s+истина\\s+известна'),
  re('увидит\\s+истину\\s+сам'),
  re('абсолютно\\s+так\\s+же'),
];

// catalogue (pattern-array cluster): bg-asuri-epistemology-16-8
// catalogue (pattern-array cluster): bg-asuri-epistemology-16-8
const CONSPIRACY_PATTERNS = [
  re('замалчива[ею]т(?:ся)?'),
  re('тщательно\\s+скрыва[ею]тся?'),
  re('(?:наука|научн[а-яё]+\\s+среда|академическ[а-яё]+\\s+(?:наука|среда))\\s+(?:замалчива|игнорир|обходит)[а-яё]*'),
  re('замалчивае?т\\s+эти\\s+факты'),
  re('без\\s+(?:идеологическ[а-яё]+\\s+фильтр[а-яё]*|западных\\s+шор)'),
  re('господствует\\s+иная\\s+парадигма'),
  re('обходит\\s+этот\\s+факт\\s+стороной'),
  re('в\\s+учебниках\\s+(?:не\\s+найд[её]шь|её?\\s+не\\s+найд)[а-яё]*'),
  re('систематически\\s+игнорирую[тя]т?ся'),
  re('по\\s+идеологическим\\s+причинам'),
  re('разрушает\\s+(?:принят[а-яё]+|европоцентрическ[а-яё]+)'),
];

// catalogue (pattern-array cluster): ns-arthantara-5-2-7
// catalogue (pattern-array cluster): ns-arthantara-5-2-7
const VAGUE_SOURCE_PATTERNS = [
  re('древние\\s+(?:тексты|свидетельства|источники)'),
  re('в\\s+ведах\\s+(?:сказано|написано|есть)'),
  re('(?:веды|ведах)\\s+(?:описывают|говорят)'),
  re('согласно\\s+ведам'),
  re('махабхарат[а-яё]+\\s+(?:описывает|говорит)'),
  re('летописи\\s+свидетельствуют'),
  re('санскритские\\s+источники'),
  re('как\\s+известно\\s+из\\s+санскрита'),
  re('известно\\s+(?:тем,?\\s+кто|специалистам)'),
  re('любой\\s+непредвзятый'),
  re('любое\\s+непредвзятое\\s+сравнение'),
  re('вед[ыа]\\s+без\\s+западных\\s+шор'),
  re('известно\\s+тем,?\\s+кто\\s+работает'),
];

// catalogue (pattern-array cluster): ns-jalpa-definition-1-2-2
// catalogue (pattern-array cluster): ns-jalpa-definition-1-2-2
const LEAP_PATTERNS = [
  re('прозрачно\\s+читаются?\\s+по-русски'),
  re('явно\\s+читается\\s+как'),
  re('подтверждается\\s+общим\\s+корнем'),
  re('просто\\s+искажённое\\s+русское'),
  re('по\\s+существу\\s+являются\\s+ветвями\\s+(?:праславянского|русского)'),
  re('(?:это\\s+видно\\s+по\\s+созвучию|видно\\s+по\\s+созвучию)'),
  re('тождественно\\s+(?:английскому|немецкому|латинскому|санскритскому)'),
];

// ─────────────────────────────────────────────
// v0.1.0 — Epistemic closure (M-7) + Ad hominem
// Calibrated against learning-cycle-2026-05-08 N=119 fresh-pull corpus
// (Kotsnews + RIA FN cluster). See LEARNING-CYCLE-2026-05-08-RESULTS.md
// FN-Group 5 (epistemic closure) + FN-Group 6 (ad hominem).
// ─────────────────────────────────────────────

// catalogue: M-7 epistemic-closure markers — pre-conclusion framing where
// observation is presented as confirmation of foregone outcome.
// v0.2.0 (cycle-2.A1) broadens verb-list to cover more parallel constructions.
const EPISTEMIC_CLOSURE_PATTERNS = [
  // "Y ожидаемо ..." — open verb-list (v0.2.0 broadening)
  re(
    'ожидаемо\\s+(?:не\\s+|так\\s+и\\s+|тоже\\s+|и\\s+)?' +
    '(?:ста(?:л|ла|ли|нет|нут)|ста?н(?:ёт|ут)|поступил|повёл|повела|нарушил|выполнил|не\\s+выполнил|остаются?|осталась|остался|осталось|оста(?:ли|вши)сь|остаётся|оказал' + W_STAR + '|оказывается|попал|попала|попали|пришл' + W_STAR + ')'
  ),
  // "закономерно" + outcome verb (v0.2.0 broadening)
  re(
    'закономерно\\s+(?:не\\s+|так\\s+и\\s+|тоже\\s+)?' +
    '(?:ста(?:л|ла|ли)|поступил|нарушил|выполнил|остаются?|оказал' + W_STAR + ')'
  ),
  // "Как и предполагалось / как и ожидалось / как и предсказывалось"
  re('как\\s+и\\s+(?:предполагалось|ожидалось|предсказывалось|предвидел' + W_STAR + ')'),
  // "Сразу возникла мысль / сразу стало ясно / сразу было понятно"
  re('сразу\\s+(?:возникла\\s+мысль|стало\\s+ясно|было\\s+понятно|стало\\s+понятно)'),
  // "Неудивительно, что Y" — closure conjunction
  re('неудивительно,?\\s+что'),
  // v0.2.0 — Parenthetical closure adverb: "Х — ожидаемо — тоже остаются"
  // The em-dash + adverb + em-dash construction is itself the closure mark.
  re('—\\s+(?:ожидаемо|закономерно|неудивительно|очевидно|разумеется)\\s+—'),
];

// catalogue: ad-hominem characterological attacks in political context.
// Differs from documented misconduct (which would name a court/proceeding):
// these are headline-level personal attacks with no factual referent.
const AD_HOMINEM_PATTERNS = [
  // "руки заточены / руки в крови / руки по локоть в крови"
  re('руки\\s+(?:под\\s+\\w+\\s+)?заточен' + W_STAR),
  re('руки\\s+(?:по\\s+локоть\\s+)?в\\s+крови'),
  re('руки\\s+(?:в|на)\\s+(?:взятках|откатах|деньгах)'),
  // "не доверили бы X инструмент / стакан / руль" — composite distrust+object
  re('не\\s+доверил' + W_STAR + '\\s+бы\\s+[А-ЯЁ][а-яё]+(?:у|е|ому)?\\s+(?:инструмент|стакан|руль|нож|оружи)' + W_STAR),
  // "Иуда / предатель / изменник + name" as headline label
  re('(?:иуда|предатель|изменник|перебежчик|подонок|мразь|выродок|холуй|псих|дурак|клоун)\\s+[А-ЯЁ][а-яё]+'),
];

const W_BOUNDARY_DIGIT_OR_PUNCT = '[\\s,.!?:;\\-—()«»"\']';

// ─────────────────────────────────────────────
// v0.3.0-pre.1 — Five Nyāya-jāti detectors (SCAFFOLD)
// Anchored to catalogue.yaml entries from Phase 2 batches 14–16.
// Status: pattern arrays seeded from contemporary_examples + bhāṣya
// glosses. NOT yet real-corpus validated. Real-corpus probe required
// before promotion to v0.3.0 stable. Uses CERTAINTY_PATTERNS-style
// lexical-only matching with optional inhibitor checks.
// Documented limitation: synthetic/manual sanity only — author=tester,
// per CLAUDE.md «empirical verification» discipline.
// ─────────────────────────────────────────────

// catalogue (pattern-array cluster): ns-nityasama-5-1-35
// Naturalization fallacy — turning consistency-of-observation into
// ontological permanence ("X has always been this way → X is immutable").
const NATURALIZATION_PATTERNS = [
  // RU: appeals to immutable essence/nature
  re('человеческ(?:ая|ой|ую)\\s+природ' + W_STAR),
  re('природ[ауые]\\s+человека'),
  re('всегда\\s+так\\s+(?:было|есть|будет|существовал' + W_STAR + ')'),
  re('во\\s+все\\s+времена'),
  re('(?:искони|испокон\\s+веков|с\\s+начала\\s+времён)'),
  re('вечн(?:ая|ой|ый|ое|ые)\\s+(?:проблем' + W_STAR + '|вопрос' + W_STAR + '|истин' + W_STAR + ')'),
  re('неизменн(?:ое|ая|ый|ы[мх])\\s+(?:закон' + W_STAR + '|свойств' + W_STAR + '|качеств' + W_STAR + ')'),
  re('так\\s+устроен(?:ы|\\s+(?:мир|люди|общество))'),
  // EN
  re('human\\s+nature'),
  re('always\\s+been\\s+(?:this|that)\\s+way'),
  re('throughout\\s+history'),
  re('timeless\\s+truth'),
  re('inherent\\s+(?:to|in)\\s+(?:human|man|people)'),
];

// catalogue (pattern-array cluster): ns-avisesa-sama-5-1-23
// catalogue (pattern-array cluster): ns-anityasama-5-1-32
// False equivalence by trivial property — collapsing distinctions via
// universal/trivial shared attribute ("all politicians are the same").
const FALSE_EQUIVALENCE_PATTERNS = [
  re('все\\s+(?:политик|олигарх|чиновник|журналист|корпораци|бизнесмен)' + W_STAR + '\\s+(?:одинаков' + W_STAR + '|одни\\s+и\\s+те\\s+же)'),
  re('обе\\s+(?:стороны|партии)\\s+(?:одинаково|равно)\\s+(?:плох|хорош|виноват|правы)'),
  re('нет\\s+принципиальной\\s+разницы\\s+между'),
  re('по\\s+сути\\s+(?:это\\s+)?одно\\s+и\\s+то\\s+же'),
  re('(?:в\\s+конечном\\s+счёте|в\\s+итоге)\\s+все\\s+(?:одинаков' + W_STAR + '|равн' + W_STAR + ')'),
  re('и\\s+те\\s+и\\s+другие\\s+(?:одинаково\\s+)?(?:плох|хорош|виноват)'),
  // EN
  re('both\\s+sides\\s+(?:are\\s+)?(?:equally|just\\s+as)\\s+(?:bad|good|wrong|guilty)'),
  re('all\\s+(?:politicians|corporations|media|journalists)\\s+(?:are\\s+)?the\\s+same'),
  re('no\\s+real\\s+difference\\s+between'),
];

// catalogue (pattern-array cluster): ns-anupalabdhi-sama-5-1-29
// Argument from absence — treating non-perception as non-existence
// ("I haven't seen X → X doesn't exist") without scope qualifier.
const ABSENCE_ARGUMENT_PATTERNS = [
  re('никто\\s+(?:никогда\\s+)?не\\s+видел'),
  re('нигде\\s+не\\s+(?:показано|доказано|зафиксирован' + W_STAR + ')'),
  re('нет\\s+ни\\s+одного\\s+(?:доказательств|случа|фактическ' + W_STAR + ')'),
  re('ни\\s+один\\s+(?:исследовател|учён|эксперт)' + W_STAR + '\\s+не\\s+(?:обнаружил|подтвердил|нашёл)'),
  re('(?:если\\s+бы\\s+это\\s+было|при\\s+наличии).*мы\\s+бы\\s+(?:знали|видели|обнаружили)'),
  // EN
  re('no\\s+(?:one|body)\\s+has\\s+ever\\s+(?:seen|shown|proven)'),
  re('not\\s+a\\s+single\\s+(?:study|case|piece\\s+of\\s+evidence)'),
  re('absence\\s+of\\s+evidence\\s+(?:proves|means|shows)'),
];

// catalogue (pattern-array cluster): ns-upalabdhi-sama-5-1-27
// Anecdotal override — personal perception used to displace systematic
// argument ("I've seen X with my own eyes, so studies are wrong").
const ANECDOTAL_OVERRIDE_PATTERNS = [
  re('я\\s+(?:сам|лично)\\s+(?:видел|убедил' + W_STAR + '|испытал)'),
  re('своими\\s+(?:глазами|руками)\\s+(?:видел|трогал|проверил)'),
  re('мой\\s+(?:личный\\s+)?опыт\\s+(?:показывает|доказывает|говорит)'),
  re('за\\s+\\d+\\s+(?:лет|года?)\\s+(?:работы|практики)\\s+(?:я\\s+)?(?:не\\s+)?(?:видел|встречал|сталкивал' + W_STAR + ')'),
  re('у\\s+меня\\s+(?:есть\\s+)?знаком(?:ый|ая|ые)\\s+котор(?:ый|ая|ые)'),
  // EN
  re('I\\s+(?:saw|witnessed)\\s+it\\s+(?:myself|with\\s+my\\s+own\\s+eyes)'),
  re('in\\s+my\\s+(?:\\d+\\s+years?\\s+of\\s+)?(?:experience|practice|career)'),
  re('I\\s+have\\s+a\\s+(?:friend|relative|colleague)\\s+who'),
];

// catalogue (pattern-array cluster): ns-apratibha-5-2-18
// Silence-as-concession — treating non-response as proof of guilt/agreement
// without verifying whether silence reflects inability vs strategic refusal.
const SILENCE_AS_CONCESSION_PATTERNS = [
  re('(?:отказ' + W_STAR + '|не\\s+стал' + W_STAR + ')\\s+комментировать[^.]{0,40}(?:что\\s+говорит\\s+(?:само\\s+за\\s+себя|о\\s+мног|обо\\s+всём)|многозначительн' + W_STAR + ')'),
  re('молчани[ея]\\s+(?:в\\s+этом\\s+вопросе\\s+)?(?:говорит\\s+(?:само\\s+за\\s+себя|о\\s+мног)|не\\s+случайн' + W_STAR + ')'),
  re('(?:не\\s+нашёл' + W_STAR + '|не\\s+смог)\\s+(?:что|чего)\\s+ответить\\s*[—,]\\s*(?:значит|следовательно|очевидно)'),
  re('показательно[^.]{0,30}(?:промолчал|отказал' + W_STAR + '\\s+отвеча|воздержал' + W_STAR + ')'),
  // EN
  re('(?:their|his|her)\\s+silence\\s+speaks\\s+volumes'),
  re('declined\\s+to\\s+comment[,\\s]+which\\s+(?:tells|says)'),
  re('failure\\s+to\\s+respond\\s+(?:proves|confirms|shows)'),
];


// ─────────────────────────────────────────────
// Inhibit patterns — uncertainty markers / named sources
// ─────────────────────────────────────────────

// catalogue (pattern-array cluster): ys-satya-pratistha-2-36
// catalogue (pattern-array cluster): ys-satya-pratistha-2-36
const UNCERTAINTY_PATTERNS = [
  re('гипотез[а-яё]+'),
  re('по\\s+реконструкци[а-яё]+'),
  re('допустимо\\s+(?:описывать|считать|полагать)'),
  re('предметом\\s+дискуссии'),
  re('альтернативн[а-яё]+\\s+(?:реконструкц|локализац|интерпретац|объяснени|верси)[а-яё]*'),
  re('продолжа[еюя]т(?:ся)?\\s+обсуждаться'),
  re('консенсус\\s+не\\s+достигнут'),
  re('остаётся\\s+спорн[а-яё]+'),
  re('не\\s+принят[а-яё]+\\s+как'),
  re('вероятн(?:ее|о|ый|ая|ое|ой)'),
  re('предположительно'),
  re('по\\s+(?:их|данной)\\s+аргументации'),
  re('ставит\\s+под\\s+сомнение'),
  re('реконструкция\\s+опирается\\s+на'),
  re('(?:может|могло|могли)\\s+быть\\s+инициирован[а-яё]*'),
];

// catalogue (pattern-array cluster): manu-satya-priya-4-138
// catalogue (pattern-array cluster): manu-satya-priya-4-138
const NAMED_SOURCE_PATTERNS = [
  // Initials + surname: "В. В. Иванов", "Т. В. Гамкрелидзе" — Cyrillic-aware
  /(?<![\p{L}\p{N}_])[А-ЯЁ]\.\s*(?:[А-ЯЁ]\.\s*)?[А-ЯЁ][а-яё]+/u,
  // Western author + year: "Reich et al., 2015", "Firestone et al., 2007"
  /(?<![\p{L}\p{N}_])[A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s+\d{4}(?![\p{L}\p{N}_])/u,
  // Year in parens: "(1974)", "(2007)"
  /\(\s*\d{4}\s*\)/u,
  // Year span: "1500-1200 BCE", "~1500-1200"
  /\d{3,4}[-–]\d{3,4}\s*(?:BCE|CE|BC|AD|до\s+н\.?\s*э\.?)?/u,
  // Specific shloka citation
  /(?<![\p{L}\p{N}_])(?:RV|Бр\.-Уп\.|Бх\.-?Г\.?|БГ)\s*\d+[\.,]\d+/u,
  /(?<![\p{L}\p{N}_])(?:Ригведа|Махабхарата|Бхагавадгита|Бхагавад-Гита|Упанишад[а-яё]+)\s+\d+[\.,]\d+/iu,
  // PIE/Proto-form notation: "*bʰag-", "*gudą"
  /\*[a-zа-яё][a-zа-яёʰːᵇᵈᵍ-]+/iu,
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function anyMatch(text, patterns) {
  return patterns.some((re) => re.test(text));
}

function hasCertaintyAssertion(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, CERTAINTY_PATTERNS) || anyMatch(text, CONSPIRACY_PATTERNS);
}

function hasVagueSourceCitation(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, VAGUE_SOURCE_PATTERNS);
}

function hasLogicalLeap(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, LEAP_PATTERNS);
}

function hasEpistemicClosure(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, EPISTEMIC_CLOSURE_PATTERNS);
}

function hasAdHominem(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, AD_HOMINEM_PATTERNS);
}

function hasUncertaintyMarker(text) {
  return anyMatch(text, UNCERTAINTY_PATTERNS);
}

function hasNamedSource(text) {
  return anyMatch(text, NAMED_SOURCE_PATTERNS);
}

function hasInhibitor(text) {
  return hasUncertaintyMarker(text) || hasNamedSource(text);
}

// ─────────────────────────────────────────────
// v0.3.0-pre.1 — jāti-detector helpers
// ─────────────────────────────────────────────

function hasNaturalizationFrame(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, NATURALIZATION_PATTERNS);
}

function hasFalseEquivalence(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, FALSE_EQUIVALENCE_PATTERNS);
}

function hasAbsenceArgument(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, ABSENCE_ARGUMENT_PATTERNS);
}

function hasAnecdotalOverride(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, ANECDOTAL_OVERRIDE_PATTERNS);
}

function hasSilenceAsConcession(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, SILENCE_AS_CONCESSION_PATTERNS);
}

// Inhibitor for naturalization: temporal qualifier ("в XX веке",
// "в период X-Y") signals the author is bounded-claiming, not
// asserting timeless permanence.
const TEMPORAL_QUALIFIER = [
  /(?<![\p{L}\p{N}_])в\s+\d{2,4}(?:[-–]\d{2,4})?\s+(?:год|век|веке)/iu,
  /(?<![\p{L}\p{N}_])в\s+(?:XV|XVI|XVII|XVIII|XIX|XX|XXI)\s+век/iu,
  /(?<![\p{L}\p{N}_])(?:с|после|до|до\s+начала)\s+(?:периода|эпохи|реформы|войны)/iu,
  /(?<![\p{L}\p{N}_])(?:in|since|after|before)\s+the\s+(?:1[789]\d{2}|20\d{2})/iu,
];

function hasTemporalQualifier(text) {
  return TEMPORAL_QUALIFIER.some((re) => re.test(text));
}

// Inhibitor for absence-argument: scope qualifier (timeframe, methodology)
// signals epistemically-honest framing rather than universal claim.
const SCOPE_QUALIFIER = [
  re('в\\s+(?:рамках|пределах|границах)\\s+(?:исследовани|метод|подход|выборк)' + W_STAR),
  re('по\\s+(?:состояни|данны)' + W_STAR + '\\s+на\\s+\\d{4}'),
  re('согласно\\s+(?:текущим|имеющимся)\\s+данным'),
  re('within\\s+the\\s+(?:scope|limits|bounds)\\s+of'),
  re('to\\s+(?:my|our)\\s+(?:current\\s+)?knowledge'),
  re('as\\s+of\\s+\\d{4}'),
];

function hasScopeQualifier(text) {
  return SCOPE_QUALIFIER.some((re) => re.test(text));
}

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const epistemologyPack = Object.freeze({
  id: 'epistemology',
  version: '0.3.0-pre.1',
  description:
    'Epistemic-mode detection. Catches indifference-to-truth (Frankfurt), ' +
    'simulacrum-of-source (Baudrillard), and source-trace-break (Holiday) ' +
    'patterns that pass through standard fact-check / urgency / fear filters. ' +
    'Detection is context-aware: triggers when certainty assertions / vague ' +
    'sources / logical leaps appear WITHOUT uncertainty markers or named ' +
    'sources. Routes back to mahā-vrata rules satya / asteya.',

  // Detection patterns intentionally empty — epistemology violations are
  // context-dependent and handled via requirements with inhibitor checks.
  detectionPatterns: [],

  requirements: Object.freeze([
    {
      id: 'indifference_to_truth',
      // catalogue: bg-asuri-epistemology-16-8
      // catalogue: bg-asuri-epistemology-16-8
      condition: hasCertaintyAssertion,
      check: hasInhibitor,
      severity: 'medium',
      message:
        'Certainty assertion or hidden-truth conspiracy frame present without ' +
        'uncertainty markers or named sources. Indifference-to-truth pattern ' +
        '(Frankfurt). Routes to satya (truthfulness) rule.',
    },
    {
      id: 'simulacrum_of_source',
      // catalogue: ns-arthantara-5-2-7
      // catalogue: ns-arthantara-5-2-7
      condition: hasVagueSourceCitation,
      check: hasNamedSource,
      severity: 'medium',
      message:
        'Vague-source citation ("древние тексты", "согласно Ведам", ' +
        '"известно специалистам") without specific attribution. ' +
        'Simulacrum-of-source pattern (Baudrillard). Routes to asteya ' +
        '(non-stealing-of-credit / proper attribution) rule.',
    },
    {
      id: 'source_trace_break',
      // catalogue: ns-jalpa-definition-1-2-2
      // catalogue: ns-jalpa-definition-1-2-2
      condition: hasLogicalLeap,
      check: () => false,
      severity: 'medium',
      message:
        'Logical-leap inference (etymology-by-sound, "прозрачно читается", ' +
        '"подтверждается общим корнем" without regular phonetic correspondence). ' +
        'Source-trace-break pattern (Holiday). Routes to satya + asteya rules.',
    },
    {
      id: 'epistemic_closure',
      // catalogue: M-7 (реестр манипулятивных операций)
      condition: hasEpistemicClosure,
      // No inhibitor at v0.1.0 — closure framing is speaker-attributable; if
      // wrapped in named-source quote ("Песков заявил, что Y ожидаемо...") the
      // narrator's frame still applies. Revisit in v0.2.0 if FP-rate > 5%.
      check: () => false,
      severity: 'medium',
      message:
        'Epistemic closure framing — observation presented as confirmation of ' +
        'foregone conclusion ("ожидаемо не стал", "как и предполагалось", ' +
        '"сразу возникла мысль"). M-7 in pantheon-guard manipulation registry. ' +
        'Routes to satya rule (truthfulness via openness to alternatives).',
    },
    {
      id: 'ad_hominem',
      // catalogue: nyaya-hetvabhasa (ad-hominem fallacy class)
      condition: hasAdHominem,
      check: () => false,
      severity: 'medium',
      message:
        'Ad-hominem characterological attack — headline-level personal attack ' +
        'without factual referent ("руки заточены", "Иуда X", "не доверили бы ' +
        'X инструмент"). Differs from documented misconduct (court rulings, ' +
        'named criminal cases). Routes to satya + ahimsa rules.',
    },
    // ─────────────────────────────────────────────
    // v0.3.0-pre.1 — Five Nyāya-jāti detectors (SCAFFOLD, not yet
    // real-corpus validated). See pack metadata for status caveat.
    // ─────────────────────────────────────────────
    {
      id: 'naturalization_fallacy',
      // catalogue: ns-nityasama-5-1-35
      condition: hasNaturalizationFrame,
      check: hasTemporalQualifier,
      severity: 'medium',
      message:
        'Naturalization framing — claim presents persistent observation as ' +
        'ontologically immutable ("человеческая природа", "всегда так было", ' +
        '"human nature"). Without temporal qualifier this is nitya-sama ' +
        '(NS 5.1.35): turning consistency into permanence to block reform ' +
        'arguments. Routes to satya rule.',
    },
    {
      id: 'false_equivalence_levelling',
      // catalogue: ns-avisesa-sama-5-1-23
      // catalogue: ns-anityasama-5-1-32
      condition: hasFalseEquivalence,
      check: () => false,
      severity: 'medium',
      message:
        'False equivalence by trivial levelling — collapsing genuine ' +
        'distinctions via universally-shared property ("все политики ' +
        'одинаковы", "both sides equally bad"). Maps to aviśeṣa-sama ' +
        '(NS 5.1.23): the same reasoning would absurdly level all things. ' +
        'Routes to satya rule.',
    },
    {
      id: 'absence_argument',
      // catalogue: ns-anupalabdhi-sama-5-1-29
      condition: hasAbsenceArgument,
      check: hasScopeQualifier,
      severity: 'medium',
      message:
        'Argument from absence — non-perception treated as proof of ' +
        'non-existence without scope qualifier ("никто не видел", "no one ' +
        'has ever shown"). Maps to anupalabdhi-sama (NS 5.1.29): valid ' +
        'when scope is bounded, fallacious when universal. Routes to satya.',
    },
    {
      id: 'anecdotal_override',
      // catalogue: ns-upalabdhi-sama-5-1-27
      condition: hasAnecdotalOverride,
      check: () => false,
      severity: 'medium',
      message:
        'Anecdotal-perception override — single direct observation used ' +
        'to displace systematic argument ("я сам видел", "in my X years"). ' +
        'Maps to upalabdhi-sama (NS 5.1.27): N=1 perception cannot override ' +
        'inferential evidence-base. Routes to satya rule.',
    },
    {
      id: 'silence_as_concession',
      // catalogue: ns-apratibha-5-2-18
      condition: hasSilenceAsConcession,
      check: () => false,
      severity: 'medium',
      message:
        'Silence-as-concession framing — non-response treated as proof of ' +
        'guilt/agreement without verifying whether silence reflects ' +
        'inability vs strategic refusal. Maps to apratibhā (NS 5.2.18): ' +
        'a procedural defeat-rule from formal vāda misapplied to informal ' +
        'discourse. Routes to satya rule.',
    },
  ]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    theoreticalAnchors: [
      'Frankfurt H. (2005) "On Bullshit"',
      'Baudrillard J. (1981) "Simulacres et Simulation"',
      'Holiday R. (2012) "Trust Me, I\'m Lying"',
    ],
    intendedUse:
      'Layer on top of AI agents producing or reasoning about historical, ' +
      'scientific, religious, or philosophical claims. Edu-tools, research ' +
      'assistants, fact-check pipelines for non-news domains. Catches ' +
      'epistemic-mode violations that pass through urgency/fear/clickbait ' +
      'detection.',
    notIntendedUse:
      'NOT a content-classifier for "true" vs "false" claims. Detects ' +
      'speech regime, not propositional truth. NOT a substitute for ' +
      'fact-check. Does NOT cover non-Russian / non-English; current ' +
      'patterns are RU-leaning by design (Shemshuk corpus origin).',
    coverage: 'scaffold — Russian-leaning patterns, English minimal',
    acceptanceMetric:
      'negative-control pass-rate ≥ 5/5 AND positive-control catch-rate ≥ 4/5 ' +
      '(from EPISTEMOLOGY-PACK-{POSITIVE,NEGATIVE}-CONTROL.md)',
    v030pre1: {
      addedDetectors: [
        'naturalization_fallacy (ns-nityasama-5-1-35)',
        'false_equivalence_levelling (ns-avisesa-sama-5-1-23, ns-anityasama-5-1-32)',
        'absence_argument (ns-anupalabdhi-sama-5-1-29)',
        'anecdotal_override (ns-upalabdhi-sama-5-1-27)',
        'silence_as_concession (ns-apratibha-5-2-18)',
      ],
      status:
        'SCAFFOLD — patterns seeded from contemporary_examples + bhāṣya glosses, ' +
        'NOT real-corpus validated. Per CLAUDE.md «empirical verification» rule, ' +
        'a real-corpus probe is required before promotion to v0.3.0 stable. ' +
        'Author=tester until probe runs.',
    },
  }),
});

export {
  hasCertaintyAssertion,
  hasVagueSourceCitation,
  hasLogicalLeap,
  hasUncertaintyMarker,
  hasNamedSource,
  hasInhibitor,
  hasEpistemicClosure,
  hasAdHominem,
  hasNaturalizationFrame,
  hasFalseEquivalence,
  hasAbsenceArgument,
  hasAnecdotalOverride,
  hasSilenceAsConcession,
  hasTemporalQualifier,
  hasScopeQualifier,
};
