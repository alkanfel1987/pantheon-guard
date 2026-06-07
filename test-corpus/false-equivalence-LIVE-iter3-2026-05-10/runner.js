/**
 * iter-3 LIVE probe runner — false_equivalence_levelling, 2026-05-10
 *
 * Combined Round-1 (training: 6 pos / 12 neg) + Round-2 (held-out FP-stress:
 * 0 pos / 8 neg) = 6 pos / 20 neg total.
 *
 * Round-1 catch is implementation-verification, NOT generalization claim.
 * Round-2 has 0 positives — held-out catch validation NOT possible in this
 * probe; selection-by-availability bias on positives noted in PRE-REGISTRATION.
 *
 * Reproducibility:
 *   cd test-corpus/false-equivalence-LIVE-iter3-2026-05-10 && node runner.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasFalseEquivalence,
  hasComparativeDivergence,
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

const results = corpus.entries.map((e) => ({
  ...e,
  fires: hasFalseEquivalence(e.text),
  inhibitor_active: hasComparativeDivergence(e.text),
}));

console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version} — iter-3 broadening + comparative-divergence inhibitor\n`);
console.log('Round-1 = TRAINING-set (patterns designed from these FNs)');
console.log('Round-2 = held-out FP-stress (0 positives surfaced — selection-by-availability)\n');

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const verdict = r.class === 'positive' ? (r.fires ? 'TP' : 'FN') : (r.fires ? 'FP' : 'TN');
  const round = `R${r.round}`;
  const inhib = r.inhibitor_active ? ' [inhib]' : '';
  console.log(`  [${verdict}] ${round} ${r.id} (${r.lang}) fires=${r.fires}${inhib}`);
  console.log(`     ${r.text.slice(0, 110)}${r.text.length > 110 ? '…' : ''}`);
}

const positives = results.filter((r) => r.class === 'positive');
const negatives = results.filter((r) => r.class === 'negative');
const r1Positives = positives.filter((r) => r.round === 1);
const r1Negatives = negatives.filter((r) => r.round === 1);
const r2Negatives = negatives.filter((r) => r.round === 2);

const tp_r1 = r1Positives.filter((r) => r.fires).length;
const fp_r1 = r1Negatives.filter((r) => r.fires).length;
const fp_r2 = r2Negatives.filter((r) => r.fires).length;
const fp_combined = negatives.filter((r) => r.fires).length;

console.log('\n=== ROUND-1 TRAINING-SET (NOT generalization claim) ===\n');
console.log(`  Positives: ${r1Positives.length}  Negatives: ${r1Negatives.length}`);
console.log(`  Catch (training):    ${fmt(wilson(tp_r1, r1Positives.length))}`);
console.log(`  FP    (training):    ${fmt(wilson(fp_r1, r1Negatives.length))}`);

console.log('\n=== ROUND-2 HELD-OUT FP-STRESS (8 NEW negatives, 0 positives) ===\n');
console.log(`  Negatives: ${r2Negatives.length}`);
console.log(`  FP    (held-out):    ${fmt(wilson(fp_r2, r2Negatives.length))}`);

console.log('\n=== COMBINED FP (training + held-out) ===\n');
console.log(`  Total negatives: ${negatives.length}`);
console.log(`  FP combined:    ${fmt(wilson(fp_combined, negatives.length))}`);

console.log('\n=== FN AUDIT (Round-1 positives detector did NOT fire on) ===\n');
const fns = r1Positives.filter((p) => !p.fires);
if (fns.length === 0) {
  console.log('  (none — all 6 Round-1 positives caught — but iter-3 patterns designed from these, this is verification not generalization)');
} else {
  for (const r of fns) {
    console.log(`  ${r.id}: ${r.text.slice(0, 110)}…`);
    if (r.notes) console.log(`     why-miss: ${r.notes}`);
  }
}

console.log('\n=== FP AUDIT (negatives that fired) ===\n');
const fps = negatives.filter((n) => n.fires);
if (fps.length === 0) {
  console.log('  (none — clean classification on combined 20 negatives)');
} else {
  for (const r of fps) {
    console.log(`  ${r.id} (R${r.round}): ${r.text.slice(0, 110)}…`);
    console.log(`     src: ${r.source}`);
    if (r.notes) console.log(`     ctx: ${r.notes}`);
  }
}

console.log('\n=== PRE-REG DECISION RULE EVALUATION ===\n');
const trainCatch = wilson(tp_r1, r1Positives.length).mean;
const combFP = wilson(fp_combined, negatives.length).mean;
let decision;
if (tp_r1 >= 4 && combFP <= 0.05) {
  decision = 'iter-3 patterns SHIP to v0.3.0-pre.2 — Round-1 catch ≥ 4/6 (target hit), combined FP ≤ 5%. Tier remains 2 — Tier 1 promotion blocked by absent held-out positives.';
} else if (tp_r1 >= 4 && combFP > 0.05) {
  decision = 'iter-3 patterns SHIP with inhibitor tightening — combined FP > 5%, iter-3.1 follow-up required.';
} else {
  decision = 'REVERT — Round-1 catch < 4/6 means iter-3 patterns mis-implemented.';
}
console.log(`  Round-1 catch:  ${tp_r1}/6 = ${pct(trainCatch)}`);
console.log(`  Combined FP:    ${fp_combined}/${negatives.length} = ${pct(combFP)}`);
console.log(`  Decision: ${decision}`);

console.log('\n=== TIER-PROMOTION GATE (per docs/EVIDENCE-TIER.md) ===\n');
console.log('  Held-out positives required for Tier 1 promotion: 0 surfaced this round.');
console.log('  Tier remains: 2 (synthesis + iter-3 broadening + held-out FP-stress).');
console.log('  Next phase: manual-curated held-out positive corpus (owner involvement).');

const summary = {
  date: new Date().toISOString(),
  detector: 'false_equivalence_levelling',
  pack_version: epistemologyPack.version,
  probe_iteration: 3,
  notes: 'Round-1 = training-set (FN-driven pattern design), Round-2 = held-out FP-stress only (0 positives surfaced)',
  corpus_size: {
    r1_positive: r1Positives.length,
    r1_negative: r1Negatives.length,
    r2_negative: r2Negatives.length,
    held_out_positives: 0,
  },
  metrics: {
    catch_r1_training: wilson(tp_r1, r1Positives.length),
    fp_r1: wilson(fp_r1, r1Negatives.length),
    fp_r2_held_out: wilson(fp_r2, r2Negatives.length),
    fp_combined: wilson(fp_combined, negatives.length),
  },
  fn_ids: fns.map((r) => r.id),
  fp_ids: fps.map((r) => r.id),
  decision,
  tier_after_iter3: 2,
  tier1_blocker: 'held-out positive corpus required',
};
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(summary, null, 2));
console.log('\n  → results.json written\n');
