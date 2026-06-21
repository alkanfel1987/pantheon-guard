/**
 * pantheon-guard · pack architecture
 *
 * A "pack" is a domain-specific extension to the deterministic core. It adds:
 *
 *   1. detectionPatterns — additional regex matchers, each tagged with a
 *      core mahā-vrata rule (ahimsa / satya / asteya / shaucha /
 *      indriya_nigraha). Packs do NOT introduce new top-level ethical
 *      categories — every domain harm maps onto a Yoga-sūtra rule for
 *      principled audit consistency.
 *
 *   2. requirements — domain-specific *positive* requirements (e.g.
 *      healthcare AI must include provider-escalation language when
 *      discussing symptoms). Failing one is its own violation class.
 *
 *   3. calibratorOverrides — per-pack tightening of CALIBRATOR_PARAMS.
 *      Higher-stakes domains use lower noise floors and lower
 *      strong-thresholds because the cost of a confident-but-wrong
 *      "pass" is higher.
 *
 * `applyPack(pack)` returns an inspect() variant that runs core detection
 * with the pack's calibrator overrides AND the pack's patterns +
 * requirements. The normalized text is shared between the two passes so
 * normalization runs only once per inspect call.
 */

import { inspect as coreInspect } from '../inspect.js';
import { CALIBRATOR_PARAMS, calibrate, isStrong } from '../calibrator.js';
import { normalizeText } from '../normalize.js';
import { MAHAVRATA } from '../mahavrata.js';

const VALID_RULES = Object.freeze(Object.keys(MAHAVRATA.rules));
const VALID_SEVERITIES = Object.freeze(['low', 'medium', 'high']);

// Pañca-vṛtti taxonomy (Yoga-sūtra I.6) — pattern's cognitive-axis coordinate.
// Source: 00-Foundation/04D-Pramana-Architecture.md §2 in Pantheon vault.
// Optional on patterns; when present enables future cross-pack 5×5 coverage matrix
// (vṛtti × pack-domain) for empirical hypothesis verification per 04D §5.2.
export const VALID_VRTTIS = Object.freeze([
  'pramana',     // valid cognition substituted (e.g. agama disguised as pratyaksa)
  'viparyaya',   // cognitive inversion (impermanent for permanent, etc.)
  'vikalpa',     // conceptual construct without referent (puṣpita-vāc)
  'nidra',       // cognitive absence / decision-fatigue exploitation
  'smriti',      // memory tampering (gaslighting, selective recall)
]);

// Frame taxonomy (Mahābhārata + Manu-smṛti) — pack's applicability context.
// Source: 00-Foundation/06A-Legitimate-Ambiguity-Zones.md §5.1 in Pantheon vault.
// Same text has different manipulation-status in different frames; pack declares
// which frames it applies to. Optional; absent ≡ universal (all frames).
export const VALID_FRAMES = Object.freeze([
  'diplomatic',         // strategic/political — dvaidhībhāva legitimate
  'judicial',           // witness/expert — strict satya regime
  'medical',            // clinician — strict satya, ubhaya allowed for prognosis
  'personal',           // 1-to-1 / spiritual — strict satya everywhere
  'educational',        // teacher — strict satya, ubhaya allowed for pedagogy
  'public_information', // news / marketing — strictest; no ambiguity zone
]);

/**
 * @typedef {Object} DetectionPattern
 * @property {'ahimsa'|'satya'|'asteya'|'shaucha'|'indriya_nigraha'} rule
 * @property {string} name
 * @property {RegExp} regex
 * @property {string} [description]
 * @property {string} [counter]  optional positive marker — what right speech in this slot looks like (Я-4: shadow-integration requires positive replacement, not just blocking). Free-form string; consumed by future shadow-integration UI.
 * @property {'pramana'|'viparyaya'|'vikalpa'|'nidra'|'smriti'} [vrttiAxis]  optional pañca-vṛtti coordinate (Yoga-sūtra I.6); enables future cross-pack vṛtti coverage matrix per 04D §5.1.
 */

