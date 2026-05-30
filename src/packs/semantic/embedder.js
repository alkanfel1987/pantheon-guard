/**
 * pantheon-guard · semantic / Embedder interface
 *
 * Abstract interface for the semantic-detection backend. Concrete
 * implementations are pluggable — pantheon-guard core ships only the
 * interface + a MockEmbedder for testing. Real model adapters (mDeBERTa
 * via @xenova/transformers, or future API-backed adapters) live in
 * separate peer-dep packages so the core remains light.
 *
 * Distribution model — peer-dep (per docs/SEMANTIC-PACK-ARCHITECTURE.md):
 * the model bytes are NOT bundled with `pantheon-guard`. User installs the
 * model package explicitly:
 *
 *   npm install pantheon-guard
 *   npm install @pantheon-guard/model-mdeberta-xnli   ← optional
 *
 * Then wires it:
 *
 *   import { createMDeBERTaEmbedder } from '@pantheon-guard/model-mdeberta-xnli';
 *   import { applyPackAsync } from 'pantheon-guard/packs/semantic';
 *   import { feSemanticPack } from 'pantheon-guard/packs/semantic/false-equivalence';
 *
 *   const embedder = await createMDeBERTaEmbedder();
 *   const inspect = applyPackAsync(feSemanticPack, embedder);
 *   const r = await inspect("Both parties are dominated by the swamp.");
 *
 * Why peer-dep, not on-demand download:
 *   - Enterprise security review flags auto-network dependencies
 *   - Sovereignty (RU customers) — HuggingFace-Hub fetch may not work
 *   - Air-gapped deploy — peer-dep ships with code artifact
 *   - Predictable failure mode at install time, not at first inference
 *   See docs/SEMANTIC-PACK-ARCHITECTURE.md §"Distribution rationale".
 */

// ─────────────────────────────────────────────
// Interface (TypeScript-style JSDoc)
// ─────────────────────────────────────────────

/**
 * @typedef {Object} Embedder
 * @property {(text: string, hypothesis: string) => Promise<number>} classify
 *   Zero-shot NLI: returns entailment probability ∈ [0, 1] for hypothesis|text.
 *   The convention: closer to 1 = hypothesis is supported by text.
 * @property {() => Promise<boolean>} ready
 *   Health check. Returns true when model is loaded and operational.
 * @property {() => string} name      identifier (e.g. 'mdeberta-xnli')
 * @property {() => string} version   semver of the model adapter
 */

// ─────────────────────────────────────────────
// MockEmbedder — deterministic, dependency-free, for tests
// ─────────────────────────────────────────────

/**
 * MockEmbedder returns scores via a user-supplied scoring function (or a
 * simple keyword-match heuristic if none provided). NEVER ship this in
 * production — it has no real ML and will not generalize.
 *
 * @param {Object} [opts]
 * @param {(text: string, hypothesis: string) => number} [opts.score]
 *   Custom deterministic scoring function returning ∈ [0, 1].
 * @param {Object<string, number>} [opts.fixtures]
 *   Map of (text-substring) → score. Useful for unit tests.
 * @returns {Embedder}
 */
export function createMockEmbedder(opts = {}) {
  const fixtures = opts.fixtures || {};
  const score = opts.score || ((text, hypothesis) => {
    // Default: simple keyword overlap heuristic — not for production
    const lt = text.toLowerCase();
    const lh = hypothesis.toLowerCase();
    const hypTokens = lh.split(/\s+/).filter((t) => t.length > 4);
    let hits = 0;
    for (const t of hypTokens) if (lt.includes(t)) hits++;
    return hypTokens.length === 0 ? 0 : hits / hypTokens.length;
  });

  return {
    async classify(text, hypothesis) {
      // Fixture override: if any key is a substring of text, return that score
      for (const [key, val] of Object.entries(fixtures)) {
        if (text.includes(key)) return val;
      }
      return score(text, hypothesis);
    },
    async ready() {
      return true;
    },
    name() {
      return 'mock-embedder';
    },
    version() {
      return '0.0.0-mock';
    },
  };
}

// ─────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────

/**
 * Validates an embedder object satisfies the interface contract.
 * Throws TypeError on any missing method.
 */
export function validateEmbedder(emb) {
  if (!emb || typeof emb !== 'object') {
    throw new TypeError('embedder must be an object');
  }
  for (const m of ['classify', 'ready', 'name', 'version']) {
    if (typeof emb[m] !== 'function') {
      throw new TypeError(`embedder is missing method: ${m}()`);
    }
  }
  return true;
}
