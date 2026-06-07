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
  // iter-2 additions per test-corpus/naturalization-2026-05-09/REPORT.md fixes:
  //   #2 «inherently» adverb (P-EN-03 was a miss in iter-1 probe)
  //   #3 «genetically inborn» (P-EN-06 out-of-scope by design)
  //   #4 «laws of nature that cannot be changed» (long-phrase form)
  re('inherently\\s+(?:selfish|prone|disposed|aggressive|violent|greedy|tribal|hierarchical|competitive|self[\\s-]?interested)'),
  re('genetically\\s+(?:inborn|programmed|wired|determined|hard[\\s-]?wired)'),
  re('laws?\\s+of\\s+(?:human\\s+)?nature\\s+(?:that\\s+)?(?:cannot|can\'?t)\\s+be\\s+(?:changed|altered|reversed)'),
];

// catalogue (pattern-array cluster): ns-avisesa-sama-5-1-23
// catalogue (pattern-array cluster): ns-anityasama-5-1-32
// False equivalence by trivial property — collapsing distinctions via
// universal/trivial shared attribute ("all politicians are the same").
//
// iter-2 fix 2026-05-10 (synthesis FN audit): W_STAR on declension stems +
// EN both → both (sides|parties|teams|camps).
//
// iter-3 broadening 2026-05-10 (LIVE Round-1 FN audit, 5 of 6 FN classes;
// see test-corpus/false-equivalence-LIVE-2026-05-10/REPORT.md):
//   Class 1 — «Both [Named X] and [Named Y] [are] [leveling-predicate]»
//             (P-EN-LIVE-01: "Both the Democrats and the Republicans are vested in...")
//   Class 2 — «(political establishment | governing class | uniparty | the swamp) [verb]»
//             (P-EN-LIVE-02: "The political establishment will initiate...")
//   Class 3 — «both (sides|parties) are [non-canonical leveling predicate]»
//             extending canonical from equally|just-as to dominated by, funded by,
//             owned by, captured by, complicit in, beholden to (P-EN-LIVE-03)
//   Class 4 — cross-party position-flip pattern: «purport/claim/pretend to oppose ...
//             change their minds / reverse course / abandon principles» (P-EN-LIVE-04)
//   Class 5 — position-transformation-by-power: «opposition/stance transforms into
//             support once they ascend to power» (P-EN-LIVE-05)
//   (Class 6 from LIVE-Round-1 — single-actor sentence describing list-membership,
//    P-EN-LIVE-06 — context-loss, NOT a pattern-coverage gap; remains out-of-scope.)
//
// iter-3 also adds the `hasComparativeDivergence` inhibitor (analog of
// hasScopeQualifier for absence_argument). Class-1, Class-2, and Class-3
// patterns are broad enough to false-fire on legitimate substantive
// comparisons — the inhibitor suppresses when the text also contains
// divergence markers («differ», «differs», «while X..., Y diverges»,
// «however», «but ... distinct», «отличаются», «расходятся», «однако»).
// Canonical patterns — narrow, surface-form-specific, fire unconditionally.
// These were the original detector set + iter-2 structural fixes. They have
// near-zero FP risk because they require explicit leveling claims
// («equally bad», «no real difference», «все одинаковы»).
const FALSE_EQUIVALENCE_CANONICAL = [
  // ─── RU canonical ───
  re('все\\s+(?:политик|олигарх|чиновник|журналист|корпораци|бизнесмен)' + W_STAR + '\\s+(?:одинаков' + W_STAR + '|одни\\s+и\\s+те\\s+же|на\\s+одно\\s+лицо)'),
  // v0.3.0-pre.8 cycle-8 RU canonical idiom (feed-2026-05-14)
  // «все X на одно лицо» — common FE idiom missing from pattern
  re('все\\s+(?:политик|олигарх|чиновник|журналист|корпораци|бизнесмен|элит|власт)' + W_STAR + '\\s+на\\s+одно\\s+лицо'),
  re('обе\\s+(?:стороны|партии)\\s+(?:одинаково|равно)\\s+(?:плох' + W_STAR + '|хорош' + W_STAR + '|виноват' + W_STAR + '|прав' + W_STAR + ')'),
  re('нет\\s+принципиальной\\s+разницы\\s+между'),
  re('по\\s+сути\\s+(?:это\\s+)?одно\\s+и\\s+то\\s+же'),
  re('(?:в\\s+конечном\\s+счёте|в\\s+итоге)\\s+все\\s+(?:одинаков' + W_STAR + '|равн' + W_STAR + ')'),
  re('и\\s+те\\s+и\\s+другие\\s+(?:одинаково\\s+)?(?:плох' + W_STAR + '|хорош' + W_STAR + '|виноват' + W_STAR + ')'),
  // ─── EN canonical ───
  re('both\\s+(?:sides|parties|teams|camps)\\s+(?:are\\s+)?(?:equally|just\\s+as)\\s+(?:bad|good|wrong|guilty)'),
  re('all\\s+(?:politicians|corporations|media|journalists)\\s+(?:are\\s+)?the\\s+same'),
  re('no\\s+real\\s+difference\\s+between'),
];

// iter-3 broad patterns — broader semantic FE-rhetoric forms surfaced from
// LIVE Round-1 FN audit (test-corpus/false-equivalence-LIVE-2026-05-10/).
// These are MORE prone to FP on legitimate substantive comparison; they are
// suppressed by `hasComparativeDivergence` (the inhibitor below).
const FALSE_EQUIVALENCE_BROAD = [
  // Class 3 — both [container] + non-canonical leveling predicate (EN)
  re('both\\s+(?:sides|parties|teams|camps)\\s+(?:are\\s+|have\\s+been\\s+)?(?:dominated\\s+by|funded\\s+by|owned\\s+by|captured\\s+by|complicit\\s+(?:in|with)|beholden\\s+to|bought\\s+by|in\\s+the\\s+pocket\\s+of)'),
  // Class 1 — Both [Named X] and [Named Y] + leveling predicate (EN)
  re('both\\s+(?:the\\s+)?[A-Z]\\p{L}+(?:s)?\\s+and\\s+(?:the\\s+)?[A-Z]\\p{L}+(?:s)?\\s+(?:are|have\\s+been)\\s+(?:vested|funded|controlled|owned|dominated|captured|complicit|beholden|bought|in\\s+the\\s+pocket)'),
  // Class 2 — collective-leveling subject + perpetual-claim verb (EN)
  re('(?:the\\s+)?(?:political\\s+(?:establishment|class)|governing\\s+(?:class|elite)|ruling\\s+(?:class|elite)|uniparty|the\\s+swamp|deep\\s+state)\\s+(?:will\\s+(?:never|always)|has\\s+always|have\\s+always|won[\'’]t|cannot|never\\s+(?:will|has|have)|always\\s+(?:has|have))'),
  // Class 4 — pretend-to-oppose + flip-when-in-power (EN). Window extended
  // 80→120 after iter-3 LIVE Round-1 P-EN-LIVE-04 audit (text had 81 chars
  // between «oppose» and «change»; off-by-one miss).
  re('(?:purport|claim|pretend)\\s+to\\s+oppose[^.]{0,120}(?:change\\s+(?:their|its)\\s+(?:mind|minds|tune)|reverse\\s+(?:themselves|course|position)|abandon\\s+(?:their\\s+)?principles|do\\s+the\\s+opposite)'),
  // Class 5 — opposition-transforms-into-support (EN)
  re('(?:opposition|stance|position|principles?)\\s+(?:magically\\s+|conveniently\\s+|suddenly\\s+|always\\s+)?(?:transforms?\\s+into|reverses?\\s+to|flips?\\s+to|becomes?)\\s+(?:vehement\\s+|enthusiastic\\s+|fervent\\s+)?(?:support|backing|approval|advocacy|cheerleading)'),
  // RU collective-leveling (parallel to Class 2)
  re('(?:политическая?\\s+элита|правящ' + W_STAR + '\\s+(?:класс|элита)|номенклатура|обе\\s+(?:сторон|сил)' + W_STAR + ')\\s+(?:всегда|никогда\\s+не|по\\s+сути)'),
];

