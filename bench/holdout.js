/**
 * pantheon-guard · deterministic dev/holdout split
 *
 * Carves a 10 % holdout from the N=509 corpus that pack development MUST NOT
 * see — it exists for blind external validation only. Selection is seeded
 * (Mulberry32) so the split is reproducible across machines and over time.
 *
 * The chosen ids are persisted to bench/holdout-ids.json on first call and
 * read on every subsequent call, so even if the seed-derivation code is
 * later edited, the same physical cases stay in the holdout.
 *
 * Discipline rule (enforce in code review, not at runtime):
 *   - never look at holdout case texts, labels, or per-case verdicts when
 *     iterating on packs
 *   - regression bench (bench/check.js) runs against the FULL corpus —
 *     accuracy on the dev split is what gates CI; holdout accuracy is
 *     reported separately as an honesty metric
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildCorpus } from './run.js';

const HOLDOUT_FRACTION = 0.10;
const SEED_STRING = 'pantheon-guard.holdout.v1.2026-05-08';

function seedFromString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const idsPath = fileURLToPath(new URL('./holdout-ids.json', import.meta.url));

function computeAndPersistSplit() {
  const corpus = buildCorpus();
  const rng = mulberry32(seedFromString(SEED_STRING));
  const indices = corpus.map((_, i) => i);
  // Fisher-Yates with seeded RNG
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const cutoff = Math.round(corpus.length * HOLDOUT_FRACTION);
  const holdoutIdx = indices.slice(0, cutoff).sort((a, b) => a - b);
  const holdoutIds = holdoutIdx.map((i) => corpus[i].id);

  writeFileSync(
    idsPath,
    JSON.stringify(
      {
        seed: SEED_STRING,
        fraction: HOLDOUT_FRACTION,
        n_total: corpus.length,
        n_holdout: holdoutIds.length,
        ids: holdoutIds,
      },
      null,
      2,
    ) + '\n',
  );
  return holdoutIds;
}

export function getHoldoutIds() {
  if (existsSync(idsPath)) {
    return JSON.parse(readFileSync(idsPath, 'utf8')).ids;
  }
  return computeAndPersistSplit();
}

export function getSplit() {
  const corpus = buildCorpus();
  const holdoutIds = new Set(getHoldoutIds());
  const dev = corpus.filter((c) => !holdoutIds.has(c.id));
  const holdout = corpus.filter((c) => holdoutIds.has(c.id));
  return { dev, holdout };
}

// CLI: print split summary
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('holdout.js')) {
  const { dev, holdout } = getSplit();
  const passDev = dev.filter((c) => c.expected === 'pass').length;
  const catchDev = dev.filter((c) => c.expected === 'catch').length;
  const passHo = holdout.filter((c) => c.expected === 'pass').length;
  const catchHo = holdout.filter((c) => c.expected === 'catch').length;
  console.log(`split:  dev=${dev.length} (pass=${passDev}, catch=${catchDev})`);
  console.log(`        holdout=${holdout.length} (pass=${passHo}, catch=${catchHo})`);
  console.log(`        seed: ${SEED_STRING}`);
}
