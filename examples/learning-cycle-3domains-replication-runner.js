/**
 * Learning Cycle 2026-05-08 · REPLICATION runner
 * Tests post-fix stack (news v0.3.0 + epistemology v0.1.0 + healthcare v0.1.2)
 * on a NEW corpus pulled from section URLs of same publishers — overfit check.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { stackPacks, newsPack, healthcarePack, epistemologyPack } from '../src/index.js';
import { REPLICATION } from './learning-cycle-3domains-replication-corpus.js';

const corpusPath = new URL('./learning-cycle-3domains-replication-corpus.js', import.meta.url);
const corpusHash = createHash('sha256').update(readFileSync(corpusPath)).digest('hex');

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96, p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const halfwidth = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - halfwidth), Math.min(1, center + halfwidth)];
}
const fmt = (x) => (x * 100).toFixed(1) + '%';
const fmtCI = (ci) => `[${fmt(ci[0])}, ${fmt(ci[1])}]`;

const runner = stackPacks([healthcarePack, newsPack, epistemologyPack]);

console.log('\n═════════════════════════════════════════════════════════════════════════');
console.log('  pantheon-guard · LEARNING CYCLE 2026-05-08 · REPLICATION PROBE');
console.log('═════════════════════════════════════════════════════════════════════════');
console.log(`  Corpus SHA-256: ${corpusHash}`);
console.log(`  N = ${REPLICATION.length}`);
console.log(`  Stack: news@${newsPack.version} + epistemology@${epistemologyPack.version} + healthcare@${healthcarePack.version}`);

const results = [];
for (const c of REPLICATION) {
  const r = runner(c.text);
  const triggered = r.passes === false;
  const verdict = c.expected === 'pass' && triggered ? 'FP'
                : c.expected === 'catch' && !triggered ? 'FN'
                : c.expected === 'catch' && triggered ? 'TP'
                : 'TN';
  results.push({ ...c, triggered, verdict });
}

function aggregate(items, scope) {
  const total = items.length;
  const passN = items.filter((x) => x.expected === 'pass').length;
  const catchN = items.filter((x) => x.expected === 'catch').length;
  const tp = items.filter((x) => x.verdict === 'TP').length;
  const tn = items.filter((x) => x.verdict === 'TN').length;
  const fp = items.filter((x) => x.verdict === 'FP').length;
  const fn = items.filter((x) => x.verdict === 'FN').length;
  return { scope, total, passN, catchN, tp, tn, fp, fn };
}

const lawA = aggregate(results.filter((x) => x.domain === 'law'), 'LAW');
const jrnA = aggregate(results.filter((x) => x.domain === 'journalism'), 'JOURNALISM');
const infA = aggregate(results.filter((x) => x.domain === 'influencer'), 'INFLUENCER');
const allA = aggregate(results, 'TOTAL');

const printAgg = (a) => {
  const acc = (a.tp + a.tn) / a.total;
  const fpr = a.passN > 0 ? a.fp / a.passN : 0;
  const rec = a.catchN > 0 ? a.tp / a.catchN : 0;
  console.log(`\n  ${a.scope}  N=${a.total}  pass=${a.passN}  catch=${a.catchN}`);
  console.log(`    accuracy:  ${fmt(acc)}  CI ${fmtCI(wilson95(a.tp + a.tn, a.total))}`);
  console.log(`    FP-rate:   ${fmt(fpr)}  CI ${fmtCI(wilson95(a.fp, a.passN))}  (${a.fp}/${a.passN})`);
  console.log(`    recall:    ${fmt(rec)}  CI ${fmtCI(wilson95(a.tp, a.catchN))}  (${a.tp}/${a.catchN})`);
};
console.log('\n─── Per-domain ───');
printAgg(lawA); printAgg(jrnA); printAgg(infA); printAgg(allA);

console.log('\n─── False positives (over-trigger) ───');
const fps = results.filter((x) => x.verdict === 'FP');
if (fps.length === 0) console.log('  None.');
else fps.forEach((x) => console.log(`  [${x.domain}/${x.src}] "${x.label}"\n    ${x.text.slice(0, 130)}`));

console.log('\n─── False negatives (under-trigger) ───');
const fns = results.filter((x) => x.verdict === 'FN');
if (fns.length === 0) console.log('  None.');
else fns.forEach((x) => console.log(`  [${x.domain}/${x.src}] "${x.label}"\n    ${x.text.slice(0, 130)}`));

console.log('\n═════════════════════════════════════════════════════════════════════════\n');