// Backward-compat: combined array for any external code that imports the symbol.
const FALSE_EQUIVALENCE_PATTERNS = [...FALSE_EQUIVALENCE_CANONICAL, ...FALSE_EQUIVALENCE_BROAD];

// iter-3 inhibitor: comparative-divergence markers. When present, the broader
// (Class 1-3) patterns above are suppressed. Canonical patterns (lines 1-9
// of the array) are NOT suppressed by this inhibitor — those patterns are
// narrow enough to require an actual leveling claim.
const COMPARATIVE_DIVERGENCE_PATTERNS = [
  // EN
  re('(?:differ|differs|differed|differing|diverge|diverges|diverged|diverging)\\s+(?:in|on|over|substantially|sharply|markedly|widely)'),
  re('(?:while|though|whereas|yet)\\s+\\w+[^.]{1,60}(?:differs|differ|distinct|diverge|opposite|contrary)'),
  re('(?:however|nevertheless|nonetheless|in\\s+contrast|by\\s+contrast|on\\s+the\\s+other\\s+hand)'),
  re('(?:substantively|substantially|materially|fundamentally|sharply)\\s+(?:different|distinct|opposed|divergent)'),
  re('(?:but|yet)\\s+(?:their|the)\\s+(?:approach|approaches|methods|priorities|policies|reasons|motivations)\\s+(?:differ|diverge|vary)'),
  // RU
  re('(?:отличаются|отличается|расходятся|расходится|различаются|различается)\\s+(?:в|по|существенно|принципиально|резко)'),
  re('(?:однако|тем\\s+не\\s+менее|напротив|в\\s+отличие\\s+от|в\\s+противоположность)'),
  re('(?:существенно|принципиально|кардинально)\\s+(?:различ|отлич|разн)' + W_STAR),
];

// catalogue (pattern-array cluster): ns-anupalabdhi-sama-5-1-29
// Argument from absence — treating non-perception as non-existence
// ("I haven't seen X → X doesn't exist") without scope qualifier.
// iter-2 fix 2026-05-10 (absence-argument-2026-05-10 probe FN audit):
// (1) Added W_STAR to declension stems доказательств/случа — bare-stem POST
//     blocked declined forms «доказательства / случаи / случаев».
// (2) Extended EN «no\s+(one|body)» → also «nobody|noone» as solid token
//     (no internal whitespace) — original missed «Nobody has ever seen».
const ABSENCE_ARGUMENT_PATTERNS = [
  re('никто\\s+(?:никогда\\s+)?не\\s+видел'),
  re('нигде\\s+не\\s+(?:показано|доказано|зафиксирован' + W_STAR + ')'),
  re('нет\\s+ни\\s+одного\\s+(?:доказательств' + W_STAR + '|случа' + W_STAR + '|фактическ' + W_STAR + ')'),
  re('ни\\s+один\\s+(?:исследовател|учён|эксперт)' + W_STAR + '\\s+не\\s+(?:обнаружил|подтвердил|нашёл)'),
  re('(?:если\\s+бы\\s+это\\s+было|при\\s+наличии).*мы\\s+бы\\s+(?:знали|видели|обнаружили)'),
  // EN
  re('(?:no\\s+(?:one|body)|nobody|noone)\\s+has\\s+ever\\s+(?:seen|shown|proven)'),
  re('not\\s+a\\s+single\\s+(?:study|case|piece\\s+of\\s+evidence)'),
  re('absence\\s+of\\s+evidence\\s+(?:proves|means|shows)'),
  // ─────────────────────────────────────────────
  // v0.3.0-pre.5 — gap-class broadening from feed-2026-05-14 Cycle 2+2b
  // 0/11 catch across Wiki Argument_from_ignorance + Russell teapot (2 indep
  // sources). Synthesis 100% / live 0% — same FE-LIVE-2026-05-10 pattern.
  // Patterns targeted at GAP-CLASS, not specific FNs (cycle-2 trap discipline).
  // ─────────────────────────────────────────────
  // G1a: passive «X has not been proven Y, therefore Z» — single-sentence form
  re('(?:has|have|had)\\s+not\\s+been\\s+(?:proven|proved|shown|demonstrated|established)[^.]{0,60}(?:,\\s+therefore|;\\s+therefore|thus|hence|so\\s+(?:it|that|we|the|p))'),
  // G1b: passive «X has not been proven Y. Therefore Z.» — cross-sentence form
  // Sentence-bounded: end-of-sentence period + Therefore at start of next sentence
  re('(?:has|have|had)\\s+not\\s+been\\s+(?:proven|proved|shown|demonstrated|established)[^.!?]{0,40}[.!?]\\s+(?:Therefore|Thus|Hence)'),
  // G2: «nobody/no one can|could|is able to disprove/prove that there is not»
  re('(?:no(?:body)?|no\\s+one)\\s+(?:can|could|is\\s+able\\s+to|would\\s+be\\s+able\\s+to)\\s+(?:disprove|prove\\s+(?:that\\s+)?there\\s+is\\s+not|refute)'),
  // G3: «cannot be disproved/proven» + inference (passive ad-ignorantiam)
  re('(?:cannot|can\\s*not|can\'?t)\\s+be\\s+(?:disproved|disproven|refuted|falsified)[^.]{0,60}(?:therefore|thus|hence|so\\s+(?:it|that|we))'),
  // G3b: «no way/method/means to disprove/refute/test»
  re('(?:no|zero)\\s+(?:way|method|means|conceivable\\s+experiment)\\s+to\\s+(?:disprove|refute|test\\s+against|falsify)'),
  // G3c: «since X cannot be disproved» — burden-shift «since»-phrasing
  re('since\\s+[^.,!?]{0,60}\\s+cannot\\s+be\\s+(?:disproved|disproven|refuted|falsified)'),
  // G4: «no compelling/good/sufficient evidence that ... therefore» — negated evidence + inference
  re('(?:no|without)\\s+(?:compelling|good|sufficient|conclusive|reliable|solid|strong|hard)\\s+(?:evidence|proof|reason|grounds)\\s+that[^.!?;]{0,80}[;.!?]?\\s*(?:therefore|thus|hence)'),
];

