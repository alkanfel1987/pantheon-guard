/**
 * pantheon-guard · pack architecture
 *
 * A "pack" is a domain-specific extension to the deterministic core. It adds:
 *
 *   1. detectionPatterns — additional regex matchers, each tagged with a
 *      core mahā-vrata rule it routes through (ahimsa, satya, asteya,
 *      shaucha, indriya_nigraha). Packs do NOT introduce new top-level
 *      ethical categories — every domain-specific harm maps onto a
 *      Yoga-sūtra rule for principled consistency.
 *
 *   2. requirements — domain-specific *positive* requirements: things a
 *      compliant AI text MUST contain in this domain (e.g. healthcare
 *      AI must recommend professional consultation when discussing
 *      symptoms). Failing a requirement is its own violation class.
 *
 *   3. calibratorOverrides — per-pack tightening of the calibrator
 *      thresholds. Higher-stakes domains (medical, financial advice) use
 *      lower noise floors and lower strong-thresholds, because the cost
 *      of a confident-but-wrong "pass" is higher.
 *
 * The pack does NOT replace the core; it composes with it. Calling
 * `applyPack(pack)` returns an enhanced inspect() function that runs
 * core detection PLUS the pack rules in a single pipeline.
 *
 * Why this design:
 *   - Backward compatible: core inspect() unchanged.
 *   - Principled: domain rules route through existing mahā-vrata, so
 *     audit logs stay consistent across packs.
 *   - Composable: callers can stack packs (e.g. healthcare + finance for
 *     a hybrid medtech-fintech app).
 *   - Commercial fit: packs are the natural unit for paid subscriptions
 *     in the open-core model.
 */

import { inspect as coreInspect } from '../inspect.js';
import { CALIBRATOR_PARAMS } from '../calibrator.js';
import { normalizeText } from '../normalize.js';

/**
 * @typedef {Object} DetectionPattern
 * @property {'ahimsa'|'satya'|'asteya'|'shaucha'|'indriya_nigraha'} rule  Maha-vrata rule this pattern routes through.
 * @property {string} name                 Marker name for evidence trail.
 * @property {RegExp} regex                Pattern to match against normalized text.
 * @property {string} [description]        Human-readable description for audit.
 */

/**
 * @typedef {Object} Requirement
 * @property {string} id                   Unique requirement id.
 * @property {(text: string) => boolean} condition  When this requirement applies (e.g. "if text mentions symptoms").
 * @property {(text: string) => boolean} check       Whether the requirement is satisfied.
 * @property {'low'|'medium'|'high'} severity        Severity if unmet.
 * @property {string} message                        Audit log message.
 */

/**
 * @typedef {Object} Pack
 * @property {string} id
 * @property {string} version
 * @property {string} description
 * @property {DetectionPattern[]} detectionPatterns
 * @property {Requirement[]} requirements
 * @property {Partial<typeof CALIBRATOR_PARAMS>} [calibratorOverrides]
 */

// ─────────────────────────────────────────────
// Pack validation — defensive checks at registration
// ─────────────────────────────────────────────

const VALID_RULES = Object.freeze(
  ['ahimsa', 'satya', 'asteya', 'shaucha', 'indriya_nigraha']
);

export function validatePack(pack) {
  if (!pack || typeof pack !== 'object') {
    throw new TypeError('pack must be an object');
  }
  if (typeof pack.id !== 'string' || !pack.id) {
    throw new TypeError('pack.id must be a non-empty string');
  }
  if (typeof pack.version !== 'string') {
    throw new TypeError('pack.version must be a string');
  }
  if (!Array.isArray(pack.detectionPatterns)) {
    throw new TypeError('pack.detectionPatterns must be an array');
  }
  for (const p of pack.detectionPatterns) {
    if (!VALID_RULES.includes(p.rule)) {
      throw new TypeError(
        `pack ${pack.id}: pattern "${p.name}" routes to unknown rule "${p.rule}"; ` +
        `must be one of ${VALID_RULES.join(', ')}`
      );
    }
    if (!(p.regex instanceof RegExp)) {
      throw new TypeError(`pack ${pack.id}: pattern "${p.name}" missing regex`);
    }
  }
  if (!Array.isArray(pack.requirements)) {
    throw new TypeError('pack.requirements must be an array (empty array is fine)');
  }
  for (const r of pack.requirements) {
    if (typeof r.id !== 'string' || !r.id) {
      throw new TypeError(`pack ${pack.id}: requirement missing id`);
    }
    if (typeof r.condition !== 'function' || typeof r.check !== 'function') {
      throw new TypeError(`pack ${pack.id}: requirement "${r.id}" missing condition/check`);
    }
    if (!['low', 'medium', 'high'].includes(r.severity)) {
      throw new TypeError(
        `pack ${pack.id}: requirement "${r.id}" severity must be low|medium|high`
      );
    }
  }
  return true;
}

