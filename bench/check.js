/**
 * pantheon-guard · regression check vs frozen + living baselines
 *
 * FROZEN (bench/baseline.json, pre-registered N=509) — hard gate:
 *   - corpus-hash mismatch (the immutable snapshot must never change)
 *   - any new FP (strict: pass-case that flips to caught)
 *   - statistically significant McNemar regression (exact binomial sign test)
 *
 * LIVING (bench/baseline-living.json, growing set) — soft gate:
 *   - fails ONLY if a case already recorded in the living baseline REGRESSES
 *     (was correct, now wrong). Newly-added cases never fail CI — corpus growth
 *     is expected. Re-freeze the living baseline (`npm run bench:freeze`) to
 *     accept current verdicts on new cases.
 *
 * Exit codes: 0 = clean (or only benign growth); 1 = frozen drift / regression.
 *
 * Usage: npm run bench:check
 */

import { readFileSync } from 'node:fs';
import { runFrozen, runLiving } from './run.js';

const failures = [];
const lines = [];

// ────────────────────────────── FROZEN (N=509) ──────────────────────────────

const baseline = JSON.parse(
  readFileSync(new URL('./baseline.json', import.meta.url), 'utf8'),
);
const frozen = runFrozen();

if (frozen.corpus_hash !== baseline.corpus_hash) {
  failures.push(
    `[frozen] corpus hash mismatch — the pre-registered N=509 snapshot was mutated\n` +
      `  baseline: ${baseline.corpus_hash}\n` +
      `  current : ${frozen.corpus_hash}\n` +
      `  bench/corpus-frozen.json is immutable; new examples belong in the living set.`,
  );
}
if (frozen.corpus_size !== baseline.corpus_size) {
  failures.push(
    `[frozen] corpus size mismatch: baseline=${baseline.corpus_size} current=${frozen.corpus_size}`,
  );
}

const baseById = new Map(baseline.results.map((r) => [r.id, r]));
let newlyCorrect = 0;
let newlyWrong = 0;
let newFp = 0;
let newFn = 0;
let fixedFp = 0;
let fixedFn = 0;
const frozenDrift = [];

for (const c of frozen.results) {
  const b = baseById.get(c.id);
  if (!b) {
    frozenDrift.push({ id: c.id, kind: 'new-case', current: c });
    continue;
  }
  if (b.caught === c.caught && b.correct === c.correct) continue;
  frozenDrift.push({
    id: c.id,
    label: c.label,
    expected: c.expected,
    baseline: { caught: b.caught, correct: b.correct },
    current: { caught: c.caught, correct: c.correct },
  });
  if (!b.correct && c.correct) newlyCorrect++;
  if (b.correct && !c.correct) newlyWrong++;
  if (c.expected === 'pass' && c.caught && !b.caught) newFp++;
  if (c.expected === 'pass' && !c.caught && b.caught) fixedFp++;
  if (c.expected === 'catch' && !c.caught && b.caught) newFn++;
  if (c.expected === 'catch' && c.caught && !b.caught) fixedFn++;
}