// catalogue (pattern-array cluster): ns-upalabdhi-sama-5-1-27
// Anecdotal override — personal perception used to displace systematic
// argument ("I've seen X with my own eyes, so studies are wrong").
// iter-2 fix 2026-05-10 (anecdotal-override-2026-05-10 probe FN audit):
// (1) RU «за N лет работы»: allow optional modifier-noun between
//     «работы/практики» and the verb («работы хирургом я не видел»).
// (2) RU «у меня есть знакомый который»: allow optional comma between
//     «знаком(ый|ая|ые)» and «котор(ый|ая|ые)» — comma-relative-clause
//     is the natural punctuation in Russian.
// (3) EN «in my N years of <modifier> practice»: allow optional modifier
//     adjective between «of» and «experience|practice|career»
//     («in my 25 years of clinical practice»).
const ANECDOTAL_OVERRIDE_PATTERNS = [
  re('я\\s+(?:сам|лично)\\s+(?:видел|убедил' + W_STAR + '|испытал)'),
  re('своими\\s+(?:глазами|руками)\\s+(?:видел|трогал|проверил)'),
  re('мой\\s+(?:личный\\s+)?опыт\\s+(?:показывает|доказывает|говорит)'),
  // RU clinical-practice override: «за N лет работы [modifier] [я] [не/ни разу не] [verb]»
  // Bug-fix 2026-05-14 feed cycle 3: allow «ни разу не / никогда не» adverbial
  // between subject and verb (P-CAN-09 «я ни разу не сталкивался»).
  re('за\\s+\\d+\\s+(?:лет|года?)\\s+(?:работы|практики)(?:\\s+\\p{L}+)?\\s+(?:я\\s+)?(?:(?:ни\\s+разу|никогда)\\s+)?(?:не\\s+)?(?:видел|встречал|сталкивал' + W_STAR + ')'),
  re('у\\s+меня\\s+(?:есть\\s+)?знаком(?:ый|ая|ые),?\\s+котор(?:ый|ая|ые)'),
  // EN
  re('I\\s+(?:saw|witnessed)\\s+it\\s+(?:myself|with\\s+my\\s+own\\s+eyes)'),
  re('in\\s+my\\s+(?:\\d+\\s+years?\\s+of\\s+(?:\\p{L}+\\s+)?)?(?:experience|practice|career)'),
  re('I\\s+have\\s+a\\s+(?:friend|relative|colleague)\\s+who'),
  // v0.3.0-pre.6 — canonical Wiki anecdotal forms (feed cycle 3, 2026-05-14)
  // EN «I know a/of a person/case who/where» — Wikipedia canonical schematic
  re('I\\s+know\\s+(?:a|of\\s+a)\\s+(?:person|case|guy|woman|man|friend|colleague|family|relative)\\s+(?:who|where)'),
  // EN «my (personal) experience shows/proves/teaches/demonstrates»
  re('my\\s+(?:personal\\s+|own\\s+)?experience\\s+(?:shows|proves|tells|teaches|demonstrates|reveals|confirms)'),
];

// ─────────────────────────────────────────────
// v0.3.0-pre.2 — Pseudo-technical simulacrum (quantum-mysticism subset)
// SCAFFOLD: SYNTHESIS-ONLY against Manovaidya master-spec Раздел 6E test
// cases (5 positives derived from Dispenza-Джо case-study, 2026-05-13).
// LIVE-CORPUS PROBE PENDING. Author=tester per CLAUDE.md empirical-
// verification discipline — promotion to v0.3.0 stable requires real-
// corpus validation against held-out wellness/quantum-spirituality content
// (Becoming Supernatural verbatim chapters, Lipton chapters, Sheldrake
// morphic-field claims) + negative controls (Bohm direct quotes, Penrose-
// Hameroff Orch-OR, Wallace Contemplative Science).
//
// Extension of simulacrum_of_source (Baudrillard) — physics terminology
// used as simulacrum of physics, without operational referent or bridge
// to actual physics. Foundation reference: vault/00-Foundation/
// 08-Coherence-Across-Registers.md §2.2 (anti-bridge B↔F catalogue).
// ─────────────────────────────────────────────

