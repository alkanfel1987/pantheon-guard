/**
 * pantheon-guard · detect-patterns
 *
 * Deterministic pattern detection for manipulative text.
 *
 * v0.1 uses regex heuristics tuned against Russian and English marketing
 * vocabulary. v0.2 will replace this with a trained classifier — see
 * BENCHMARK.md in the project source-of-truth folder. The function returns
 * an object with the same boolean keys consumed by `checkMahavrata`'s
 * `action.contains` block, so patterns flow into Mahā-vrata cleanly.
 *
 * Why regex first: deterministic, zero dependencies, no model card to
 * publish, no inference latency, easy to audit. Trade-off: lower recall on
 * paraphrased manipulation. Acceptable for v0.1, replaced in v0.2.
 *
 * Note on Cyrillic: JavaScript's `\b` only treats [A-Za-z0-9_] as word
 * characters. We use Unicode-aware lookbehind/lookahead with `\p{L}\p{N}`
 * under the `u` flag so word boundaries work for Russian text too.
 */

// Unicode-aware "word boundary": non-letter/digit on either side, or string edge.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';

const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

// ─────────────────────────────────────────────
// Russian patterns
// ─────────────────────────────────────────────
const URGENCY_RU = re('сроч(?:но|ный|ная|ное)|сейчас|немедленно|только сегодня|последний шанс|до полуночи|до конца дня|осталось мало|не упусти(?:ть)?');
const FEAR_RU = re('потеряете|пожалеете|упустите|не успеете|останетесь без|пропадёт|катастроф\\w*|обвал|кризис');
const CLICKBAIT_RU = re('секрет|шок|никто не знает|скрывают|то,? о чём молчат|разоблач\\w*|раскрыт\\w*');
const SCARCITY_RU = re('только \\d+|осталось \\d+ ?(?:мест|штук)|последн(?:ие|их) \\d+');

// ─────────────────────────────────────────────
// English patterns (\b works fine for ASCII)
// ─────────────────────────────────────────────
const URGENCY_EN = /\b(?:hurry|urgent|right now|today only|last chance|expires|deadline|don'?t miss|act now|limited time)\b/i;
const FEAR_EN = /\b(?:regret|miss out|fall behind|left behind|too late|lose everything|disaster|collapse)\b/i;
const CLICKBAIT_EN = /\b(?:secret|nobody knows|the one thing|they don'?t want you|shocking|exposed|revealed)\b/i;
const SCARCITY_EN = /\b(?:only \d+ left|\d+ spots left|last \d+|while supplies last)\b/i;

/**
 * Inspect text for known manipulation patterns.
 *
 * The returned shape matches the `action.contains` keys consumed by
 * {@link checkMahavrata}, so the typical pipeline is:
 *
 *   const contains = detectPatterns(text);
 *   const result = checkMahavrata({ text, urgency, paused, contains });
 *
 * @param {string} text — text to inspect
 * @returns {{
 *   falseUrgency: boolean,
 *   fearBased: boolean,
 *   clickbait: boolean,
 *   manipulation: boolean
 * }}
 */
export function detectPatterns(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return {
      falseUrgency: false,
      fearBased: false,
      clickbait: false,
      manipulation: false,
    };
  }

  const falseUrgency =
    URGENCY_RU.test(text) ||
    URGENCY_EN.test(text) ||
    SCARCITY_RU.test(text) ||
    SCARCITY_EN.test(text);

  const fearBased =
    FEAR_RU.test(text) ||
    FEAR_EN.test(text);

  const clickbait =
    CLICKBAIT_RU.test(text) ||
    CLICKBAIT_EN.test(text);

  // "manipulation" is a meta-flag — true when at least two manipulation
  // signals fire together. A single urgency word in a benign sentence
  // ("act now to confirm your booking") shouldn't trip the meta-flag.
  const signalCount = [falseUrgency, fearBased, clickbait].filter(Boolean).length;
  const manipulation = signalCount >= 2;

  return { falseUrgency, fearBased, clickbait, manipulation };
}

// ─────────────────────────────────────────────
// v0.2 calibrated detector — collects evidence per pattern, exposes
// raw markers for the calibrator. Backward compatible: it does not
// change the shape of `detectPatterns`.
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  { flag: 'falseUrgency', name: 'urgency_ru',   re: URGENCY_RU },
  { flag: 'falseUrgency', name: 'urgency_en',   re: URGENCY_EN },
  { flag: 'falseUrgency', name: 'scarcity_ru',  re: SCARCITY_RU },
  { flag: 'falseUrgency', name: 'scarcity_en',  re: SCARCITY_EN },
  { flag: 'fearBased',    name: 'fear_ru',      re: FEAR_RU },
  { flag: 'fearBased',    name: 'fear_en',      re: FEAR_EN },
  { flag: 'clickbait',    name: 'clickbait_ru', re: CLICKBAIT_RU },
  { flag: 'clickbait',    name: 'clickbait_en', re: CLICKBAIT_EN },
]);

