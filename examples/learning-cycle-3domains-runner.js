/**
 * Learning Cycle 2026-05-08 · 3-Domain Runner
 *
 * Pre-registration: ../../Pantheon/vault/04-Projects/Этический фильтр.../LEARNING-CYCLE-2026-05-08-PRE-REGISTRATION.md
 *
 * Stack: core + healthcare-pack v0.1.1 + news-pack v0.2.0 + epistemology-pack v0.0.1
 * Domains: law (40), journalism (40), influencer (39) — N=119
 *
 * Computes SHA-256 of all 3 corpus files (proof of pre-registration),
 * runs stack, reports per-domain + per-source metrics with Wilson 95% CI,
 * and lists FP/FN cases for gap analysis.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  inspect,
  stackPacks,
  newsPack,
  healthcarePack,
  epistemologyPack,
} from '../src/index.js';
import { LAW } from './learning-cycle-3domains-corpus-law.js';
import { JOURNALISM } from './learning-cycle-3domains-corpus-journalism.js';
import { INFLUENCER } from './learning-cycle-3domains-corpus-influencer.js';

// ─────────────────────────────────────────────
// SHA-256 of all 3 corpus files (pre-registration proof)
// ─────────────────────────────────────────────

function sha256OfFile(name) {
  const path = new URL(`./${name}`, import.meta.url);
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const lawHash = sha256OfFile('learning-cycle-3domains-corpus-law.js');
const jrnHash = sha256OfFile('learning-cycle-3domains-corpus-journalism.js');
const infHash = sha256OfFile('learning-cycle-3domains-corpus-influencer.js');

// ─────────────────────────────────────────────
// Wilson 95% CI for proportion
// ─────────────────────────────────────────────

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const halfwidth = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - halfwidth), Math.min(1, center + halfwidth)];
}

const fmt = (x) => (x * 100).toFixed(1) + '%';
const fmtCI = (ci) => `[${fmt(ci[0])}, ${fmt(ci[1])}]`;

// ─────────────────────────────────────────────
// Stack: core + healthcare + news + epistemology
// ─────────────────────────────────────────────

const runner = stackPacks([healthcarePack, newsPack, epistemologyPack]);

const CORPUS = [...LAW, ...JOURNALISM, ...INFLUENCER];

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────

const banner = (s) => '\n' + '═'.repeat(78) + '\n  ' + s + '\n' + '═'.repeat(78);

console.log(banner('pantheon-guard · LEARNING CYCLE 2026-05-08 · 3 DOMAINS'));
console.log(`  Corpus SHA-256:`);
console.log(`    law         (N=${LAW.length}):         ${lawHash}`);
console.log(`    journalism  (N=${JOURNALISM.length}):  ${jrnHash}`);
console.log(`    influencer  (N=${INFLUENCER.length}):  ${infHash}`);
console.log(`  Total N = ${CORPUS.length}`);
console.log(`  Stack: core + healthcare v0.1.1 + news v0.2.0 + epistemology v0.0.1`);

// Per-item run
const results = [];
for (const c of CORPUS) {
  const r = runner(c.text);
  const triggered = r.passes === false;
  const correct = (c.expected === 'catch' && triggered) || (c.expected === 'pass' && !triggered);
  const verdict = c.expected === 'pass' && triggered ? 'FP'
                : c.expected === 'catch' && !triggered ? 'FN'
                : c.expected === 'catch' && triggered ? 'TP'
                : 'TN';
  results.push({ ...c, triggered, correct, verdict, ruleHits: r.ruleHits || [] });
}

// ─────────────────────────────────────────────
// Per-domain aggregation
// ─────────────────────────────────────────────

function aggregate(items, scope) {
  const total = items.length;
  const passN = items.filter((x) => x.expected === 'pass').length;
  const catchN = items.filter((x) => x.expected === 'catch').length;
  const tp = items.filter((x) => x.verdict === 'TP').length;
  const tn = items.filter((x) => x.verdict === 'TN').length;
  const fp = items.filter((x) => x.verdict === 'FP').length;
  const fn = items.filter((x) => x.verdict === 'FN').length;
  const acc = (tp + tn) / total;
  const triggerRate = (tp + fp) / total;
  const fpRate = passN > 0 ? fp / passN : 0;
  const recall = catchN > 0 ? tp / catchN : 0;
  const accCI = wilson95(tp + tn, total);
  const fpCI = wilson95(fp, passN);
  const recallCI = wilson95(tp, catchN);
  return { scope, total, passN, catchN, tp, tn, fp, fn, acc, accCI, triggerRate, fpRate, fpCI, recall, recallCI };
}

const lawResults = results.filter((x) => x.domain === 'law');
const jrnResults = results.filter((x) => x.domain === 'journalism');
const infResults = results.filter((x) => x.domain === 'influencer');

const lawAgg = aggregate(lawResults, 'LAW');
const jrnAgg = aggregate(jrnResults, 'JOURNALISM');
const infAgg = aggregate(infResults, 'INFLUENCER');
const allAgg = aggregate(results, 'TOTAL');

console.log(banner('Per-domain summary'));
const printAgg = (a) => {
  console.log(`\n  ${a.scope}  (N=${a.total}, pass=${a.passN}, catch=${a.catchN})`);
  console.log(`    accuracy:    ${fmt(a.acc).padEnd(7)}  CI ${fmtCI(a.accCI)}`);
  console.log(`    trigger %:   ${fmt(a.triggerRate)} (TP=${a.tp} + FP=${a.fp})`);
  console.log(`    FP-rate:     ${fmt(a.fpRate).padEnd(7)}  CI ${fmtCI(a.fpCI)}  (${a.fp}/${a.passN})`);
  console.log(`    recall:      ${fmt(a.recall).padEnd(7)}  CI ${fmtCI(a.recallCI)}  (${a.tp}/${a.catchN})`);
};
printAgg(lawAgg);
printAgg(jrnAgg);
printAgg(infAgg);
printAgg(allAgg);

// ─────────────────────────────────────────────
// Per-source breakdown
// ─────────────────────────────────────────────

console.log(banner('Per-source breakdown'));
const bySrc = {};
for (const r of results) {
  bySrc[r.src] ??= [];
  bySrc[r.src].push(r);
}
const sources = Object.keys(bySrc).sort();
console.log('\n  source                 N    pass→TN  catch→TP  FP   FN   acc');
console.log('  ' + '─'.repeat(70));
for (const s of sources) {
  const items = bySrc[s];
  const a = aggregate(items, s);
  console.log(`  ${s.padEnd(20)}  ${String(a.total).padStart(2)}    ${String(a.tn).padStart(7)}  ${String(a.tp).padStart(8)}  ${String(a.fp).padStart(2)}   ${String(a.fn).padStart(2)}   ${fmt(a.acc)}`);
}

// ─────────────────────────────────────────────
// FP / FN listing for gap analysis
// ─────────────────────────────────────────────

console.log(banner('FALSE POSITIVES (pack triggered on pass-labelled — over-triggering)'));
const fpItems = results.filter((x) => x.verdict === 'FP');
if (fpItems.length === 0) {
  console.log('\n  None.');
} else {
  for (const x of fpItems) {
    console.log(`\n  [${x.domain}/${x.src}] "${x.label}"`);
    console.log(`    text: ${x.text.slice(0, 140)}${x.text.length > 140 ? '...' : ''}`);
    console.log(`    rules: ${x.ruleHits.map((h) => h.code || h.id || h.message || JSON.stringify(h)).join(', ')}`);
  }
}

console.log(banner('FALSE NEGATIVES (pack missed catch-labelled — under-triggering)'));
const fnItems = results.filter((x) => x.verdict === 'FN');
if (fnItems.length === 0) {
  console.log('\n  None.');
} else {
  for (const x of fnItems) {
    console.log(`\n  [${x.domain}/${x.src}] "${x.label}"`);
    console.log(`    text: ${x.text.slice(0, 140)}${x.text.length > 140 ? '...' : ''}`);
  }
}

// ─────────────────────────────────────────────
// Hypothesis verdict (vs pre-registered ranges)
// ─────────────────────────────────────────────

console.log(banner('Hypothesis verdict (vs pre-registration)'));

function verdictForRange(actual, lo, hi, name) {
  const inRange = actual >= lo && actual <= hi;
  const status = inRange ? 'CONFIRMED' : (actual < lo ? 'FALSIFIED-LOW' : 'FALSIFIED-HIGH');
  console.log(`  ${name}: predicted [${fmt(lo)}, ${fmt(hi)}], actual ${fmt(actual)} → ${status}`);
}

console.log('\n  H-LAW (catch-rate / trigger-rate):');
verdictForRange(lawAgg.triggerRate, 0.05, 0.15, '    H-LAW.trigger');
verdictForRange(lawAgg.fpRate, 0, 0.05, '    H-LAW.FP-rate');

console.log('\n  H-JOURNALISM (catch-rate / FP):');
verdictForRange(jrnAgg.triggerRate, 0.30, 0.50, '    H-J.trigger');
verdictForRange(jrnAgg.fpRate, 0, 0.05, '    H-J.FP-rate');

console.log('\n  H-INFLUENCER (catch-rate / FP):');
verdictForRange(infAgg.triggerRate, 0.40, 0.60, '    H-INF.trigger');
verdictForRange(infAgg.fpRate, 0, 0.10, '    H-INF.FP-rate');

console.log('\n' + '═'.repeat(78));
console.log('  Done. Per-domain metrics + Wilson 95% CI above. FP/FN listed for gap analysis.');
console.log('═'.repeat(78) + '\n');