// catalogue (pattern-array cluster): ns-arthantara-5-2-7 (extension)
// Quantum-terminology misused as simulacrum of physics in personal /
// healing / manifestation / wellness context, without operational
// physics-regime referent. Inhibitor: hasNamedSource (existing) catches
// legitimate physics citations with author+year. Inhibitor extension
// (this scaffold): hasFormalPhysicsContext for technical paragraphs.
const QUANTUM_TERMINOLOGY_MISUSE_PATTERNS = [
  // ─── RU ───
  // "квантовое поле" + non-physics action (изменять/настраивать/входить/доступ)
  re('квантов' + W_STAR + '\\s+пол' + W_STAR + '[^.]{0,60}(?:изменя|настраив|вход|доступ|подключ|открыть|открыва|меня|настро)' + W_STAR),
  // Reverse: action + квантовое поле
  re('(?:доступ|подключ|вход|настройк|изменени)' + W_STAR + '\\s+(?:к\\s+)?квантов' + W_STAR + '\\s+пол' + W_STAR),
  // "электромагнитная вибрация/частота/поле" в personal context
  // Bug-fix 2026-05-13 (sanity Case 2): added пол stem — text «электромагнитные поля»
  re('электромагнитн' + W_STAR + '\\s+(?:вибраци|частот|настройк|колебани|пол)' + W_STAR),
  // "повышать/менять/настраивать вибрацию" (без научного контекста)
  re('(?:повыша|повысить|подня|поднять|меня|изменя|настраив|настроить)' + W_STAR + '\\s+(?:свою?\\s+|вашу?\\s+)?вибраци' + W_STAR),
  // "коллапсировать волновую функцию" + personal context
  re('коллапс' + W_STAR + '\\s+волнов' + W_STAR + '\\s+функци' + W_STAR + '[^.]{0,80}(?:намерен|сознани|внимани|мысл|медитаци)' + W_STAR),
  re('(?:намерен|сознани|внимани|мысль|медитаци)' + W_STAR + '[^.]{0,40}(?:коллапсир|схлопыва)' + W_STAR + '\\s+волнов' + W_STAR),
  // ДНК / DNA + изменение через emotion/intention/medication
  // Bug-fix 2026-05-13 (sanity Case 4): broader verb stems —
  // изменил/менял/поменял not matched by «изменя» prefix; switched to
  // (?:из|пере|по)?мен stem with explicit ending alternatives.
  re('(?:(?:из|пере|по)?мен[яеилюо]|трансформ|перепрограмм)' + W_STAR + '\\s+(?:сво[юе]й?\\s+|нашу?\\s+|вашу?\\s+)?(?:днк|днк[а-яё]+|геном|экспресси' + W_STAR + ')[^.]{0,80}(?:намерен|эмоци|мысль|медитаци|вибраци|сознани)' + W_STAR),
  re('(?:намерен|эмоци|мысль|медитаци|вибраци|сознани)' + W_STAR + '[^.]{0,80}(?:(?:из|пере|по)?мен[яеилюо]|трансформ)' + W_STAR + '\\s+(?:сво[юе]й?\\s+|нашу?\\s+|вашу?\\s+)?(?:днк|геном|экспресси)' + W_STAR),
  // "энергетическое поле" + healing
  re('энергетическ' + W_STAR + '\\s+пол' + W_STAR + '[^.]{0,40}(?:исцеля|очища|восстанавлива|трансформ|меня)' + W_STAR),
  // "коллективное сознание" + квантовое влияние (Dispenza meditation events)
  re('коллективн' + W_STAR + '\\s+сознани' + W_STAR + '[^.]{0,80}(?:квантов|волнов|пол' + W_STAR + ')'),
  // "когерентность сердца / сердечная когерентность" БЕЗ HRV-контекста
  re('(?:когерентность\\s+сердца|сердечн' + W_STAR + '\\s+когерентност' + W_STAR + ')[^.]{0,80}(?:электромагнитн|квантов|пол|вибраци|частот|резонанс|трансформ|исцеля)' + W_STAR),
  // "манифестировать через квантовое / поле / намерение"
  re('манифестир' + W_STAR + '[^.]{0,80}(?:квантов|пол|вибраци|сознани|намерен)' + W_STAR),
  // "вибрация изобилия / денег / любви" — manifestation pseudo-physics
  re('вибраци' + W_STAR + '\\s+(?:изобили|денег|любв|здоровь|успех)' + W_STAR),

  // ─── EN ───
  // "quantum field" + access/intention/manifest/heal
  re('quantum\\s+field[^.]{0,60}(?:access|tap\\s+into|connect|enter|change|alter|manifest|heal)'),
  re('(?:access|tap\\s+into|connect\\s+to|enter|manifest\\s+through)\\s+the\\s+quantum\\s+field'),
  // Electromagnetic vibration / frequency in personal context.
  // Bug-fix 2026-05-13 live-probe iter-2: `electromagnetic vibration|frequency`
  // is itself a pop-misuse signature — mainstream physics says «wave» /
  // «oscillation» / «field», never «vibration». Made standalone (no trailing
  // context required). «electromagnetic signature/field» still requires
  // trailing personal-context word — those phrases have legitimate physics uses.
  re('electromagnetic\\s+(?:vibration|frequency)'),
  re('electromagnetic\\s+(?:signature|field)[^.]{0,80}(?:heart|emotion|consciousness|intention|heal|raise|change|vibration|frequency)'),
  // "raise your vibration / frequency"
  // Bug-fix 2026-05-13 live-probe iter-2: raise → raise[sd]? for raises/raised
  // + optional adjective slot between «your» and noun («raises your electromagnetic vibration»)
  re('raise[sd]?\\s+(?:your|the)\\s+(?:\\w+\\s+)?(?:vibration|frequency)'),
  // "collapse the wave function" + personal
  re('collapse\\s+(?:the\\s+)?wave[\\s-]?function[^.]{0,80}(?:intention|consciousness|attention|meditat|observ)'),
  // DNA + intention / emotion / meditation
  re('(?:change|alter|reprogram|transform)\\s+(?:your|our)?\\s+(?:dna|genom|gene\\s+expression)[^.]{0,80}(?:intention|emotion|thought|meditation|vibration)'),
  re('(?:intention|emotion|thought|meditation|vibration)[^.]{0,80}(?:changes?|alters?|reprograms?|transforms?)\\s+(?:your|our)?\\s+(?:dna|gene\\s+expression)'),
  // Energy field + healing
  re('energy\\s+field[^.]{0,40}(?:heal|cleans|restor|transform|chang)'),
  // Heart-coherence + non-HRV pseudoscience extension
  re('heart[\\s-]?(?:brain\\s+)?coherence[^.]{0,80}(?:electromagnetic|quantum|field|vibration|frequency|transform|heal)'),
  // Manifestation through quantum
  re('manifest[^.]{0,40}(?:quantum|field|vibration|frequency|consciousness|intention)'),
  // "vibration of abundance / money / love"
  re('vibration\\s+of\\s+(?:abundance|money|wealth|love|health|success)'),
];

// ─────────────────────────────────────────────
// v0.3.0-pre.4 — Morphic-field simulacrum (Sheldrake-style fringe-biology)
// SCAFFOLD: SYNTHESIS-ONLY against Sheldrake-Руперт.md case-study card +
// Foundation 09 §4.2 (2026-05-13). LIVE-CORPUS PROBE PENDING — promotion
// requires real-corpus validation against Sheldrake verbatim works (A New
// Science of Life, The Presence of the Past) + Sheldrake-followers content
// (sheldrake.org articles, morphic field popularizers), with mainstream
// embryology (Spemann-Mangold organizer, Wolpert positional information,
// modern morphogen literature) as negative controls.
//
// Distinct from pseudo_technical_simulacrum (which targets quantum-vocab
// extraction — regis H pop-quantum-mysticism). This detector targets
// regis G fringe-biology (Sheldrake morphic resonance specifically).
// Both can co-fire on text mixing both registers.
// ─────────────────────────────────────────────

