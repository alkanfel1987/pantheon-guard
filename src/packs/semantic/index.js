/**
 * pantheon-guard · semantic / public exports
 *
 * Entry point for the semantic-pack subsystem. Imports here are the public
 * API for consumers who want to use semantic detectors. Regex packs remain
 * accessible via `pantheon-guard/packs` (sync, no model dependency).
 *
 * Typical usage:
 *
 *   import { applyPackAsync, createMockEmbedder, feSemanticPack } from 'pantheon-guard/packs/semantic';
 *
 *   const embedder = createMockEmbedder({ fixtures: { 'both parties': 0.9 } });
 *   const inspect = applyPackAsync(feSemanticPack, embedder);
 *   const r = await inspect("Both parties are dominated by the swamp.");
 *
 * Production with real model (peer-dep):
 *
 *   import { applyPackAsync, feSemanticPack } from 'pantheon-guard/packs/semantic';
 *   import { createMDeBERTaEmbedder } from '@pantheon-guard/model-mdeberta-xnli';
 *
 *   const embedder = await createMDeBERTaEmbedder();
 *   const inspect = applyPackAsync(feSemanticPack, embedder);
 *   const r = await inspect("...");
 *
 * Stacking regex + semantic for full FE coverage:
 *
 *   import { stackPacksAsync } from 'pantheon-guard/packs/semantic';
 *   import { epistemologyPack } from 'pantheon-guard/packs/epistemology';
 *   import { feSemanticPack } from 'pantheon-guard/packs/semantic';
 *
 *   const inspect = stackPacksAsync([
 *     { pack: epistemologyPack },                  // sync regex pack
 *     { pack: feSemanticPack, embedder },          // async semantic pack
 *   ]);
 */

export {
  createMockEmbedder,
  validateEmbedder,
} from './embedder.js';

export {
  runPackAsync,
  applyPackAsync,
  stackPacksAsync,
  validateSemanticPack,
} from './runner.js';

export { feSemanticPack } from './false-equivalence.js';

// ─────────────────────────────────────────────
// Peer-dep loader — lazy require with clear error
// ─────────────────────────────────────────────

const PEER_DEP_PKGS = Object.freeze({
  'mdeberta-xnli': '@pantheon-guard/model-mdeberta-xnli',
});

/**
 * Attempt to load a real-model embedder by name. Returns the embedder
 * instance on success, throws a clear actionable error if the peer-dep
 * package is not installed.
 *
 * Available models (resolve to peer-dep package names):
 *   - 'mdeberta-xnli' → @pantheon-guard/model-mdeberta-xnli
 *
 * @param {string} modelName
 * @param {Object} [opts]  forwarded to the model package factory
 * @returns {Promise<import('./embedder.js').Embedder>}
 *
 * @example
 *   import { loadEmbedder } from 'pantheon-guard/packs/semantic';
 *   const embedder = await loadEmbedder('mdeberta-xnli');
 */
export async function loadEmbedder(modelName, opts = {}) {
  const pkgName = PEER_DEP_PKGS[modelName];
  if (!pkgName) {
    throw new Error(
      `loadEmbedder: unknown model "${modelName}". ` +
      `Available: ${Object.keys(PEER_DEP_PKGS).join(', ')}. ` +
      `For custom embedders, implement the Embedder interface from src/packs/semantic/embedder.js.`
    );
  }

  let mod;
  try {
    // Dynamic import — will throw MODULE_NOT_FOUND if peer-dep not installed
    mod = await import(pkgName);
  } catch (err) {
    if (err && (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND' || /Cannot find package/.test(String(err.message || '')))) {
      throw new Error(
        `Semantic detector requires peer-dep model package "${pkgName}".\n\n` +
        `Install:\n  npm install ${pkgName}\n\n` +
        `Or supply a custom embedder via createMockEmbedder() / hand-rolled Embedder interface.\n` +
        `See docs/SEMANTIC-PACK-ARCHITECTURE.md §"Distribution rationale" for why ` +
        `pantheon-guard does NOT auto-download models from network.`
      );
    }
    throw err;
  }

  if (typeof mod.createEmbedder !== 'function') {
    throw new Error(
      `Peer-dep package "${pkgName}" does not export createEmbedder(). ` +
      `Expected interface: createEmbedder(opts) → Promise<Embedder>.`
    );
  }
  return mod.createEmbedder(opts);
}
