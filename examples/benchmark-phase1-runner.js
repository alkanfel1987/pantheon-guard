/**
 * Benchmark Phase 1 runner · 2026-05-05
 *
 * Loads pre-registered corpus from benchmark-phase1-corpus.js, computes
 * SHA-256 of the labelled corpus BEFORE running guard (proof of pre-
 * registration), runs core+news+epistemology stack, reports per-source
 * accuracy + Wilson 95% CI + FN class breakdown.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  inspect,
  applyPack,
  stackPacks,
  newsPack,
  epistemologyPack,
} from '../src/index.js';
import { CORPUS } from './benchmark-phase1-corpus.js';

// ─────────────────────────────────────────────
// SHA-256 of corpus file (pre-registration proof)
// ─────────────────────────────────────────────

const corpusPath = new URL('./benchmark-phase1-corpus.js', import.meta.url);
const corpusBytes = readFileSync(corpusPath);
const corpusHash = createHash('sha256').update(corpusBytes).digest('hex');

// ─────────────────────────────────────────────
// Wilson 95% CI for proportion
// ─────────────────────────────────────────────

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const halfwidth = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - halfwidth), Math.min(1, center + halfwidth)];
}

// ─────────────────────────────────────────────
// Build runner: core + news + epistemology stacked
// ─────────────────────────────────────────────

const runner = stackPacks([newsPack, epistemologyPack]);

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(78));
console.log('  pantheon-guard · BENCHMARK Phase 1 · 2026-05-05');
console.log('═'.repeat(78));
console.log(`  Corpus SHA-256: ${corpusHash}`);
console.log(`  N = ${CORPUS.length}`);
console.log('  Stack: core + news-pack v0.1.1 + epistemology-pack v0.0.1');

const counts = { pass: 0, catch: 0 };
const bySrc = {};
const allResults = [];

for (const c of CORPUS) {
  counts[c.expected]++;
  const r = runner(c.text);
  const caught = r.passes === false;
  const correct = (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);
  bySrc[c.src] ??= { total: 0, ok: 0, fp: 0, fn: 0, fp_labels: [], fn_labels: [], pass_n: 0, catch_n: 0, pass_ok: 0, catch_ok: 0 };
  const s = bySrc[c.src];
  s.total++;
  if (c.expected === 'pass') s.pass_n++;
  else s.catch_n++;
  if (correct) {
    s.ok++;
    if (c.expected === 'pass') s.pass_ok++;
    else s.catch_ok++;
  } else {
    if (c.expected === 'pass' && caught) { s.fp++; s.fp_labels.push(c.label); }
    if (c.expected === 'catch' && !caught) { s.fn++; s.fn_labels.push(c.label); }
  }
  allResults.push({ src: c.src, expected: c.expected, caught, correct, label: c.label });
}

// ─────────────────────────────────────────────
// Per-source breakdown
// ─────────────────────────────────────────────

console.log('\n── Per-source ──');
console.log('  src          n  ok  acc%   FP  FN   pass-rate  catch-rate');
console.log('  ' + '─'.repeat(72));

let totalOk = 0, totalFP = 0, totalFN = 0;
for (const [src, s] of Object.entries(bySrc)) {
  totalOk += s.ok;
  totalFP += s.fp;
  totalFN += s.fn;
  const acc = ((s.ok / s.total) * 100).toFixed(0);
  const passRate = s.pass_n ? ((s.pass_ok / s.pass_n) * 100).toFixed(0) : '—';
  const catchRate = s.catch_n ? ((s.catch_ok / s.catch_n) * 100).toFixed(0) : '—';
  console.log(`  ${src.padEnd(10)}  ${String(s.total).padStart(2)}  ${String(s.ok).padStart(2)}   ${acc.padStart(3)}%  ${String(s.fp).padStart(2)}  ${String(s.fn).padStart(2)}    ${passRate.padStart(3)}%       ${catchRate.padStart(3)}%`);
}

// ─────────────────────────────────────────────
// Aggregates with Wilson CI
// ─────────────────────────────────────────────

const N = CORPUS.length;
const accuracy = totalOk / N;
const [accLo, accHi] = wilson95(totalOk, N);

const passN = counts.pass;
const passOk = passN - totalFP;
const fpRate = totalFP / passN;
const [fpLo, fpHi] = wilson95(totalFP, passN);

const catchN = counts.catch;
const catchOk = catchN - totalFN;
const catchRate = catchOk / catchN;
const [catchLo, catchHi] = wilson95(catchOk, catchN);

console.log('\n── Aggregate metrics with Wilson 95% CI ──');
console.log(`  N = ${N}  (pass=${passN}, catch=${catchN})`);
console.log(`  Accuracy:    ${(accuracy * 100).toFixed(1)}%   95% CI [${(accLo*100).toFixed(1)}%, ${(accHi*100).toFixed(1)}%]   ok=${totalOk}/${N}`);
console.log(`  Catch-rate:  ${(catchRate * 100).toFixed(1)}%   95% CI [${(catchLo*100).toFixed(1)}%, ${(catchHi*100).toFixed(1)}%]   ${catchOk}/${catchN}`);
console.log(`  FP-rate:     ${(fpRate * 100).toFixed(1)}%   95% CI [${(fpLo*100).toFixed(1)}%, ${(fpHi*100).toFixed(1)}%]   ${totalFP}/${passN}`);

// ─────────────────────────────────────────────
// FP / FN class detail
// ─────────────────────────────────────────────

if (totalFP > 0) {
  console.log('\n── False-positives (caught but expected pass) ──');
  for (const [src, s] of Object.entries(bySrc)) {
    for (const l of s.fp_labels) console.log(`  [${src}] ${l}`);
  }
}

if (totalFN > 0) {
  console.log('\n── False-negatives (passed but expected catch) ──');
  for (const [src, s] of Object.entries(bySrc)) {
    for (const l of s.fn_labels) console.log(`  [${src}] ${l}`);
  }
}

// ─────────────────────────────────────────────
// Pre-registered hypothesis check
// ─────────────────────────────────────────────

console.log('\n── Pre-registered hypothesis check ──');
const h1 = accLo >= 0.85;
console.log(`  H1: Accuracy lower bound ≥ 85%   →  ${h1 ? '✓' : '✗'} (got ${(accLo*100).toFixed(1)}%)`);

const mainstream = ['kom', 'rbc', 'vedomosti'];
let mainFP = 0, mainPassN = 0;
for (const m of mainstream) {
  if (bySrc[m]) { mainFP += bySrc[m].fp; mainPassN += bySrc[m].pass_n; }
}
const h2 = mainPassN === 0 ? false : (mainFP / mainPassN) <= 0.05;
console.log(`  H2: Mainstream FP ≤ 5%           →  ${h2 ? '✓' : '✗'} (got ${mainPassN ? ((mainFP/mainPassN)*100).toFixed(1) : '—'}%, ${mainFP}/${mainPassN})`);

const tabloid = ['kp', 'lenta'];
let tabCatch = 0, tabCatchN = 0;
for (const t of tabloid) {
  if (bySrc[t]) { tabCatch += bySrc[t].catch_ok; tabCatchN += bySrc[t].catch_n; }
}
const h3 = tabCatchN === 0 ? false : (tabCatch / tabCatchN) >= 0.6;
console.log(`  H3: Tabloid catch-rate ≥ 60%     →  ${h3 ? '✓' : '✗'} (got ${tabCatchN ? ((tabCatch/tabCatchN)*100).toFixed(1) : '—'}%, ${tabCatch}/${tabCatchN})`);

console.log('\n── Stopping rules ──');
const mainFPRate = mainPassN ? mainFP / mainPassN : 0;
const tabCatchRate = tabCatchN ? tabCatch / tabCatchN : 0;
const stopRevise = mainFPRate > 0.10 || tabCatchRate < 0.30;
console.log(`  Mainstream FP > 10%? ${mainFPRate > 0.10 ? '⚠ YES — REVISE' : '✓ no'}`);
console.log(`  Tabloid catch < 30%? ${tabCatchRate < 0.30 ? '⚠ YES — REVISE' : '✓ no'}`);
console.log(`  Decision: ${stopRevise ? '⚠ STOP & REVISE before Phase 2' : '✓ CONTINUE to Phase 2 (N=500)'}`);

console.log('\n' + '═'.repeat(78) + '\n');
