/**
 * Hypothesis-tuning experiment — model is cached, test multiple hypothesis
 * phrasings against the same sample set to find the one with best
 * positive-vs-negative separation.
 *
 * Per CLAUDE.md cycle-2 trap awareness: this is exploration on synthesis
 * sample set, NOT calibration. Final threshold tuning requires held-out
 * positive corpus.
 */

import { createEmbedder } from '../src/index.js';

const HYPOTHESES = [
  {
    id: 'H1-original',
    text: 'This text frames two or more political parties, factions, or institutions as morally or behaviorally equivalent, dismissing meaningful distinctions between them.',
  },
  {
    id: 'H2-direct-en',
    text: 'Both sides are equally bad.',
  },
  {
    id: 'H3-no-difference',
    text: 'There is no meaningful difference between the political parties.',
  },
  {
    id: 'H4-uniparty',
    text: 'Both political parties are essentially the same entity.',
  },
  {
    id: 'H5-RU-direct',
    text: 'Все политические стороны одинаково плохи.',
  },
  {
    id: 'H6-mixed',
    text: 'The text claims that opposing political parties are equivalent and indistinguishable.',
  },
];

const SAMPLES = [
  // High-expect (FE rhetoric)
  { text: 'Both Democrats and Republicans are vested in this corrupt machine and funded by the same billionaires.', expect: 'high', label: 'FE-EN-Dem-Rep-vested' },
  { text: 'All politicians are the same — they say one thing in opposition and do the opposite in power.', expect: 'high', label: 'FE-EN-all-same' },
  { text: 'Все политики одинаковы — нет принципиальной разницы между ними, все одинаково коррумпированы.', expect: 'high', label: 'FE-RU-all-same' },
  { text: 'There is no real difference between the two parties on any issue that matters.', expect: 'high', label: 'FE-EN-no-diff' },
  { text: 'Both parties have always been controlled by the same lobbying class.', expect: 'high', label: 'FE-EN-both-controlled' },
  // Low-expect (substantive comparison)
  { text: 'Republicans favor lower marginal tax rates while Democrats prefer progressive structures with targeted credits.', expect: 'low', label: 'NEG-EN-tax-policy-distinct' },
  { text: 'Российские партии демонстрируют сходную централизованную структуру, но отличаются в риторике и составе электората.', expect: 'low', label: 'NEG-RU-similar-but-differ' },
  { text: 'The Dissident Right rejects mutual forbearance in favor of a will-to-power political approach.', expect: 'low', label: 'NEG-EN-single-actor-critique' },
  { text: 'Both leaders will likely announce Chinese purchases of American products, such as Boeing airplanes.', expect: 'low', label: 'NEG-EN-both-leaders-coincidence' },
];

function pct(x) { return (x * 100).toFixed(1) + '%'; }

async function main() {
  console.log('Loading model (cached after first run)...');
  const t0 = Date.now();
  const embedder = await createEmbedder();
  console.log(`  loaded in ${Date.now() - t0}ms\n`);

  const matrix = []; // rows = samples, cols = hypotheses

  console.log('Hypothesis tuning matrix (scores per sample × hypothesis):\n');
  console.log('Sample / Hypothesis'.padEnd(35) + '  ' + HYPOTHESES.map((h) => h.id.padStart(15)).join('  '));

  for (const s of SAMPLES) {
    const row = [];
    for (const h of HYPOTHESES) {
      const score = await embedder.classify(s.text, h.text);
      row.push(score);
    }
    matrix.push({ sample: s, scores: row });

    const expectMark = s.expect === 'high' ? '🔺' : '🔻';
    const scoreStr = row.map((v) => v.toFixed(3).padStart(15)).join('  ');
    console.log(`${expectMark} ${s.label.padEnd(33)}  ${scoreStr}`);
  }

  // Compute separation per hypothesis
  console.log('\n=== Per-hypothesis separation ===\n');
  const hypothesisStats = HYPOTHESES.map((h, hi) => {
    const highScores = matrix.filter((r) => r.sample.expect === 'high').map((r) => r.scores[hi]);
    const lowScores = matrix.filter((r) => r.sample.expect === 'low').map((r) => r.scores[hi]);
    const meanHigh = highScores.reduce((a, b) => a + b, 0) / highScores.length;
    const meanLow = lowScores.reduce((a, b) => a + b, 0) / lowScores.length;
    const minHigh = Math.min(...highScores);
    const maxLow = Math.max(...lowScores);
    return {
      id: h.id,
      meanHigh, meanLow,
      separation: meanHigh - meanLow,
      worstCaseSeparation: minHigh - maxLow,
      // best threshold = midpoint between maxLow and minHigh (only well-defined if minHigh > maxLow)
      bestThresh: (minHigh + maxLow) / 2,
      cleanSeparated: minHigh > maxLow,
    };
  });

  hypothesisStats.sort((a, b) => b.separation - a.separation);

  console.log('id'.padEnd(20) + '  meanHigh  meanLow  separation  worst-case  best-threshold  clean?');
  for (const s of hypothesisStats) {
    console.log(
      s.id.padEnd(20) + '  ' +
      pct(s.meanHigh).padStart(8) + '  ' +
      pct(s.meanLow).padStart(7) + '  ' +
      pct(s.separation).padStart(10) + '  ' +
      pct(s.worstCaseSeparation).padStart(10) + '  ' +
      s.bestThresh.toFixed(3).padStart(15) + '  ' +
      (s.cleanSeparated ? 'YES' : 'no')
    );
  }

  console.log('\n=== Best hypothesis ===');
  const best = hypothesisStats[0];
  console.log(`  ${best.id} (separation ${pct(best.separation)})`);
  console.log(`  recommended threshold ≈ ${best.bestThresh.toFixed(3)}`);
  console.log(`  clean class separation: ${best.cleanSeparated ? 'YES' : 'no — there is overlap'}`);

  // Save full result
  const out = { date: new Date().toISOString(), hypotheses: HYPOTHESES, samples: SAMPLES, matrix, hypothesisStats };
  const fs = await import('node:fs');
  const path = await import('node:path');
  const url = await import('node:url');
  const dirname = path.dirname(url.fileURLToPath(import.meta.url));
  fs.writeFileSync(path.join(dirname, 'hypothesis-tuning-results.json'), JSON.stringify(out, null, 2));
  console.log('\n  → hypothesis-tuning-results.json saved');
}

main().catch((e) => { console.error(e); process.exit(1); });
