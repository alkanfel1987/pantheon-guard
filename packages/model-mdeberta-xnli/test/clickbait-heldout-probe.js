/**
 * clickbait-heldout-probe — does zero-shot NLI close the clickbait
 * generalization gap?
 *
 * Runs the real mDeBERTa-XNLI embedder against held-out clickbait corpus #2
 * (LittleThings + Scary Mommy + TheThings — sources used nowhere in the
 * regex pack's authoring/tuning). 3 candidate hypotheses, threshold sweep.
 *
 * Reference points:
 *   - regex clickbait pack v0.0.3 on this same held-out: 20% catch, 0% FP
 *   - FE semantic proof-of-concept: 33% semantic-only catch, 8.3% FP
 *
 * Pre-registered decision rule (before numbers come in):
 *   - If best hypothesis gives semantic-only catch ≥ 50% AND FP ≤ 2%
 *     at some threshold → NLI L2 beats the FE pattern, R₁ viable as
 *     a blocking detector.
 *   - If catch < 50% OR FP > 2% at every threshold → NLI L2 reproduces
 *     the FE lukewarm pattern; clickbait-semantic stays advisory-only.
 *
 * Writes clickbait-heldout-probe-results.json.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createEmbedder } from '../src/index.js';
import { HELDOUT_V2 } from '../../../examples/benchmark-heldout-clickbait-v2-corpus.js';

const HYPOTHESES = [
  { id: 'H1-direct', text: 'This is a clickbait headline.' },
  { id: 'H2-curiosity-gap', text: 'This headline deliberately withholds information to make the reader click.' },
  { id: 'H3-intent', text: 'This headline is written to attract clicks rather than to inform.' },
];

const THRESHOLDS = [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

async function main() {
  const corpusPath = new URL('../../../examples/benchmark-heldout-clickbait-v2-corpus.js', import.meta.url);
  const corpusHash = createHash('sha256').update(readFileSync(corpusPath)).digest('hex');

  const catchExpected = HELDOUT_V2.filter((e) => e.expected === 'catch');
  const passExpected = HELDOUT_V2.filter((e) => e.expected === 'pass');

  console.log('═'.repeat(78));
  console.log('  CLICKBAIT SEMANTIC HELD-OUT PROBE — zero-shot NLI vs generalization gap');
  console.log('═'.repeat(78));
  console.log(`  Corpus: held-out #2  SHA-256: ${corpusHash}`);
  console.log(`  N=${HELDOUT_V2.length}  (catch-expected ${catchExpected.length}, pass-expected ${passExpected.length})`);
  console.log(`  Reference: regex pack v0.0.3 on this corpus = 20% catch, 0% FP`);
  console.log('  Loading mDeBERTa-v3-base-mnli-xnli (first run downloads ~140MB)...');

  const t0 = Date.now();
  const embedder = await createEmbedder({ dtype: 'q8' });
  console.log(`  Model ready in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

  // score[hypId][entryIndex] = number
  const scores = {};
  for (const h of HYPOTHESES) scores[h.id] = [];

  let done = 0;
  for (const entry of HELDOUT_V2) {
    for (const h of HYPOTHESES) {
      const s = await embedder.classify(entry.text, h.text);
      scores[h.id].push(s);
    }
    done++;
    if (done % 10 === 0) console.log(`  scored ${done}/${HELDOUT_V2.length}`);
  }
  console.log('');

  const results = { date: new Date().toISOString(), corpusHash, n: HELDOUT_V2.length,
    catchExpected: catchExpected.length, passExpected: passExpected.length,
    hypotheses: HYPOTHESES, perHypothesis: [] };

  for (const h of HYPOTHESES) {
    const sweep = [];
    for (const thr of THRESHOLDS) {
      let caught = 0, fp = 0;
      HELDOUT_V2.forEach((entry, i) => {
        const fired = scores[h.id][i] >= thr;
        if (entry.expected === 'catch' && fired) caught++;
        if (entry.expected === 'pass' && fired) fp++;
      });
      sweep.push({
        threshold: thr,
        catch: caught, catchRate: caught / catchExpected.length,
        fp, fpRate: fp / passExpected.length,
      });
    }
    results.perHypothesis.push({ id: h.id, hypothesis: h.text, sweep });

    console.log(`── ${h.id}: "${h.text}"`);
    console.log('   thr   catch        FP');
    for (const s of sweep) {
      const cr = (100 * s.catchRate).toFixed(0).padStart(3);
      const fr = (100 * s.fpRate).toFixed(0).padStart(3);
      console.log(`   ${s.threshold.toFixed(2)}  ${cr}% (${s.catch}/${catchExpected.length})   ${fr}% (${s.fp}/${passExpected.length})`);
    }
    // Best threshold = max catch with FP ≤ 2 entries (~8%) ... and the
    // FP≤2%-strict point
    const fpStrict = sweep.filter((s) => s.fpRate <= 0.02);
    const best = fpStrict.length ? fpStrict.reduce((a, b) => (b.catch > a.catch ? b : a)) : null;
    if (best) {
      const ci = wilson95(best.catch, catchExpected.length);
      console.log(`   → at FP≤2%: best catch ${best.catch}/${catchExpected.length} = ${(100 * best.catchRate).toFixed(0)}% [${(100*ci[0]).toFixed(0)}-${(100*ci[1]).toFixed(0)}%] @thr ${best.threshold}`);
    } else {
      console.log('   → NO threshold achieves FP ≤ 2% — detector is advisory-only at best');
    }
    console.log('');
  }

  // Verdict
  let viable = false;
  for (const ph of results.perHypothesis) {
    for (const s of ph.sweep) {
      if (s.catchRate >= 0.5 && s.fpRate <= 0.02) viable = true;
    }
  }
  console.log('═'.repeat(78));
  console.log(`  PRE-REGISTERED VERDICT: ${viable
    ? 'NLI L2 VIABLE as blocking detector (catch≥50% AND FP≤2% achieved)'
    : 'NLI L2 reproduces FE lukewarm pattern — clickbait-semantic ADVISORY-ONLY'}`);
  console.log('═'.repeat(78));
  results.verdict = viable ? 'viable-blocking' : 'advisory-only';

  writeFileSync(
    new URL('./clickbait-heldout-probe-results.json', import.meta.url),
    JSON.stringify(results, null, 2)
  );
  console.log('  Results written to clickbait-heldout-probe-results.json');
}

main().catch((err) => { console.error(err); process.exit(1); });
