// Cross-domain FP check 2026-05-13
//
// New detectors pseudo_technical_simulacrum (v0.3.0-pre.2+) and
// morphic_field_simulacrum (v0.3.0-pre.4) MUST NOT false-fire on:
//   - false-equivalence LIVE corpus (political FE rhetoric, not pseudoscience)
//   - other unrelated content
//
// This script runs both new detectors against the historical FE LIVE corpus
// (test-corpus/false-equivalence-LIVE-2026-05-10/corpus.json) to verify
// zero cross-domain false-positives.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasQuantumMysticism,
  hasQuantumLegitimacyMarker,
  hasMorphicFieldMisuse,
  hasMorphicFieldLegitimacyMarker,
  epistemologyPack,
} from '../src/packs/epistemology.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpusPath = path.join(__dirname, 'false-equivalence-LIVE-2026-05-10', 'corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));

console.log(`\n═══ CROSS-DOMAIN FP CHECK ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`corpus: false-equivalence-LIVE-2026-05-10 (N=${corpus.entries.length})\n`);
console.log(`Expectation: quantum + morphic detectors fire 0/N on political FE content (different scope)\n`);

let quantumFires = 0;
let quantumFiresUninhibited = 0;
let morphicFires = 0;
let morphicFiresUninhibited = 0;
const flagged = [];

for (const e of corpus.entries) {
  const qRaw = hasQuantumMysticism(e.text);
  const qLegit = hasQuantumLegitimacyMarker(e.text);
  const mRaw = hasMorphicFieldMisuse(e.text);
  const mLegit = hasMorphicFieldLegitimacyMarker(e.text);

  if (qRaw) quantumFires++;
  if (qRaw && !qLegit) quantumFiresUninhibited++;
  if (mRaw) morphicFires++;
  if (mRaw && !mLegit) morphicFiresUninhibited++;

  if ((qRaw && !qLegit) || (mRaw && !mLegit)) {
    flagged.push({
      id: e.id,
      text: e.text.substring(0, 80),
      qFire: qRaw,
      mFire: mRaw,
    });
  }
}

console.log(`Quantum raw fires:               ${quantumFires}/${corpus.entries.length}`);
console.log(`Quantum uninhibited (true FP):   ${quantumFiresUninhibited}/${corpus.entries.length}`);
console.log(`Morphic raw fires:               ${morphicFires}/${corpus.entries.length}`);
console.log(`Morphic uninhibited (true FP):   ${morphicFiresUninhibited}/${corpus.entries.length}`);

if (flagged.length === 0) {
  console.log(`\n✓ CLEAN — zero cross-domain false-positives on political FE content`);
} else {
  console.log(`\n✗ FLAGGED ENTRIES (need audit):`);
  for (const f of flagged) {
    console.log(`  [${f.id}] q=${f.qFire} m=${f.mFire}`);
    console.log(`    "${f.text}..."`);
  }
}

console.log(`\n═══════════════════════════════\n`);
