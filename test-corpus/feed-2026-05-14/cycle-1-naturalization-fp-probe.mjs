// Cycle 1 (2026-05-14) — naturalization_fallacy FP probe
// Evolutionary psychology mainstream quotes (Wikipedia verbatim) — should NOT
// fire because of evolutionary-scope context.
//
// Source: en.wikipedia.org/wiki/Evolutionary_psychology
// Honest scope: small N=7, single source. NOT promotion-grade.

import {
  hasNaturalizationFrame,
  hasTemporalQualifier,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const NEGATIVES_EVO_PSY = [
  {
    id: 'N-EVO-01',
    text: 'The evolutionary psychologists argue that much of human behavior is the output of psychological adaptations that evolved to solve recurrent problems in human ancestral environments.',
  },
  {
    id: 'N-EVO-02',
    text: 'Evolutionary psychology posits that psychological traits, like biological organs, have a genetic foundation and have developed through natural selection.',
  },
  {
    id: 'N-EVO-03',
    text: 'The brain\'s adaptive mechanisms were shaped by natural and sexual selection.',
  },
  {
    id: 'N-EVO-04',
    text: 'Different neural mechanisms are specialized for solving problems in humanity\'s evolutionary past.',
  },
  {
    id: 'N-EVO-05',
    text: 'Most human adaptations either evolved during the Pleistocene or were maintained by stabilizing selection during the Pleistocene.',
  },
  {
    id: 'N-EVO-06',
    text: 'Evolutionary psychologists hold that behaviors or traits that occur universally in all cultures are good candidates for evolutionary adaptations.',
  },
  {
    id: 'N-EVO-07',
    text: 'The environment of evolutionary adaptation is significantly different from modern society.',
  },
];

console.log(`\n═══ CYCLE 1 — naturalization_fallacy FP probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Source: Wikipedia Evolutionary_psychology (mainstream science, scope-aware)`);
console.log(`Expected: 0/7 fires (scope-aware text should not trigger naturalization)\n`);

let rawFires = 0;
let effectiveFires = 0;
const flagged = [];

for (const e of NEGATIVES_EVO_PSY) {
  const raw = hasNaturalizationFrame(e.text);
  const temp = hasTemporalQualifier(e.text);
  if (raw) rawFires++;
  if (raw && !temp) {
    effectiveFires++;
    flagged.push({ id: e.id, text: e.text, raw, temp });
  }
  console.log(`  [${e.id}] raw=${raw}, temporal-inhibitor=${temp} → ${raw && !temp ? 'FP' : (raw ? 'inhibited' : 'clean')}`);
  console.log(`    "${e.text.substring(0, 90)}..."`);
}

console.log(`\n── Summary ──`);
console.log(`Raw fires:            ${rawFires}/${NEGATIVES_EVO_PSY.length}`);
console.log(`Effective FPs:        ${effectiveFires}/${NEGATIVES_EVO_PSY.length}`);

if (flagged.length === 0) {
  console.log(`\n✓ CLEAN — no false-positive on legitimate evolutionary psychology science`);
} else {
  console.log(`\n✗ FALSE-POSITIVES:`);
  for (const f of flagged) {
    console.log(`  ${f.id}: "${f.text}"`);
  }
}
console.log();
