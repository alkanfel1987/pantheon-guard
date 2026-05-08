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

// ─────────────────────────────────────────────
// Trigger patterns — assertions made WITHOUT source/uncertainty
// ─────────────────────────────────────────────

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
// Inhibit patterns — uncertainty markers / named sources
// ─────────────────────────────────────────────

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
// Pack export
// ─────────────────────────────────────────────

export const epistemologyPack = Object.freeze({
  id: 'epistemology',
  version: '0.0.1-scaffold',
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
      condition: hasLogicalLeap,
      check: () => false,
      severity: 'medium',
      message:
        'Logical-leap inference (etymology-by-sound, "прозрачно читается", ' +
        '"подтверждается общим корнем" without regular phonetic correspondence). ' +
        'Source-trace-break pattern (Holiday). Routes to satya + asteya rules.',
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
  }),
});

export {
  hasCertaintyAssertion,
  hasVagueSourceCitation,
  hasLogicalLeap,
  hasUncertaintyMarker,
  hasNamedSource,
  hasInhibitor,
};