/**
 * @typedef {Object} Requirement
 * @property {string} id
 * @property {(text: string) => boolean} condition
 * @property {(text: string) => boolean} check
 * @property {'low'|'medium'|'high'} severity
 * @property {string} message
 * @property {(text: string) => string[]} [evidence]  optional — returns matched tokens / phrases for shadow-integration (Я-4): caller can show the author what triggered the rule rather than just blocking
 * @property {string} [counter]  optional positive marker — what fulfilling this requirement looks like (Я-4 parity with DetectionPattern).
 */

/**
 * @typedef {Object} Pack
 * @property {string} id
 * @property {string} version
 * @property {string} description
 * @property {DetectionPattern[]} detectionPatterns
 * @property {Requirement[]} requirements
 * @property {Partial<typeof CALIBRATOR_PARAMS>} [calibratorOverrides]  tunes the CORE detector's thresholds when this pack is applied.
 * @property {Partial<typeof CALIBRATOR_PARAMS>} [violationCalibration]  params for calibrating THIS pack's OWN detector hits into a manipulation score (see calibratePackViolations / result.packManipulation). Distinct from calibratorOverrides so a pack can lift its own per-hit base without touching core calibration.
 * @property {Array<'diplomatic'|'judicial'|'medical'|'personal'|'educational'|'public_information'>} [applicableFrames]  optional frames where this pack applies (06A §5.1); absent ≡ universal.
 */

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

export function validatePack(pack) {
  if (!pack || typeof pack !== 'object') throw new TypeError('pack must be an object');
  if (typeof pack.id !== 'string' || !pack.id) throw new TypeError('pack.id must be a non-empty string');
  if (typeof pack.version !== 'string') throw new TypeError('pack.version must be a string');
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
    if (p.counter !== undefined && (typeof p.counter !== 'string' || !p.counter)) {
      throw new TypeError(
        `pack ${pack.id}: pattern "${p.name}" counter must be a non-empty string when present`
      );
    }
    if (p.vrttiAxis !== undefined && !VALID_VRTTIS.includes(p.vrttiAxis)) {
      throw new TypeError(
        `pack ${pack.id}: pattern "${p.name}" vrttiAxis "${p.vrttiAxis}" must be one of ${VALID_VRTTIS.join(', ')}`
      );
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
    if (!VALID_SEVERITIES.includes(r.severity)) {
      throw new TypeError(
        `pack ${pack.id}: requirement "${r.id}" severity must be ${VALID_SEVERITIES.join('|')}`
      );
    }
    if (r.counter !== undefined && (typeof r.counter !== 'string' || !r.counter)) {
      throw new TypeError(
        `pack ${pack.id}: requirement "${r.id}" counter must be a non-empty string when present`
      );
    }
  }
  if (pack.applicableFrames !== undefined) {
    if (!Array.isArray(pack.applicableFrames) || pack.applicableFrames.length === 0) {
      throw new TypeError(
        `pack ${pack.id}: applicableFrames must be a non-empty array when present`
      );
    }
    for (const f of pack.applicableFrames) {
      if (!VALID_FRAMES.includes(f)) {
        throw new TypeError(
          `pack ${pack.id}: applicableFrames includes unknown frame "${f}"; ` +
          `must be one of ${VALID_FRAMES.join(', ')}`
        );
      }
    }
  }
  return true;
}

// ─────────────────────────────────────────────
// Pack runner
// ─────────────────────────────────────────────

/**
 * Run a pack's detection patterns + requirements.
 *
 * @param {Pack} pack
 * @param {string} text
 * @param {Object} [options]
 * @param {string} [options.normalized] precomputed normalized view (shared with core inspect)
 * @returns {{
 *   packViolations: Array<{rule: string, source: string, reason: string, severity: string}>,
 *   packEvidence: Object<string, string[]>,
 *   unmetRequirements: Array<{id: string, severity: string, message: string, evidence?: string[]}>,
 * }}
 */