// catalogue (pattern-array cluster): ns-arthantara-5-2-7 (extension)
// Morphic-resonance / morphic-field claims used as if mainstream biology
// (or as extended causal mechanism beyond developmental biology), without
// peer-review citation or operational referent in embryology methodology.
const MORPHIC_FIELD_MISUSE_PATTERNS = [
  // ─── EN ───
  // "morphic resonance" + claim about memory/inheritance/influence
  re('morphic\\s+resonance[^.]{0,80}(?:memory|inherit|influence|guide|shape|transmit|propagate|species|collective)'),
  re('(?:memory|inherit|influence|guide|shape|transmit|propagate|species|collective)[^.]{0,80}morphic\\s+resonance'),
  // "morphic field(s)" + non-embryological action.
  // Bug-fix 2026-05-13 sanity: target tokens need W_STAR for plural forms
  // (attractor → attractors; chreode → chreodes; habit → habits) because
  // POST word-boundary lookahead `(?![\\p{L}\\p{N}_])` rejects trailing 's'.
  re('morphic\\s+field[s]?[^.]{0,80}(?:memory|habit' + W_STAR + '|attractor' + W_STAR + '|chreode' + W_STAR + '|guide|shape|inherit|species|collective)'),
  re('(?:guide|shape|influence|organize|pattern)\\s+(?:by|through|via)\\s+(?:a\\s+)?morphic\\s+field'),
  // Sheldrake-canonical phrases — high specificity
  re('laws?\\s+of\\s+nature\\s+(?:are|become)\\s+(?:more\\s+like\\s+)?habits?'),
  re('habits?\\s+of\\s+nature'),
  // collective memory + species — allow content between (e.g. "from past members of the species")
  re('collective\\s+memory[^.]{0,80}(?:species|family|kind)'),
  re('memory\\s+(?:in|inherent\\s+in)\\s+nature'),
  // Non-local biological resonance
  re('non[\\s-]?local\\s+(?:biological|cellular|species|organismic)\\s+(?:resonance|memory|inherit)'),
  // "morphogenetic field" + memory/inheritance (out of mainstream embryology)
  re('morphogenetic\\s+field[s]?[^.]{0,80}(?:memory|inherit|past|previous|collective|resonance|across\\s+species)'),
  // TV-receiver brain metaphor — Sheldrake-signature.
  // Bug-fix 2026-05-13 sanity: allow comma/clause between «brains» and «are»
  // («brains, which are more like TV receivers»).
  re('brain[s]?[^.]{0,30}(?:are|is)\\s+(?:more\\s+like\\s+)?(?:TV|tv|television|radio)\\s+receiver' + W_STAR),
  re('(?:memory|consciousness)\\s+(?:is\\s+|need\\s+)?not\\s+(?:be\\s+)?stored\\s+in\\s+(?:material\\s+)?(?:traces|brain' + W_STAR + ')'),

  // ─── RU ───
  // «морфическ(ое|ий|ая) поле/резонанс» + claim
  re('морфическ' + W_STAR + '\\s+(?:поле|резонанс|резонанса)[^.]{0,80}(?:памят|наследов|влия|формир|направля|передач|вид)' + W_STAR),
  re('(?:памят|наследов|влия|формир|направля|передач)' + W_STAR + '[^.]{0,80}морфическ' + W_STAR + '\\s+(?:поле|резонанс)'),
  // «законы природы — это привычки»
  // Bug-fix 2026-05-13 sanity: «—» AND «это» both can be present
  // («законы природы — это скорее привычки»); replaced explicit alternation
  // with permissive [^.]{0,30} between «природы» and «привычк».
  re('закон[ыов]?\\s+природы[^.]{0,30}привычк' + W_STAR),
  re('привычк' + W_STAR + '\\s+природы'),
  // «коллективная память вида»
  re('коллективн' + W_STAR + '\\s+памят' + W_STAR + '\\s+(?:вида|видов|рода)'),
  // «нелокальная биологическая резонанс»
  re('нелокальн' + W_STAR + '\\s+(?:биологическ|видов|клеточн)' + W_STAR + '\\s+(?:резонанс|памят)' + W_STAR),
  // «мозг — приёмник» Sheldrake metaphor
  re('мозг\\s+(?:—|это|как)\\s+(?:скорее\\s+)?(?:теле|TV|тв|радио)?\\s*приёмник'),
  re('памят' + W_STAR + '\\s+не\\s+(?:храни|стор)' + W_STAR + '\\s+в\\s+мозг' + W_STAR),
];

// Inhibitor — mainstream embryology / developmental biology context.
// Spemann-Mangold organizer (Nobel 1935), Wolpert positional information
// (1969), morphogen gradients, gene expression — these are legitimate
// embryology and should NOT trigger morphic-field detector.
const MAINSTREAM_EMBRYOLOGY_PATTERNS = [
  // Named mainstream embryologists / concepts
  re('(?:Spemann|Mangold|Spemann[\\-–]Mangold|Wolpert|Turing|Gurdon|Nüsslein[\\-–]Volhard)'),
  re('(?:positional\\s+information|gradient[\\s-]?signaling|morphogen[\\s-]?gradient)'),
  re('(?:induction\\s+experiment|organizer\\s+experiment|fate\\s+map)'),
  re('(?:induct(?:ion|ive)\\s+signal[s]?|signaling\\s+pathway[s]?)'),
  re('(?:gene\\s+expression\\s+pattern|expression\\s+assay|in\\s+situ\\s+hybridization)'),
  // RU
  re('(?:Шпеман|Мангольд|организатор\\s+Шпемана|Уолперт|Тьюринг)'),
  re('(?:позиционн' + W_STAR + '\\s+информ|градиент' + W_STAR + '\\s+(?:сигнал|морфоген))'),
  re('(?:индукционн' + W_STAR + '\\s+эксперимент|карт' + W_STAR + '\\s+судьб' + W_STAR + ')'),
];

// Inhibitor extension — formal physics-context markers. When present
// alongside quantum-mysticism patterns, suppress (text is technical
// physics discussion, not quantum-mysticism).
const FORMAL_PHYSICS_CONTEXT_PATTERNS = [
  // Specific physics formalism
  re('(?:уравнени[ея]|формул[а-яё]+)\\s+(?:Шрёдингера|Дирака|Гамильтона|Шредингера)'),
  re('(?:Schr(?:ö|oe|o)dinger|Dirac|Hamiltonian|Heisenberg)\\s+equation'),
  re('(?:eigenstate|eigenvalue|eigenfunction|собственн' + W_STAR + '\\s+(?:состояни|значени|функци))' + W_STAR),
  re('(?:decoherence|декогеренц' + W_STAR + ')'),
  re('(?:Hilbert\\s+space|гильбертов' + W_STAR + '\\s+пространств' + W_STAR + ')'),
  // Legitimate quantum-foundations work
  re('(?:Penrose[\\-\\s]?Hameroff|Orch[\\-\\s]?OR)'),
  re('(?:Aspect\\s+experiment|эксперимент' + W_STAR + '\\s+Аспек)'),
  re('(?:Bell[\'’]?s?\\s+(?:inequality|theorem)|неравенств' + W_STAR + '\\s+Белла|теорем' + W_STAR + '\\s+Белла)'),
  re('(?:Bohm[\'’]?s?\\s+(?:interpretation|implicate\\s+order|holomovement)|интерпретаци' + W_STAR + '\\s+Бом)'),
  // Common physics-paper anchors
  re('(?:согласно\\s+)?(?:квантовой\\s+(?:механике|теории\\s+поля|электродинамике)|quantum\\s+(?:mechanics|field\\s+theory|electrodynamics))'),
];

