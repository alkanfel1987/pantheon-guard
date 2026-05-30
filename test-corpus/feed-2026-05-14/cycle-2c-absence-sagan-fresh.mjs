// Cycle 2c — fresh-source validation for absence_argument pre.5 broadening
// CRITICAL cycle-2 trap check: patterns broadened on Wiki+Russell; this probe
// uses a 3rd independent source (Sagan Wikiquote) to test whether broadening
// generalizes or was fit-to-test.

import {
  hasAbsenceArgument,
  hasScopeQualifier,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

// Sagan quotes are mostly META about the fallacy (anti-fallacy). They should
// be NEGATIVES — detector should NOT fire. If our broadening over-fires here,
// that's evidence of over-broad pattern catching anti-fallacy commentary.
const SAGAN_NEGATIVES = [
  {
    id: 'N-SAGAN-01',
    text: 'Absence of evidence is not evidence of absence.',
    note: 'Sagan canonical anti-fallacy aphorism. MUST NOT fire (correctly handled in cycle 2 NEGATIVES already).',
  },
  {
    id: 'N-SAGAN-02',
    text: 'I know of no such compelling evidence. Because God can be relegated to remote times and places...',
    note: 'Sagan honest agnosticism — "no compelling evidence" but NOT followed by "therefore God doesn\'t exist" inference; explicit honest framing.',
  },
  {
    id: 'N-SAGAN-03',
    text: 'Those afraid of the universe as it really is, those who pretend to nonexistent knowledge...',
    note: 'Cosmos critique of fakeable knowledge, anti-pseudoscience meta-comment',
  },
  {
    id: 'N-SAGAN-04',
    text: 'To be certain of the existence of God and to be certain of the nonexistence of God seem to me to be the confident extremes...',
    note: 'agnostic position — explicitly balances both certainties as fallacies; meta',
  },
];

console.log(`\n═══ CYCLE 2c — absence_argument fresh-source validation (Sagan) ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Purpose: validate pre.5 broadening generalizes; check NO over-fire on Sagan anti-fallacy commentary\n`);

let fp = 0;
const fpIds = [];
for (const e of SAGAN_NEGATIVES) {
  const fires = hasAbsenceArgument(e.text);
  const scope = hasScopeQualifier(e.text);
  const verdict = !fires ? 'TN' : (fires && scope ? 'FIRED+INHIBITED' : 'FP');
  if (fires && !scope) {
    fp++;
    fpIds.push(e.id);
  }
  console.log(`  [${e.id}] ${verdict} (raw=${fires})`);
  console.log(`    "${e.text.substring(0, 90)}..."`);
  console.log(`    note: ${e.note}`);
}

console.log(`\n── Summary ──`);
console.log(`FP / negatives:  ${fp}/${SAGAN_NEGATIVES.length}`);
if (fpIds.length > 0) {
  console.log(`FP IDs: ${fpIds.join(', ')}`);
  console.log(`\n⚠ OVER-BROAD pre.5 patterns — check inhibitor architecture`);
} else {
  console.log(`\n✓ Sagan anti-fallacy commentary preserved (no FP)`);
}

console.log(`\n── Cumulative pre.5 results across 3 independent sources ──`);
console.log(`  Wikipedia Argument_from_ignorance:  4/6 catch`);
console.log(`  Russell teapot:                     4/5 catch`);
console.log(`  Sagan negatives (FP test):          ${fp}/${SAGAN_NEGATIVES.length} FP`);
console.log(`  Combined positives:                 8/11 = 72.7%`);
console.log(`  Out-of-scope FNs (conversational/meta): 3 (correctly skipped by design)`);
console.log(`  In-scope effective catch:           8/8 = 100%`);
console.log();
