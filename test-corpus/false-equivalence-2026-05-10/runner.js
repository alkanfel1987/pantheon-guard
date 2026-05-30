/**
 * Real-corpus probe runner — false_equivalence_levelling detector v0.3.0-pre.1
 *
 * Reads corpus.json, runs hasFalseEquivalence against each entry,
 * computes Wilson 95% CI per language and aggregate.
 *
 * Reproducibility:
 *   cd test-corpus/false-equivalence-2026-05-10 && node runner.js
 *
 * Honest framing: synthesis-leaning small-N directional probe (~26 docs).
 * Positive class is paraphrase-of-canonical-op-ed; negatives are public-domain
 * + paraphrased analytical text. Per CLAUDE.md selection-bias discipline,
 * this is structured sanity, not external validation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasFalseEquivalence,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpusPath = path.join(__dirname, 'corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));

function wilson(successes, total) {
  if (total === 0) return { lo: 0, hi: 0, mean: 0 };
  const z = 1.96;
  const p = successes / total;
  const denom = 1 + (z * z) / total;
  const center = p + (z * z) / (2 * total);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  return {
    mean: p,
    lo: Math.max(0, (center - margin) / denom),
    hi: Math.min(1, (center + margin) / denom),
  };
}

const pct = (x) => (x * 100).toFixed(1) + '%';
const fmtCI = (ci) => `${pct(ci.mean)} [${pct(ci.lo)}, ${pct(ci.hi)}]`;

const results = corpus.entries.map((e) => ({
  ...e,
  fires: hasFalseEquivalence(e.text),
}));

console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);
console.log('synthesis_flag:', corpus._meta.synthesis_flag, '\n');

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const verdict =
    r.class === 'positive'
      ? r.fires ? 'TP' : 'FN'
      : r.fires ? 'FP' : 'TN';
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
console.log(`  Total positives: ${positives.length}  Total negatives: ${negatives.length}`);
console.log(`  Catch:    ${fmtCI(wilson(tp, positives.length))}`);
console.log(`  FP:       ${fmtCI(wilson(fp, negatives.length))}`);

console.log('\n=== PER-LANGUAGE ===\n');
const enCatch = wilson(enPos.filter((r) => r.fires).length, enPos.length);
const ruCatch = wilson(ruPos.filter((r) => r.fires).length, ruPos.length);
const enFp = wilson(enNeg.filter((r) => r.fires).length, enNeg.length);
const ruFp = wilson(ruNeg.filter((r) => r.fires).length, ruNeg.length);
console.log(`  EN catch:  ${fmtCI(enCatch)}  (n=${enPos.length})`);
console.log(`  RU catch:  ${fmtCI(ruCatch)}  (n=${ruPos.length})`);
console.log(`  EN FP:     ${fmtCI(enFp)}  (n=${enNeg.length})`);
console.log(`  RU FP:     ${fmtCI(ruFp)}  (n=${ruNeg.length})`);

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
  decision =
    'PROMOTE_PARTIAL → false_equivalence_levelling SYNTHESIS-VALIDATED ' +
    '(release-candidate); LIVE-CORPUS PROBE STILL REQUIRED before stable claim';
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
  detector: 'false_equivalence_levelling',
  pack_version: epistemologyPack.version,
  synthesis_flag: corpus._meta.synthesis_flag,
  corpus_size: { positive: positives.length, negative: negatives.length },
  metrics: {
    catch_point: wilson(tp, positives.length),
    fp_point: wilson(fp, negatives.length),
    catch_en: enCatch,
    catch_ru: ruCatch,
    fp_en: enFp,
    fp_ru: ruFp,
  },
  fn_ids: fns.map((r) => r.id),
  fp_ids: fps.map((r) => r.id),
  decision,
};

fs.writeFileSync(
  path.join(__dirname, 'results.json'),
  JSON.stringify(summary, null, 2)
);
console.log('\n  → results.json written\n');
