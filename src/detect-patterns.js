/**
 * pantheon-guard · detect-patterns
 *
 * Deterministic regex-based detection for manipulative text. Two entry
 * points: `detectPatterns` returns boolean flags compatible with
 * `checkMahavrata`'s `action.contains`; `detectPatternsCalibrated` adds
 * per-flag confidence + evidence markers + abstain decision.
 *
 * Both run text through `normalizeText` before matching to defeat
 * homoglyph / zero-width / fullwidth / leet bypasses (see `normalize.js`
 * and `test/adversarial.test.js`).
 *
 * Cyrillic word boundaries: JavaScript's `\b` only treats [A-Za-z0-9_] as
 * word characters, so Russian patterns use Unicode lookbehind/lookahead
 * with `\p{L}\p{N}` under the `u` flag.
 */

import { normalizeText } from './normalize.js';
import { calibrate } from './calibrator.js';

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
// English patterns
// ─────────────────────────────────────────────
const URGENCY_EN = /\b(?:hurry|urgent|right now|today only|last chance|expires|deadline|don'?t miss|act now|limited time)\b/i;
const FEAR_EN = /\b(?:regret|miss out|fall behind|left behind|too late|lose everything|disaster|collapse)\b/i;
const CLICKBAIT_EN = /\b(?:secret|nobody knows|the one thing|they don'?t want you|shocking|exposed|revealed)\b/i;
const SCARCITY_EN = /\b(?:only \d+ left|\d+ spots left|last \d+|while supplies last)\b/i;

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

const EMPTY_FLAGS = Object.freeze({
  falseUrgency: false,
  fearBased: false,
  clickbait: false,
  manipulation: false,
});

const EMPTY_CALIBRATED = Object.freeze({
  flags: EMPTY_FLAGS,
  confidence: Object.freeze({ falseUrgency: 0, fearBased: 0, clickbait: 0, manipulation: 0 }),
  evidence:   Object.freeze({ falseUrgency: [], fearBased: [], clickbait: [] }),
  abstain: true,
  reason: 'empty input',
});

// ─────────────────────────────────────────────
// Public — boolean detector (v0.1 shape, backward compat)
// ─────────────────────────────────────────────

/**
 * @param {string} text
 * @returns {{falseUrgency: boolean, fearBased: boolean, clickbait: boolean, manipulation: boolean}}
 */
export function detectPatterns(text) {
  if (typeof text !== 'string' || text.length === 0) return { ...EMPTY_FLAGS };
  const normalized = normalizeText(text);

  const falseUrgency =
    URGENCY_RU.test(normalized) || URGENCY_EN.test(normalized) ||
    SCARCITY_RU.test(normalized) || SCARCITY_EN.test(normalized);
  const fearBased   = FEAR_RU.test(normalized)      || FEAR_EN.test(normalized);
  const clickbait   = CLICKBAIT_RU.test(normalized) || CLICKBAIT_EN.test(normalized);

  // Meta-flag — fires only when ≥2 categories hit, so a single urgency
  // word in a benign sentence ("act now to confirm your booking") is not
  // promoted to "manipulation".
  const signalCount = [falseUrgency, fearBased, clickbait].filter(Boolean).length;
  const manipulation = signalCount >= 2;

  return { falseUrgency, fearBased, clickbait, manipulation };
}

// ─────────────────────────────────────────────
// Public — calibrated detector (v0.2 shape)
// ─────────────────────────────────────────────

/**
 * Calibrated detector: returns the same boolean keys as {@link detectPatterns}
 * for compatibility, plus per-flag confidence in [0, 1], evidence markers,
 * and an `abstain` decision. Domain rule packs may pass `options.overrides`
 * to tighten calibrator thresholds for higher-stakes contexts; they may
 * also pass `options.normalized` to skip re-normalizing already-normalized
 * text (used by `applyPack` to avoid double work in the hot path).
 *
 * @param {string} text
 * @param {Object} [options]
 * @param {Object} [options.overrides] partial override of CALIBRATOR_PARAMS
 * @param {string} [options.normalized] precomputed normalized text
 * @returns {{
 *   flags: {falseUrgency: boolean, fearBased: boolean, clickbait: boolean, manipulation: boolean},
 *   confidence: {falseUrgency: number, fearBased: number, clickbait: number, manipulation: number},
 *   evidence: {falseUrgency: string[], fearBased: string[], clickbait: string[]},
 *   abstain: boolean,
 *   reason: string|null,
 * }}
 */
export function detectPatternsCalibrated(text, options = {}) {
  if (typeof text !== 'string' || text.length === 0) return EMPTY_CALIBRATED;
  const normalized = options.normalized ?? normalizeText(text);

  const evidence = { falseUrgency: [], fearBased: [], clickbait: [] };
  for (const { flag, name, re } of PATTERNS) {
    const m = normalized.match(re);
    if (m) evidence[flag].push(`${name}:${m[0]}`);
  }

  const cal = calibrate(text, evidence, options.overrides);
  const confidence = {
    falseUrgency: cal.confidence.falseUrgency || 0,
    fearBased:    cal.confidence.fearBased    || 0,
    clickbait:    cal.confidence.clickbait    || 0,
    manipulation: cal.manipulation,
  };

  // manipulation boolean = ≥ 2 mid-strong claims OR overall conf ≥ 0.7.
  // Mid-strong threshold (0.5) intentionally below STRONG_THRESHOLD so the
  // meta-flag fires when two clear-but-not-confident signals co-occur.
  const strongCount = [confidence.falseUrgency, confidence.fearBased, confidence.clickbait]
    .filter((c) => c >= 0.5).length;
  const manipulation = strongCount >= 2 || confidence.manipulation >= 0.7;

  return {
    flags: {
      falseUrgency: evidence.falseUrgency.length > 0,
      fearBased:    evidence.fearBased.length > 0,
      clickbait:    evidence.clickbait.length > 0,
      manipulation,
    },
    confidence,
    evidence,
    abstain: cal.abstain,
    reason:  cal.reason,
  };
}
