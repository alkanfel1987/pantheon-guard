/**
 * pantheon-guard · weighted conformal prediction
 *
 * Extends split conformal (Vovk 2005) to the *covariate-shift* setting
 * where the test input distribution differs from the calibration input
 * distribution, but the conditional Y|X is the same.
 *
 * Reference: Tibshirani, Foygel-Barber, Candès, Ramdas.
 *   *Conformal Prediction Under Covariate Shift.* NeurIPS 2019.
 *
 * Setup:
 *   Calibration data X_i ~ P_cal,    test point X_test ~ P_test.
 *   Both have the same conditional Y|X.
 *   Importance weight w(x) = dP_test(x) / dP_cal(x), assumed known
 *   (or estimated by the caller — typical option: a small density-ratio
 *   classifier, see Sugiyama 2012).
 *
 * Theorem (Tibshirani 2019, Theorem 2):
 *   Define normalized weights p_i = w(X_i) / (Σ_j w(X_j) + w(X_test))
 *   and p_test = w(X_test) / (Σ_j w(X_j) + w(X_test)).
 *   Then for the weighted quantile threshold
 *     q̂_w  =  inf { t : Σ_{i: s_i ≤ t} p_i  ≥ 1 - α - p_test }
 *   the prediction set C(X_test) = {y : s(X_test, y) ≤ q̂_w} satisfies
 *     P( Y_test ∈ C(X_test) )  ≥  1 - α
 *   under any P_test absolutely continuous w.r.t. P_cal.
 *
 * In practice for our binary-label guard, this means: if production
 * traffic skews toward marketing-heavy text (relative to a balanced
 * calibration set), the weighted threshold compensates and coverage
 * still holds.
 */

import { nonconformityScore } from './conformal.js';
import { inspect } from './inspect.js';

const LABELS = Object.freeze(['manipulation', 'safe']);

// ─────────────────────────────────────────────
// Weighted quantile (Tibshirani 2019 form)
// ─────────────────────────────────────────────

/**
 * Weighted (1-α-p_test) quantile of nonconformity scores.
 *
 * Implements the empirical CDF inversion with normalized weights, as
 * described in equation (5) of Tibshirani et al. 2019.
 *
 * @param {number[]} scores — nonconformity scores on calibration set
 * @param {number[]} weights — w(X_i) for each calibration point (positive)
 * @param {number} alpha — miscoverage rate
 * @param {number} weightTest — w(X_test) for the new point
 * @returns {number} threshold
 */
export function weightedQuantile(scores, weights, alpha, weightTest) {
  const n = scores.length;
  if (n === 0) throw new TypeError('scores must be non-empty');
  if (weights.length !== n) {
    throw new TypeError(`weights.length=${weights.length} !== scores.length=${n}`);
  }
  for (const w of weights) {
    if (!(w > 0) || !Number.isFinite(w)) {
      throw new RangeError(`weights must be positive finite, got ${w}`);
    }
  }
  if (!(weightTest > 0) || !Number.isFinite(weightTest)) {
    throw new RangeError(`weightTest must be positive finite, got ${weightTest}`);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0) + weightTest;
  const target = 1 - alpha - weightTest / totalWeight;

  // Sort (score, weight) pairs by ascending score.
  const indexed = scores.map((s, i) => ({ s, w: weights[i] }))
                        .sort((a, b) => a.s - b.s);

  // Walk and accumulate normalized weights until we cross `target`.
  let cum = 0;
  for (const { s, w } of indexed) {
    cum += w / totalWeight;
    if (cum >= target) return s;
  }
  // If we never crossed (e.g. target ≥ 1, very large weightTest),
  // return the maximum score — coverage degrades to 1 (set is full).
  return indexed[indexed.length - 1].s;
}

// ─────────────────────────────────────────────
// Fit weighted conformal
// ─────────────────────────────────────────────

