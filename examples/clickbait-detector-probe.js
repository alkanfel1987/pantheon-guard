/**
 * clickbait-detector-probe — per-detector, cross-source contribution matrix
 *
 * Implements the validation discipline from
 * PROCESS-FINDING-2026-05-16-closed-loop-validation.md corrective action #2:
 * a detector is NEVER validated by strings its author wrote. Every number
 * below comes from real held-out headline corpora.
 *
 * Generalization criterion (operationalizes "pattern ↔ phenomenon"):
 *   a detector GENERALIZES iff it fires on catch-labelled headlines from
 *   >= 2 INDEPENDENT SOURCES with 0 false positives. A detector that fires
 *   on one source only is traced around that source's examples, not the
 *   phenomenon — exactly the cg-family failure mode the process-finding
 *   diagnosed (7 hits on held-out #1, 0 on held-out #2).
 *
 * Usage:  node examples/clickbait-detector-probe.js
 */

import { normalizeText } from '../src/normalize.js';
import { clickbaitPack } from '../src/packs/clickbait.js';
import { HELDOUT } from './benchmark-heldout-clickbait-corpus.js';
import { HELDOUT_V2 } from './benchmark-heldout-clickbait-v2-corpus.js';
import { CONTROL } from './benchmark-control-2026-05-16-corpus.js';

const CORPORA = [
  { id: 'heldout#1', entries: HELDOUT },     // Upworthy / BrightSide / Distractify
  { id: 'heldout#2', entries: HELDOUT_V2 },  // LittleThings / ScaryMommy / TheThings
  { id: 'control',   entries: CONTROL },     // 150 EN/RU/DE — cross-language
];

// Flatten, tagging each entry with corpus + source + region.
const ALL = [];
for (const c of CORPORA) {
  for (const e of c.entries) {
    ALL.push({
      corpus: c.id, src: e.src, region: e.region || 'EN',
      text: e.text, expected: e.expected,
    });
  }
}
const CATCH = ALL.filter((e) => e.expected === 'catch');
const PASS = ALL.filter((e) => e.expected === 'pass');

// ── Per-detector contribution ───────────────────────────────────────────
const detectors = clickbaitPack.detectionPatterns;
const stats = {};
for (const d of detectors) {
  stats[d.name] = { tp: 0, fp: 0, tpSrc: new Set(), tpEx: [], fpEx: [] };
}

for (const item of ALL) {
  const norm = normalizeText(item.text);
  for (const d of detectors) {
    if (d.regex.test(norm)) {
      const s = stats[d.name];
      if (item.expected === 'catch') {
        s.tp++; s.tpSrc.add(item.src);
        if (s.tpEx.length < 3) s.tpEx.push(`${item.corpus}/${item.src}: ${item.text.slice(0, 64)}`);
      } else {
        s.fp++;
        if (s.fpEx.length < 5) s.fpEx.push(`${item.corpus}/${item.src}: ${item.text.slice(0, 64)}`);
      }
    }
  }
}

console.log('═'.repeat(78));
console.log(`  CLICKBAIT DETECTOR PROBE — pack v${clickbaitPack.version}`);
console.log(`  ${detectors.length} detectors · ${CATCH.length} catch / ${PASS.length} pass across ${CORPORA.length} held-out corpora`);
console.log('═'.repeat(78));
console.log('');
console.log('  detector                          TP  src  FP  verdict');
console.log('  ' + '─'.repeat(72));

// Detectors exempt from the >=2-source rule, with the documented reason
// (see src/packs/clickbait.js header). A purely typographic pattern has
// no vocabulary to trace; an RU pattern has only one RU clickbait source
// available in the corpus.
const EXEMPT = {
  'numeric-listicle-plus': 'STRUCTURAL (zero lexical content — untraceable)',
  'numeric-listicle-ru': 'SINGLE-LANG-SOURCE (RU — pending 2nd RU corpus)',
};

let generalizes = 0, traced = 0, dead = 0;
for (const d of detectors) {
  const s = stats[d.name];
  let verdict;
  if (s.tp === 0) { verdict = 'DEAD (fires nowhere)'; dead++; }
  else if (s.fp > 0) { verdict = `FP-DIRTY (${s.fp} false pos)`; traced++; }
  else if (s.tpSrc.size >= 2) { verdict = 'GENERALIZES'; generalizes++; }
  else if (EXEMPT[d.name]) { verdict = `SHIP — ${EXEMPT[d.name]}`; generalizes++; }
  else { verdict = `TRACED (1 source: ${[...s.tpSrc][0]})`; traced++; }
  console.log(
    '  ' + d.name.padEnd(34) +
    String(s.tp).padStart(2) + '  ' +
    String(s.tpSrc.size).padStart(3) + '  ' +
    String(s.fp).padStart(2) + '  ' + verdict
  );
}
console.log('  ' + '─'.repeat(72));
console.log(`  GENERALIZES: ${generalizes}   TRACED/FP-dirty: ${traced}   DEAD: ${dead}`);
console.log('');

// ── Detail for non-generalizing detectors ───────────────────────────────
console.log('  ── per-detector evidence ' + '─'.repeat(52));
for (const d of detectors) {
  const s = stats[d.name];
  console.log(`\n  ${d.name}  [TP ${s.tp} / ${s.tpSrc.size} src · FP ${s.fp}]`);
  for (const ex of s.tpEx) console.log(`    + ${ex}`);
  for (const ex of s.fpEx) console.log(`    ! FP ${ex}`);
}
console.log('');

// ── Pack-level catch/FP per corpus and region ───────────────────────────
function packFires(text) {
  const norm = normalizeText(text);
  return detectors.some((d) => d.regex.test(norm));
}

console.log('  ── pack-level catch / FP ' + '─'.repeat(52));
for (const c of CORPORA) {
  const cat = c.entries.filter((e) => e.expected === 'catch');
  const pas = c.entries.filter((e) => e.expected === 'pass');
  const caught = cat.filter((e) => packFires(e.text)).length;
  const fp = pas.filter((e) => packFires(e.text)).length;
  console.log(
    `  ${c.id.padEnd(12)} catch ${caught}/${cat.length} = ${(100 * caught / (cat.length || 1)).toFixed(0)}%` +
    `   FP ${fp}/${pas.length} = ${(100 * fp / (pas.length || 1)).toFixed(1)}%`
  );
}
// control by region
for (const region of ['EN', 'RU', 'DE']) {
  const reg = CONTROL.filter((e) => e.region === region);
  const cat = reg.filter((e) => e.expected === 'catch');
  const pas = reg.filter((e) => e.expected === 'pass');
  const caught = cat.filter((e) => packFires(e.text)).length;
  const fp = pas.filter((e) => packFires(e.text)).length;
  console.log(
    `  control:${region.padEnd(4)} catch ${caught}/${cat.length} = ${(100 * caught / (cat.length || 1)).toFixed(0)}%` +
    `   FP ${fp}/${pas.length} = ${(100 * fp / (pas.length || 1)).toFixed(1)}%`
  );
}
const totalCaught = CATCH.filter((e) => packFires(e.text)).length;
const totalFp = PASS.filter((e) => packFires(e.text)).length;
console.log('  ' + '─'.repeat(72));
console.log(
  `  ALL          catch ${totalCaught}/${CATCH.length} = ${(100 * totalCaught / CATCH.length).toFixed(0)}%` +
  `   FP ${totalFp}/${PASS.length} = ${(100 * totalFp / PASS.length).toFixed(1)}%`
);
console.log('═'.repeat(78));
