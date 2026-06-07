/**
 * Real-corpus probe runner — absence_argument detector v0.3.0-pre.1
 *
 * Three-class evaluation:
 *   - positive            : universal absence-framing fallacy (must FIRE eff)
 *   - negative_comparative: comparative / different topic (must NOT fire)
 *   - negative_bounded    : bounded absence WITH scope qualifier (raw FIRES,
 *                           inhibitor must SUPPRESS → effective NOT fires)
 *
 * Reports raw + effective metrics, inhibitor specificity, inhibitor false-
 * suppression rate. Wilson 95% CI throughout.
 *
 * Reproducibility:
 *   cd test-corpus/absence-argument-2026-05-10 && node runner.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasAbsenceArgument,
  hasScopeQualifier,
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

const results = corpus.entries.map((e) => {
  const cond = hasAbsenceArgument(e.text);
  const inhib = hasScopeQualifier(e.text);
  return {
    ...e,
    cond_fires: cond,
    inhibitor_active: inhib,
    effective_fires: cond && !inhib,
  };
});

console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);
console.log('synthesis_flag:', corpus._meta.synthesis_flag, '\n');

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const expected =
    r.class === 'positive' ? 'fire'
    : r.class === 'negative_comparative' ? 'not-fire-raw'
    : 'fire-raw-inhibit'; // negative_bounded
  const actualRaw = r.cond_fires ? 'fires' : 'silent';
  const actualEff = r.effective_fires ? 'fires' : 'silent';
  let verdict;
  if (r.class === 'positive') verdict = r.effective_fires ? 'TP' : 'FN';
  else if (r.class === 'negative_comparative') verdict = r.cond_fires ? 'FP-raw' : 'TN';
  else /* negative_bounded */ verdict = r.cond_fires && !r.inhibitor_active ? 'FP-eff' : (r.cond_fires ? 'TN-via-inhibitor' : 'TN-not-fired');
  console.log(`  [${verdict}] ${r.id} (${r.lang}, ${r.class.padEnd(22)}) raw=${actualRaw} eff=${actualEff} expected=${expected}`);
}

const positives = results.filter((r) => r.class === 'positive');
const negsComp  = results.filter((r) => r.class === 'negative_comparative');
const negsBound = results.filter((r) => r.class === 'negative_bounded');

const tpRaw = positives.filter((r) => r.cond_fires).length;
const tpEff = positives.filter((r) => r.effective_fires).length;
const fpCompRaw = negsComp.filter((r) => r.cond_fires).length;
const fpCompEff = negsComp.filter((r) => r.effective_fires).length;
const fpBoundRaw = negsBound.filter((r) => r.cond_fires).length;
const fpBoundEff = negsBound.filter((r) => r.effective_fires).length;

const totalNeg = negsComp.length + negsBound.length;
const fpAllEff = fpCompEff + fpBoundEff;

console.log('\n=== AGGREGATE METRICS ===\n');
console.log(`  Positives: ${positives.length}  Neg-comparative: ${negsComp.length}  Neg-bounded: ${negsBound.length}\n`);
console.log(`  Catch RAW       : ${fmt(wilson(tpRaw, positives.length))}`);
console.log(`  Catch EFFECTIVE : ${fmt(wilson(tpEff, positives.length))}`);
console.log(`  FP all (eff)    : ${fmt(wilson(fpAllEff, totalNeg))}`);

console.log('\n=== INHIBITOR EFFECTIVENESS ===\n');
console.log(`  Bounded class (n=${negsBound.length}):`);
console.log(`    raw fires       : ${fpBoundRaw}/${negsBound.length} (${pct(fpBoundRaw / Math.max(1, negsBound.length))})`);
console.log(`    inhibitor active: ${negsBound.filter((r) => r.inhibitor_active).length}/${negsBound.length}`);
console.log(`    effective FP    : ${fpBoundEff}/${negsBound.length} (${pct(fpBoundEff / Math.max(1, negsBound.length))})`);
const inhibFalseSupp = positives.filter((r) => r.inhibitor_active).length;
console.log(`  False suppression on positives: ${inhibFalseSupp}/${positives.length} (${pct(inhibFalseSupp / Math.max(1, positives.length))})`);
console.log(`  Comparative-class raw FP      : ${fpCompRaw}/${negsComp.length} (${pct(fpCompRaw / Math.max(1, negsComp.length))})`);

