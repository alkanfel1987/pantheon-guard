/**
 * Real-corpus probe runner — naturalization_fallacy detector v0.3.0-pre.1
 *
 * Reads corpus.json, runs hasNaturalizationFrame against each entry,
 * checks hasTemporalQualifier inhibitor effectiveness, computes Wilson 95% CI.
 *
 * Reproducibility:
 *   cd test-corpus/naturalization-2026-05-09 && node runner.js
 *
 * Honest framing: small-N directional probe (~25 docs).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasNaturalizationFrame,
  hasTemporalQualifier,
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

function pct(x) {
  return (x * 100).toFixed(1) + '%';
}

function fmtCI(ci) {
  return `${pct(ci.mean)} [${pct(ci.lo)}, ${pct(ci.hi)}]`;
}

const results = corpus.entries.map((e) => {
  const cond = hasNaturalizationFrame(e.text);
  const inhib = hasTemporalQualifier(e.text);
  // Effective firing: cond fires AND no inhibitor present
  const effective = cond && !inhib;
  return { ...e, cond_fires: cond, inhibitor_active: inhib, effective_fires: effective };
});

console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const verdictRaw = r.class === 'positive'
    ? (r.cond_fires ? 'TP-raw' : 'FN-raw')
    : (r.cond_fires ? 'FP-raw' : 'TN-raw');
  const verdictEff = r.class === 'positive'
    ? (r.effective_fires ? 'TP' : 'FN')
    : (r.effective_fires ? 'FP' : 'TN');
  const scopeTag = r.class === 'positive'
    ? (r.in_scope ? 'IN-SCOPE ' : 'OUT-SCOPE')
    : '         ';
  console.log(`  [${verdictRaw}/${verdictEff}] ${r.id} (${r.lang}, ${scopeTag}) cond=${r.cond_fires} inhib=${r.inhibitor_active}`);
  console.log(`     ${r.text.slice(0, 120)}${r.text.length > 120 ? '…' : ''}`);
}

const positives = results.filter((r) => r.class === 'positive');
const negatives = results.filter((r) => r.class === 'negative');

// RAW = before inhibitor
const tpRaw = positives.filter((r) => r.cond_fires).length;
const fpRaw = negatives.filter((r) => r.cond_fires).length;

// EFFECTIVE = after inhibitor
const tpEff = positives.filter((r) => r.effective_fires).length;
const fpEff = negatives.filter((r) => r.effective_fires).length;

const inScope = positives.filter((r) => r.in_scope);
const outScope = positives.filter((r) => !r.in_scope);

const ruPos = positives.filter((r) => r.lang === 'ru');
const enPos = positives.filter((r) => r.lang === 'en');
const ruNeg = negatives.filter((r) => r.lang === 'ru');
const enNeg = negatives.filter((r) => r.lang === 'en');

console.log('\n=== AGGREGATE METRICS ===\n');
console.log(`  Total positives: ${positives.length}  Total negatives: ${negatives.length}`);
console.log();
console.log(`  RAW (no inhibitor):`);
console.log(`    Catch:    ${fmtCI(wilson(tpRaw, positives.length))}`);
console.log(`    FP:       ${fmtCI(wilson(fpRaw, negatives.length))}`);
console.log();
console.log(`  EFFECTIVE (with hasTemporalQualifier inhibitor):`);
console.log(`    Catch:    ${fmtCI(wilson(tpEff, positives.length))}`);
console.log(`    FP:       ${fmtCI(wilson(fpEff, negatives.length))}`);

console.log('\n=== INHIBITOR EFFECTIVENESS ===\n');
const inhibFiredOnPos = positives.filter((r) => r.inhibitor_active).length;
const inhibFiredOnNeg = negatives.filter((r) => r.inhibitor_active).length;
console.log(`  Inhibitor fires on  ${inhibFiredOnPos}/${positives.length} positive samples (false suppression)`);
console.log(`  Inhibitor fires on  ${inhibFiredOnNeg}/${negatives.length} negative samples (true suppression)`);
console.log(`  → Inhibitor specificity = ${pct(inhibFiredOnNeg / negatives.length)} on negatives`);
console.log(`  → Inhibitor false-suppression on positives = ${pct(inhibFiredOnPos / positives.length)}`);

console.log('\n=== IN-SCOPE vs OUT-OF-SCOPE positive breakdown ===\n');
const tpInScope = inScope.filter((r) => r.cond_fires).length;
const tpOutScope = outScope.filter((r) => r.cond_fires).length;
console.log(`  In-scope catch (raw):    ${fmtCI(wilson(tpInScope, inScope.length))}  (${tpInScope}/${inScope.length})`);
console.log(`  Out-of-scope catch (raw):${fmtCI(wilson(tpOutScope, outScope.length))}  (${tpOutScope}/${outScope.length})`);

console.log('\n=== PER-LANGUAGE ===\n');
const enPosCatch = wilson(enPos.filter((r) => r.cond_fires).length, enPos.length);
const ruPosCatch = wilson(ruPos.filter((r) => r.cond_fires).length, ruPos.length);
const enNegFp = wilson(enNeg.filter((r) => r.effective_fires).length, enNeg.length);
const ruNegFp = wilson(ruNeg.filter((r) => r.effective_fires).length, ruNeg.length);
console.log(`  EN positive catch (raw):  ${fmtCI(enPosCatch)}  (n=${enPos.length})`);
console.log(`  RU positive catch (raw):  ${fmtCI(ruPosCatch)}  (n=${ruPos.length})`);
console.log(`  EN negative FP (eff):     ${fmtCI(enNegFp)}  (n=${enNeg.length})`);
console.log(`  RU negative FP (eff):     ${fmtCI(ruNegFp)}  (n=${ruNeg.length})`);

console.log('\n=== FN AUDIT (positives that did NOT fire on raw condition) ===\n');
for (const r of positives.filter((p) => !p.cond_fires)) {
  console.log(`  ${r.id} (${r.lang}, ${r.in_scope ? 'IN-SCOPE' : 'OUT-SCOPE'}): ${r.text.slice(0, 90)}…`);
  if (r.notes) console.log(`     why-miss: ${r.notes}`);
}

console.log('\n=== FP AUDIT (negatives that fired raw OR effective) ===\n');
const fpItemsRaw = negatives.filter((n) => n.cond_fires);
if (fpItemsRaw.length === 0) {
  console.log('  (none fired even on raw condition — clean classification)');
} else {
  for (const r of fpItemsRaw) {
    const after = r.effective_fires ? 'still FIRES (FP)' : 'inhibitor cleared';
    console.log(`  ${r.id}: raw fires; ${after}`);
    console.log(`     text: ${r.text}`);
  }
}

console.log('\n=== PRE-REG DECISION RULE EVALUATION ===\n');
const catchPoint = wilson(tpEff, positives.length).mean;
const fpPoint = wilson(fpEff, negatives.length).mean;
let decision;
if (catchPoint >= 0.6 && fpPoint <= 0.05) {
  decision = 'PROMOTE → naturalization detector v0.3.0 stable';
} else if (catchPoint >= 0.4 && fpPoint <= 0.05) {
  decision = 'HOLD pre.1; document iter-2 plan';
} else {
  decision = 'ITER-2 MANDATORY';
}
console.log(`  Catch (effective, point): ${pct(catchPoint)}  (target ≥60%)`);
console.log(`  FP    (effective, point): ${pct(fpPoint)}  (target ≤5%)`);
console.log(`  Decision: ${decision}`);

const summary = {
  date: new Date().toISOString(),
  corpus_size: { positive: positives.length, negative: negatives.length },
  metrics: {
    catch_raw: wilson(tpRaw, positives.length),
    fp_raw: wilson(fpRaw, negatives.length),
    catch_effective: wilson(tpEff, positives.length),
    fp_effective: wilson(fpEff, negatives.length),
    catch_in_scope: wilson(tpInScope, inScope.length),
    catch_out_of_scope: wilson(tpOutScope, outScope.length),
    catch_en: enPosCatch,
    catch_ru: ruPosCatch,
    fp_en: enNegFp,
    fp_ru: ruNegFp,
    inhibitor_specificity: inhibFiredOnNeg / negatives.length,
    inhibitor_false_suppression: inhibFiredOnPos / positives.length,
  },
  decision,
};
fs.writeFileSync(
  path.join(__dirname, 'results.json'),
  JSON.stringify(summary, null, 2)
);
console.log('\n  → results.json written\n');
