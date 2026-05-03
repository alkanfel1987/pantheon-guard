/**
 * pantheon-guard · integrity / rule-watermark
 *
 * Tamper-detection for the frozen rule structures (MAHAVRATA, LAWS,
 * PRINCIPLES, FIVE_STEP_ALGORITHM, CALIBRATOR_PARAMS). At module load,
 * we compute a SHA-256 hash over canonical JSON of these structures
 * and expose `getIntegrity()` so callers can verify they are
 * interacting with an unmodified copy of the library.
 *
 * Use cases:
 *   - CI / CD pipeline: assert getIntegrity().rule_set_hash matches
 *     a baseline value committed when the release was built. Mismatch
 *     means the npm artifact has been swapped or the source patched.
 *   - Runtime: a service operating in a hostile environment can log
 *     getIntegrity() at startup and alert if the hash drifts.
 *   - Audit: getIntegrity() + signed verdicts (sign.js) provide a
 *     paired chain of custody for every guard decision.
 *
 * The hash is over *frozen* exports only. Calibrator code paths (which
 * may legitimately tune via `BENCHMARK.md` workflow in v0.3) are
 * separately versioned and exposed as `calibrator_params_hash` so
 * tuning is detectable but does not invalidate rule integrity.
 */

import { createHash } from 'node:crypto';

import { CORE_VERSION, LAYERS, GUNAS, PRIORITY } from './constants.js';
import { MAHAVRATA } from './mahavrata.js';
import { SVADHARMA_SCHEMA } from './svadharma.js';
import { FIVE_STEP_ALGORITHM } from './algorithm.js';
import { PRINCIPLES } from './principles.js';
import { LAWS } from './laws.js';
import { CALIBRATOR_PARAMS } from './calibrator.js';
import { canonicalize } from './sign.js';

// ─────────────────────────────────────────────
// Compute hashes once at module load.
// ─────────────────────────────────────────────

function sha256Hex(value) {
  return createHash('sha256').update(canonicalize(value)).digest('hex');
}

const RULE_SET = Object.freeze({
  MAHAVRATA, SVADHARMA_SCHEMA, FIVE_STEP_ALGORITHM, PRINCIPLES, LAWS,
  LAYERS, GUNAS, PRIORITY,
});

const RULE_SET_HASH = sha256Hex(RULE_SET);
const CALIBRATOR_PARAMS_HASH = sha256Hex(CALIBRATOR_PARAMS);

// ─────────────────────────────────────────────
// Public introspection
// ─────────────────────────────────────────────

/**
 * @returns {{
 *   library: string,
 *   library_version: string,
 *   rule_set_hash: string,
 *   calibrator_params_hash: string,
 *   covered: string[]
 * }}
 */
export function getIntegrity() {
  return {
    library: 'pantheon-guard',
    library_version: CORE_VERSION,
    rule_set_hash: RULE_SET_HASH,
    calibrator_params_hash: CALIBRATOR_PARAMS_HASH,
    covered: Object.keys(RULE_SET),
  };
}

/**
 * Assert the live rule-set hash matches an expected value. Throws if
 * mismatched. Intended for CI / startup checks.
 *
 * @param {string} expectedHash — hex SHA-256 from a trusted baseline
 * @throws {Error} on mismatch
 */
export function assertRuleSetHash(expectedHash) {
  if (typeof expectedHash !== 'string' || expectedHash.length !== 64) {
    throw new TypeError('expectedHash must be a 64-char hex string (SHA-256)');
  }
  if (RULE_SET_HASH !== expectedHash) {
    throw new Error(
      `pantheon-guard rule set hash mismatch: expected ${expectedHash}, ` +
      `got ${RULE_SET_HASH}. The library has been modified or replaced.`
    );
  }
}

/**
 * Compute a fingerprint that uniquely identifies this build. Useful
 * for log lines, deployment manifests, and forensic comparison.
 *
 * @returns {string} short hex prefix of combined hash
 */
export function getBuildFingerprint() {
  const combined = sha256Hex({
    rule: RULE_SET_HASH,
    calibrator: CALIBRATOR_PARAMS_HASH,
    version: CORE_VERSION,
  });
  return combined.slice(0, 16);
}
