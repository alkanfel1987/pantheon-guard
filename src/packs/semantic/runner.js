/**
 * pantheon-guard · semantic / async pack runner
 *
 * Async-aware extension of the regex pack runner. Coexists with the sync
 * `runPack` / `applyPack` / `stackPacks` from `../index.js` — regex packs
 * keep microsecond-latency sync execution; semantic packs add async
 * inference per detector.
 *
 * Shape parity with sync runner:
 *   - same `unmetRequirements` array shape (id, severity, message, evidence?)
 *   - PLUS new field `semantic` carrying score / threshold / hypothesis
 *
 * A pack can declare BOTH `requirements` (sync, regex/predicate) AND
 * `semanticDetectors` (async, embedder-backed). The runner executes regex
 * synchronously first (fast path, possibly short-circuiting), then runs
 * pending semantic detectors.
 */

import { inspect as coreInspect } from '../../inspect.js';
import { normalizeText } from '../../normalize.js';
import { runPack, validatePack } from '../index.js';
import { validateEmbedder } from './embedder.js';

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

/**
 * @typedef {Object} SemanticDetector
 * @property {string} id                           detector id (unique within pack)
 * @property {string[]} catalogueAnchors           catalogue IDs (e.g. 'ns-avisesa-sama-5-1-23')
 * @property {string} hypothesis                   NLI hypothesis sentence
 * @property {number} threshold                    fire when classify() ≥ threshold
 * @property {'low'|'medium'|'high'} severity
 * @property {string} message
 * @property {(text: string, score: number) => string[]} [evidence]   optional evidence array builder
 * @property {string} [language]                   language hint, e.g. 'en' / 'ru' / 'multilingual'
 */

/**
 * @typedef {Object} SemanticPack
 * @property {string} id
 * @property {string} version
 * @property {string} description
 * @property {Array<*>} [detectionPatterns]    inherited from regex pack interface (can be empty)
 * @property {Array<*>} [requirements]         inherited (can be empty)
 * @property {SemanticDetector[]} semanticDetectors
 * @property {Object} [calibratorOverrides]
 * @property {Object} [metadata]
 */

const VALID_SEVERITIES = Object.freeze(['low', 'medium', 'high']);

export function validateSemanticPack(pack) {
  // First validate as a regular pack (covers id, version, detectionPatterns, requirements)
  validatePack(pack);
  if (!Array.isArray(pack.semanticDetectors)) {
    throw new TypeError(`semantic pack ${pack.id}: missing semanticDetectors array`);
  }
  for (const d of pack.semanticDetectors) {
    if (typeof d.id !== 'string' || !d.id) {
      throw new TypeError(`semantic pack ${pack.id}: detector missing id`);
    }
    if (typeof d.hypothesis !== 'string' || d.hypothesis.length === 0) {
      throw new TypeError(`semantic pack ${pack.id}: detector "${d.id}" missing hypothesis`);
    }
    if (typeof d.threshold !== 'number' || d.threshold < 0 || d.threshold > 1) {
      throw new TypeError(
        `semantic pack ${pack.id}: detector "${d.id}" threshold must be number ∈ [0, 1], got ${d.threshold}`
      );
    }
    if (!VALID_SEVERITIES.includes(d.severity)) {
      throw new TypeError(
        `semantic pack ${pack.id}: detector "${d.id}" severity must be ${VALID_SEVERITIES.join('|')}`
      );
    }
    if (typeof d.message !== 'string') {
      throw new TypeError(`semantic pack ${pack.id}: detector "${d.id}" missing message`);
    }
    if (!Array.isArray(d.catalogueAnchors)) {
      throw new TypeError(`semantic pack ${pack.id}: detector "${d.id}" missing catalogueAnchors array`);
    }
  }
  return true;
}

// ─────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────

/**
 * Runs a semantic pack against `text` using the supplied embedder.
 * Backward-compatible with regex pack contract: if pack has no
 * `semanticDetectors`, falls back to sync runPack (just wrapped in Promise).
 *
 * @param {SemanticPack} pack
 * @param {string} text
 * @param {import('./embedder.js').Embedder} embedder
 * @param {Object} [options]
 * @param {string} [options.normalized]
 * @returns {Promise<{
 *   packViolations: Array<*>,
 *   packEvidence: Object<string, string[]>,
 *   unmetRequirements: Array<{id: string, severity: string, message: string, evidence?: string[], semantic?: {score: number, threshold: number, hypothesis: string}}>,
 *   semanticDetectorResults: Array<{id: string, score: number, threshold: number, fired: boolean, hypothesis: string}>,
 * }>}
 */
export async function runPackAsync(pack, text, embedder, options = {}) {
  validateSemanticPack(pack);
  validateEmbedder(embedder);

  const normalized = options.normalized ?? normalizeText(text);
  const syncResult = runPack(pack, text, { normalized });

  // Run all semantic detectors in parallel
  const detectorResults = await Promise.all(
    pack.semanticDetectors.map(async (det) => {
      const score = await embedder.classify(text, det.hypothesis);
      const fired = score >= det.threshold;
      return {
        id: det.id,
        hypothesis: det.hypothesis,
        threshold: det.threshold,
        score,
        fired,
        // keep ref to detector for assembling unmet item:
        _detector: det,
      };
    })
  );

  // Translate fired detectors into unmetRequirements items (parity shape)
  const semanticUnmet = detectorResults
    .filter((r) => r.fired)
    .map((r) => {
      const item = {
        id: `${pack.id}/${r.id}`,
        severity: r._detector.severity,
        message: r._detector.message,
        semantic: {
          score: Math.round(r.score * 10000) / 10000,
          threshold: r.threshold,
          hypothesis: r.hypothesis,
          embedder: { name: embedder.name(), version: embedder.version() },
        },
      };
      if (typeof r._detector.evidence === 'function') {
        const ev = r._detector.evidence(text, r.score);
        if (Array.isArray(ev) && ev.length > 0) item.evidence = ev;
      }
      return item;
    });

  return {
    packViolations: syncResult.packViolations,
    packEvidence: syncResult.packEvidence,
    unmetRequirements: [...syncResult.unmetRequirements, ...semanticUnmet],
    semanticDetectorResults: detectorResults.map((r) => ({
      id: r.id,
      score: Math.round(r.score * 10000) / 10000,
      threshold: r.threshold,
      fired: r.fired,
      hypothesis: r.hypothesis,
    })),
  };
}

