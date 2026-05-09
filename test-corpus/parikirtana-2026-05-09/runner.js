/**
 * Real-corpus probe runner — parikīrtana detectors v0.5.0-pre.1
 *
 * Reads corpus.json, runs the 3 parikīrtana detection patterns from
 * news pack against each entry, computes:
 *   - per-class catch / FP-rate
 *   - per-language breakdown
 *   - in-scope vs out-of-scope catch (narrow detector)
 *   - Wilson 95% CI for each rate
 *
 * Reproducibility:
 *   cd test-corpus/parikirtana-2026-05-09 && node runner.js
 *
 * Honest framing: this is a small-N directional probe (~33 docs).
 * Wilson CIs will be wide; decision is qualitative more than statistical.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsPack } from '../../src/packs/news.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpusPath = path.join(__dirname, 'corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));

const parikPatterns = newsPack.detectionPatterns.filter((p) =>
  p.name.includes('parikirtana')
);

if (parikPatterns.length !== 3) {
  console.error(`Expected 3 parikirtana patterns, found ${parikPatterns.length}`);
  process.exit(1);
}

// Wilson 95% CI for binomial proportion. Returns {lo, hi}.
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

// Detect — returns the matching pattern name or null
function detect(text) {
  for (const p of parikPatterns) {
    if (p.regex.test(text)) return p.name;
  }
  return null;
}

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────

const results = corpus.entries.map((e) => ({
  ...e,
  detected: detect(e.text),
  hit: detect(e.text) !== null,
}));

console.log('=== INDIVIDUAL VERDICTS ===\n');
for (const r of results) {
  const verdict = r.class === 'positive'
    ? (r.hit ? 'TP' : 'FN')
    : (r.hit ? 'FP' : 'TN');
  const scopeTag = r.class === 'positive'
    ? (r.in_scope_narrow_detector ? 'IN-SCOPE ' : 'OUT-SCOPE')
    : '         ';
  console.log(`  [${verdict}] ${r.id} (${r.lang}, ${scopeTag}, ${r.source.padEnd(25)}) detector=${r.detected ?? '-'}`);
  console.log(`         ${r.text.slice(0, 120)}${r.text.length > 120 ? '…' : ''}`);
}

const positives = results.filter((r) => r.class === 'positive');
const negatives = results.filter((r) => r.class === 'negative');
const tp = positives.filter((r) => r.hit).length;
const fn = positives.filter((r) => !r.hit).length;
const fp = negatives.filter((r) => r.hit).length;
const tn = negatives.filter((r) => !r.hit).length;

const inScope = positives.filter((r) => r.in_scope_narrow_detector);
const outScope = positives.filter((r) => !r.in_scope_narrow_detector);
const tpInScope = inScope.filter((r) => r.hit).length;
const tpOutScope = outScope.filter((r) => r.hit).length;

const ruPos = positives.filter((r) => r.lang === 'ru');
const enPos = positives.filter((r) => r.lang === 'en');
const ruNeg = negatives.filter((r) => r.lang === 'ru');
const enNeg = negatives.filter((r) => r.lang === 'en');

console.log('\n=== AGGREGATE METRICS ===\n');
console.log(`  Total positives: ${positives.length}  Total negatives: ${negatives.length}`);
console.log(`  TP=${tp}  FN=${fn}  FP=${fp}  TN=${tn}`);
console.log();
const catchAll = wilson(tp, positives.length);
const fpAll = wilson(fp, negatives.length);
console.log(`  Catch-rate (all):     ${fmtCI(catchAll)}`);
console.log(`  FP-rate (all):        ${fmtCI(fpAll)}`);

console.log('\n=== IN-SCOPE vs OUT-OF-SCOPE positive breakdown ===\n');
const catchInScope = wilson(tpInScope, inScope.length);
const catchOutScope = wilson(tpOutScope, outScope.length);
console.log(`  In-scope catch:       ${fmtCI(catchInScope)}  (${tpInScope}/${inScope.length})`);
console.log(`  Out-of-scope catch:   ${fmtCI(catchOutScope)}  (${tpOutScope}/${outScope.length})`);
console.log(`  → Detector verb-list narrowness measured directly.`);

console.log('\n=== PER-LANGUAGE ===\n');
const catchRu = wilson(ruPos.filter((r) => r.hit).length, ruPos.length);
const catchEn = wilson(enPos.filter((r) => r.hit).length, enPos.length);
const fpRu = wilson(ruNeg.filter((r) => r.hit).length, ruNeg.length);
const fpEn = wilson(enNeg.filter((r) => r.hit).length, enNeg.length);
console.log(`  RU positive catch:    ${fmtCI(catchRu)}  (n=${ruPos.length})`);
console.log(`  EN positive catch:    ${fmtCI(catchEn)}  (n=${enPos.length})`);
console.log(`  RU negative FP:       ${fmtCI(fpRu)}  (n=${ruNeg.length})`);
console.log(`  EN negative FP:       ${fmtCI(fpEn)}  (n=${enNeg.length})`);

console.log('\n=== FN AUDIT (positives that did NOT fire) ===\n');
for (const r of positives.filter((p) => !p.hit)) {
  console.log(`  ${r.id} (${r.lang}, ${r.in_scope_narrow_detector ? 'IN-SCOPE' : 'OUT-SCOPE'}): ${r.text.slice(0, 90)}…`);
  if (r.notes) console.log(`     why-miss: ${r.notes}`);
}

console.log('\n=== FP AUDIT (negatives that DID fire) ===\n');
const fpItems = negatives.filter((n) => n.hit);
if (fpItems.length === 0) {
  console.log('  (none — clean third-party reportage classified correctly)');
} else {
  for (const r of fpItems) {
    console.log(`  ${r.id}: detector=${r.detected}`);
    console.log(`     text: ${r.text}`);
  }
}

console.log('\n=== PRE-REG DECISION RULE EVALUATION ===\n');
const catchPoint = catchAll.mean;
const fpPoint = fpAll.mean;
let decision;
if (catchPoint >= 0.6 && fpPoint <= 0.05) {
  decision = 'PROMOTE → news v0.5.0 stable';
} else if (catchPoint >= 0.4 && fpPoint <= 0.05) {
  decision = 'HOLD pre.1; document iter-2 plan with verb-list / inhibitor gaps';
} else {
  decision = 'ITER-2 MANDATORY — corpus-design vs detector-design root cause needs analysis';
}
console.log(`  Catch (point): ${pct(catchPoint)}  (target ≥60%)`);
console.log(`  FP    (point): ${pct(fpPoint)}  (target ≤5%)`);
console.log(`  Decision: ${decision}`);

// Output machine-readable summary too
const summary = {
  date: new Date().toISOString(),
  corpus_size: { positive: positives.length, negative: negatives.length },
  metrics: {
    catch_all: catchAll,
    fp_all: fpAll,
    catch_in_scope: catchInScope,
    catch_out_of_scope: catchOutScope,
    catch_ru: catchRu,
    catch_en: catchEn,
    fp_ru: fpRu,
    fp_en: fpEn,
  },
  decision,
};
fs.writeFileSync(
  path.join(__dirname, 'results.json'),
  JSON.stringify(summary, null, 2)
);
console.log('\n  → results.json written\n');
