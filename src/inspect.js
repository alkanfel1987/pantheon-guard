/**
 * pantheon-guard · inspect
 *
 * Top-level v0.2 API: a single function that takes raw text and returns the
 * mahā-vrata verdict together with calibrated confidence and an abstain
 * decision when the input is too thin.
 *
 * Why this exists:
 *   The v0.1 pipeline made the caller assemble three things — detectPatterns,
 *   action shape, checkMahavrata — before getting an answer. That is fine for
 *   integrators wiring guard inside a larger system, but unfriendly for the
 *   "5-minute first-look" path used during outreach. `inspect(text, options)`
 *   collapses the common case to one call without removing the lower-level
 *   building blocks.
 *
 * Decision policy:
 *   - 'strict'     (v0.1 behavior): a flag fires whenever any pattern matches.
 *   - 'calibrated' (v0.2 default):  a flag fires only when its confidence
 *                                   crosses the strong-threshold (0.7), and
 *                                   the call may abstain on thin input.
 *
 * Calibrated mode is what the BENCHMARK.md numbers will be measured against,
 * so it is also the mode advertised in PITCH.md as the differentiator.
 */

import { detectPatternsCalibrated } from './detect-patterns.js';
import { checkMahavrata } from './mahavrata.js';
import { isStrong } from './calibrator.js';

const DEFAULT_OPTIONS = Object.freeze({
  /** 'strict' = boolean flags as-detected. 'calibrated' = threshold at 0.7. */
  policy: 'calibrated',
  /** Caller-provided context; passed through to checkMahavrata. */
  urgency: 0,
  paused: true,
  intent: undefined,
  sources: undefined,
  /** Extra `contains` flags the caller already computed externally. */
  contains: undefined,
});

/**
 * Run the full v0.2 pipeline on a piece of text.
 *
 * @param {string} text — content to inspect
 * @param {Object} [options]
 * @param {'strict'|'calibrated'} [options.policy] — decision policy
 * @param {number}  [options.urgency]    — 0..1, upstream urgency tag
 * @param {boolean} [options.paused]     — was there a pause for reflection?
 * @param {string}  [options.intent]     — 'inform' | 'persuade' | ...
 * @param {Array}   [options.sources]    — attributions, used by asteya
 * @param {Object}  [options.contains]   — additional pre-computed flags
 * @returns {{
 *   passes: boolean,
 *   abstain: boolean,
 *   reason: string|null,
 *   confidence: { falseUrgency: number, fearBased: number, clickbait: number, manipulation: number },
 *   evidence: { falseUrgency: string[], fearBased: string[], clickbait: string[] },
 *   violations: Array<{rule: string, reason: string}>,
 *   details: Object,
 *   policy: string
 * }}
 */
export function inspect(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const detection = detectPatternsCalibrated(text);

  // Compose `contains` for checkMahavrata according to policy.
  let contains;
  if (opts.policy === 'strict') {
    contains = { ...detection.flags, ...(opts.contains || {}) };
  } else {
    // 'calibrated' — a flag only counts when its confidence is strong.
    contains = {
      falseUrgency: isStrong(detection.confidence.falseUrgency),
      fearBased:    isStrong(detection.confidence.fearBased),
      clickbait:    isStrong(detection.confidence.clickbait),
      manipulation: isStrong(detection.confidence.manipulation),
      ...(opts.contains || {}),
    };
  }

  const action = {
    text,
    urgency: opts.urgency,
    paused: opts.paused,
    intent: opts.intent,
    sources: opts.sources,
    contains,
  };
  const mvResult = checkMahavrata(action);

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
