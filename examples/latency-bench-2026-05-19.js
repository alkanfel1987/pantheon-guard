/**
 * latency-bench-2026-05-19.js — dedicated per-call latency measurement.
 *
 *   node examples/latency-bench-2026-05-19.js
 *
 * Times the DETERMINISTIC path (regex packs, sync) over the 93 real
 * headlines of the fresh-probe corpus. Two configs:
 *   1. inspect()       — core, default policy
 *   2. stackPacks 5    — healthcare+news+news-de+news-hi+epistemology
 *      (the config the NeMo output-rail integration uses)
 * Headlines are short text — a "typical short output" proxy; longer
 * inputs cost more. The optional semantic ML layer (mDeBERTa) is a
 * separate ~64ms async path and is NOT measured here.
 */
import { performance } from 'node:perf_hooks';
import {
  inspect,
  stackPacks,
  healthcarePack,
  newsPack,
  newsDePack,
  newsHiPack,
  epistemologyPack,
} from '../src/index.js';
import { CORPUS } from './fresh-probe-2026-05-19-corpus.js';

const texts = CORPUS.map((c) => c.text);
const stack = stackPacks([healthcarePack, newsPack, newsDePack, newsHiPack, epistemologyPack]);

function bench(label, fn) {
  for (let r = 0; r < 3; r++) for (const t of texts) fn(t); // warmup
  const ROUNDS = 20;
  const d = [];
  for (let r = 0; r < ROUNDS; r++) {
    for (const t of texts) {
      const t0 = performance.now();
      fn(t);
      d.push(performance.now() - t0);
    }
  }
  d.sort((a, b) => a - b);
  const n = d.length;
  const mean = d.reduce((a, b) => a + b, 0) / n;
  const pct = (p) => d[Math.min(n - 1, Math.floor(p * n))];
  console.log(`\n${label} · N=${n} calls`);
  console.log(`  mean ${mean.toFixed(4)} ms · median ${pct(0.5).toFixed(4)} ms · ` +
    `p95 ${pct(0.95).toFixed(4)} ms · p99 ${pct(0.99).toFixed(4)} ms · max ${d[n - 1].toFixed(4)} ms`);
}

console.log('pantheon-guard — per-call latency (deterministic path)');
console.log('corpus: fresh-probe-2026-05-19 · 93 short texts · 20 rounds, warmed');
bench('1. inspect() — core, default policy', (t) => inspect(t));
bench('2. stackPacks ×5 — healthcare+news+news-de+news-hi+epistemology', (t) => stack(t));