/**
 * Fit a weighted conformal predictor.
 *
 * Caller supplies importance weights `w_i = w(x_i)` per calibration point.
 * Typical sources:
 *   - A density-ratio classifier (Sugiyama 2012, Bickel et al. 2009).
 *   - Domain-specific knowledge (e.g. "production has 70% marketing,
 *     calibration has 50% marketing").
 *   - All weights = 1 → reduces to standard split conformal.
 *
 * @param {Array<{text: string, label: string, weight?: number}>} calibrationSet
 * @param {Object} [options]
 * @param {number} [options.alpha=0.1]
 * @param {number} [options.weightTest=1] — default weight for unseen test points
 * @param {Object} [options.inspectOpts]
 * @returns {{
 *   alpha: number,
 *   coverageGuarantee: number,
 *   n: number,
 *   scores: number[],
 *   weights: number[],
 *   weightTest: number,
 *   variant: 'weighted',
 * }}
 */
export function fitWeightedConformal(calibrationSet, options = {}) {
  const alpha = options.alpha ?? 0.1;
  const weightTest = options.weightTest ?? 1;
  const inspectOpts = options.inspectOpts ?? {};

  if (!Array.isArray(calibrationSet) || calibrationSet.length === 0) {
    throw new TypeError('calibrationSet must be a non-empty array');
  }
  if (alpha <= 0 || alpha >= 1) {
    throw new RangeError(`alpha must be in (0, 1), got ${alpha}`);
  }

  const scores = [];
  const weights = [];
  for (const entry of calibrationSet) {
    if (typeof entry.text !== 'string' || !LABELS.includes(entry.label)) {
      throw new TypeError(
        `each entry needs {text: string, label: 'manipulation'|'safe', weight?: number}`
      );
    }
    const w = entry.weight ?? 1;
    if (!(w > 0) || !Number.isFinite(w)) {
      throw new RangeError(`per-entry weight must be positive finite, got ${w}`);
    }
    scores.push(nonconformityScore(entry.text, entry.label, inspectOpts));
    weights.push(w);
  }

  return {
    alpha,
    coverageGuarantee: 1 - alpha,
    n: scores.length,
    scores,
    weights,
    weightTest,
    variant: 'weighted',
  };
}

// ─────────────────────────────────────────────
// Predict with weighted conformal
// ─────────────────────────────────────────────

/**
 * Wrapper around `inspect()` returning a weighted-conformal prediction set.
 *
 * @param {string} text
 * @param {Object} options
 * @param {ReturnType<typeof fitWeightedConformal>} options.calibrator
 * @param {number} [options.weightTest] — optional override of test weight
 * @returns {Object} same shape as inspectConformal's return, plus weight info.
 */
export function inspectWeightedConformal(text, options = {}) {
  const { calibrator, weightTest, ...inspectOpts } = options;
  if (!calibrator || calibrator.variant !== 'weighted') {
    throw new TypeError(
      'inspectWeightedConformal requires options.calibrator from fitWeightedConformal()'
    );
  }

  // Use the same inspect path as plain inspectConformal but compute the
  // threshold per-request from the weighted quantile (depends on weightTest).
  const wt = weightTest ?? calibrator.weightTest;
  const threshold = weightedQuantile(
    calibrator.scores, calibrator.weights, calibrator.alpha, wt
  );

  // Score the candidate labels at the threshold.
  const verdict_set = LABELS.filter(
    (label) => nonconformityScore(text, label, inspectOpts) <= threshold
  );

  // Re-run inspect once for confidence/evidence. (Could be optimized:
  // nonconformityScore already calls inspect; cache if profiling shows
  // this in the hot path.)
  const base = inspect(text, inspectOpts);

  if (verdict_set.length === 0) {
    verdict_set.push(base.confidence.manipulation >= 0.5 ? 'manipulation' : 'safe');
  }
  const conformalAbstain = verdict_set.length === 2;

  return {
    verdict_set,
    coverage: calibrator.coverageGuarantee,
    weighted: true,
    threshold,
    weightTest: wt,
    passes: base.passes,
    abstain: conformalAbstain || base.abstain,
    reason: conformalAbstain
      ? `weighted-conformal abstain: both labels within coverage (α=${calibrator.alpha}, w_test=${wt})`
      : base.reason,
    confidence: base.confidence,
    evidence: base.evidence,
    violations: base.violations,
    policy: base.policy,
  };
}

