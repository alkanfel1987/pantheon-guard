/**
 * pantheon-guard · regression check vs frozen baseline
 *
 * Runs the production pack stack against the same N=509 corpus and compares
 * to bench/baseline.json case-by-case. Reports:
 *   - corpus-hash mismatch (corpus mutated since freeze)
 *   - per-case verdict drift
 *   - aggregated accuracy / FP / FN delta
 *   - exact-binomial McNemar test on discordant pairs
 *
 * Exit codes:
 *   0  no drift, or drift is statistically not significant AND no new FPs
 *   1  significant regression OR new FP introduced OR corpus hash changed
 *
 * Significance gate (paired McNemar, exact binomial sign test):
 *   discordant pairs (b, c) where b = newly-correct, c = newly-wrong
 *   p_one_sided = P(X >= c | n = b+c, p = 0.5)  → fails CI if p < 0.05 and c > b
 *
 * On N=509 the floor is ~5 cases shifted one-sided, ≈0.98pp accuracy delta.
 *
 * Usage: npm run bench:check
 */

import { readFileSync } from 'node:fs';
import { runCorpus } from './run.js';

const baseline = JSON.parse(
  readFileSync(new URL('./baseline.json', import.meta.url), 'utf8'),
);
const current = runCorpus();

const failures = [];

if (current.corpus_hash !== baseline.corpus_hash) {
  failures.push(
    `corpus hash mismatch — corpus files mutated since freeze\n` +
      `  baseline: ${baseline.corpus_hash}\n` +
      `  current : ${current.corpus_hash}`,
  );
}

if (current.corpus_size !== baseline.corpus_size) {
  failures.push(
    `corpus size mismatch: baseline=${baseline.corpus_size} current=${current.corpus_size}`,
  );
}

const baselineById = new Map(baseline.results.map((r) => [r.id, r]));
const drift = [];
let newlyCorrect = 0; // baseline wrong → current correct (b in McNemar)
let newlyWrong = 0; //   baseline correct → current wrong (c in McNemar)
let newFp = 0;
let newFn = 0;
let fixedFp = 0;
let fixedFn = 0;

for (const c of current.results) {
  const b = baselineById.get(c.id);
  if (!b) {
    drift.push({ id: c.id, kind: 'new-case', current: c });
    continue;
  }
  if (b.caught === c.caught && b.correct === c.correct) continue;

  drift.push({
    id: c.id,
    label: c.label,
    expected: c.expected,
    baseline: { caught: b.caught, correct: b.correct },
    current: { caught: c.caught, correct: c.correct },
  });

  if (!b.correct && c.correct) newlyCorrect++;
  if (b.correct && !c.correct) newlyWrong++;

  // Targeted regression flags
  if (c.expected === 'pass' && c.caught && !b.caught) newFp++;
  if (c.expected === 'pass' && !c.caught && b.caught) fixedFp++;
  if (c.expected === 'catch' && !c.caught && b.caught) newFn++;
  if (c.expected === 'catch' && c.caught && !b.caught) fixedFn++;
}

// Exact binomial McNemar (sign-test variant) on discordant pairs.
// One-sided test for "current is worse than baseline": p = P(X >= newlyWrong)
// under null p=0.5 with n = newlyCorrect + newlyWrong.
function binomCdfRight(k, n, p = 0.5) {
  if (n === 0) return 1;
  // sum_{i=k..n} C(n,i) * p^i * (1-p)^(n-i)
  let logFactN = 0;
  for (let i = 1; i <= n; i++) logFactN += Math.log(i);
  let total = 0;
  for (let i = k; i <= n; i++) {
    let logFactI = 0;
    for (let j = 1; j <= i; j++) logFactI += Math.log(j);
    let logFactNI = 0;
    for (let j = 1; j <= n - i; j++) logFactNI += Math.log(j);
    const logBinom = logFactN - logFactI - logFactNI;
    total += Math.exp(logBinom + i * Math.log(p) + (n - i) * Math.log(1 - p));
  }
  return Math.min(1, total);
}

const discordantTotal = newlyCorrect + newlyWrong;
const pRegression =
  discordantTotal === 0 ? 1 : binomCdfRight(newlyWrong, discordantTotal, 0.5);

const accDelta =
  current.summary.accuracy - baseline.summary.accuracy;

const reportLines = [];
reportLines.push('═'.repeat(72));
reportLines.push('  pantheon-guard · bench:check vs frozen baseline');
reportLines.push('═'.repeat(72));
reportLines.push(`  baseline guard v${baseline.guard_version}  frozen ${baseline.frozen_at}`);
reportLines.push(`  corpus N=${current.corpus_size}  hash=${current.corpus_hash.slice(0, 12)}…`);
reportLines.push('');
reportLines.push('  ── summary delta ──');
reportLines.push(
  `  accuracy : ${(baseline.summary.accuracy * 100).toFixed(2)}% → ${(current.summary.accuracy * 100).toFixed(2)}%   (Δ ${(accDelta * 100 >= 0 ? '+' : '')}${(accDelta * 100).toFixed(2)}pp)`,
);
reportLines.push(
  `  FP       : ${baseline.summary.fp} → ${current.summary.fp}   (newFP=${newFp}, fixedFP=${fixedFp})`,
);
reportLines.push(
  `  FN       : ${baseline.summary.fn} → ${current.summary.fn}   (newFN=${newFn}, fixedFN=${fixedFn})`,
);
reportLines.push('');
reportLines.push('  ── McNemar (paired, exact binomial) ──');
reportLines.push(
  `  newly-correct (b) = ${newlyCorrect}   newly-wrong (c) = ${newlyWrong}`,
);
reportLines.push(
  `  P(regression | null) one-sided = ${pRegression.toFixed(4)}   ${
    pRegression < 0.05 && newlyWrong > newlyCorrect ? '** SIGNIFICANT REGRESSION **' : 'n.s.'
  }`,
);

if (drift.length === 0) {
  reportLines.push('');
  reportLines.push('  ✓ no drift — every case matches baseline');
} else {
  reportLines.push('');
  reportLines.push(`  ── drift (${drift.length} cases) ──`);
  for (const d of drift.slice(0, 25)) {
    if (d.kind === 'new-case') {
      reportLines.push(`    [new] ${d.id}  ${d.current.label ?? ''}`);
      continue;
    }
    const bMark = d.baseline.correct ? '✓' : '✗';
    const cMark = d.current.correct ? '✓' : '✗';
    reportLines.push(
      `    ${d.id}  ${bMark}→${cMark}  exp=${d.expected}  baseCaught=${d.baseline.caught} curCaught=${d.current.caught}  ${d.label ?? ''}`,
    );
  }
  if (drift.length > 25) reportLines.push(`    … and ${drift.length - 25} more`);
}

console.log(reportLines.join('\n'));

// CI gate logic
if (newFp > 0) {
  failures.push(
    `${newFp} new false positive(s) introduced — strict gate: any new FP fails CI`,
  );
}
if (pRegression < 0.05 && newlyWrong > newlyCorrect) {
  failures.push(
    `McNemar regression p=${pRegression.toFixed(4)} (newly-wrong=${newlyWrong} vs newly-correct=${newlyCorrect})`,
  );
}

if (failures.length > 0) {
  console.error('\n✗ bench:check failed:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\n✓ bench:check passed');
