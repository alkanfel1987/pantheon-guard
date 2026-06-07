/**
 * pantheon-guard · regression bench runner (shared)
 *
 * Two distinct corpora, two distinct contracts:
 *
 *   FROZEN (bench/corpus-frozen.json) — the PRE-REGISTERED N=509 benchmark.
 *     Labels fixed 2026-05-05 BEFORE the detector existed. This file is
 *     IMMUTABLE: its SHA-256 must never change. It backs the published
 *     metric (N=509, RU 95.7%, FP 0.4%). bench:check fails hard on any hash
 *     drift, any new FP, or a statistically significant McNemar regression.
 *
 *   LIVING (source arrays beyond the frozen boundary) — the growing
 *     regression set. New examples are appended to the same source files
 *     (examples/benchmark-multiregion-corpus.js [index >= FROZEN.multiregion],
 *     examples/benchmark-phase1-corpus.js [index >= FROZEN.phase1]). Growth is
 *     EXPECTED and must NOT fail CI. bench:check only fails the living set if a
 *     case that already had a recorded verdict REGRESSES (correct -> wrong).
 *
 * Why split: a single corpus file cannot be both "immutable pre-registered
 * benchmark" and "freely-growing test set" — those requirements contradict.
 * Conflating them is what made every corpus edit red the CI. Separating the
 * two jobs into two artifacts dissolves the trade-off: pre-registration stays
 * honest, and adding examples stays green.
 *
 * Contract when you change packs / defaults:
 *   1. Update PACK_STACK_NAMES below.
 *   2. Re-freeze: `npm run bench:freeze` (writes baseline.json + baseline-living.json).
 *   3. Commit both with a CHANGELOG entry explaining what shifted and why.
 *      NEVER silently re-freeze to hide a regression.
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

const frozenUrl = new URL('./corpus-frozen.json', import.meta.url);
const FROZEN = JSON.parse(readFileSync(frozenUrl, 'utf8'));
const FROZEN_MR = FROZEN.frozen_boundary.multiregion;
const FROZEN_PH = FROZEN.frozen_boundary.phase1;

function gradeCase(c) {
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
}

function summarize(results) {
  const total = results.length;
  const ok = results.filter((r) => r.correct).length;
  const fp = results.filter((r) => r.expected === 'pass' && r.caught).length;
  const fn = results.filter((r) => r.expected === 'catch' && !r.caught).length;
  return { accuracy: total ? ok / total : 1, ok, fp, fn };
}

// ─────────────────────── FROZEN (pre-registered N=509) ───────────────────────

// Hash the immutable snapshot file verbatim. Stable forever — nobody edits it.
function hashFrozen() {
  return createHash('sha256').update(readFileSync(frozenUrl)).digest('hex');
}

export function runFrozen() {
  const results = FROZEN.cases.map(gradeCase);
  return {
    schema_version: 2,
    set: 'frozen',
    pack_stack: PACK_STACK_NAMES,
    corpus_hash: hashFrozen(),
    corpus_size: results.length,
    summary: summarize(results),
    results,
  };
}

// Back-compat: callers that imported runCorpus get the frozen set.
export const runCorpus = runFrozen;

// ─────────────────────── LIVING (growing regression set) ─────────────────────

// Everything in the source arrays beyond the frozen boundary. Append-only by
// convention; new entries land here automatically and never red the CI on
// growth alone.
export function buildLiving() {
  const out = [];
  MULTIREGION.slice(FROZEN_MR).forEach((c, i) =>
    out.push({ id: `multiregion:${FROZEN_MR + i}`, ...c }),
  );
  PHASE1.slice(FROZEN_PH).forEach((c, i) =>
    out.push({ id: `phase1:${FROZEN_PH + i}`, ...c }),
  );
  return out;
}

export function runLiving() {
  const results = buildLiving().map(gradeCase);
  return {
    schema_version: 2,
    set: 'living',
    pack_stack: PACK_STACK_NAMES,
    corpus_size: results.length,
    summary: summarize(results),
    results,
  };
}