// ─────────────────────────────────────────────
// Pack runner — runs additional patterns + requirements over text
// ─────────────────────────────────────────────

/**
 * Run a pack's detection patterns + requirements against text.
 * Returns the additional violations and pack-specific evidence found.
 *
 * @param {Pack} pack
 * @param {string} text
 * @returns {{
 *   packViolations: Array<{rule: string, source: string, reason: string, severity: string}>,
 *   packEvidence: Object<string, string[]>,
 *   unmetRequirements: Array<{id: string, severity: string, message: string}>,
 * }}
 */
export function runPack(pack, text) {
  validatePack(pack);
  const normalized = normalizeText(text);
  const packEvidence = {};
  const packViolations = [];

  for (const p of pack.detectionPatterns) {
    const m = normalized.match(p.regex);
    if (m) {
      if (!packEvidence[p.rule]) packEvidence[p.rule] = [];
      packEvidence[p.rule].push(`${pack.id}/${p.name}:${m[0]}`);
      packViolations.push({
        rule: p.rule,
        source: `${pack.id}/${p.name}`,
        reason: p.description || `pack rule ${p.name} matched`,
        severity: 'medium',
      });
    }
  }

  const unmetRequirements = [];
  for (const r of pack.requirements) {
    if (r.condition(text) && !r.check(text)) {
      unmetRequirements.push({
        id: `${pack.id}/${r.id}`,
        severity: r.severity,
        message: r.message,
      });
    }
  }

  return { packViolations, packEvidence, unmetRequirements };
}

// ─────────────────────────────────────────────
// applyPack — produces an inspect() variant enhanced with the pack
// ─────────────────────────────────────────────

/**
 * Wraps `inspect()` so every call also runs the supplied pack.
 *
 * The returned function has the same signature as inspect(), and adds
 * three fields to the returned object:
 *   - packViolations: pack-specific violations (in addition to core)
 *   - packEvidence:   markers naming which pack patterns fired
 *   - unmetRequirements: domain-specific positive checks that failed
 *
 * The `passes` field is conjunction: passes-core AND no-pack-violations
 * AND all-requirements-met.
 *
 * @param {Pack} pack
 * @returns {(text: string, options?: Object) => Object}
 */
export function applyPack(pack) {
  validatePack(pack);
  return function inspectWithPack(text, options = {}) {
    const baseResult = coreInspect(text, options);
    const { packViolations, packEvidence, unmetRequirements } = runPack(pack, text);

    const passesPack = packViolations.length === 0 && unmetRequirements.length === 0;
    return {
      ...baseResult,
      passes: baseResult.passes && passesPack,
      pack: { id: pack.id, version: pack.version },
      packViolations,
      packEvidence,
      unmetRequirements,
    };
  };
}

/**
 * Stack multiple packs. Calls run sequentially; violations and evidence
 * from each pack are merged into the result.
 *
 * @param {Pack[]} packs
 * @returns {(text: string, options?: Object) => Object}
 */
export function stackPacks(packs) {
  if (!Array.isArray(packs) || packs.length === 0) {
    throw new TypeError('stackPacks requires non-empty pack array');
  }
  packs.forEach(validatePack);
  return function inspectWithStack(text, options = {}) {
    let result = coreInspect(text, options);
    const allPackViolations = [];
    const allPackEvidence = {};
    const allUnmet = [];
    const packIds = [];
    for (const pack of packs) {
      const { packViolations, packEvidence, unmetRequirements } = runPack(pack, text);
      allPackViolations.push(...packViolations);
      for (const [k, v] of Object.entries(packEvidence)) {
        if (!allPackEvidence[k]) allPackEvidence[k] = [];
        allPackEvidence[k].push(...v);
      }
      allUnmet.push(...unmetRequirements);
      packIds.push(`${pack.id}@${pack.version}`);
    }
    const passesPacks = allPackViolations.length === 0 && allUnmet.length === 0;
    return {
      ...result,
      passes: result.passes && passesPacks,
      packs: packIds,
      packViolations: allPackViolations,
      packEvidence: allPackEvidence,
      unmetRequirements: allUnmet,
    };
  };
}
