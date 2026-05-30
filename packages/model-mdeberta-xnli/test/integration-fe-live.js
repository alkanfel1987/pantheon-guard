/**
 * Integration test — apply feSemanticPack via real mDeBERTa-XNLI embedder
 * to the LIVE Round-1 corpus (test-corpus/false-equivalence-LIVE-2026-05-10/).
 *
 * Goal: empirical comparison of regex iter-3 vs semantic vs union on the
 * same live corpus. Honest scope per CLAUDE.md cycle-2 trap awareness:
 *
 *   - Hypothesis + threshold tuned on synthesis sample set (9 samples)
 *   - LIVE Round-1 corpus (6 positives + 12 negatives) is verbatim text
 *     from real articles — at minimum source-held-out from tuning set
 *   - This is sanity check, NOT full Tier 1 validation (which requires
 *     held-out positive corpus beyond Round-1)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEmbedder } from '../src/index.js';
import {
  feSemanticPack,
  applyPackAsync,
} from '../../../src/packs/semantic/index.js';
import {
  hasFalseEquivalence,
} from '../../../src/packs/epistemology.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const liveCorpusPath = path.resolve(__dirname, '../../../test-corpus/false-equivalence-LIVE-2026-05-10/corpus.json');

const corpus = JSON.parse(fs.readFileSync(liveCorpusPath, 'utf-8'));

const pct = (x) => (x * 100).toFixed(1) + '%';
function wilson(s, n) {
  if (n === 0) return { lo: 0, hi: 0, mean: 0 };
  const z = 1.96;
  const p = s / n;
  const denom = 1 + (z * z) / n;
  const center = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return { mean: p, lo: Math.max(0, (center - margin) / denom), hi: Math.min(1, (center + margin) / denom) };
}
const fmt = (ci) => `${pct(ci.mean)} [${pct(ci.lo)}, ${pct(ci.hi)}]`;

async function main() {
  console.log('=== Integration test: feSemanticPack via real mDeBERTa-XNLI ===');
  console.log(`Corpus: ${liveCorpusPath}`);
  console.log(`Hypothesis: "${feSemanticPack.semanticDetectors[0].hypothesis}"`);
  console.log(`Threshold: ${feSemanticPack.semanticDetectors[0].threshold}\n`);

  console.log('Loading model (cached)...');
  const t0 = Date.now();
  const embedder = await createEmbedder();
  console.log(`  loaded in ${Date.now() - t0}ms\n`);

  const inspect = applyPackAsync(feSemanticPack, embedder);

  const results = [];
  for (const e of corpus.entries) {
    const t = Date.now();
    const semanticResult = await inspect(e.text);
    const dur = Date.now() - t;

    const semanticFires = semanticResult.unmetRequirements.length > 0;
    const semanticScore = semanticResult.semanticDetectorResults[0]?.score ?? 0;
    const regexFires = hasFalseEquivalence(e.text);

    results.push({
      ...e,
      regexFires,
      semanticFires,
      semanticScore,
      unionFires: regexFires || semanticFires,
      latency_ms: dur,
    });
  }

  // Group by class
  const positives = results.filter((r) => r.class === 'positive');
  const negatives = results.filter((r) => r.class === 'negative');

  console.log('=== Per-entry verdicts ===\n');
  console.log('id'.padEnd(18) + 'class'.padEnd(12) + 'regex   semantic(score)   union   text(snippet)');
  for (const r of results) {
    const regexMark = r.regexFires ? '🔥' : '  ';
    const semMark = r.semanticFires ? '🔥' : '  ';
    const unionMark = r.unionFires ? '🔥' : '  ';
    const scoreStr = r.semanticScore.toFixed(3);
    console.log(
      r.id.padEnd(18) +
      r.class.padEnd(12) +
      `${regexMark}      ${semMark}(${scoreStr})        ${unionMark}     ` +
      r.text.slice(0, 60) + (r.text.length > 60 ? '…' : '')
    );
  }

  // Aggregate
  const tp_regex = positives.filter((r) => r.regexFires).length;
  const fp_regex = negatives.filter((r) => r.regexFires).length;
  const tp_sem = positives.filter((r) => r.semanticFires).length;
  const fp_sem = negatives.filter((r) => r.semanticFires).length;
  const tp_union = positives.filter((r) => r.unionFires).length;
  const fp_union = negatives.filter((r) => r.unionFires).length;

  console.log('\n=== Comparison: regex iter-3 vs semantic vs union ===\n');
  console.log('approach'.padEnd(20) + 'catch'.padEnd(28) + 'FP'.padEnd(28));
  console.log('-'.repeat(76));
  console.log(
    'regex iter-3'.padEnd(20) +
    fmt(wilson(tp_regex, positives.length)).padEnd(28) +
    fmt(wilson(fp_regex, negatives.length))
  );
  console.log(
    'semantic only'.padEnd(20) +
    fmt(wilson(tp_sem, positives.length)).padEnd(28) +
    fmt(wilson(fp_sem, negatives.length))
  );
  console.log(
    'regex ∪ semantic'.padEnd(20) +
    fmt(wilson(tp_union, positives.length)).padEnd(28) +
    fmt(wilson(fp_union, negatives.length))
  );

  // Per-positive complementarity matrix
  console.log('\n=== Complementarity matrix (positives only) ===\n');
  console.log('id'.padEnd(20) + 'regex     semantic    union');
  for (const r of positives) {
    console.log(
      r.id.padEnd(20) +
      (r.regexFires ? '✓        ' : '✗        ') +
      (r.semanticFires ? '✓ (' : '✗ (') + r.semanticScore.toFixed(3) + ')   ' +
      (r.unionFires ? '✓' : '✗')
    );
  }

  console.log('\n=== Latency ===\n');
  const lats = results.map((r) => r.latency_ms);
  const mean = lats.reduce((a, b) => a + b, 0) / lats.length;
  console.log(`  per-call: mean=${mean.toFixed(0)}ms  min=${Math.min(...lats)}ms  max=${Math.max(...lats)}ms`);

  // Save full result
  const out = {
    date: new Date().toISOString(),
    corpus: 'false-equivalence-LIVE-2026-05-10',
    hypothesis: feSemanticPack.semanticDetectors[0].hypothesis,
    threshold: feSemanticPack.semanticDetectors[0].threshold,
    embedder: { name: embedder.name(), version: embedder.version() },
    counts: {
      positives: positives.length,
      negatives: negatives.length,
    },
    metrics: {
      regex_only: { catch: wilson(tp_regex, positives.length), fp: wilson(fp_regex, negatives.length) },
      semantic_only: { catch: wilson(tp_sem, positives.length), fp: wilson(fp_sem, negatives.length) },
      union: { catch: wilson(tp_union, positives.length), fp: wilson(fp_union, negatives.length) },
    },
    per_entry: results,
    latency_mean_ms: mean,
  };

  const outPath = path.join(__dirname, 'integration-fe-live-results.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\n  → results saved: ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
