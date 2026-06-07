// Cycle 2b — fresh-source replication probe for absence_argument
// Source: Wikipedia Russell's_teapot verbatim quotes
// Purpose: confirm gap-class from Cycle 2 (Wiki textbook 0/6) generalizes
// to independent second source before any pattern broadening (cycle-2 trap
// discipline — never tune on single corpus).

import {
  hasAbsenceArgument,
  hasScopeQualifier,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const POSITIVES_RUSSELL = [
  {
    id: 'P-RUS-01',
    text: 'Nobody would be able to disprove my assertion provided I were careful to add that the teapot is too small to be revealed even by our most powerful telescopes.',
    expected: 'classic absence-shift Russell teapot',
  },
  {
    id: 'P-RUS-02',
    text: 'If I were to go on to say that, since my assertion cannot be disproved, it is intolerable presumption on the part of human reason to doubt it...',
    expected: '"cannot be disproved therefore" structure',
  },
  {
    id: 'P-RUS-03',
    text: 'Many orthodox people speak as though it were the business of sceptics to disprove received dogmas rather than of dogmatists to prove them.',
    expected: 'meta-comment on burden-of-proof shift',
  },
  {
    id: 'P-RUS-04',
    text: 'Nobody can prove that there is not between the Earth and Mars a china teapot revolving in an elliptical orbit, but nobody thinks this sufficiently likely to be taken into account in practice.',
    expected: 'paradigm absence-argument structure',
  },
  {
    id: 'P-RUS-05',
    text: 'If there\'s no way to disprove my contention, no conceivable experiment that would count against it, what does it mean to say that my dragon exists?',
    expected: 'modern Sagan paraphrase, anti-fallacy framing',
  },
];

console.log(`\n═══ CYCLE 2b — absence_argument fresh-source probe (Russell teapot) ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Purpose: confirm cycle-2 gap-class (0/6 on Wiki textbook) generalizes\n`);

let tp = 0;
const fns = [];
for (const e of POSITIVES_RUSSELL) {
  const fires = hasAbsenceArgument(e.text);
  const scope = hasScopeQualifier(e.text);
  const verdict = fires && !scope ? 'TP' : 'FN';
  if (verdict === 'TP') tp++;
  else fns.push(e);
  console.log(`  [${e.id}] ${verdict} (raw=${fires})`);
  console.log(`    "${e.text.substring(0, 100)}..."`);
}

console.log(`\n── Summary ──`);
console.log(`Catch: ${tp}/${POSITIVES_RUSSELL.length} = ${((tp / POSITIVES_RUSSELL.length) * 100).toFixed(1)}%`);
console.log(`Combined with Cycle 2: ${tp}/${POSITIVES_RUSSELL.length + 6} from 2 independent sources`);

console.log(`\n── Gap-class taxonomy across both probes ──`);
console.log(`Classes of FN observed (Wikipedia + Russell):`);
console.log(`  G1: passive «has not been proven X, therefore Y» (Wiki 1,2,3,4)`);
console.log(`  G2: «nobody can/would disprove X» (Russell 1, 4) — exists in patterns but maybe not matching exact form`);
console.log(`  G3: «no conceivable experiment / no way to disprove» (Russell 5)`);
console.log(`  G4: meta-comments about burden-of-proof (Russell 3) — POSITIVE for fallacy-spotting but our detector targets PRACTITIONERS not COMMENTATORS — likely correctly out-of-scope`);
console.log(`  G5: «they never called me back» conversational (Wiki 6) — out-of-scope by design`);
console.log();
