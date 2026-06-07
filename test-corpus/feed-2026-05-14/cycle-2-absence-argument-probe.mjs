// Cycle 2 (2026-05-14) — absence_argument live probe
// First live probe for this detector (was synthesis-only until now).
// Source: Wikipedia Argument_from_ignorance verbatim examples.

import {
  hasAbsenceArgument,
  hasScopeQualifier,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const POSITIVES_WIKI = [
  {
    id: 'P-WIKI-01',
    text: 'It has not been proven that the defendant is guilty. Therefore, the defendant is not guilty.',
    expected: 'argument from absence — guilt-not-proven inverted',
  },
  {
    id: 'P-WIKI-02',
    text: 'P has not been proven false. Therefore, P is true.',
    expected: 'classic argumentum ad ignorantiam',
  },
  {
    id: 'P-WIKI-03',
    text: 'P has not been proven true. Therefore, P is false.',
    expected: 'classic argumentum ad ignorantiam',
  },
  {
    id: 'P-WIKI-04',
    text: 'Although we have proven that the moon is not made of spare ribs, we have not proven that its core cannot be filled with them; therefore, the moon\'s core is filled with spare ribs.',
    expected: 'reductio illustration of absence fallacy',
  },
  {
    id: 'P-WIKI-05',
    text: 'There is no compelling evidence that UFOs are not visiting the Earth; therefore, UFOs exist.',
    expected: 'paradigm absence-argument',
  },
  {
    id: 'P-WIKI-06',
    text: 'They never called me back. I guess I didn\'t get the job.',
    expected: 'conversational silence-as-absence',
  },
];

// Quotes ABOUT the fallacy (anti-fallacy), should NOT fire
const NEGATIVES_META = [
  {
    id: 'N-META-01',
    text: 'Simply because you do not have evidence that something exists does not mean that you have evidence that it doesn\'t exist.',
    expected: 'meta-statement about fallacy',
  },
  {
    id: 'N-META-02',
    text: 'Absence of evidence is not evidence of absence.',
    expected: 'aphoristic anti-fallacy quote',
  },
];

console.log(`\n═══ CYCLE 2 — absence_argument first live probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Source: Wikipedia Argument_from_ignorance verbatim`);
console.log(`Honest scope: textbook examples — possibly mismatch detector lexicon\n`);

console.log('── POSITIVES (expected fire) ──');
let tp = 0;
const fnIds = [];
for (const e of POSITIVES_WIKI) {
  const fires = hasAbsenceArgument(e.text);
  const scope = hasScopeQualifier(e.text);
  const verdict = fires && !scope ? 'TP' : (fires && scope ? 'FIRED+INHIBITED' : 'FN');
  if (fires && !scope) tp++;
  if (!fires || scope) fnIds.push(e.id);
  console.log(`  [${e.id}] ${verdict} (raw=${fires}, scope-inhibitor=${scope})`);
  console.log(`    expected: ${e.expected}`);
  console.log(`    text: "${e.text.substring(0, 90)}..."`);
}

console.log(`\n── NEGATIVES (anti-fallacy meta-statements, expected NOT fire) ──`);
let fp = 0;
const fpIds = [];
for (const e of NEGATIVES_META) {
  const fires = hasAbsenceArgument(e.text);
  const scope = hasScopeQualifier(e.text);
  const verdict = !fires ? 'TN' : (fires && scope ? 'FIRED+INHIBITED' : 'FP');
  if (fires && !scope) fp++;
  if (fires && !scope) fpIds.push(e.id);
  console.log(`  [${e.id}] ${verdict} (raw=${fires}, scope-inhibitor=${scope})`);
  console.log(`    text: "${e.text.substring(0, 90)}..."`);
}

console.log(`\n── Summary ──`);
console.log(`TP / total positives:   ${tp}/${POSITIVES_WIKI.length}`);
console.log(`FP / total negatives:   ${fp}/${NEGATIVES_META.length}`);
console.log(`FN IDs: ${fnIds.join(', ') || '(none)'}`);
console.log(`FP IDs: ${fpIds.join(', ') || '(none)'}`);

console.log(`\n── Diagnostic ──`);
console.log(`Synthesis catch was 100% post-fix (same-corpus).`);
console.log(`First live probe catch (Wikipedia textbook): ${tp}/${POSITIVES_WIKI.length} = ${((tp / POSITIVES_WIKI.length) * 100).toFixed(1)}%`);
console.log(`Generalization gap: ${((1 - tp / POSITIVES_WIKI.length) * 100).toFixed(1)}pp.`);
console.log();