// catalogue (pattern-array cluster): ns-apratibha-5-2-18
// Silence-as-concession — treating non-response as proof of guilt/agreement
// without verifying whether silence reflects inability vs strategic refusal.
// iter-2 fix 2026-05-10 (silence-as-concession-2026-05-10 probe FN audit):
// 5 RU FN structural fixes — EN was 100% on iter-1, no EN changes.
// (1) Refusal+signal Pattern 1: extended verb to «комментировать|отвечать»
//     («отказался отвечать» also occurs); widened window 40→60; added
//     reverse word order «что [phrase] говорит» (P-RU-01 had «что само за
//     себя говорит», pattern only had forward «что говорит само за себя»).
// (2) Silence-говорит Pattern 2: replaced fixed «в этом вопросе» slot with
//     general optional modifier (any chars up to 40, non-period) between
//     «молчание» and signal-phrase. Plus reverse word order.
// (3) Не-нашёл-ответить Pattern 3: replaced bare «нашёл + W_STAR» with stem
//     «наш + W_STAR» so it catches all gender/number forms (нашла/нашли/
//     нашло). Replaced rigid adjacency «ответить\\s*[—,]\\s*signal» with
//     «ответить[^.]{0,40}signal» so modifier between (e.g. «на запрос
//     журналистов») does not break the match.
const SILENCE_AS_CONCESSION_PATTERNS = [
  re('(?:отказ' + W_STAR + '|не\\s+стал' + W_STAR + ')\\s+(?:комментировать|отвечать)[^.]{0,60}(?:что\\s+(?:говорит\\s+(?:само\\s+за\\s+себя|о\\s+мног' + W_STAR + '|обо\\s+всём)|(?:само\\s+за\\s+себя|о\\s+мног' + W_STAR + '|обо\\s+всём)\\s+говорит)|многозначительн' + W_STAR + ')'),
  // RU «молчание...говорит о многом» — bug-fix 2026-05-14 cycle 4: «о мног» needed W_STAR
  // to match «о многом» (POST word-boundary blocked bare stem from matching «о многом»).
  re('молчани[ея][^.]{0,40}?(?:говорит\\s+(?:само\\s+за\\s+себя|о\\s+мног' + W_STAR + ')|(?:само\\s+за\\s+себя|о\\s+мног' + W_STAR + ')\\s+говорит|не\\s+случайн' + W_STAR + ')'),
  // RU «не нашли что ответить значит/следовательно» — bug-fix 2026-05-14 cycle 4:
  // tolerate comma between «нашли» and «что» («не нашли, что ответить»).
  re('(?:не\\s+наш' + W_STAR + '|не\\s+смог' + W_STAR + ')[\\s,]+(?:что|чего)\\s+ответить[^.]{0,40}(?:значит|следовательно|очевидно)'),
  re('показательно[^.]{0,30}(?:промолчал|отказал' + W_STAR + '\\s+отвеча|воздержал' + W_STAR + ')'),
  // EN
  re('(?:their|his|her)\\s+silence\\s+speaks\\s+volumes'),
  re('declined\\s+to\\s+comment[,\\s]+which\\s+(?:tells|says)'),
  re('failure\\s+to\\s+respond\\s+(?:proves|confirms|shows)'),
  // v0.3.0-pre.7 — canonical EN «silence/refusal is itself X» (cycle 4 gap-class)
  re('(?:silence|refusal|non[\\s-]?response)\\s+(?:on|to|in)?[^.!?]{0,30}\\s+is\\s+(?:itself\\s+)?(?:a|the)\\s+(?:confession|admission|answer|proof|acknowledgment)'),
  re('(?:that\\s+)?(?:refusal|silence)\\s+itself\\s+is\\s+(?:a|the)\\s+(?:answer|confession|proof|admission)'),
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
  // Canonical patterns fire unconditionally — narrow surface forms with
  // near-zero FP risk («equally bad», «no real difference», «все одинаковы»).
  if (anyMatch(text, FALSE_EQUIVALENCE_CANONICAL)) return true;
  // iter-3 broad patterns require the comparative-divergence inhibitor
  // to be ABSENT — else legitimate substantive comparison would FP.
  if (anyMatch(text, FALSE_EQUIVALENCE_BROAD) && !anyMatch(text, COMPARATIVE_DIVERGENCE_PATTERNS)) {
    return true;
  }
  return false;
}

// iter-3 helper: detect substantive divergence markers («differ», «while X..., Y diverges»,
// «однако», «отличаются»). Suppresses Class 1-3 broad patterns when
// the text actually compares-and-distinguishes rather than levels.
function hasComparativeDivergence(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, COMPARATIVE_DIVERGENCE_PATTERNS);
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

// v0.3.0-pre.2 — Pseudo-technical simulacrum (quantum-mysticism)
function hasQuantumMysticism(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, QUANTUM_TERMINOLOGY_MISUSE_PATTERNS);
}

function hasFormalPhysicsContext(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, FORMAL_PHYSICS_CONTEXT_PATTERNS);
}

// Composite inhibitor — either named source (existing) OR formal physics
// context. When EITHER present, suppress quantum-mysticism firing.
function hasQuantumLegitimacyMarker(text) {
  return hasNamedSource(text) || hasFormalPhysicsContext(text);
}

// v0.3.0-pre.4 — Morphic-field simulacrum helpers
function hasMorphicFieldMisuse(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, MORPHIC_FIELD_MISUSE_PATTERNS);
}

function hasMainstreamEmbryologyContext(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return anyMatch(text, MAINSTREAM_EMBRYOLOGY_PATTERNS);
}