// Exact binomial McNemar (sign-test) on discordant pairs.
function binomCdfRight(k, n, p = 0.5) {
  if (n === 0) return 1;
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

const discordant = newlyCorrect + newlyWrong;
const pRegression = discordant === 0 ? 1 : binomCdfRight(newlyWrong, discordant, 0.5);
const accDelta = frozen.summary.accuracy - baseline.summary.accuracy;

lines.push('═'.repeat(72));
lines.push('  pantheon-guard · bench:check');
lines.push('═'.repeat(72));
lines.push(`  ── frozen (pre-registered) · baseline v${baseline.guard_version} frozen ${baseline.frozen_at} ──`);
lines.push(`  corpus N=${frozen.corpus_size}  hash=${frozen.corpus_hash.slice(0, 12)}…`);
lines.push(
  `  accuracy : ${(baseline.summary.accuracy * 100).toFixed(2)}% → ${(frozen.summary.accuracy * 100).toFixed(2)}%   (Δ ${(accDelta * 100 >= 0 ? '+' : '')}${(accDelta * 100).toFixed(2)}pp)`,
);
lines.push(`  FP       : ${baseline.summary.fp} → ${frozen.summary.fp}   (newFP=${newFp}, fixedFP=${fixedFp})`);
lines.push(`  FN       : ${baseline.summary.fn} → ${frozen.summary.fn}   (newFN=${newFn}, fixedFN=${fixedFn})`);
lines.push(`  McNemar  : newly-correct=${newlyCorrect} newly-wrong=${newlyWrong}  p=${pRegression.toFixed(4)} ${pRegression < 0.05 && newlyWrong > newlyCorrect ? '** SIGNIFICANT **' : 'n.s.'}`);
if (frozenDrift.length === 0) {
  lines.push('  ✓ no drift — every frozen case matches baseline');
} else {
  lines.push(`  drift (${frozenDrift.length}):`);
  for (const d of frozenDrift.slice(0, 25)) {
    if (d.kind === 'new-case') {
      lines.push(`    [unexpected-new] ${d.id}  ${d.current.label ?? ''}`);
      continue;
    }
    const bm = d.baseline.correct ? '✓' : '✗';
    const cm = d.current.correct ? '✓' : '✗';
    lines.push(`    ${d.id}  ${bm}→${cm}  exp=${d.expected}  ${d.label ?? ''}`);
  }
  if (frozenDrift.length > 25) lines.push(`    … and ${frozenDrift.length - 25} more`);
}

if (newFp > 0) {
  failures.push(`[frozen] ${newFp} new false positive(s) — strict gate: any new FP on the pre-registered set fails CI`);
}
if (pRegression < 0.05 && newlyWrong > newlyCorrect) {
  failures.push(`[frozen] McNemar regression p=${pRegression.toFixed(4)} (newly-wrong=${newlyWrong} vs newly-correct=${newlyCorrect})`);
}

// ────────────────────────────── LIVING (growing) ─────────────────────────────

lines.push('');
lines.push('  ── living (growing regression set) ──');

let livingBaseline = null;
try {
  livingBaseline = JSON.parse(
    readFileSync(new URL('./baseline-living.json', import.meta.url), 'utf8'),
  );
} catch {
  /* no living baseline yet — first run */
}

const living = runLiving();

if (!livingBaseline) {
  lines.push(`  N=${living.corpus_size}  (no living baseline yet — run npm run bench:freeze to record)`);
} else {
  const livBaseById = new Map(livingBaseline.results.map((r) => [r.id, r]));
  let regressed = 0;
  let improved = 0;
  let added = 0;
  const regressions = [];
  for (const c of living.results) {
    const b = livBaseById.get(c.id);
    if (!b) {
      added++;
      continue; // new example — growth, never fails CI
    }
    if (b.correct && !c.correct) {
      regressed++;
      regressions.push(c);
    } else if (!b.correct && c.correct) {
      improved++;
    }
  }
  lines.push(
    `  N=${living.corpus_size} (baseline ${livingBaseline.corpus_size})  accuracy=${(living.summary.accuracy * 100).toFixed(2)}%  FP=${living.summary.fp} FN=${living.summary.fn}`,
  );
  lines.push(`  vs living baseline: +${added} new (informational), ${improved} improved, ${regressed} regressed`);
  for (const r of regressions.slice(0, 15)) {
    lines.push(`    ✗ regressed ${r.id}  exp=${r.expected} caught=${r.caught}  ${r.label ?? ''}`);
  }
  if (regressed > 0) {
    failures.push(`[living] ${regressed} previously-correct case(s) regressed (correct → wrong)`);
  }
}

console.log(lines.join('\n'));

if (failures.length > 0) {
  console.error('\n✗ bench:check failed:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\n✓ bench:check passed');