export function runPack(pack, text, options = {}) {
  validatePack(pack);
  const normalized = options.normalized ?? normalizeText(text);
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
      const item = {
        id: `${pack.id}/${r.id}`,
        severity: r.severity,
        message: r.message,
      };
      if (typeof r.evidence === 'function') {
        const ev = r.evidence(text);
        if (Array.isArray(ev) && ev.length > 0) item.evidence = ev;
      }
      unmetRequirements.push(item);
    }
  }

  return { packViolations, packEvidence, unmetRequirements };
}

// ─────────────────────────────────────────────
// Calibrated pack score
// ─────────────────────────────────────────────

/**
 * Calibrate a pack's OWN detector hits into a manipulation probability.
 *
 * `runPack` reports pack hits as binary `packViolations`; this turns the
 * same `packEvidence` (keyed by rule, the shape `calibrate` expects) into a
 * graded score using the pack's `violationCalibration` merged over its
 * `calibratorOverrides`. Packs that lift their per-hit base (e.g. clickbait's
 * strong structural `numeric-listicle` detector) get a calibrated score that
 * reflects the detector's real precision instead of the generic 0.45 base.
 *
 * Returns `null` when the pack declares no `violationCalibration` (opt-in —
 * keeps the result shape unchanged for packs that haven't been re-fit).
 *
 * `strong` / `threshold` operationalise the saṃśaya-gate (04F §3.2): the
 * pack's `STRONG_THRESHOLD` is the decision criterion β, and `strong` is the
 * gate verdict — a graded consumer of the calibrated score that does NOT
 * relax `passes` (any hit still fails for FP-strict packs like clickbait).
 * A caller wanting a cost-matrix tuned gate reads `manipulation` + `threshold`.
 *
 * @param {Pack} pack
 * @param {string} text
 * @param {Object<string, string[]>} packEvidence  evidence map from runPack
 * @returns {{manipulation: number, confidence: Object<string, number>, abstain: boolean, reason: string|null, threshold: number, strong: boolean}|null}
 */
export function calibratePackViolations(pack, text, packEvidence) {
  if (!pack.violationCalibration) return null;
  const overrides = { ...pack.calibratorOverrides, ...pack.violationCalibration };
  const { confidence, manipulation, abstain, reason } =
    calibrate(text, packEvidence || {}, overrides);
  const threshold = overrides.STRONG_THRESHOLD ?? CALIBRATOR_PARAMS.STRONG_THRESHOLD;
  const strong = isStrong(manipulation, threshold);
  return { manipulation, confidence, abstain, reason, threshold, strong };
}

/**
 * Classify a pack outcome into a graded verdict from its calibrated score.
 * `passes` stays binary (FP-strict); this is the optional graded channel a
 * consumer reads to distinguish "block" from "flag for review".
 *
 *   'clear'       — no hit (calibrated manip ≈ 0)
 *   'flag'        — hit, but calibrated manip < pack threshold (weak claim)
 *   'strong-flag' — hit AND calibrated manip ≥ pack threshold (strong claim)
 *
 * @param {number} hitCount  number of pack violations
 * @param {{strong: boolean}|null} packCal  result of calibratePackViolations
 * @returns {'clear'|'flag'|'strong-flag'|null} null when the pack has no violationCalibration
 */
function packVerdict(hitCount, packCal) {
  if (!packCal) return null;
  if (hitCount === 0) return 'clear';
  return packCal.strong ? 'strong-flag' : 'flag';
}

// ─────────────────────────────────────────────
// applyPack — one pack
// ─────────────────────────────────────────────

/**
 * Wrap `inspect()` so every call also runs the supplied pack. The pack's
 * `calibratorOverrides` are passed through to inspect; the normalized
 * text is computed once and shared between core detection and pack
 * detection.
 *
 * @param {Pack} pack
 * @returns {(text: string, options?: Object) => Object}
 */
