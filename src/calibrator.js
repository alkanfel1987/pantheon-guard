/**
 * pantheon-guard · calibrator
 *
 * v0.2 calibration layer. Converts raw deterministic signals from
 * detect-patterns into per-flag confidence scores in [0, 1] and an overall
 * abstain decision when the input is too thin for any honest claim.
 *
 * Why calibration matters (and why we are different from competitors):
 *
 * Standard guardrail vendors (Lakera, NeMo Guardrails, Llama Guard, Guardrails
 * AI) ship classifiers that emit a single boolean or always-confident scalar.
 * That makes them silently overconfident when the input is short, ambiguous,
 * or out-of-distribution. We empirically observed the same failure mode in
 * a controlled experiment (`glyph_reconstruction/REPORT_PHASE2.md`): a
 * sparsity-regularized classifier achieves 33.6% confident-but-wrong answers
 * at K=5 measurements, while a temperature-cool softmax abstains at low
 * confidence and stays calibrated.
 *
 * The lesson translated to this module:
 *   - Confidence is a property of the *regime* of the input, not the model.
 *   - When signals are weak or text is short, return low confidence and let
 *     the caller decide whether to abstain — do not paper over uncertainty.
 *   - Calibration mapping must be replaceable; this module gives a heuristic
 *     v0.2 baseline that BENCHMARK.md will tune to ground truth in v0.3.
 *
 * No LLM is invoked here. The whole calibrator is deterministic, ~150 lines,
 * zero runtime dependencies — same audit story as v0.1 detect-patterns.
 */

// ─────────────────────────────────────────────
// Tunable constants (v0.2 heuristic baseline)
// Numbers are conservative and will be re-fit against BENCHMARK ground truth.
// ─────────────────────────────────────────────

/** Signal saturation curve: confidence = 1 - exp(-strength / TAU). */
const TAU = 0.7;

/** Baseline confidence per fired pattern (single hit). */
const BASE_PER_HIT = 0.45;

/** Increment per additional independent hit on the same flag. */
const INCREMENT_PER_HIT = 0.18;

/** Floor for any non-zero detection. Below this, we treat as noise. */
const NOISE_FLOOR = 0.30;

/** Above this, the flag is treated as a strong claim (high confidence). */
const STRONG_THRESHOLD = 0.70;

/** Texts shorter than this many word-like tokens get an abstain. */
const MIN_TOKENS = 3;

/** Texts shorter than this many word-like tokens lose confidence (× 0.6). */
const SHORT_TEXT_TOKENS = 6;

/** Short-text confidence multiplier. */
const SHORT_TEXT_PENALTY = 0.6;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Approximate token count — Unicode-aware, splits on non-letter sequences. */
function tokenCount(text) {
  if (typeof text !== 'string' || text.length === 0) return 0;
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.length : 0;
}

/** Saturating combiner: c = 1 - exp(-strength / TAU). */
function saturate(strength) {
  return 1 - Math.exp(-strength / TAU);
}

/** Clamp x to [lo, hi]. */
function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

// ─────────────────────────────────────────────
// Per-flag confidence from raw hit count + length-bonus
// ─────────────────────────────────────────────

/**
 * Compute confidence for a single flag given how many independent regex
 * patterns matched and a context bonus in [0, 1].
 *
 * @param {number} hits — number of independent patterns that fired
 * @param {number} bonus — additional evidence weight (e.g. all-caps marker)
 * @returns {number} confidence in [0, 1]
 */
export function flagConfidence(hits, bonus = 0) {
  if (hits <= 0) return 0;
  const linear = BASE_PER_HIT + INCREMENT_PER_HIT * (hits - 1) + bonus;
  return clamp(linear, 0, 0.97);
}

// ─────────────────────────────────────────────
// Calibrator entry point
// ─────────────────────────────────────────────

/**
 * Calibrate per-flag confidence from raw detector evidence.
 *
 * The shape of `evidence` mirrors what `detectPatternsCalibrated` produces:
 * for each flag key (falseUrgency, fearBased, clickbait), an array of string
 * markers naming which sub-patterns fired ('urgency_ru:срочно',
 * 'scarcity:only 3', etc.).
 *
 * @param {string} text — the original text, used for length heuristics
 * @param {Object<string, string[]>} evidence — markers per flag
 * @returns {{
 *   confidence: Object<string, number>,
 *   manipulation: number,
 *   abstain: boolean,
 *   reason: string|null
 * }}
 */
export function calibrate(text, evidence) {
  const tokens = tokenCount(text);
  const confidence = {};

  // Cleanly-empty input → abstain.
  if (tokens === 0) {
    return {
      confidence: {},
      manipulation: 0,
      abstain: true,
      reason: 'empty input',
    };
  }

  // Compute per-flag confidence from hit counts.
  for (const [flag, markers] of Object.entries(evidence || {})) {
    const hits = Array.isArray(markers) ? markers.length : 0;
    if (hits === 0) {
      confidence[flag] = 0;
      continue;
    }
    let c = flagConfidence(hits);
    // Short-text penalty: signals in 2-5 word fragments are less reliable.
    if (tokens < SHORT_TEXT_TOKENS) c *= SHORT_TEXT_PENALTY;
    // Round to 3 decimals to keep test goldens readable.
    confidence[flag] = Math.round(c * 1000) / 1000;
  }

  // Overall manipulation confidence — saturating combiner over per-flag.
  // Each flag contributes its confidence as "evidence strength".
  const totalStrength = Object.values(confidence).reduce((s, c) => s + c, 0);
  let manipulation = saturate(totalStrength);
  if (tokens < SHORT_TEXT_TOKENS) manipulation *= SHORT_TEXT_PENALTY;
  manipulation = Math.round(manipulation * 1000) / 1000;

  // Abstain decision.
  let abstain = false;
  let reason = null;
  if (tokens < MIN_TOKENS) {
    abstain = true;
    reason = `text too short (${tokens} tokens, need ≥ ${MIN_TOKENS})`;
  } else {
    const maxFlag = Math.max(0, ...Object.values(confidence));
    if (maxFlag > 0 && maxFlag < NOISE_FLOOR) {
      abstain = true;
      reason = `all signals below noise floor (max ${maxFlag} < ${NOISE_FLOOR})`;
    }
  }

  return { confidence, manipulation, abstain, reason };
}

// ─────────────────────────────────────────────
// Public introspection — for benchmark tuning
// ─────────────────────────────────────────────

export const CALIBRATOR_PARAMS = Object.freeze({
  TAU,
  BASE_PER_HIT,
  INCREMENT_PER_HIT,
  NOISE_FLOOR,
  STRONG_THRESHOLD,
  MIN_TOKENS,
  SHORT_TEXT_TOKENS,
  SHORT_TEXT_PENALTY,
});

/**
 * Decide whether a confidence value crosses the "strong claim" threshold.
 * Used by `inspect()` to convert calibrated confidence to the boolean shape
 * expected by `checkMahavrata.action.contains` when the caller picks the
 * 'strict' decision policy.
 *
 * @param {number} c — confidence in [0, 1]
 * @returns {boolean}
 */
export function isStrong(c) {
  return c >= STRONG_THRESHOLD;
}
