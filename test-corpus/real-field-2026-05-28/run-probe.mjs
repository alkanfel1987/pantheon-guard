// Real-field probe runner for pantheon-guard
// Reproducibility: node test-corpus/real-field-2026-05-28/run-probe.mjs
// Stack = production bench stack: news + news-de + epistemology + healthcare
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  stackPacks, newsPack, newsDePack, epistemologyPack, healthcarePack,
} from '../../src/index.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const corpusPath = join(__dir, 'corpus.json');
const raw = readFileSync(corpusPath);
const corpusHash = createHash('sha256').update(raw).digest('hex');
const corpus = JSON.parse(raw.toString('utf8'));

const STACK = stackPacks([newsPack, newsDePack, epistemologyPack, healthcarePack]);

// Wilson 95% score interval for a binomial proportion
function wilson(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96, p = k / n;
  const denom = 1 + z * z / n;
  const center = p + z * z / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n);
  return [(center - margin) / denom, (center + margin) / denom];
}
const pct = (x) => (100 * x).toFixed(1) + '%';

const results = corpus.map((c) => {
  const text = c.desc ? `${c.title}\n${c.desc}` : c.title;
  const r = STACK(text);
  const flagged = r.passes === false;
  const sources = [
    ...(r.packViolations || []).map((v) => v.source),
    ...(r.violations || []).map((v) => v.source || v.rule || 'core'),
    ...(r.unmetRequirements || []).map((u) => u.id),
  ];
  return { ...c, flagged, sources: [...new Set(sources)] };
});

const n = results.length;
const flagged = results.filter((r) => r.flagged);
const k = flagged.length;
const [lo, hi] = wilson(k, n);

function group(keyFn) {
  const m = {};
  for (const r of results) {
    const key = keyFn(r);
    m[key] ??= { n: 0, k: 0 };
    m[key].n++;
    if (r.flagged) m[key].k++;
  }
  return m;
}

const byDomain = group((r) => r.domain);
const byRegion = group((r) => r.region);
const bySource = group((r) => r.source);

// detector histogram
const detHist = {};
for (const r of flagged) for (const s of r.sources) detHist[s] = (detHist[s] || 0) + 1;

console.log('═'.repeat(64));
console.log('  pantheon-guard · REAL-FIELD PROBE · 2026-05-28');
console.log('═'.repeat(64));
console.log(`corpus_hash (SHA-256): ${corpusHash}`);
console.log(`N = ${n} live RSS items (title+description)`);
console.log(`pack stack: news + news-de + epistemology + healthcare (v${newsPack.version}/.../prod)`);
console.log('');
console.log(`FIRE-RATE (passes===false): ${k}/${n} = ${pct(k / n)}`);
console.log(`Wilson 95% CI: [${pct(lo)}, ${pct(hi)}]`);
console.log('');
console.log('── by domain ──');
for (const [d, v] of Object.entries(byDomain)) console.log(`  ${d.padEnd(10)} ${v.k}/${v.n} = ${pct(v.k / v.n)}`);
console.log('── by region ──');
for (const [d, v] of Object.entries(byRegion)) console.log(`  ${d.padEnd(10)} ${v.k}/${v.n} = ${pct(v.k / v.n)}`);
console.log('── by source ──');
for (const [d, v] of Object.entries(bySource)) console.log(`  ${d.padEnd(14)} ${v.k}/${v.n} = ${pct(v.k / v.n)}`);
console.log('── detector histogram (which rule fired) ──');
for (const [d, c] of Object.entries(detHist).sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(3)} × ${d}`);

// dump all flagged for manual adjudication
const dump = flagged.map((r) => ({ source: r.source, domain: r.domain, region: r.region, title: r.title, fired: r.sources }));
writeFileSync(join(__dir, 'flagged.json'), JSON.stringify(dump, null, 2));
writeFileSync(join(__dir, 'results.json'), JSON.stringify({
  corpus_hash: corpusHash, n, flagged: k, fire_rate: k / n, wilson95: [lo, hi],
  by_domain: byDomain, by_region: byRegion, by_source: bySource, detector_histogram: detHist,
}, null, 2));
console.log('');
console.log(`flagged dump → flagged.json (${k} items), summary → results.json`);