export function applyPack(pack) {
  validatePack(pack);
  return function inspectWithPack(text, options = {}) {
    const normalized = typeof text === 'string' ? normalizeText(text) : '';
    const baseResult = coreInspect(text, {
      ...options,
      calibratorOverrides: pack.calibratorOverrides ?? options.calibratorOverrides,
      normalized,
    });
    const { packViolations, packEvidence, unmetRequirements } =
      runPack(pack, text, { normalized });

    const passesPack = packViolations.length === 0 && unmetRequirements.length === 0;
    const packCal = calibratePackViolations(pack, text, packEvidence);
    return {
      ...baseResult,
      passes: baseResult.passes && passesPack,
      pack: { id: pack.id, version: pack.version },
      packViolations,
      packEvidence,
      unmetRequirements,
      // Calibrated score for the pack's own hits — present only when the pack
      // declares violationCalibration (opt-in; null otherwise).
      packManipulation: packCal ? packCal.manipulation : null,
      packConfidence: packCal ? packCal.confidence : null,
      // Graded consumer of the calibrated score against the pack's saṃśaya-gate
      // threshold (04F §3.2). Does NOT relax `passes` — any hit still fails.
      packManipulationStrong: packCal ? packCal.strong : null,
      packVerdict: packVerdict(packViolations.length, packCal),
    };
  };
}

// ─────────────────────────────────────────────
// stackPacks — multiple packs
// ─────────────────────────────────────────────

/**
 * Stack multiple packs. The merged calibratorOverrides apply (later packs
 * win on key collisions). Normalized text is computed once and shared
 * across all pack runs.
 *
 * @param {Pack[]} packs
 * @returns {(text: string, options?: Object) => Object}
 */
export function stackPacks(packs) {
  if (!Array.isArray(packs) || packs.length === 0) {
    throw new TypeError('stackPacks requires non-empty pack array');
  }
  packs.forEach(validatePack);

  // Merge calibrator overrides at composition time so per-call work is just
  // a shallow read.
  const mergedOverrides = packs.reduce((acc, p) => (
    p.calibratorOverrides ? { ...acc, ...p.calibratorOverrides } : acc
  ), undefined);

  return function inspectWithStack(text, options = {}) {
    const normalized = typeof text === 'string' ? normalizeText(text) : '';
    const baseResult = coreInspect(text, {
      ...options,
      calibratorOverrides: mergedOverrides ?? options.calibratorOverrides,
      normalized,
    });

    const allPackViolations = [];
    const allPackEvidence = {};
    const allUnmet = [];
    const packIds = [];
    const packManipulationByPack = {};
    let anyCalibrated = false;
    let strongAny = false;
    for (const pack of packs) {
      const { packViolations, packEvidence, unmetRequirements } =
        runPack(pack, text, { normalized });
      allPackViolations.push(...packViolations);
      for (const [k, v] of Object.entries(packEvidence)) {
        if (!allPackEvidence[k]) allPackEvidence[k] = [];
        allPackEvidence[k].push(...v);
      }
      allUnmet.push(...unmetRequirements);
      packIds.push(`${pack.id}@${pack.version}`);
      const packCal = calibratePackViolations(pack, text, packEvidence);
      if (packCal) {
        anyCalibrated = true;
        packManipulationByPack[pack.id] = packCal.manipulation;
        if (packViolations.length > 0 && packCal.strong) strongAny = true;
      }
    }

    const contributed = Object.values(packManipulationByPack);
    const passesPacks = allPackViolations.length === 0 && allUnmet.length === 0;
    return {
      ...baseResult,
      passes: baseResult.passes && passesPacks,
      packs: packIds,
      packViolations: allPackViolations,
      packEvidence: allPackEvidence,
      unmetRequirements: allUnmet,
      // Most-confident calibrated pack score (OR aggregation — 04F Bridge-B);
      // null when no stacked pack declares violationCalibration.
      packManipulation: contributed.length ? Math.max(...contributed) : null,
      packManipulationByPack,
      // Graded gate across the stack (any strong-flag wins; 04F §3.2).
      packManipulationStrong: anyCalibrated ? strongAny : null,
      packVerdict: !anyCalibrated
        ? null
        : (allPackViolations.length === 0 ? 'clear' : (strongAny ? 'strong-flag' : 'flag')),
    };
  };
}
