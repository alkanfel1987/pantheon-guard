/**
 * @pantheon/guard · public API
 *
 * Deterministic conscience layer for AI-generated content.
 * Catches manipulation, dark patterns, and false urgency that pass through
 * standard guardrails.
 *
 * Phase 1 of B3-ACTION-PLAN: extract from monolithic pantheon-core.js into
 * focused modules. Still CommonJS — Phase 2 will switch to dual ESM/CJS via tsup.
 *
 * Source of truth: C:\Pantheon\vault\04-Projects\Этический фильтр от Пантеона как продукт\
 */

'use strict';

const {
  CORE_VERSION,
  LAYERS,
  GUNAS,
  PRIORITY,
} = require('./constants');

const {
  MAHAVRATA,
  checkMahavrata,
} = require('./mahavrata');

const {
  SVADHARMA_SCHEMA,
  validateSvadharma,
  checkSvadharmaConsistency,
} = require('./svadharma');

const {
  FIVE_STEP_ALGORITHM,
  runFiveSteps,
} = require('./algorithm');

const { PRINCIPLES } = require('./principles');
const { LAWS } = require('./laws');

// ─────────────────────────────────────────────
// Getters
// ─────────────────────────────────────────────

/** @returns {Object} the frozen Mahā-vrata structure */
function getMahavrata() {
  return MAHAVRATA;
}

/** @returns {Object} the frozen 5-step algorithm description */
function getAlgorithm() {
  return FIVE_STEP_ALGORITHM;
}

/**
 * @param {string} [name] — principle key (rita, dharma, yajna, ...)
 * @returns {Object} the named principle, or all principles if name omitted
 */
function getPrinciple(name) {
  return name ? PRINCIPLES[name] : PRINCIPLES;
}

/**
 * @param {number} [number] — law number 1..11
 * @returns {Object|Array|null} a law by number, all laws if number omitted, or null
 */
function getLaw(number) {
  if (number === undefined) return LAWS;
  return LAWS.find((l) => l.number === number) || null;
}

/**
 * Main API entry — runs Mahā-vrata check + 5-step algorithm.
 * Alias of runFiveSteps with consistent naming for external callers.
 *
 * @param {Object} agent — agent with svadharma
 * @param {Object} action — action descriptor
 * @returns {Object} runFiveSteps result (includes mahavrataResult inside)
 */
function checkAction(agent, action) {
  return runFiveSteps(agent, action);
}

module.exports = {
  // Version
  CORE_VERSION,

  // Constants
  LAYERS,
  GUNAS,
  PRIORITY,

  // Frozen structures
  MAHAVRATA,
  SVADHARMA_SCHEMA,
  FIVE_STEP_ALGORITHM,
  PRINCIPLES,
  LAWS,

  // Check functions
  checkMahavrata,
  validateSvadharma,
  checkSvadharmaConsistency,
  runFiveSteps,
  checkAction,

  // Getters
  getMahavrata,
  getAlgorithm,
  getPrinciple,
  getLaw,
};