// ─────────────────────────────────────────────
// applyPackAsync — one pack
// ─────────────────────────────────────────────

/**
 * Async analog of `applyPack`. Returns an inspect() variant that runs the
 * core sync detection AND the semantic pack.
 *
 * @param {SemanticPack} pack
 * @param {import('./embedder.js').Embedder} embedder
 * @returns {(text: string, options?: Object) => Promise<Object>}
 */
export function applyPackAsync(pack, embedder) {
  validateSemanticPack(pack);
  validateEmbedder(embedder);
  return async function inspectWithSemanticPack(text, options = {}) {
    const normalized = typeof text === 'string' ? normalizeText(text) : '';
    const baseResult = coreInspect(text, {
      ...options,
      calibratorOverrides: pack.calibratorOverrides ?? options.calibratorOverrides,
      normalized,
    });
    const { packViolations, packEvidence, unmetRequirements, semanticDetectorResults } =
      await runPackAsync(pack, text, embedder, { normalized });

    const passesPack = packViolations.length === 0 && unmetRequirements.length === 0;
    return {
      ...baseResult,
      passes: baseResult.passes && passesPack,
      pack: { id: pack.id, version: pack.version, embedder: { name: embedder.name(), version: embedder.version() } },
      packViolations,
      packEvidence,
      unmetRequirements,
      semanticDetectorResults,
    };
  };
}

// ─────────────────────────────────────────────
// stackPacksAsync — multiple packs (semantic + regex mixed)
// ─────────────────────────────────────────────

/**
 * Stack multiple packs; semantic packs use the embedder, regex packs run
 * synchronously. Useful for `epistemology + epistemologySemantic` combo.
 *
 * @param {Array<{pack: Object, embedder?: import('./embedder.js').Embedder}>} entries
 *   Each entry: pack + optional embedder (required iff pack has semanticDetectors).
 * @returns {(text: string, options?: Object) => Promise<Object>}
 */
export function stackPacksAsync(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError('stackPacksAsync requires non-empty entries array');
  }

  // Validate all entries upfront
  for (const e of entries) {
    if (!e || typeof e !== 'object' || !e.pack) {
      throw new TypeError('stackPacksAsync: each entry must be {pack, embedder?}');
    }
    const isSemantic = Array.isArray(e.pack.semanticDetectors) && e.pack.semanticDetectors.length > 0;
    if (isSemantic) {
      if (!e.embedder) {
        throw new TypeError(
          `stackPacksAsync: pack ${e.pack.id} has semanticDetectors but no embedder provided`
        );
      }
      validateSemanticPack(e.pack);
      validateEmbedder(e.embedder);
    } else {
      validatePack(e.pack);
    }
  }

  const mergedOverrides = entries.reduce((acc, e) => (
    e.pack.calibratorOverrides ? { ...acc, ...e.pack.calibratorOverrides } : acc
  ), undefined);

  return async function inspectWithStack(text, options = {}) {
    const normalized = typeof text === 'string' ? normalizeText(text) : '';
    const baseResult = coreInspect(text, {
      ...options,
      calibratorOverrides: mergedOverrides ?? options.calibratorOverrides,
      normalized,
    });

    const allPackViolations = [];
    const allPackEvidence = {};
    const allUnmet = [];
    const allSemanticResults = [];
    const packIds = [];

    for (const { pack, embedder } of entries) {
      const isSemantic = Array.isArray(pack.semanticDetectors) && pack.semanticDetectors.length > 0;
      if (isSemantic) {
        const r = await runPackAsync(pack, text, embedder, { normalized });
        allPackViolations.push(...r.packViolations);
        for (const [k, v] of Object.entries(r.packEvidence)) {
          if (!allPackEvidence[k]) allPackEvidence[k] = [];
          allPackEvidence[k].push(...v);
        }
        allUnmet.push(...r.unmetRequirements);
        allSemanticResults.push(...r.semanticDetectorResults.map((d) => ({ pack: pack.id, ...d })));
        packIds.push(`${pack.id}@${pack.version}+${embedder.name()}`);
      } else {
        const r = runPack(pack, text, { normalized });
        allPackViolations.push(...r.packViolations);
        for (const [k, v] of Object.entries(r.packEvidence)) {
          if (!allPackEvidence[k]) allPackEvidence[k] = [];
          allPackEvidence[k].push(...v);
        }
        allUnmet.push(...r.unmetRequirements);
        packIds.push(`${pack.id}@${pack.version}`);
      }
    }

    const passesPacks = allPackViolations.length === 0 && allUnmet.length === 0;
    return {
      ...baseResult,
      passes: baseResult.passes && passesPacks,
      packs: packIds,
      packViolations: allPackViolations,
      packEvidence: allPackEvidence,
      unmetRequirements: allUnmet,
      semanticDetectorResults: allSemanticResults,
    };
  };
}
