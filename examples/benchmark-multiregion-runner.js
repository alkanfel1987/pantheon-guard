/**
 * Multi-region benchmark runner · 2026-05-05
 *
 * Runs core + news + epistemology stack against EN+DE corpus to measure
 * regional generalisation of pack architecture. Reports per-region and
 * per-source breakdown with Wilson 95% CI.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  inspect,
  applyPack,
  stackPacks,
  newsPack,
  newsDePack,
  epistemologyPack,
  healthcarePack,
  clickbaitPack,
} from '../src/index.js';
import { CORPUS } from './benchmark-multiregion-corpus.js';

const corpusPath = new URL('./benchmark-multiregion-corpus.js', import.meta.url);
const corpusBytes = readFileSync(corpusPath);
const corpusHash = createHash('sha256').update(corpusBytes).digest('hex');

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const halfwidth = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - halfwidth), Math.min(1, center + halfwidth)];
}

const runner = stackPacks([newsPack, newsDePack, epistemologyPack, healthcarePack, clickbaitPack]);

console.log('\n' + '═'.repeat(78));
console.log('  pantheon-guard · MULTI-REGION BENCHMARK · 2026-05-05');
console.log('═'.repeat(78));
console.log(`  Corpus SHA-256: ${corpusHash}`);
console.log(`  N = ${CORPUS.length}  (EN + DE only — RU is in benchmark-phase1)`);
console.log('  Stack: core + news v0.1.2 + epistemology v0.0.1 + healthcare v0.1.0 + clickbait v0.0.1');

const counts = { pass: 0, catch: 0 };
const bySrc = {};
const byRegion = {};
const fails = [];

for (const c of CORPUS) {
  counts[c.expected]++;
  const r = runner(c.text);
  const caught = r.passes === false;
  const correct = (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);

  bySrc[c.src] ??= { region: c.region, total: 0, ok: 0, fp: 0, fn: 0, pass_n: 0, catch_n: 0, pass_ok: 0, catch_ok: 0 };
  byRegion[c.region] ??= { total: 0, ok: 0, fp: 0, fn: 0, pass_n: 0, catch_n: 0, pass_ok: 0, catch_ok: 0 };

  for (const agg of [bySrc[c.src], byRegion[c.region]]) {
    agg.total++;
    if (c.expected === 'pass') agg.pass_n++;
    else agg.catch_n++;
    if (correct) {
      agg.ok++;
      if (c.expected === 'pass') agg.pass_ok++;
      else agg.catch_ok++;
    } else {
      if (c.expected === 'pass' && caught) agg.fp++;
      if (c.expected === 'catch' && !caught) agg.fn++;
    }
  }

  if (!correct) {
    fails.push({
      src: c.src, region: c.region, label: c.label, expected: c.expected, caught,
      text: c.text.slice(0, 70),
    });
  }
}

console.log('\n── Per-region ──');
console.log('  region  n   ok   acc%   FP  FN   pass-rate  catch-rate');
console.log('  ' + '─'.repeat(72));
for (const [r, s] of Object.entries(byRegion)) {
  const acc = ((s.ok / s.total) * 100).toFixed(0);
  const passR = s.pass_n ? ((s.pass_ok / s.pass_n) * 100).toFixed(0) : '—';
  const catchR = s.catch_n ? ((s.catch_ok / s.catch_n) * 100).toFixed(0) : '—';
  console.log(`  ${r.padEnd(6)}  ${String(s.total).padStart(3)}  ${String(s.ok).padStart(3)}   ${acc.padStart(3)}%  ${String(s.fp).padStart(2)}  ${String(s.fn).padStart(2)}    ${passR.padStart(3)}%       ${catchR.padStart(3)}%`);
}

console.log('\n── Per-source ──');
console.log('  src       reg  n   ok   acc%   FP  FN');
console.log('  ' + '─'.repeat(60));
for (const [src, s] of Object.entries(bySrc)) {
  const acc = ((s.ok / s.total) * 100).toFixed(0);
  console.log(`  ${src.padEnd(9)} ${s.region.padEnd(3)}  ${String(s.total).padStart(2)}  ${String(s.ok).padStart(3)}   ${acc.padStart(3)}%  ${String(s.fp).padStart(2)}  ${String(s.fn).padStart(2)}`);
}

const N = CORPUS.length;
const totalOk = Object.values(bySrc).reduce((a, s) => a + s.ok, 0);
const totalFP = Object.values(bySrc).reduce((a, s) => a + s.fp, 0);
const totalFN = Object.values(bySrc).reduce((a, s) => a + s.fn, 0);
const accuracy = totalOk / N;
const [accLo, accHi] = wilson95(totalOk, N);
const passN = counts.pass;
const fpRate = totalFP / passN;
const [fpLo, fpHi] = wilson95(totalFP, passN);
const catchN = counts.catch;
const catchOk = catchN - totalFN;
const catchRate = catchOk / catchN;
const [catchLo, catchHi] = wilson95(catchOk, catchN);

console.log('\n── Aggregate (EN + DE, N=' + N + ') ──');
console.log(`  Accuracy:    ${(accuracy*100).toFixed(1)}%   95% CI [${(accLo*100).toFixed(1)}%, ${(accHi*100).toFixed(1)}%]`);
console.log(`  Catch-rate:  ${(catchRate*100).toFixed(1)}%   95% CI [${(catchLo*100).toFixed(1)}%, ${(catchHi*100).toFixed(1)}%]   ${catchOk}/${catchN}`);
console.log(`  FP-rate:     ${(fpRate*100).toFixed(1)}%   95% CI [${(fpLo*100).toFixed(1)}%, ${(fpHi*100).toFixed(1)}%]   ${totalFP}/${passN}`);

if (fails.length > 0) {
  console.log('\n── Failures (first 30) ──');
  for (const f of fails.slice(0, 30)) {
    const tag = f.expected === 'pass' ? 'FP' : 'FN';
    console.log(`  [${tag}] [${f.src}/${f.region}] ${f.label}`);
  }
  if (fails.length > 30) console.log(`  ... (+${fails.length - 30} more)`);
}

console.log('\n' + '═'.repeat(78) + '\n');
