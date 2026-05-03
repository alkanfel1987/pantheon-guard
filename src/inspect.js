/**
 * pantheon-guard · inspect
 *
 * Top-level v0.2 API: a single function that takes raw text and returns
 * the mahā-vrata verdict together with calibrated confidence and an
 * abstain decision when the input is too thin.
 *
 * Decision policy:
 *   'strict'     — boolean flags fire whenever any pattern matches (v0.1 shape).
 *   'calibrated' — flags fire only when confidence ≥ STRONG_THRESHOLD (default).
 *
 * Domain rule packs (see `packs/index.js`) may pass `options.calibratorOverrides`
 * to tighten thresholds in higher-stakes contexts (e.g. healthcare uses
 * STRONG_THRESHOLD 0.55 instead of 0.70). Packs may also pass
 * `options.normalized` to share an already-normalized view and avoid
 * re-running normalization.
 */

import { detectPatternsCalibrated } from './detect-patterns.js';
import { checkMahavrata } from './mahavrata.js';
import { isStrong, CALIBRATOR_PARAMS } from './calibrator.js';

const DEFAULT_OPTIONS = Object.freeze({
  policy: 'calibrated',
  urgency: 0,
  paused: true,
  intent: undefined,
  sources: undefined,
  contains: undefined,
  calibratorOverrides: undefined,
  normalized: undefined,
});

/**
 * @param {string} text
 * @param {Object} [options]
 * @param {'strict'|'calibrated'} [options.policy]
 * @param {number}  [options.urgency]
 * @param {boolean} [options.paused]
 * @param {string}  [options.intent]
 * @param {Array}   [options.sources]
 * @param {Object}  [options.contains]
 * @param {Object}  [options.calibratorOverrides] partial CALIBRATOR_PARAMS override
 * @param {string}  [options.normalized] precomputed normalized view (perf hint)
 * @returns {{
 *   passes: boolean,
 *   abstain: boolean,
 *   reason: string|null,
 *   confidence: {falseUrgency: number, fearBased: number, clickbait: number, manipulation: number},
 *   evidence: {falseUrgency: string[], fearBased: string[], clickbait: string[]},
 *   violations: Array<{rule: string, reason: string}>,
 *   details: Object,
 *   policy: string,
 * }}
 */
export function inspect(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const detection = detectPatternsCalibrated(text, {
    overrides:  opts.calibratorOverrides,
    normalized: opts.normalized,
  });

  // Threshold for "strong" claim respects the per-call override.
  const strongThreshold =
    opts.calibratorOverrides?.STRONG_THRESHOLD ?? CALIBRATOR_PARAMS.STRONG_THRESHOLD;

  let contains;
  if (opts.policy === 'strict') {
    contains = { ...detection.flags, ...(opts.contains || {}) };
  } else {
    contains = {
      falseUrgency: isStrong(detection.confidence.falseUrgency, strongThreshold),
      fearBased:    isStrong(detection.confidence.fearBased,    strongThreshold),
      clickbait:    isStrong(detection.confidence.clickbait,    strongThreshold),
      manipulation: isStrong(detection.confidence.manipulation, strongThreshold),
      ...(opts.contains || {}),
    };
  }

  const mvResult = checkMahavrata({
    text,
    urgency: opts.urgency,
    paused:  opts.paused,
    intent:  opts.intent,
    sources: opts.sources,
    contains,
  });

  return {
    passes:     mvResult.passes,
    abstain:    detection.abstain,
    reason:     detection.reason,
    confidence: detection.confidence,
    evidence:   detection.evidence,
    violations: mvResult.violations,
    details:    mvResult.details,
    policy:     opts.policy,
  };
}
