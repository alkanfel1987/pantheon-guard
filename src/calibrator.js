/**
 * pantheon-guard · calibrator
 *
 * Converts raw deterministic signals from detect-patterns into per-flag
 * confidence in [0, 1] and an abstain decision when the input is too thin
 * for any honest claim.
 *
 * Confidence here is a property of the *regime* of the input, not of the
 * model — when signals are weak or text is short the calibrator returns low
 * confidence and lets the caller decide whether to abstain. See
 * `glyph_reconstruction/REPORT_PHASE2.md` for the controlled experiment that
 * justified this design (a sparsity-regularized classifier produced 33.6%
 * confident-but-wrong answers in the underdetermined regime).
 *
 * Tunable parameters live in `CALIBRATOR_PARAMS`. They are baseline values
 * fit by hand; `BENCHMARK.md` will re-fit them against ground truth in v0.5.
 * Any caller may also pass an override map via the `params` argument of
 * `calibrate()` — used by domain rule packs (see `packs/healthcare.js`) to
 * tighten thresholds in higher-stakes contexts.
 */

// ─────────────────────────────────────────────
// Default parameters
// ─────────────────────────────────────────────

export const CALIBRATOR_PARAMS = Object.freeze({
  /** Signal saturation curve: confidence = 1 - exp(-strength / TAU). */
  TAU: 0.7,
  /** Baseline confidence per fired pattern (single hit). */
  BASE_PER_HIT: 0.45,
  /** Increment per additional independent hit on the same flag. */
  INCREMENT_PER_HIT: 0.18,
  /** Floor for any non-zero detection. Below this, treat as noise. */
  NOISE_FLOOR: 0.30,
  /** Above this, the flag is a strong claim. */
  STRONG_THRESHOLD: 0.70,
  /** Texts shorter than this many word-like tokens get an abstain. */
  MIN_TOKENS: 3,
  /** Texts shorter than this many word-like tokens lose confidence. */
  SHORT_TEXT_TOKENS: 6,
  /** Short-text confidence multiplier. */
  SHORT_TEXT_PENALTY: 0.6,
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function tokenCount(text) {
  if (typeof text !== 'string' || text.length === 0) return 0;
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.length : 0;
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

// ─────────────────────────────────────────────
// Per-flag confidence
// ─────────────────────────────────────────────

/**
 * @param {number} hits  number of independent patterns that fired
 * @param {number} bonus additional evidence weight (e.g. all-caps marker)
 * @param {Partial<typeof CALIBRATOR_PARAMS>} [params] optional override map
 * @returns {number} confidence in [0, 1]
 */
export function flagConfidence(hits, bonus = 0, params = CALIBRATOR_PARAMS) {
  if (hits <= 0) return 0;
  const linear = params.BASE_PER_HIT + params.INCREMENT_PER_HIT * (hits - 1) + bonus;
  return clamp(linear, 0, 0.97);
}

// ─────────────────────────────────────────────
// Calibrator entry point
// ─────────────────────────────────────────────

/**
 * Calibrate per-flag confidence from raw detector evidence.
 *
 * @param {string} text the original text (used for length heuristics)
 * @param {Object<string, string[]>} evidence markers per flag
 * @param {Partial<typeof CALIBRATOR_PARAMS>} [overrides] domain-specific
 *   parameter overrides — e.g. `{NOISE_FLOOR: 0.20, STRONG_THRESHOLD: 0.55}`
 *   for healthcare pack
 * @returns {{
 *   confidence: Object<string, number>,
 *   manipulation: number,
 *   abstain: boolean,
 *   reason: string|null,
 * }}
 */
export function calibrate(text, evidence, overrides) {
  const p = overrides ? { ...CALIBRATOR_PARAMS, ...overrides } : CALIBRATOR_PARAMS;
  const tokens = tokenCount(text);
  const confidence = {};

  if (tokens === 0) {
    return {
      confidence: {},
      manipulation: 0,
      abstain: true,
      reason: 'empty input',
    };
  }

  for (const [flag, markers] of Object.entries(evidence || {})) {
    const hits = Array.isArray(markers) ? markers.length : 0;
    if (hits === 0) {
      confidence[flag] = 0;
      continue;
    }
    let c = flagConfidence(hits, 0, p);
    if (tokens < p.SHORT_TEXT_TOKENS) c *= p.SHORT_TEXT_PENALTY;
    confidence[flag] = Math.round(c * 1000) / 1000;
  }

  const totalStrength = Object.values(confidence).reduce((s, c) => s + c, 0);
  let manipulation = 1 - Math.exp(-totalStrength / p.TAU);
  if (tokens < p.SHORT_TEXT_TOKENS) manipulation *= p.SHORT_TEXT_PENALTY;
  manipulation = Math.round(manipulation * 1000) / 1000;

  let abstain = false;
  let reason = null;
  if (tokens < p.MIN_TOKENS) {
    abstain = true;
    reason = `text too short (${tokens} tokens, need ≥ ${p.MIN_TOKENS})`;
  } else {
    const maxFlag = Math.max(0, ...Object.values(confidence));
    if (maxFlag > 0 && maxFlag < p.NOISE_FLOOR) {
      abstain = true;
      reason = `all signals below noise floor (max ${maxFlag} < ${p.NOISE_FLOOR})`;
    }
  }

  return { confidence, manipulation, abstain, reason };
}

// ─────────────────────────────────────────────
// Public threshold check
// ─────────────────────────────────────────────

/**
 * Decide whether a confidence value crosses the "strong claim" threshold.
 *
 * @param {number} c confidence in [0, 1]
 * @param {number} [threshold] optional override of the default threshold
 * @returns {boolean}
 */
export function isStrong(c, threshold = CALIBRATOR_PARAMS.STRONG_THRESHOLD) {
  return c >= threshold;
}
