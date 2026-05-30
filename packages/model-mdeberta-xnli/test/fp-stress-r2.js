/**
 * FP-stress test on LIVE Round-2 8 NEW negatives — held-out from synthesis
 * tuning AND from LIVE Round-1.
 *
 * Round-2 sources (per test-corpus/false-equivalence-LIVE-iter3-2026-05-10/corpus.json):
 *   - Brookings supreme court analysis
 *   - Federalist 10 (public domain) × 2
 *   - Federalist 78 (public domain) × 2
 *   - CounterPunch Pity Billionaire × 2
 *
 * Threshold sensitivity sweep:
 *   threshold = {0.45, 0.5, 0.55, 0.6, 0.65}
 *   FP-rate at each level
 *
 * Per CLAUDE.md "selection bias warning" + iter-3 discipline: this is the
 * proper held-out FP test for the synthesis-tuned threshold 0.5.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEmbedder } from '../src/index.js';
import { feSemanticPack } from '../../../src/packs/semantic/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iter3CorpusPath = path.resolve(__dirname, '../../../test-corpus/false-equivalence-LIVE-iter3-2026-05-10/corpus.json');
const corpus = JSON.parse(fs.readFileSync(iter3CorpusPath, 'utf-8'));

// Filter to ROUND-2 NEW negatives only (held-out)
const r2Negatives = corpus.entries.filter((e) => e.round === 2 && e.class === 'negative');

const HYPOTHESIS = feSemanticPack.semanticDetectors[0].hypothesis;
const pct = (x) => (x * 100).toFixed(1) + '%';

async function main() {
  console.log('=== FP-stress on LIVE Round-2 held-out negatives ===');
  console.log(`Hypothesis: "${HYPOTHESIS}"`);
  console.log(`N = ${r2Negatives.length} negatives (Round-2 NEW: Brookings, Federalist 10/78, CounterPunch Pity-Billionaire)\n`);

  console.log('Loading model (cached)...');
  const embedder = await createEmbedder();
  console.log('  ready\n');

  const scored = [];
  for (const e of r2Negatives) {
    const t = Date.now();
    const score = await embedder.classify(e.text, HYPOTHESIS);
    scored.push({ ...e, score, latency_ms: Date.now() - t });
  }

  console.log('=== Per-entry scores ===\n');
  for (const r of scored) {
    console.log(`  ${r.id.padEnd(15)} score=${r.score.toFixed(3)}  ${r.text.slice(0, 70)}…`);
    console.log(`     src: ${r.source}`);
  }

  // Threshold sweep
  const thresholds = [0.45, 0.5, 0.55, 0.6, 0.65, 0.7];
  console.log('\n=== Threshold sweep — FP-rate on Round-2 held-out negatives ===\n');
  console.log('threshold   FP/total       FP-rate');
  console.log('-'.repeat(45));
  for (const t of thresholds) {
    const fp = scored.filter((r) => r.score >= t).length;
    const fps = scored.filter((r) => r.score >= t).map((r) => r.id);
    console.log(
      `   ${t.toFixed(2)}    ${fp}/${r2Negatives.length}        ${pct(fp / r2Negatives.length)}    ${fps.length > 0 ? '  fired: ' + fps.join(', ') : ''}`
    );
  }

  // Save
  const out = {
    date: new Date().toISOString(),
    purpose: 'FP-stress test on Round-2 held-out negatives',
    hypothesis: HYPOTHESIS,
    embedder: { name: embedder.name(), version: embedder.version() },
    n_negatives: r2Negatives.length,
    per_entry: scored,
    threshold_sweep: thresholds.map((t) => ({
      threshold: t,
      fp_count: scored.filter((r) => r.score >= t).length,
      fp_ids: scored.filter((r) => r.score >= t).map((r) => r.id),
      fp_rate: scored.filter((r) => r.score >= t).length / r2Negatives.length,
    })),
  };
  fs.writeFileSync(path.join(__dirname, 'fp-stress-r2-results.json'), JSON.stringify(out, null, 2));
  console.log('\n  → results saved.');
}

main().catch((e) => { console.error(e); process.exit(1); });