/**
 * Calibrated v0.2 detector.
 *
 * Returns the same boolean keys as {@link detectPatterns} for compatibility,
 * plus per-flag confidence in [0, 1], evidence markers explaining which
 * sub-patterns fired, and an `abstain` flag set when the input is too
 * short or too weak to support any honest claim.
 *
 * The calibration logic lives in `calibrator.js` and is replaceable —
 * BENCHMARK.md will fit it to ground truth in v0.3.
 *
 * @param {string} text — text to inspect
 * @returns {{
 *   flags: { falseUrgency: boolean, fearBased: boolean, clickbait: boolean, manipulation: boolean },
 *   confidence: { falseUrgency: number, fearBased: number, clickbait: number, manipulation: number },
 *   evidence: { falseUrgency: string[], fearBased: string[], clickbait: string[] },
 *   abstain: boolean,
 *   reason: string|null
 * }}
 */
export function detectPatternsCalibrated(text) {
  // Lazy import to avoid circular dependency surprises in some bundlers.
  // eslint-disable-next-line global-require
  // (calibrator has zero deps on detect-patterns, so this is only stylistic.)
  const empty = {
    flags: { falseUrgency: false, fearBased: false, clickbait: false, manipulation: false },
    confidence: { falseUrgency: 0, fearBased: 0, clickbait: 0, manipulation: 0 },
    evidence: { falseUrgency: [], fearBased: [], clickbait: [] },
    abstain: true,
    reason: 'empty input',
  };
  if (typeof text !== 'string' || text.length === 0) return empty;

  // Collect evidence per flag.
  const evidence = { falseUrgency: [], fearBased: [], clickbait: [] };
  for (const { flag, name, re } of PATTERNS) {
    const m = text.match(re);
    if (m) evidence[flag].push(`${name}:${m[0]}`);
  }

  // Boolean flags compatible with checkMahavrata.action.contains.
  const flags = {
    falseUrgency: evidence.falseUrgency.length > 0,
    fearBased:    evidence.fearBased.length > 0,
    clickbait:    evidence.clickbait.length > 0,
    manipulation: false, // computed below from confidence
  };

  // Calibrate.
  return calibrateFromEvidence(text, evidence, flags);
}

// Lazy-imported to keep the file ESM-clean and avoid bundler quirks.
import { calibrate } from './calibrator.js';

function calibrateFromEvidence(text, evidence, flags) {
  const cal = calibrate(text, evidence);
  // Promote calibrator-computed manipulation confidence + boolean.
  const confidence = {
    falseUrgency: cal.confidence.falseUrgency || 0,
    fearBased:    cal.confidence.fearBased || 0,
    clickbait:    cal.confidence.clickbait || 0,
    manipulation: cal.manipulation,
  };
  // manipulation boolean = ≥ 2 strong claims OR overall confidence ≥ 0.7.
  const strongCount = [confidence.falseUrgency, confidence.fearBased, confidence.clickbait]
    .filter((c) => c >= 0.5).length;
  flags.manipulation = strongCount >= 2 || confidence.manipulation >= 0.7;

  return {
    flags,
    confidence,
    evidence,
    abstain: cal.abstain,
    reason: cal.reason,
  };
}
