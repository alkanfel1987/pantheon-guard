/**
 * test/packs-semantic.test.js — semantic pack architecture
 *
 * Tests the async pack runner with MockEmbedder. Real-model integration
 * tests live in the peer-dep package's own test suite — pantheon-guard
 * core is dependency-free and uses only mocks here.
 *
 * Coverage:
 *   1. Embedder interface validation (validateEmbedder)
 *   2. Semantic pack validation (validateSemanticPack)
 *   3. runPackAsync — basic fire/silent + score/threshold/hypothesis surface
 *   4. applyPackAsync — full inspect()-style result with passes flag
 *   5. stackPacksAsync — mixing regex + semantic in one pipeline
 *   6. loadEmbedder — peer-dep loader returns clear error when package missing
 *   7. evidence() function on semantic detector
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createMockEmbedder,
  validateEmbedder,
  runPackAsync,
  applyPackAsync,
  stackPacksAsync,
  validateSemanticPack,
  loadEmbedder,
  feSemanticPack,
} from '../src/packs/semantic/index.js';
import { epistemologyPack } from '../src/packs/epistemology.js';

// ─── Embedder interface validation ───

test('validateEmbedder: valid mock passes', () => {
  const emb = createMockEmbedder();
  assert.equal(validateEmbedder(emb), true);
});

test('validateEmbedder: missing method throws', () => {
  const broken = { classify: async () => 0.5, ready: async () => true, name: () => 'x' };
  assert.throws(() => validateEmbedder(broken), /missing method: version/);
});

test('validateEmbedder: non-object throws', () => {
  assert.throws(() => validateEmbedder(null), /must be an object/);
  assert.throws(() => validateEmbedder('foo'), /must be an object/);
});

// ─── MockEmbedder behavior ───

test('createMockEmbedder: fixtures override score', async () => {
  const emb = createMockEmbedder({
    fixtures: { 'both parties': 0.92, 'analytical comparison': 0.05 },
  });
  assert.equal(await emb.classify('both parties are bad', 'leveling claim'), 0.92);
  assert.equal(await emb.classify('analytical comparison shows', 'leveling claim'), 0.05);
});

test('createMockEmbedder: default heuristic returns ∈ [0, 1]', async () => {
  const emb = createMockEmbedder();
  const score = await emb.classify('both sides equally bad', 'leveling claim equivalent');
  assert.ok(score >= 0 && score <= 1, `score must be ∈ [0,1], got ${score}`);
});

test('createMockEmbedder: ready/name/version', async () => {
  const emb = createMockEmbedder();
  assert.equal(await emb.ready(), true);
  assert.equal(emb.name(), 'mock-embedder');
  assert.match(emb.version(), /^0\.0\.0-mock/);
});

// ─── Semantic pack validation ───

test('validateSemanticPack: feSemanticPack passes', () => {
  assert.equal(validateSemanticPack(feSemanticPack), true);
});

test('validateSemanticPack: missing semanticDetectors throws', () => {
  const bad = { ...feSemanticPack, semanticDetectors: undefined };
  assert.throws(() => validateSemanticPack(bad), /missing semanticDetectors/);
});

test('validateSemanticPack: threshold out of [0,1] throws', () => {
  const bad = {
    ...feSemanticPack,
    semanticDetectors: [
      { ...feSemanticPack.semanticDetectors[0], threshold: 1.5 },
    ],
  };
  assert.throws(() => validateSemanticPack(bad), /threshold must be number/);
});

// ─── runPackAsync core behavior ───

test('runPackAsync: high-score fires detector → unmetRequirements', async () => {
  const emb = createMockEmbedder({
    fixtures: { 'TARGET-FE-TEXT': 0.91 },
  });
  const r = await runPackAsync(feSemanticPack, 'TARGET-FE-TEXT corp critique', emb);
  assert.equal(r.unmetRequirements.length, 1);
  const item = r.unmetRequirements[0];
  assert.equal(item.id, 'fe-semantic/false_equivalence_semantic');
  assert.equal(item.severity, 'medium');
  assert.ok(item.semantic);
  assert.equal(item.semantic.score, 0.91);
  // Threshold reflects current operating point (iter-2 post-LIVE-R1 audit:
  // 0.5 → 0.55 to drop weak-Democrats-opened-gates FP).
  assert.equal(item.semantic.threshold, 0.55);
  assert.equal(item.semantic.embedder.name, 'mock-embedder');
});

test('runPackAsync: low-score does not fire → empty unmet', async () => {
  const emb = createMockEmbedder({
    fixtures: { 'TARGET-CLEAN': 0.10 },
  });
  const r = await runPackAsync(feSemanticPack, 'TARGET-CLEAN benign text', emb);
  assert.equal(r.unmetRequirements.length, 0);
  // semanticDetectorResults still records attempt
  assert.equal(r.semanticDetectorResults.length, 1);
  assert.equal(r.semanticDetectorResults[0].fired, false);
});

test('runPackAsync: evidence() function attached to unmet item', async () => {
  const emb = createMockEmbedder({ fixtures: { 'EVT': 0.88 } });
  const r = await runPackAsync(feSemanticPack, 'EVT some text', emb);
  const item = r.unmetRequirements[0];
  assert.ok(Array.isArray(item.evidence));
  assert.ok(item.evidence.some((e) => e.startsWith('score=')));
});

test('runPackAsync: detector at exactly threshold fires (≥ semantics)', async () => {
  // Use the actual configured threshold so test stays valid across calibration.
  const t = feSemanticPack.semanticDetectors[0].threshold;
  const emb = createMockEmbedder({ fixtures: { 'BOUND': t } });
  const r = await runPackAsync(feSemanticPack, 'BOUND test text', emb);
  assert.equal(r.unmetRequirements.length, 1);
  assert.equal(r.semanticDetectorResults[0].fired, true);
});

test('runPackAsync: just under threshold does NOT fire', async () => {
  const t = feSemanticPack.semanticDetectors[0].threshold;
  const emb = createMockEmbedder({ fixtures: { 'UNDER': t - 0.01 } });
  const r = await runPackAsync(feSemanticPack, 'UNDER test text', emb);
  assert.equal(r.unmetRequirements.length, 0);
  assert.equal(r.semanticDetectorResults[0].fired, false);
});

// ─── applyPackAsync — wrapper ───

test('applyPackAsync: result has passes/pack/semanticDetectorResults', async () => {
  const emb = createMockEmbedder({ fixtures: { 'FIRES': 0.90 } });
  const inspect = applyPackAsync(feSemanticPack, emb);
  const r = await inspect('FIRES some leveling text');
  assert.equal(r.passes, false);
  assert.equal(r.pack.id, 'fe-semantic');
  assert.equal(r.pack.embedder.name, 'mock-embedder');
  assert.ok(Array.isArray(r.semanticDetectorResults));
});

test('applyPackAsync: clean text passes', async () => {
  const emb = createMockEmbedder({ fixtures: { 'CLEAN': 0.05 } });
  const inspect = applyPackAsync(feSemanticPack, emb);
  const r = await inspect('CLEAN technical documentation about HTTP status codes.');
  // base result may flag urgency etc; semantic should not contribute
  assert.equal(r.unmetRequirements.length, 0);
});

// ─── stackPacksAsync — mixing regex + semantic ───

test('stackPacksAsync: regex pack runs sync alongside semantic pack', async () => {
  const emb = createMockEmbedder({ fixtures: { 'MIX': 0.85 } });
  const inspect = stackPacksAsync([
    { pack: epistemologyPack },
    { pack: feSemanticPack, embedder: emb },
  ]);
  const r = await inspect('MIX leveling claim across factions');
  assert.equal(r.packs.length, 2);
  assert.match(r.packs[0], /^epistemology@/);
  assert.match(r.packs[1], /^fe-semantic@.*\+mock-embedder/);
});

test('stackPacksAsync: throws when semantic pack lacks embedder', () => {
  assert.throws(
    () => stackPacksAsync([{ pack: feSemanticPack }]),
    /has semanticDetectors but no embedder/
  );
});

test('stackPacksAsync: throws on empty array', () => {
  assert.throws(() => stackPacksAsync([]), /non-empty/);
});

// ─── loadEmbedder peer-dep ───

test('loadEmbedder: unknown model throws clear error', async () => {
  await assert.rejects(
    loadEmbedder('not-a-real-model'),
    /unknown model/
  );
});

test('loadEmbedder: returns Embedder when peer-dep is installed (workspace-resolved)', async () => {
  // Workspace setup makes @pantheon-guard/model-mdeberta-xnli resolvable
  // during dev. In a published-only consumer environment without the peer
  // package this would throw the install-instruction error — that branch
  // is structurally covered by `unknown model` test above.
  // Cold-start may take ~2-5s for cached model load on this machine.
  const emb = await loadEmbedder('mdeberta-xnli');
  assert.equal(typeof emb.classify, 'function');
  assert.equal(emb.name(), 'mdeberta-xnli');
  assert.match(emb.version(), /MoritzLaurer\/mDeBERTa-v3-base-mnli-xnli$/);
});

// ─── feSemanticPack metadata sanity ───

test('feSemanticPack: catalogue anchors point to NS jāti', () => {
  const anchors = feSemanticPack.metadata.catalogueAnchors;
  assert.deepEqual(
    [...anchors].sort(),
    ['ns-anityasama-5-1-32', 'ns-avisesa-sama-5-1-23'].sort()
  );
});

test('feSemanticPack: experimental version flag present', () => {
  assert.match(feSemanticPack.version, /experimental/);
});

test('feSemanticPack: companionRegexPack reference correct', () => {
  assert.equal(
    feSemanticPack.metadata.companionRegexPack,
    'epistemology/false_equivalence_levelling'
  );
});
