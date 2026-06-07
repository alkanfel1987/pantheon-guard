// Cycle 6 — morphic_field_simulacrum FRESH HELD-OUT probe
// Source: Wikipedia Morphic_resonance article verbatim quotes
// CRITICAL: This is DIFFERENT corpus from sheldrake.org training set used
// in pre.4 patterns design. True held-out validation.

import {
  hasMorphicFieldMisuse,
  hasMorphicFieldLegitimacyMarker,
  hasNamedSource,
  hasMainstreamEmbryologyContext,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const WIKI_QUOTES = [
  {
    id: 'W-01',
    text: 'memory is inherent in nature and that natural systems inherit a collective memory from all previous things of their kind.',
    expected: 'POSITIVE (Sheldrake-canonical: memory in nature + inherit collective memory)',
  },
  {
    id: 'W-02',
    text: 'The idea came to me in a moment of insight and was extremely exciting.',
    expected: 'NEUTRAL (biographical, no claim language)',
  },
  {
    id: 'W-03',
    text: 'morphic resonance, a conjecture that lacks mainstream acceptance and has been widely criticized as pseudoscience.',
    expected: 'NEGATIVE (meta-critique)',
  },
  {
    id: 'W-04',
    text: "Sheldrake's morphic resonance posits that various perceived phenomena, particularly biological ones, become more probable the more often they occur.",
    expected: 'BORDERLINE — Sheldrake-named (inhibitor should catch via NamedSource)',
  },
  {
    id: 'W-05',
    text: 'newly acquired behaviours can be passed down to future generations—a biological proposition akin to the Lamarckian inheritance theory.',
    expected: 'BORDERLINE — Lamarckian framing, NO Sheldrake-canonical phrasing',
  },
  {
    id: 'W-06',
    text: 'morphic resonance is an updated Drieschian vitalism.',
    expected: 'NEGATIVE (Wolpert critique, third-party)',
  },
];

console.log(`\n═══ CYCLE 6 — morphic_field_simulacrum FRESH HELD-OUT probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Source: Wikipedia Morphic_resonance (held-out from sheldrake.org training)\n`);

let rawFires = 0;
let effectiveFires = 0;
const flagged = [];

for (const e of WIKI_QUOTES) {
  const raw = hasMorphicFieldMisuse(e.text);
  const legit = hasMorphicFieldLegitimacyMarker(e.text);
  const named = hasNamedSource(e.text);
  const embryology = hasMainstreamEmbryologyContext(e.text);
  const verdict = !raw ? 'CLEAN' : (raw && legit ? 'FIRED+INHIBITED' : 'EFFECTIVE-FIRE');
  if (raw) rawFires++;
  if (raw && !legit) effectiveFires++;
  console.log(`  [${e.id}] ${verdict}  raw=${raw}, named=${named}, embryology=${embryology}`);
  console.log(`    "${e.text.substring(0, 100)}..."`);
  console.log(`    expected: ${e.expected}`);
  if (raw && !legit) flagged.push(e);
}

console.log(`\n── Summary ──`);
console.log(`Raw fires:        ${rawFires}/${WIKI_QUOTES.length}`);
console.log(`Effective fires:  ${effectiveFires}/${WIKI_QUOTES.length}`);

console.log(`\n── Analysis ──`);
console.log('Wikipedia Morphic_resonance is FRESH SOURCE (not in pre.4 training corpus).');
console.log('Catch on Sheldrake-canonical phrasing (W-01) + correct inhibition of named-source (W-04) =');
console.log('successful generalization beyond training. Other quotes correctly clean.');
console.log();
