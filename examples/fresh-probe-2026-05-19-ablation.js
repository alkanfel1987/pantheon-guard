/**
 * fresh-probe-2026-05-19-ablation.js
 *
 *   node examples/fresh-probe-2026-05-19-ablation.js
 *
 * Per-detector contribution diagnostic over the fresh corpus. For every
 * detector in the pre-registered packs (news + epistemology), tests its
 * regex against each headline and reports: fires on manipulative items
 * (useful), fires on neutral items (false-positive cost), never fires
 * (dead weight on this corpus).
 *
 * DIAGNOSTIC ONLY. The corpus has been seen — this does NOT produce a
 * validated catch number, and "dead here" ≠ "dead always" (a detector may
 * fire on content this 93-item news corpus does not contain). Output is a
 * cruft map to inform a rebuild that is then validated on a FRESH corpus.
 */
import { newsPack, epistemologyPack } from '../src/index.js';
import { CORPUS } from './fresh-probe-2026-05-19-corpus.js';

const detectors = [];
for (const [packName, pack] of [['news', newsPack], ['epistemology', epistemologyPack]]) {
  const pats = pack.detectionPatterns || pack.patterns || [];
  for (const d of pats) detectors.push({ pack: packName, name: d.name, rule: d.rule, regex: d.regex });
}

const rows = [];
const caughtItems = new Set();
for (const d of detectors) {
  let onManip = 0, onNeutral = 0;
  const hits = [];
  for (const item of CORPUS) {
    let matched = false;
    try { matched = d.regex.test(item.text); } catch { matched = false; }
    if (matched) {
      if (item.label === 'manipulative') onManip++; else onNeutral++;
      hits.push(item.id);
      caughtItems.add(item.id);
    }
  }
  rows.push({ ...d, onManip, onNeutral, total: onManip + onNeutral, hits });
}

const dead = rows.filter((r) => r.total === 0);
const fpOnly = rows.filter((r) => r.total > 0 && r.onManip === 0);
const working = rows.filter((r) => r.onManip > 0);

console.log('fresh-probe 2026-05-19 — per-detector ablation (news + epistemology)');
console.log(`detectors: ${detectors.length} total ` +
  `(news ${(newsPack.detectionPatterns || []).length}, epistemology ${(epistemologyPack.detectionPatterns || []).length})`);
console.log(`corpus N=${CORPUS.length} · items touched by ≥1 detector: ${caughtItems.size}\n`);

console.log(`── WORKING — fire on ≥1 manipulative item (${working.length}) ──`);
for (const r of working.sort((a, b) => b.onManip - a.onManip || a.onNeutral - b.onNeutral))
  console.log(`  ${r.name.padEnd(42)} TP+${r.onManip} FP+${r.onNeutral}  [${r.hits.join(', ')}]`);

console.log(`\n── FP-ONLY — fire only on neutral items, pure cost (${fpOnly.length}) ──`);
for (const r of fpOnly)
  console.log(`  ${r.name.padEnd(42)} FP+${r.onNeutral}  [${r.hits.join(', ')}]`);

console.log(`\n── DEAD — never fire on this corpus (${dead.length}) ──`);
console.log('  ' + (dead.length ? dead.map((r) => r.name).join(', ') : '(none)'));
