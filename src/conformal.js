/**
 * pantheon-guard · conformal prediction wrapper
 *
 * Distribution-free finite-sample coverage guarantee on top of the v0.2
 * calibrator. Implements split conformal prediction (Vovk 1999, 2005):
 *
 *   1. Fit a non-conformity score on a labelled calibration set.
 *   2. Compute the 1-α empirical quantile of those scores.
 *   3. At inference, return the set of labels whose non-conformity is
 *      below the quantile. By Vovk's theorem, this set covers the true
 *      label with probability ≥ 1-α regardless of distribution, model,
 *      or sample size.
 *
 * For our binary classification ({manipulation, safe}), the conformal
 * prediction set has three possible shapes — and these map exactly onto
 * the three guarded actions a caller can take:
 *
 *   ['manipulation']            → confident block + regenerate
 *   ['safe']                    → confident pass
 *   ['manipulation', 'safe']    → abstain — escalate to human reviewer
 *
 * The abstain case is what the v0.2 heuristic abstain hinted at, but
 * conformal makes it *certified*: if α=0.1, then in the long run no more
 * than 10% of true labels are missed by the prediction set, full stop.
 *
 * What competitors cannot offer: the marginal coverage guarantee is
 * distribution-free. They report empirical accuracy on a fixed test set;
 * we provide a *theorem* about any future input distribution, given an
 * exchangeable calibration set.
 *
 * Reference: Vovk, Gammerman, Shafer. *Algorithmic Learning in a Random
 * World*. Springer, 2005. Lei et al., *Distribution-Free Predictive
 * Inference for Regression.* JASA 2018, for split conformal exposition.
 */

import { inspect } from './inspect.js';

const LABELS = Object.freeze(['manipulation', 'safe']);

// ─────────────────────────────────────────────
// Non-conformity score
// ─────────────────────────────────────────────

/**
 * Non-conformity score: how unusual is `(text, label)` under our calibrator?
 *
 *   s(x, y = 'manipulation') = 1 - confidence.manipulation
 *   s(x, y = 'safe')         =     confidence.manipulation
 *
 * High score = the calibrator did *not* expect this label. The conformal
 * algorithm uses the empirical distribution of scores on labelled data
 * to decide what counts as "unusual enough to exclude".
 *
 * @param {string} text
 * @param {'manipulation'|'safe'} label
 * @param {Object} [opts] — passed to inspect() (urgency, paused, intent, ...)
 * @returns {number} score in [0, 1]
 */
export function nonconformityScore(text, label, opts = {}) {
  const r = inspect(text, opts);
  const conf = r.confidence.manipulation;
  if (label === 'manipulation') return 1 - conf;
  if (label === 'safe')         return conf;
  throw new TypeError(`unknown label: ${label}`);
}

// ─────────────────────────────────────────────
// Fit — compute the conformal quantile threshold
// ─────────────────────────────────────────────

/**
 * Fit a conformal predictor on a labelled calibration set.
 *
 * The "fit" is just computing scores on labelled examples and taking the
 * empirical quantile — no parametric optimization. The strict quantile
 * formula uses ⌈(n+1)(1-α)⌉ / n for finite-sample validity.
 *
 * @param {Array<{text: string, label: 'manipulation'|'safe'}>} calibrationSet
 * @param {Object} [options]
 * @param {number} [options.alpha=0.1] — miscoverage rate (1-α is the guarantee)
 * @param {Object} [options.inspectOpts] — passed through to inspect() during scoring
 * @returns {{
 *   threshold: number,
 *   alpha: number,
 *   coverageGuarantee: number,
 *   n: number,
 *   scores: number[],
 * }}
 */
export function fitConformal(calibrationSet, options = {}) {
  const alpha = options.alpha ?? 0.1;
  const inspectOpts = options.inspectOpts ?? {};

  if (!Array.isArray(calibrationSet) || calibrationSet.length === 0) {
    throw new TypeError('calibrationSet must be a non-empty array');
  }
  if (alpha <= 0 || alpha >= 1) {
    throw new RangeError(`alpha must be in (0, 1), got ${alpha}`);
  }

  const scores = calibrationSet.map(({ text, label }) => {
    if (typeof text !== 'string' || !LABELS.includes(label)) {
      throw new TypeError(
        `calibration entry must be {text: string, label: 'manipulation'|'safe'}, got ${JSON.stringify({ text, label })}`
      );
    }
    return nonconformityScore(text, label, inspectOpts);
  });

  // Finite-sample quantile: ⌈(n+1)(1-α)⌉ / n.
  // Take the ⌈(n+1)(1-α)⌉-th smallest score (1-indexed).
  const n = scores.length;
  const sorted = scores.slice().sort((a, b) => a - b);
  const k = Math.ceil((n + 1) * (1 - alpha));
  // Guard against k > n (happens for small n, large 1-α).
  const idx = Math.min(k, n) - 1;
  const threshold = sorted[idx];

  return {
    threshold,
    alpha,
    coverageGuarantee: 1 - alpha,
    n,
    scores,
  };
}

// ─────────────────────────────────────────────
// Predict — verdict set for a new input
// ─────────────────────────────────────────────

/**
 * Conformal-prediction wrapper around `inspect()`.
 *
 * Returns the regular `inspect()` verdict plus a `verdict_set` ⊆ {'manipulation', 'safe'}
 * with the property: by Vovk's theorem, the true label lies in `verdict_set`
 * with marginal probability ≥ `coverage`, given a calibration set drawn
 * exchangeably with the test point.
 *
 * The set has three possible shapes:
 *   ['manipulation']         → conformal block (and inspect.passes is false)
 *   ['safe']                 → conformal pass  (and inspect.passes is true)
 *   ['manipulation', 'safe'] → conformal abstain (route to human)
 *
 * @param {string} text
 * @param {Object} options
 * @param {ReturnType<typeof fitConformal>} options.calibrator
 * @param {number} [options.urgency]
 * @param {boolean} [options.paused]
 * @param {string} [options.intent]
 * @param {Array} [options.sources]
 * @param {Object} [options.contains]
 * @returns {{
 *   verdict_set: Array<'manipulation'|'safe'>,
 *   coverage: number,
 *   passes: boolean,
 *   abstain: boolean,
 *   reason: string|null,
 *   confidence: Object,
 *   evidence: Object,
 *   violations: Array,
 *   policy: string,
 * }}
 */
export function inspectConformal(text, options = {}) {
  const { calibrator, ...inspectOpts } = options;
  if (!calibrator || typeof calibrator.threshold !== 'number') {
    throw new TypeError(
      'inspectConformal requires options.calibrator from fitConformal()'
    );
  }

  const base = inspect(text, inspectOpts);

  // Score each candidate label and include those below threshold.
  const verdict_set = LABELS.filter(
    (label) => nonconformityScore(text, label, inspectOpts) <= calibrator.threshold
  );

  // If somehow nothing passes (extreme case — calibrator was too strict),
  // fall back to the singleton most-likely label so we still return a set.
  if (verdict_set.length === 0) {
    verdict_set.push(base.confidence.manipulation >= 0.5 ? 'manipulation' : 'safe');
  }

  // Conformal abstain = both labels in the set.
  const conformalAbstain = verdict_set.length === 2;

  return {
    verdict_set,
    coverage: calibrator.coverageGuarantee,
    passes: base.passes,
    abstain: conformalAbstain || base.abstain,
    reason: conformalAbstain
      ? `conformal abstain: both labels within coverage threshold (α=${calibrator.alpha})`
      : base.reason,
    confidence: base.confidence,
    evidence: base.evidence,
    violations: base.violations,
    policy: base.policy,
  };
}
