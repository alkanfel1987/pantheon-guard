/**
 * Real-corpus probe runner — anecdotal_override detector v0.3.0-pre.1
 *
 * Two-class evaluation (no inhibitor under test):
 *   - positive: anecdote-as-displacement (must FIRE)
 *   - negative: bounded experience-sharing or non-override personal anecdote (must NOT fire)
 *
 * Reproducibility:
 *   cd test-corpus/anecdotal-override-2026-05-10 && node runner.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasAnecdotalOverride,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus.json'), 'utf-8'));

function wilson(s, n) {
  if (n === 0) return { lo: 0, hi: 0, mean: 0 };
  const z = 1.96;
  const p = s / n;
  const denom = 1 + (z * z) / n;
  const center = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return { mean: p, lo: Math.max(0, (center - margin) / denom), hi: Math.min(1, (center + margin) / denom) };
}
const pct = (x) => (x * 100).toFixed(1) + '%';
const fmt = (ci) => `${pct(ci.mean)} [${pct(ci.lo)}, ${pct(ci.hi)}]`;

const results = corpus.entries.map((e) => ({ ...e, fires: hasAnecdotalOverride(e.text) }));

console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);
console.log('synthesis_flag:', corpus._meta.synthesis_flag, '\n');

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const verdict = r.class === 'positive' ? (r.fires ? 'TP' : 'FN') : (r.fires ? 'FP' : 'TN');
  const synth = r.synthesis ? ' SYNTH' : ' REAL ';
  console.log(`  [${verdict}]${synth} ${r.id} (${r.lang}) fires=${r.fires}`);
  console.log(`     ${r.text.slice(0, 110)}${r.text.length > 110 ? '…' : ''}`);
}

const positives = results.filter((r) => r.class === 'positive');
const negatives = results.filter((r) => r.class === 'negative');
const tp = positives.filter((r) => r.fires).length;
const fp = negatives.filter((r) => r.fires).length;

const enPos = positives.filter((r) => r.lang === 'en');
const ruPos = positives.filter((r) => r.lang === 'ru');
const enNeg = negatives.filter((r) => r.lang === 'en');
const ruNeg = negatives.filter((r) => r.lang === 'ru');

console.log('\n=== AGGREGATE METRICS ===\n');
console.log(`  Positives: ${positives.length}  Negatives: ${negatives.length}`);
console.log(`  Catch:    ${fmt(wilson(tp, positives.length))}`);
console.log(`  FP:       ${fmt(wilson(fp, negatives.length))}`);

console.log('\n=== PER-LANGUAGE ===\n');
console.log(`  EN catch: ${fmt(wilson(enPos.filter((r) => r.fires).length, enPos.length))}  (n=${enPos.length})`);
console.log(`  RU catch: ${fmt(wilson(ruPos.filter((r) => r.fires).length, ruPos.length))}  (n=${ruPos.length})`);
console.log(`  EN FP:    ${fmt(wilson(enNeg.filter((r) => r.fires).length, enNeg.length))}  (n=${enNeg.length})`);
console.log(`  RU FP:    ${fmt(wilson(ruNeg.filter((r) => r.fires).length, ruNeg.length))}  (n=${ruNeg.length})`);

console.log('\n=== FN AUDIT (positives that did NOT fire) ===\n');
const fns = positives.filter((p) => !p.fires);
if (fns.length === 0) {
  console.log('  (none — full positive recall)');
} else {
  for (const r of fns) {
    console.log(`  ${r.id} (${r.lang}): ${r.text.slice(0, 110)}…`);
    if (r.notes) console.log(`     marker: ${r.notes}`);
  }
}

console.log('\n=== FP AUDIT (negatives that fired) ===\n');
const fps = negatives.filter((n) => n.fires);
if (fps.length === 0) {
  console.log('  (none — clean classification on negatives)');
} else {
  for (const r of fps) {
    console.log(`  ${r.id} (${r.lang}): ${r.text}`);
    if (r.notes) console.log(`     ctx: ${r.notes}`);
  }
}

console.log('\n=== PRE-REG DECISION RULE EVALUATION ===\n');
const catchPoint = wilson(tp, positives.length).mean;
const fpPoint = wilson(fp, negatives.length).mean;
let decision;
if (catchPoint >= 0.6 && fpPoint <= 0.05) {
  decision = 'PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required';
} else if (catchPoint >= 0.4 && fpPoint <= 0.05) {
  decision = 'HOLD scaffold; document iter-2 plan';
} else {
  decision = 'ITER-2 MANDATORY';
}
console.log(`  Catch (point): ${pct(catchPoint)}  (target ≥60%)`);
console.log(`  FP    (point): ${pct(fpPoint)}  (target ≤5%)`);
console.log(`  Decision: ${decision}`);

const summary = {
  date: new Date().toISOString(),
  detector: 'anecdotal_override',
  pack_version: epistemologyPack.version,
  synthesis_flag: corpus._meta.synthesis_flag,
  corpus_size: { positive: positives.length, negative: negatives.length },
  metrics: {
    catch_point: wilson(tp, positives.length),
    fp_point: wilson(fp, negatives.length),
    catch_en: wilson(enPos.filter((r) => r.fires).length, enPos.length),
    catch_ru: wilson(ruPos.filter((r) => r.fires).length, ruPos.length),
    fp_en: wilson(enNeg.filter((r) => r.fires).length, enNeg.length),
    fp_ru: wilson(ruNeg.filter((r) => r.fires).length, ruNeg.length),
  },
  fn_ids: fns.map((r) => r.id),
  fp_ids: fps.map((r) => r.id),
  decision,
};
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(summary, null, 2));
console.log('\n  → results.json written\n');
