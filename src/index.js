/**
 * pantheon-guard · public API
 *
 * Deterministic conscience layer for AI-generated content.
 * Catches manipulation, dark patterns, and false urgency that pass through
 * standard guardrails.
 *
 * Phase 2 of B3-ACTION-PLAN: ESM source + tsup dual ESM/CJS build.
 *
 * Source of truth: C:\Pantheon\vault\04-Projects\Этический фильтр от Пантеона как продукт\
 */

export {
  CORE_VERSION,
  LAYERS,
  GUNAS,
  PRIORITY,
} from './constants.js';

export {
  MAHAVRATA,
  checkMahavrata,
} from './mahavrata.js';

export {
  SVADHARMA_SCHEMA,
  validateSvadharma,
  checkSvadharmaConsistency,
} from './svadharma.js';

export {
  FIVE_STEP_ALGORITHM,
  runFiveSteps,
  checkDharma,
  checkGuna,
  checkYajna,
  checkDana,
} from './algorithm.js';

export { PRINCIPLES } from './principles.js';
export { LAWS } from './laws.js';

export { detectPatterns, detectPatternsCalibrated } from './detect-patterns.js';
export { wrapAgent } from './wrap-agent.js';
export { calibrate, flagConfidence, isStrong, CALIBRATOR_PARAMS } from './calibrator.js';
export { inspect } from './inspect.js';
export { nonconformityScore, fitConformal, inspectConformal } from './conformal.js';
export {
  weightedQuantile,
  fitWeightedConformal,
  inspectWeightedConformal,
} from './conformal-weighted.js';
export { normalizeText, normalizeDiagnostic } from './normalize.js';
export {
  canonicalize,
  signPayload,
  verifyPayload,
  inspectSigned,
  verifySignedVerdict,
} from './sign.js';
export {
  getIntegrity,
  assertRuleSetHash,
  getBuildFingerprint,
} from './integrity.js';

// ─────────────────────────────────────────────
// Aliases & getters (kept stable for callers)
// ─────────────────────────────────────────────

import { MAHAVRATA as _MAHAVRATA } from './mahavrata.js';
import { FIVE_STEP_ALGORITHM as _FIVE_STEP_ALGORITHM } from './algorithm.js';
import { PRINCIPLES as _PRINCIPLES } from './principles.js';
import { LAWS as _LAWS } from './laws.js';
import { runFiveSteps as _runFiveSteps } from './algorithm.js';

/** @returns {Object} the frozen Mahā-vrata structure */
export function getMahavrata() {
  return _MAHAVRATA;
}

/** @returns {Object} the frozen 5-step algorithm description */
export function getAlgorithm() {
  return _FIVE_STEP_ALGORITHM;
}

/**
 * @param {string} [name] — principle key (rita, dharma, yajna, ...)
 * @returns {Object} the named principle, or all principles if name omitted
 */
export function getPrinciple(name) {
  return name ? _PRINCIPLES[name] : _PRINCIPLES;
}

/**
 * @param {number} [number] — law number 1..11
 * @returns {Object|Array|null} a law by number, all laws if number omitted, or null
 */
export function getLaw(number) {
  if (number === undefined) return _LAWS;
  return _LAWS.find((l) => l.number === number) || null;
}

/**
 * Main API entry — runs Mahā-vrata check + 5-step algorithm.
 * Alias of runFiveSteps with consistent naming for external callers.
 *
 * @param {Object} agent — agent with svadharma
 * @param {Object} action — action descriptor
 * @returns {Object} runFiveSteps result (includes mahavrataResult inside)
 */
export function checkAction(agent, action) {
  return _runFiveSteps(agent, action);
}
