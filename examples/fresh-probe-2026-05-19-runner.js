/**
 * fresh-probe-2026-05-19-runner.js
 *
 *   node examples/fresh-probe-2026-05-19-runner.js
 *
 * Runs the PRE-REGISTERED stack (core + news + epistemology) over the
 * user-adjudicated fresh held-out corpus. Reports catch-rate / FP-rate with
 * Wilson 95% CI, per language and combined.
 *
 * Pre-registration: docs/FRESH-PROBE-PREREG-2026-05-19.md
 * SHA-256 of the corpus is printed before the run — proof the labelled set
 * was frozen before the detector touched it.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { stackPacks, newsPack, epistemologyPack } from '../src/index.js';
import { CORPUS } from './fresh-probe-2026-05-19-corpus.js';

const corpusPath = new URL('./fresh-probe-2026-05-19-corpus.js', import.meta.url);
const corpusHash = createHash('sha256').update(readFileSync(corpusPath)).digest('hex');

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

const runner = stackPacks([newsPack, epistemologyPack]);

const langs = ['ru', 'en', 'de'];
const stat = {};
for (const l of [...langs, 'all']) stat[l] = { tp: 0, fn: 0, fp: 0, tn: 0 };
const misses = [];

for (const item of CORPUS) {
  const r = runner(item.text);
  const caught = r.passes === false;
  const manip = item.label === 'manipulative';
  for (const b of [stat[item.lang], stat.all]) {
    if (manip && caught) b.tp++;
    else if (manip && !caught) b.fn++;
    else if (!manip && caught) b.fp++;
    else b.tn++;
  }
  if (manip && !caught) misses.push(`FN ${item.id}`);
  if (!manip && caught) misses.push(`FP ${item.id}`);
}

console.log('fresh-probe 2026-05-19 — pre-registered stack: core + news + epistemology');
console.log(`corpus SHA-256: ${corpusHash}`);
console.log(`config: stackPacks([newsPack, epistemologyPack])`);
console.log(`ground truth: ${CORPUS.filter((c) => c.label === 'manipulative').length} manipulative / ` +
  `${CORPUS.filter((c) => c.label === 'neutral').length} neutral · N=${CORPUS.length}\n`);

const fmt = (k, n) => {
  if (n === 0) return '—';
  const [lo, hi] = wilson95(k, n);
  return `${((100 * k) / n).toFixed(1)}% [${(100 * lo).toFixed(1)}–${(100 * hi).toFixed(1)}%] (${k}/${n})`;
};

for (const l of [...langs, 'all']) {
  const s = stat[l];
  const catchN = s.tp + s.fn;
  const fpN = s.fp + s.tn;
  console.log(`${l.toUpperCase().padEnd(4)} catch ${fmt(s.tp, catchN).padEnd(36)} FP ${fmt(s.fp, fpN)}`);
}

console.log(`\nmisclassified (${misses.length}): ${misses.join(', ')}`);
