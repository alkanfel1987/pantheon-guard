// Cycle 5 — pseudo_technical_simulacrum FP-stress probe
// Source: Wikipedia Quantum_mysticism article verbatim quotes (critical meta-coverage).
//
// These quotes are THIRD-PARTY descriptions of pseudo-claims, not first-person
// claim language. Detector should NOT fire (or if raw fires, inhibitor must catch).
// Tests inhibitor architecture under FP-stress.

import {
  hasQuantumMysticism,
  hasQuantumLegitimacyMarker,
  hasNamedSource,
  hasFormalPhysicsContext,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const META_QUOTES = [
  {
    id: 'M-01',
    text: 'Quantum mysticism seeks to relate spirituality or mystical worldviews to the ideas of quantum mechanics and its interpretations.',
    note: 'meta-description, no first-person claim',
  },
  {
    id: 'M-02',
    text: 'The "consciousness causes collapse" interpretation was explored by Eugene Wigner in his 1961 paper.',
    note: 'historical reportage with named source (Wigner+1961)',
  },
  {
    id: 'M-03',
    text: "Deepak Chopra's quantum theory posits that aging is caused by the mind.",
    note: 'paraphrased Chopra claim, third-party framing',
  },
  {
    id: 'M-04',
    text: 'The film misused the Heisenberg uncertainty principle and the observer effect.',
    note: 'critical meta-comment',
  },
  {
    id: 'M-05',
    text: 'New Age beliefs combine ancient mysticism with the language of quantum mechanics.',
    note: 'meta-classification',
  },
  {
    id: 'M-06',
    text: 'Quantum mysticism draws upon coincidental similarities of language rather than genuine connections.',
    note: 'critical meta-comment',
  },
];

console.log(`\n═══ CYCLE 5 — pseudo_technical_simulacrum FP-stress probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Source: Wikipedia Quantum_mysticism (meta-descriptions, critical reportage)`);
console.log(`Expected: 0/6 effective FP (raw might fire on M-03 «aging caused by mind», inhibitor catches)\n`);

let rawFires = 0;
let effectiveFP = 0;
const flagged = [];

for (const e of META_QUOTES) {
  const raw = hasQuantumMysticism(e.text);
  const legit = hasQuantumLegitimacyMarker(e.text);
  const named = hasNamedSource(e.text);
  const formal = hasFormalPhysicsContext(e.text);
  const verdict = !raw ? 'CLEAN' : (raw && legit ? 'FIRED+INHIBITED' : 'FP');
  if (raw) rawFires++;
  if (raw && !legit) {
    effectiveFP++;
    flagged.push({ id: e.id, text: e.text, note: e.note });
  }
  console.log(`  [${e.id}] ${verdict}  raw=${raw}, named=${named}, formal=${formal}`);
  console.log(`    "${e.text}"`);
  console.log(`    note: ${e.note}`);
}

console.log(`\n── Summary ──`);
console.log(`Raw fires:        ${rawFires}/${META_QUOTES.length}`);
console.log(`Effective FPs:    ${effectiveFP}/${META_QUOTES.length}`);

if (effectiveFP === 0) {
  console.log(`\n✓ Inhibitor architecture holds — meta-descriptions correctly suppressed`);
} else {
  console.log(`\n⚠ FPs found — investigate inhibitor coverage:`);
  for (const f of flagged) console.log(`  ${f.id}: "${f.text}" (${f.note})`);
}
console.log();
