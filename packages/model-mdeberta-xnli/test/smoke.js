/**
 * Smoke test — load mDeBERTa-XNLI, run inference on a small sample set.
 *
 * First run will download ~140MB of quantized model files from HuggingFace
 * Hub. Subsequent runs use the cache. Expect cold-start ~10-30s on first
 * run depending on bandwidth.
 *
 * Usage:
 *   cd packages/model-mdeberta-xnli && npm run smoke
 */

import { createEmbedder } from '../src/index.js';

const HYPOTHESIS_FE =
  'This text frames two or more political parties, factions, or institutions ' +
  'as morally or behaviorally equivalent, dismissing meaningful distinctions between them.';

const SAMPLES = [
  // Expected high (FE rhetoric)
  {
    text: 'Both Democrats and Republicans are vested in this corrupt machine and funded by the same billionaires.',
    expect: 'high',
    label: 'FE-canonical-EN',
  },
  {
    text: 'All politicians are the same — they say one thing in opposition and do the opposite in power.',
    expect: 'high',
    label: 'FE-all-same-EN',
  },
  {
    text: 'Все политики одинаковы — нет принципиальной разницы между ними, все одинаково коррумпированы.',
    expect: 'high',
    label: 'FE-canonical-RU',
  },
  // Expected low (substantive comparison, NOT leveling)
  {
    text: 'Republicans favor lower marginal tax rates while Democrats prefer progressive structures with targeted credits.',
    expect: 'low',
    label: 'NEG-substantive-EN',
  },
  {
    text: 'Российские партии демонстрируют сходную централизованную структуру, но отличаются в риторике и составе электората.',
    expect: 'low',
    label: 'NEG-substantive-RU',
  },
  // Edge case (single-actor critique, not equivalence)
  {
    text: 'The Dissident Right rejects mutual forbearance in favor of a will-to-power political approach.',
    expect: 'low',
    label: 'NEG-single-actor-critique',
  },
];

async function main() {
  console.log('=== mDeBERTa-XNLI smoke test ===\n');
  console.log('Loading model (first run downloads ~140MB)...');

  const t0 = Date.now();
  const embedder = await createEmbedder({
    progressCallback: (data) => {
      if (data.status === 'progress' && data.progress >= 99) {
        console.log(`  download: ${data.file} done`);
      }
    },
  });
  const tLoad = Date.now() - t0;
  console.log(`  → loaded in ${tLoad}ms`);
  console.log(`  → embedder.name() = ${embedder.name()}`);
  console.log(`  → embedder.version() = ${embedder.version()}`);
  console.log(`  → ready = ${await embedder.ready()}\n`);

  console.log('=== Inference on sample set ===\n');
  console.log(`Hypothesis: "${HYPOTHESIS_FE.slice(0, 80)}..."\n`);

  const results = [];
  for (const s of SAMPLES) {
    const tInfer0 = Date.now();
    const score = await embedder.classify(s.text, HYPOTHESIS_FE);
    const tInfer = Date.now() - tInfer0;
    results.push({ ...s, score, latency_ms: tInfer });

    const flag = (s.expect === 'high' && score >= 0.5) ||
                 (s.expect === 'low' && score < 0.5)
                 ? '✓'
                 : '✗';
    console.log(
      `  [${flag}] ${s.label.padEnd(30)} expect=${s.expect.padEnd(4)} score=${score.toFixed(3)} (${tInfer}ms)`
    );
    console.log(`       text: ${s.text.slice(0, 90)}${s.text.length > 90 ? '…' : ''}`);
  }

  // Aggregate latency stats
  const latencies = results.map((r) => r.latency_ms);
  const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  console.log(`\n=== Latency ===`);
  console.log(`  cold-start (model load): ${tLoad}ms`);
  console.log(`  per-call: mean=${mean.toFixed(0)}ms  min=${min}ms  max=${max}ms`);

  // Sanity check
  const highScores = results.filter((r) => r.expect === 'high').map((r) => r.score);
  const lowScores = results.filter((r) => r.expect === 'low').map((r) => r.score);
  const meanHigh = highScores.reduce((a, b) => a + b, 0) / highScores.length;
  const meanLow = lowScores.reduce((a, b) => a + b, 0) / lowScores.length;
  console.log(`\n=== Sanity ===`);
  console.log(`  mean(high-expect) = ${meanHigh.toFixed(3)}`);
  console.log(`  mean(low-expect)  = ${meanLow.toFixed(3)}`);
  console.log(`  separation        = ${(meanHigh - meanLow).toFixed(3)} (>0 = model orientation correct)`);

  if (meanHigh > meanLow) {
    console.log('\n  → SANITY PASS: model orients high-expect above low-expect.\n');
  } else {
    console.log('\n  → SANITY FAIL: model orientation inverted or noisy.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('SMOKE FAILED:', err);
  process.exit(1);
});
