/**
 * @pantheon-guard/model-mdeberta-xnli
 *
 * Multilingual zero-shot NLI Embedder for pantheon-guard semantic packs.
 * Wraps MoritzLaurer/mDeBERTa-v3-base-mnli-xnli (quantized ONNX) via
 * @huggingface/transformers v3.
 *
 * Implements the Embedder interface from
 * pantheon-guard/src/packs/semantic/embedder.js:
 *
 *   classify(text, hypothesis) → Promise<number ∈ [0, 1]>
 *   ready() → Promise<boolean>
 *   name() → string
 *   version() → string
 *
 * First-use behavior: model files (~140MB quantized) are downloaded by
 * @huggingface/transformers from HuggingFace Hub and cached locally
 * (~/.cache/huggingface/hub/ on Linux/Mac, %USERPROFILE%\.cache\... on
 * Windows). Subsequent calls reuse cache.
 *
 * For air-gapped environments, configure env.localModelPath to point
 * to a pre-staged model directory.
 *
 * Sovereignty note: HuggingFace Hub is a US resource. RU customers may
 * need to either (a) pre-stage model from a non-sanctioned mirror, or
 * (b) use a custom Embedder. The peer-dep architecture preserves this
 * customer choice — pantheon-guard core has no opinion.
 */

import { pipeline, env } from '@huggingface/transformers';

const MODEL_ID = 'MoritzLaurer/mDeBERTa-v3-base-mnli-xnli';
const PACKAGE_VERSION = '0.0.1';

let _classifier = null;
let _loadPromise = null;

/**
 * Internal: load the classifier exactly once (idempotent).
 */
async function _loadClassifier(opts = {}) {
  if (_classifier) return _classifier;
  if (_loadPromise) return _loadPromise;

  // Allow caller to override env settings (e.g. localModelPath, allowRemoteModels)
  if (opts.localModelPath) {
    env.localModelPath = opts.localModelPath;
  }
  if (opts.allowRemoteModels === false) {
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
  }

  _loadPromise = pipeline('zero-shot-classification', MODEL_ID, {
    // quantized = smaller download, faster CPU inference
    dtype: opts.dtype || 'q8',
    progress_callback: opts.progressCallback,
  }).then((c) => {
    _classifier = c;
    _loadPromise = null;
    return c;
  });

  return _loadPromise;
}

/**
 * Factory matching the loadEmbedder('mdeberta-xnli') contract from
 * pantheon-guard/src/packs/semantic/index.js — must export `createEmbedder`
 * returning Promise<Embedder>.
 *
 * @param {Object} [opts]
 * @param {'fp32'|'fp16'|'q8'|'q4'} [opts.dtype]   precision (default 'q8')
 * @param {string} [opts.localModelPath]           local model directory
 * @param {boolean} [opts.allowRemoteModels]       set false for air-gapped
 * @param {Function} [opts.progressCallback]       download progress hook
 * @returns {Promise<import('pantheon-guard/src/packs/semantic/embedder.js').Embedder>}
 */
export async function createEmbedder(opts = {}) {
  // Eager-load model so first classify() doesn't pay cold-start
  const classifier = await _loadClassifier(opts);
  let _ready = true;

  return {
    /**
     * Zero-shot NLI: returns entailment probability ∈ [0, 1] for the
     * (text, hypothesis) pair. Uses multi_label semantics — each label
     * is scored independently as binary entailment, NOT renormalized
     * across labels. This is the correct primitive for "is this text
     * an instance of property X" detection.
     */
    async classify(text, hypothesis) {
      if (!_ready) throw new Error('embedder not ready');
      if (typeof text !== 'string' || text.length === 0) return 0;
      if (typeof hypothesis !== 'string' || hypothesis.length === 0) {
        throw new TypeError('hypothesis must be non-empty string');
      }

      const result = await classifier(text, [hypothesis], {
        multi_label: true,
      });
      // result shape: { sequence, labels: [hypothesis], scores: [number] }
      const score = Array.isArray(result.scores) && result.scores.length > 0
        ? result.scores[0]
        : 0;
      // Defensive clamp
      return Math.max(0, Math.min(1, score));
    },

    async ready() {
      return _ready;
    },

    name() {
      return 'mdeberta-xnli';
    },

    version() {
      return `${PACKAGE_VERSION}+model:${MODEL_ID}`;
    },
  };
}

// Convenience export for callers wanting raw access (advanced)
export { MODEL_ID };