const enPos = positives.filter((r) => r.lang === 'en');
const ruPos = positives.filter((r) => r.lang === 'ru');
const enNeg = [...negsComp, ...negsBound].filter((r) => r.lang === 'en');
const ruNeg = [...negsComp, ...negsBound].filter((r) => r.lang === 'ru');

console.log('\n=== PER-LANGUAGE ===\n');
console.log(`  EN catch (eff): ${fmt(wilson(enPos.filter((r) => r.effective_fires).length, enPos.length))}  (n=${enPos.length})`);
console.log(`  RU catch (eff): ${fmt(wilson(ruPos.filter((r) => r.effective_fires).length, ruPos.length))}  (n=${ruPos.length})`);
console.log(`  EN FP    (eff): ${fmt(wilson(enNeg.filter((r) => r.effective_fires).length, enNeg.length))}  (n=${enNeg.length})`);
console.log(`  RU FP    (eff): ${fmt(wilson(ruNeg.filter((r) => r.effective_fires).length, ruNeg.length))}  (n=${ruNeg.length})`);

console.log('\n=== FN AUDIT (positives that did NOT fire effective) ===\n');
const fns = positives.filter((p) => !p.effective_fires);
if (fns.length === 0) {
  console.log('  (none — full effective recall)');
} else {
  for (const r of fns) {
    const reason = r.inhibitor_active ? 'INHIBITOR FALSE-SUPPRESSED' : 'CONDITION DID NOT FIRE';
    console.log(`  ${r.id} (${r.lang}, ${reason}): ${r.text.slice(0, 110)}…`);
    if (r.notes) console.log(`     marker: ${r.notes}`);
  }
}

console.log('\n=== FP AUDIT (negatives that fire effective) ===\n');
const fps = [...negsComp, ...negsBound].filter((n) => n.effective_fires);
if (fps.length === 0) {
  console.log('  (none — clean effective classification)');
} else {
  for (const r of fps) {
    console.log(`  ${r.id} (${r.lang}, ${r.class}): ${r.text}`);
    if (r.notes) console.log(`     ctx: ${r.notes}`);
  }
}

console.log('\n=== PRE-REG DECISION RULE EVALUATION ===\n');
const catchEff = wilson(tpEff, positives.length).mean;
const fpEff = wilson(fpAllEff, totalNeg).mean;
const inhibFsupp = inhibFalseSupp / Math.max(1, positives.length);
let decision;
if (catchEff >= 0.6 && fpEff <= 0.05 && inhibFsupp <= 0.10) {
  decision = 'PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required';
} else if (catchEff >= 0.4 && fpEff <= 0.05) {
  decision = 'HOLD scaffold; document iter-2 plan';
} else {
  decision = 'ITER-2 MANDATORY';
}
console.log(`  Catch (eff, point) : ${pct(catchEff)}     (target ≥60%)`);
console.log(`  FP    (eff, point) : ${pct(fpEff)}     (target ≤5%)`);
console.log(`  Inhibitor false-supp: ${pct(inhibFsupp)}  (target ≤10%)`);
console.log(`  Decision: ${decision}`);

const summary = {
  date: new Date().toISOString(),
  detector: 'absence_argument',
  pack_version: epistemologyPack.version,
  synthesis_flag: corpus._meta.synthesis_flag,
  corpus_size: { positive: positives.length, neg_comparative: negsComp.length, neg_bounded: negsBound.length },
  metrics: {
    catch_raw: wilson(tpRaw, positives.length),
    catch_effective: wilson(tpEff, positives.length),
    fp_all_effective: wilson(fpAllEff, totalNeg),
    fp_bounded_raw: wilson(fpBoundRaw, negsBound.length),
    fp_bounded_effective: wilson(fpBoundEff, negsBound.length),
    inhibitor_false_suppression: inhibFsupp,
    catch_en_effective: wilson(enPos.filter((r) => r.effective_fires).length, enPos.length),
    catch_ru_effective: wilson(ruPos.filter((r) => r.effective_fires).length, ruPos.length),
  },
  fn_ids: fns.map((r) => ({ id: r.id, reason: r.inhibitor_active ? 'inhibitor-suppressed' : 'condition-not-fired' })),
  fp_ids: fps.map((r) => ({ id: r.id, class: r.class })),
  decision,
};

fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(summary, null, 2));
console.log('\n  → results.json written\n');
