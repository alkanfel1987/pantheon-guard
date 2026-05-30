/**
 * Field test on fresh news — runner, 2026-05-21.
 * Corpus: examples/field-test-news-corpus-2026-05-21.js
 *
 * Mirrors multiregion-runner shape but consumes label ∈ {manipulative,
 * neutral}. Maps: manipulative → 'catch', neutral → 'pass'. Reports
 * per-source / per-region / aggregate with Wilson 95% CI.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  applyPack,
  stackPacks,
  newsPack,
  newsDePack,
  epistemologyPack,
  healthcarePack,
  clickbaitPack,
} from '../src/index.js';
import { CORPUS, PULLED_AT } from './field-test-news-corpus-2026-05-21.js';

const corpusPath = new URL('./field-test-news-corpus-2026-05-21.js', import.meta.url);
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
console.log('  pantheon-guard · FIELD-TEST FRESH NEWS · ' + PULLED_AT);
console.log('═'.repeat(78));
console.log(`  Corpus SHA-256: ${corpusHash}`);
console.log(`  N = ${CORPUS.length}`);
console.log('  Stack: news + news-de + epistemology + healthcare + clickbait');

const counts = { pass: 0, catch: 0 };
const bySrc = {};
const byLang = {};
const fails = [];

for (const c of CORPUS) {
  const expected = c.label === 'manipulative' ? 'catch' : 'pass';
  counts[expected]++;
  const r = runner(c.text);
  const caught = r.passes === false;
  const correct = (expected === 'catch' && caught) || (expected === 'pass' && !caught);

  bySrc[c.source] ??= { lang: c.lang, total: 0, ok: 0, fp: 0, fn: 0, pass_n: 0, catch_n: 0, pass_ok: 0, catch_ok: 0 };
  byLang[c.lang] ??= { total: 0, ok: 0, fp: 0, fn: 0, pass_n: 0, catch_n: 0, pass_ok: 0, catch_ok: 0 };

  for (const agg of [bySrc[c.source], byLang[c.lang]]) {
    agg.total++;
    if (expected === 'pass') agg.pass_n++;
    else agg.catch_n++;
    if (correct) {
      agg.ok++;
      if (expected === 'pass') agg.pass_ok++;
      else agg.catch_ok++;
    } else {
      if (expected === 'pass' && caught) agg.fp++;
      if (expected === 'catch' && !caught) agg.fn++;
    }
  }

  if (!correct) {
    fails.push({
      id: c.id, source: c.source, lang: c.lang, label: c.label, expected, caught,
      reasons: (r.reasons || []).slice(0, 3),
      text: c.text.slice(0, 90),
    });
  }
}

console.log('\n── Per-language ──');
console.log('  lang  n   ok   acc%   FP  FN   catch-rate  FP-rate');
console.log('  ' + '─'.repeat(72));
for (const [lng, s] of Object.entries(byLang)) {
  const acc = ((s.ok / s.total) * 100).toFixed(0);
  const catchR = s.catch_n ? ((s.catch_ok / s.catch_n) * 100).toFixed(0) : '—';
  const fpR = s.pass_n ? ((s.fp / s.pass_n) * 100).toFixed(1) : '—';
  console.log(`  ${lng.padEnd(4)}  ${String(s.total).padStart(3)}  ${String(s.ok).padStart(3)}   ${acc.padStart(3)}%  ${String(s.fp).padStart(2)}  ${String(s.fn).padStart(2)}    ${catchR.padStart(3)}%       ${fpR.padStart(4)}%`);
}

console.log('\n── Per-source ──');
console.log('  source                  lang  n   ok   acc%   FP  FN');
console.log('  ' + '─'.repeat(60));
for (const [src, s] of Object.entries(bySrc)) {
  const acc = ((s.ok / s.total) * 100).toFixed(0);
  console.log(`  ${src.padEnd(22)} ${s.lang.padEnd(3)}  ${String(s.total).padStart(2)}  ${String(s.ok).padStart(3)}   ${acc.padStart(3)}%  ${String(s.fp).padStart(2)}  ${String(s.fn).padStart(2)}`);
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

console.log('\n── Aggregate (N=' + N + ', manipulative=' + catchN + ', neutral=' + passN + ') ──');
console.log(`  Accuracy:    ${(accuracy*100).toFixed(1)}%   95% CI [${(accLo*100).toFixed(1)}%, ${(accHi*100).toFixed(1)}%]   ${totalOk}/${N}`);
console.log(`  Catch-rate:  ${(catchRate*100).toFixed(1)}%   95% CI [${(catchLo*100).toFixed(1)}%, ${(catchHi*100).toFixed(1)}%]   ${catchOk}/${catchN}`);
console.log(`  FP-rate:     ${(fpRate*100).toFixed(1)}%   95% CI [${(fpLo*100).toFixed(1)}%, ${(fpHi*100).toFixed(1)}%]   ${totalFP}/${passN}`);

if (fails.length > 0) {
  console.log('\n── Failures (' + fails.length + ' total) ──');
  for (const f of fails) {
    const tag = f.expected === 'pass' ? 'FP' : 'FN';
    const reasonStr = f.reasons.length ? ` :: ${f.reasons.map(r => r.code || r).join(', ')}` : '';
    console.log(`  [${tag}] [${f.id}] ${f.text}${reasonStr}`);
  }
}

console.log('\n' + '═'.repeat(78) + '\n');