// Composite inhibitor for morphic-field: named source (Sheldrake citation
// by proper attribution is fine — third-party reportage) OR mainstream
// embryology context (Spemann, Wolpert, morphogen — legitimate biology).
function hasMorphicFieldLegitimacyMarker(text) {
  return hasNamedSource(text) || hasMainstreamEmbryologyContext(text);
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
  version: '0.3.0-pre.8',
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
    // ─────────────────────────────────────────────
    // v0.3.0-pre.2 — Pseudo-technical simulacrum (quantum-mysticism subset)
    // SCAFFOLD: SYNTHESIS-ONLY against Manovaidya master-spec Раздел 6E
    // (Dispenza-derived 5 cases, 2026-05-13). Real-corpus probe pending.
    // Foundation reference: vault/00-Foundation/08-Coherence-Across-Registers.md
    // ─────────────────────────────────────────────
    {
      id: 'pseudo_technical_simulacrum',
      // catalogue: ns-arthantara-5-2-7 (extension of simulacrum_of_source)
      condition: hasQuantumMysticism,
      check: hasQuantumLegitimacyMarker,
      severity: 'medium',
      message:
        'Pseudo-technical simulacrum — physics terminology (quantum field, ' +
        'electromagnetic vibration, wave-function collapse, DNA expression ' +
        'via intention) used in personal/healing/manifestation context ' +
        'without operational referent in physics regime, without named ' +
        'source, and without formal physics anchor (Schrödinger, Hilbert ' +
        'space, Bohm interpretation, Penrose-Hameroff). Quantum-mysticism ' +
        'subset of simulacrum-of-source (Baudrillard) — physics simulates ' +
        'itself as authority while disconnected from physics method. ' +
        'Routes to asteya (false attribution) + satya (truthfulness) rules.',
    },
    // ─────────────────────────────────────────────
    // v0.3.0-pre.4 — Morphic-field simulacrum (Sheldrake-style fringe-biology)
    // SCAFFOLD: SYNTHESIS-ONLY. Foundation 09 §4.2 + Шелдрейк-Руперт.md.
    // Live-corpus probe pending (Sheldrake verbatim + mainstream embryology
    // negatives).
    // ─────────────────────────────────────────────
    {
      id: 'morphic_field_simulacrum',
      // catalogue: ns-arthantara-5-2-7 (regis G extension)
      condition: hasMorphicFieldMisuse,
      check: hasMorphicFieldLegitimacyMarker,
      severity: 'medium',
      message:
        'Morphic-field simulacrum — Sheldrake-style fringe-biology claims ' +
        '("morphic resonance", "habits of nature", "collective memory of ' +
        'species", "brain as TV receiver") used without named source ' +
        'attribution AND without mainstream embryology context (Spemann, ' +
        'Wolpert, morphogen gradients). Subset of simulacrum-of-source ' +
        '(Baudrillard) — biology terminology used as causal mechanism ' +
        'beyond mainstream developmental biology methodology. Note: ' +
        'proper Sheldrake attribution ("Sheldrake (1981) proposed...") ' +
        'is inhibited by named-source check. Routes to asteya + satya.',
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
        'naturalization_fallacy (ns-nityasama-5-1-35) — EN release-candidate (probe 2026-05-09: catch 63.6% [35.4%, 84.8%], FP 0%, N=11 EN live)',
        'false_equivalence_levelling (ns-avisesa-sama-5-1-23, ns-anityasama-5-1-32) — iter-3 SHIP 2026-05-10 (Option B). Synthesis 100% canonical + 6 broad patterns (Class 1-5 + RU collective) + hasComparativeDivergence inhibitor. Live training-set catch 66.7% (4/6 Round-1) / FP 0% on N=20 combined held-out negatives. Tier 2 — Tier 1 BLOCKED (Round-2 surfaced 0 held-out positives in fetchable sources; manual-curated corpus needed). See test-corpus/false-equivalence-LIVE-iter3-2026-05-10/REPORT.md',
        'absence_argument (ns-anupalabdhi-sama-5-1-29) — synthesis-validated 2026-05-10 (iter-1 catch 83.3%, iter-2 post-fix 100% same-corpus, FP 0%, inhibitor 100% specific, N=12 pos / 14 neg synthesis-leaning); LIVE-CORPUS PROBE PENDING',
        'anecdotal_override (ns-upalabdhi-sama-5-1-27) — synthesis-validated 2026-05-10 (iter-1 catch 75.0%, iter-2 post-fix 100% same-corpus, FP 0%, N=12 pos / 12 neg synthesis-leaning); LIVE-CORPUS PROBE PENDING',
        'silence_as_concession (ns-apratibha-5-2-18) — synthesis-validated 2026-05-10 (iter-1 catch 58.3% RU-broken / iter-2 post-fix 100% same-corpus, FP 0%, N=12 pos / 12 neg synthesis-leaning); LIVE-CORPUS PROBE PENDING',
      ],
      status:
        'MIXED — naturalization_fallacy passed EN real-corpus probe 2026-05-09 ' +
        '(test-corpus/naturalization-2026-05-09/), promoted to EN release-candidate. ' +
        'RU evidence is synthesis-only and does not constitute external validation; ' +
        'iter-2 needs RU live corpus before bilingual stable claim. Other 4 ' +
        'detectors remain pre.1 scaffold awaiting individual probes.',
      naturalizationProbeResult: {
        date: '2026-05-09',
        report: 'test-corpus/naturalization-2026-05-09/REPORT.md',
        catch_en_live: '63.6% [35.4%, 84.8%] (N=11)',
        fp_en_live: '0.0% [0.0%, 35.4%] (N=7)',
        fp_ru_live: '0.0% [0.0%, 43.4%] (N=5)',
        catch_ru_synthesis: '100% [51.0%, 100%] (N=4 SYNTHESIS-CANONICAL — not external validation)',
        status: 'PROMOTE_PARTIAL — EN release-candidate; RU pending',
        iter2: 'PARTIAL APPLIED 2026-05-09 — added «inherently» adverb + «genetically inborn» + «laws of nature cannot be changed» patterns. Still pending: 8-10 RU live-corpus op-ed positives + fresh held-out probe (cycle-2 trap protection — no tuning on existing corpus).',
      },
      silenceAsConcessionProbeResult: {
        date: '2026-05-10',
        report: 'test-corpus/silence-as-concession-2026-05-10/REPORT.md',
        synthesis_flag: 'POSITIVE-CLASS-SYNTHESIS — paraphrase-of-canonical-political-commentary-and-discreditation framings; NOT external validation',
        catch_iter1: '58.3% [32.0%, 80.7%] (7/12 — pre-fix; below 60% threshold — first probe in series to require non-optional iter-2)',
        catch_iter2: '100.0% [75.7%, 100%] (12/12 — post-fix, same corpus)',
        fp_both: '0.0% [0.0%, 24.3%] (0/12 negatives — including legal-restraint and neither-confirm-nor-deny stress-cases)',
        en_catch_iter1_iter2: '100% / 100% (no EN changes needed — RU patterns only)',
        ru_catch_iter1: '16.7% [3.0%, 56.4%] (1/6 — broken)',
        ru_catch_iter2: '100% [61.0%, 100%] (6/6 after 5 RU pattern fixes)',
        iter2_fix: 'Five RU pattern repairs from FN audit, not corpus-fit tuning. Pattern 1 (refusal+signal): extended verb комментировать → комментировать|отвечать, widened window 40→60, added reverse word order «что [phrase] говорит». Pattern 2 (silence-говорит): replaced fixed «в этом вопросе» slot with general modifier slot, added reverse word order. Pattern 3 (не-нашёл-ответить): replaced bare нашёл + W_STAR with stem наш + W_STAR (catches all gender/number forms), replaced rigid adjacency with flexible 40-char modifier window.',
        status: 'PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required before stable claim',
        next: 'iter-3 live-corpus probe — substack op-eds + Twitter/X accusatory threads + RU TG political channels (positives); Reuters/AP/Interfax neutral reportage with «declined to comment» framings (negatives, FP stress-test); target N=20 pos / N=15 neg.',
      },
      anecdotalOverrideProbeResult: {
        date: '2026-05-10',
        report: 'test-corpus/anecdotal-override-2026-05-10/REPORT.md',
        synthesis_flag: 'POSITIVE-CLASS-SYNTHESIS — paraphrase-of-canonical-alt-med-and-experience-trumps-data forum commentary; NOT external validation',
        catch_iter1: '75.0% [46.8%, 91.1%] (9/12 — pre-fix)',
        catch_iter2: '100.0% [75.7%, 100%] (12/12 — post-fix, same corpus)',
        fp_both: '0.0% [0.0%, 24.3%] (0/12 negatives)',
        en_catch_iter2: '100% [61.0%, 100%] (N=6 EN synthesis)',
        ru_catch_iter2: '100% [61.0%, 100%] (N=6 RU synthesis)',
        iter2_fix: 'Three structural pattern repairs from FN audit, not corpus-fit tuning. (1) RU «за N лет работы»: allow optional modifier-noun between «работы/практики» and verb («работы хирургом я не видел»). (2) RU «у меня есть знакомый который»: allow optional comma between знаком- and котор- (comma-relative-clause is natural Russian). (3) EN «in my N years of <modifier> practice»: allow optional modifier adjective between «of» and noun («of clinical practice»).',
        status: 'PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required before stable claim',
        next: 'iter-3 live-corpus probe — workplace-review forums + parenting forums + alt-med TG archives; target N=20 pos / N=15 neg.',
      },
      absenceArgumentProbeResult: {
        date: '2026-05-10',
        report: 'test-corpus/absence-argument-2026-05-10/REPORT.md',
        synthesis_flag: 'POSITIVE-CLASS-SYNTHESIS — paraphrase-of-canonical-conspiracy-commentary; NOT external validation',
        catch_iter1: '83.3% [55.2%, 95.3%] (10/12 — pre-fix)',
        catch_iter2: '100.0% [75.7%, 100%] (12/12 — post-fix, same corpus)',
        fp_both: '0.0% [0.0%, 21.5%] (0/14 — comparative + bounded)',
        inhibitor_specificity_iter2: '100% (8/8 inhibitor-active on bounded class)',
        inhibitor_false_suppression: '0.0% (0/12 positives wrongly inhibited)',
        en_catch_iter2: '100% [61.0%, 100%] (N=6 EN synthesis)',
        ru_catch_iter2: '100% [61.0%, 100%] (N=6 RU synthesis)',
        iter2_fix: 'Structural pattern repair from FN audit, not corpus-fit tuning. (1) Added W_STAR to declension stems доказательств/случа in нет-ни-одного pattern — bare-stem POST blocked Russian declined forms. (2) Extended EN no\\s+(one|body) → also nobody/noone solid-token forms.',
        test_consequence: 'Updated test/packs-jati-pre1.test.js assertion: bounded text now correctly raw-fires (inhibitor architecture demonstration) — test rewritten to assert effective-behavior contract instead of raw-false.',
        status: 'PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required before stable claim',
        next: 'iter-3 live-corpus probe — alt-med forums + conspiracy substacks (EN) + anti-vaccine TG archives (RU); target N=20 pos / N=15 neg.',
      },
      v030pre2_addedDetector: 'pseudo_technical_simulacrum (ns-arthantara-5-2-7 extension) — quantum-mysticism subset of simulacrum-of-source. Calibration corpus: test-corpus/quantum-mysticism-2026-05-13/. pre.3 promoted 2026-05-13 after live probe: 3/3 in-scope catch + 0/8 FP on Bohm+Penrose-Hameroff+HeartMath verbatim. pre.4 sibling detector morphic_field_simulacrum added (see below).',
      v030pre4_addedDetector: 'morphic_field_simulacrum (ns-arthantara-5-2-7 regis G extension) — Sheldrake-style fringe-biology subset of simulacrum-of-source. SCAFFOLD: SYNTHESIS-ONLY against Foundation 09 §4.2 + Шелдрейк-Руперт.md case study (2026-05-13). Calibration corpus: test-corpus/morphic-field-2026-05-13/. LIVE-CORPUS PROBE PENDING — Sheldrake verbatim (A New Science of Life, sheldrake.org articles) positives + mainstream embryology (Spemann-Mangold, Wolpert positional information, Nüsslein-Volhard) negatives. Inhibitor uses hasNamedSource (proper Sheldrake attribution OK) OR hasMainstreamEmbryologyContext.',
      falseEquivalenceProbeResult: {
        date: '2026-05-10',
        synthesis_report: 'test-corpus/false-equivalence-2026-05-10/REPORT.md',
        live_report: 'test-corpus/false-equivalence-LIVE-2026-05-10/REPORT.md',
        iter3_report: 'test-corpus/false-equivalence-LIVE-iter3-2026-05-10/REPORT.md',
        synthesis_catch_iter2: '100.0% (14/14 post-fix synthesis, regression preserved through iter-3)',
        live_catch_baseline_iter2_patterns: '0.0% (0/6) — selection-bias trap exposed',
        live_catch_iter3_training: '66.7% [30.0%, 90.3%] (4/6 Round-1 — TRAINING-SET, patterns designed from these FNs)',
        fp_iter3_combined: '0.0% [0.0%, 16.1%] (0/20 combined Round-1 12 + Round-2 NEW 8 — held-out FP-stress passed)',
        round2_held_out_positives_surfaced: 0,
        round2_held_out_negatives_surfaced: 8,
        path_taken: 'Option B (lexical broadening) — chose 2026-05-10 after architectural review. iter-3 added 6 broad patterns + hasComparativeDivergence inhibitor.',
        iter3_classes: [
          'Class 1 — Both [Named X] and [Named Y] + leveling predicate (caught P-EN-R1-01)',
          'Class 2 — collective-leveling subject (political establishment etc.) + perpetual-claim verb (caught when «will never/always | has always | will not | cannot»; misses pure «will [action]» — acceptable narrow scope)',
          'Class 3 — both (sides|parties|teams|camps) + non-canonical leveling predicate (caught P-EN-R1-03)',
          'Class 4 — pretend-to-oppose flip with window 0,120 (caught P-EN-R1-04 after off-by-one window fix)',
          'Class 5 — opposition transforms into support (caught P-EN-R1-05)',
          'Out-of-scope — single-actor sentence whose FE meaning comes from article-level context (P-EN-R1-06; sentence-level detection limit, not pattern bug)',
        ],
        inhibitor: 'hasComparativeDivergence — suppresses broad patterns when text contains substantive divergence markers («differ», «while X..., Y», «однако», «отличаются»). Canonical patterns NOT suppressed. Confirmed working: 0 FP on Brookings «both leaders» negative, 0 FP on Vedomosti «различными частями» negative.',
        status: 'TIER 2 (iter-3 broadened) — SHIPS to v0.3.0-pre.2. Tier 1 promotion BLOCKED — held-out positive corpus required. Acceptable claim: "synthesis 100% canonical + iter-3 broadening 66.7% training-verified + 0% FP on N=20 combined live negatives". Honest scope: "live-validated catch unknown until manual-curated held-out positives available".',
        live_corpus_finding: 'Round-2 7 fetches surfaced 0 NEW positives in non-paywalled fetchable open-web sources. Either FE-rhetoric is genuinely rarer than narrative suggests, OR densest sources (Reddit r/Centrism, Telegram political, paywalled substacks) are CSP/paywall-blocked.',
        next_phase: 'Manual-curated held-out positive corpus (10-15 verbatim FE samples beyond Round-1 sources) — owner-involvement work, not autonomous WebFetch.',
      },
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
  hasComparativeDivergence,
  hasQuantumMysticism,
  hasFormalPhysicsContext,
  hasQuantumLegitimacyMarker,
  hasMorphicFieldMisuse,
  hasMainstreamEmbryologyContext,
  hasMorphicFieldLegitimacyMarker,
};
