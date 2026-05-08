/**
 * pantheon-guard · regression bench runner (shared)
 *
 * Single source of truth for "production stack vs frozen corpus N=509".
 * Used by:
 *   - bench/freeze-baseline.js  (writes baseline.json)
 *   - bench/check.js            (compares current run vs baseline.json)
 *
 * Pre-registered corpus = multiregion (EN+DE) + phase1 (RU). SHA-256 hashed
 * to detect any silent corpus mutation between freeze and check.
 *
 * If you add new packs / change defaults, the contract is:
 *   1. Update PACK_STACK_NAMES below.
 *   2. Re-freeze: `npm run bench:freeze`.
 *   3. Commit the new bench/baseline.json with a CHANGELOG entry explaining
 *      what shifted and why. NEVER silently re-freeze to hide regressions.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  stackPacks,
  newsPack,
  newsDePack,
  epistemologyPack,
  healthcarePack,
} from '../src/index.js';
import { CORPUS as MULTIREGION } from '../examples/benchmark-multiregion-corpus.js';
import { CORPUS as PHASE1 } from '../examples/benchmark-phase1-corpus.js';

export const PACK_STACK_NAMES = ['news', 'news-de', 'epistemology', 'healthcare'];

const STACK = stackPacks([newsPack, newsDePack, epistemologyPack, healthcarePack]);

const corpusFiles = [
  new URL('../examples/benchmark-multiregion-corpus.js', import.meta.url),
  new URL('../examples/benchmark-phase1-corpus.js', import.meta.url),
];

function hashCorpus() {
  const h = createHash('sha256');
  for (const u of corpusFiles) h.update(readFileSync(u));
  return h.digest('hex');
}

export function buildCorpus() {
  // Stable ordering: multiregion first, then phase1. Each entry tagged with a
  // deterministic id derived from (origin, index) so baseline diff is positional-
  // safe even if a single corpus file gets a non-text-changing edit.
  const out = [];
  MULTIREGION.forEach((c, i) => out.push({ id: `multiregion:${i}`, ...c }));
  PHASE1.forEach((c, i) => out.push({ id: `phase1:${i}`, ...c }));
  return out;
}

export function runCorpus() {
  const corpus = buildCorpus();
  const corpusHash = hashCorpus();
  const results = corpus.map((c) => {
    const r = STACK(c.text);
    const caught = r.passes === false;
    const correct =
      (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);
    return {
      id: c.id,
      src: c.src ?? null,
      region: c.region ?? null,
      label: c.label ?? null,
      expected: c.expected,
      caught,
      correct,
    };
  });

  const total = results.length;
  const ok = results.filter((r) => r.correct).length;
  const fp = results.filter((r) => r.expected === 'pass' && r.caught).length;
  const fn = results.filter((r) => r.expected === 'catch' && !r.caught).length;

  return {
    schema_version: 1,
    pack_stack: PACK_STACK_NAMES,
    corpus_hash: corpusHash,
    corpus_size: total,
    summary: {
      accuracy: ok / total,
      ok,
      fp,
      fn,
    },
    results,
  };
}
