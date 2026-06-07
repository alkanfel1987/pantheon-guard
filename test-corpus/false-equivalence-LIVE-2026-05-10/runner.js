/**
 * LIVE-corpus probe runner — false_equivalence_levelling, 2026-05-10
 *
 * Companion to test-corpus/false-equivalence-2026-05-10/ (synthesis probe).
 * This run uses verbatim sentences extracted via WebFetch from real
 * articles. Goal: graduate detector from Tier 2 (synthesis) to Tier 1
 * (live) per docs/EVIDENCE-TIER.md, OR honestly document the
 * generalization gap.
 *
 * Reproducibility:
 *   cd test-corpus/false-equivalence-LIVE-2026-05-10 && node runner.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasFalseEquivalence,
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

const results = corpus.entries.map((e) => ({ ...e, fires: hasFalseEquivalence(e.text) }));

console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);
console.log('LIVE-CORPUS probe (companion to false-equivalence-2026-05-10 synthesis)\n');
console.log('synthesis_flag:', corpus._meta.synthesis_flag, '\n');

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const verdict = r.class === 'positive' ? (r.fires ? 'TP' : 'FN') : (r.fires ? 'FP' : 'TN');
  console.log(`  [${verdict}] LIVE  ${r.id} (${r.lang}) fires=${r.fires}`);
  console.log(`     ${r.text.slice(0, 110)}${r.text.length > 110 ? '…' : ''}`);
  console.log(`     src: ${r.source}`);
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

console.log('\n=== FN AUDIT (real positives detector did NOT fire on) ===\n');
const fns = positives.filter((p) => !p.fires);
if (fns.length === 0) {
  console.log('  (none — full positive recall on live corpus, would be a major surprise)');
} else {
  console.log(`  ${fns.length}/${positives.length} live positives missed. Each represents a real-world FE-framing the detector cannot catch.\n`);
  for (const r of fns) {
    console.log(`  ${r.id} (${r.lang}): ${r.text.slice(0, 110)}…`);
    console.log(`     src: ${r.source}`);
    if (r.notes) console.log(`     why-miss: ${r.notes}`);
  }
}

console.log('\n=== FP AUDIT (negatives detector fired on) ===\n');
const fps = negatives.filter((n) => n.fires);
if (fps.length === 0) {
  console.log('  (none — clean classification on live negatives)');
} else {
  for (const r of fps) {
    console.log(`  ${r.id} (${r.lang}): ${r.text}`);
    console.log(`     src: ${r.source}`);
    if (r.notes) console.log(`     ctx: ${r.notes}`);
  }
}

console.log('\n=== PRE-REG DECISION RULE EVALUATION ===\n');
const catchPoint = wilson(tp, positives.length).mean;
const fpPoint = wilson(fp, negatives.length).mean;
let decision;
if (catchPoint >= 0.6 && fpPoint <= 0.05) {
  decision = 'PROMOTE → Tier 1 (live-validated EN); update EVIDENCE-TIER';
} else if (catchPoint >= 0.5 && fpPoint <= 0.05) {
  decision = 'PROMOTE_PARTIAL → Tier 1 EN with documented coverage gap; iter-3 lexical broadening planned';
} else if (catchPoint >= 0.25 && fpPoint <= 0.05) {
  decision = 'HOLD Tier 2; iter-3 lexical broadening MANDATORY before Tier 1';
} else {
  decision = 'DEMOTE — synthesis probe was misleading; pattern coverage too narrow for live use';
}
console.log(`  Catch (point): ${pct(catchPoint)}`);
console.log(`  FP    (point): ${pct(fpPoint)}`);
console.log(`  Decision: ${decision}`);

console.log('\n=== HONEST FRAMING ===\n');
console.log('Synthesis probe (test-corpus/false-equivalence-2026-05-10/) reported:');
console.log('  catch 100% / FP 0%, N=14 pos / 12 neg synthesis-leaning.');
console.log('Live probe (this file):');
console.log(`  catch ${pct(catchPoint)} / FP ${pct(fpPoint)}, N=${positives.length} pos / ${negatives.length} neg verbatim live extraction.`);
console.log('Generalization gap = synthesis_catch − live_catch =',
  pct(1.0 - catchPoint));
console.log('This is the discipline answer to "did synthesis 100% mean anything for live use?"');

const summary = {
  date: new Date().toISOString(),
  detector: 'false_equivalence_levelling',
  pack_version: epistemologyPack.version,
  probe_type: 'LIVE',
  companion_synthesis_probe: 'test-corpus/false-equivalence-2026-05-10/',
  corpus_size: { positive: positives.length, negative: negatives.length },
  metrics: {
    catch_point: wilson(tp, positives.length),
    fp_point: wilson(fp, negatives.length),
    catch_en: wilson(enPos.filter((r) => r.fires).length, enPos.length),
    catch_ru: wilson(ruPos.filter((r) => r.fires).length, ruPos.length),
    fp_en: wilson(enNeg.filter((r) => r.fires).length, enNeg.length),
    fp_ru: wilson(ruNeg.filter((r) => r.fires).length, ruNeg.length),
    generalization_gap_synthesis_minus_live: 1.0 - wilson(tp, positives.length).mean,
  },
  fn_ids: fns.map((r) => r.id),
  fp_ids: fps.map((r) => r.id),
  decision,
};
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(summary, null, 2));
console.log('\n  → results.json written\n');
