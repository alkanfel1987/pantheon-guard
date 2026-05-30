// Cycle 3 — anecdotal_override canonical-form probe
//
// HONEST SCOPE: live verbatim sources blocked (paywalled/inaccessible).
// This probe uses CANONICAL anecdotal-rhetoric forms documented in
// Wikipedia + standard logic textbooks. These are NOT synthesis (not
// authored by me to fit patterns), but ARE canonical schematic forms.
// NOT the same as fresh-pull live corpus — separate evidence tier.

import {
  hasAnecdotalOverride,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const POSITIVES_CANONICAL = [
  // From Wikipedia "Anecdotal evidence" — canonical forms
  { id: 'P-CAN-01', text: 'I know a person who survived without ever getting the vaccine.', src: 'Wiki canonical "I know a person who"' },
  { id: 'P-CAN-02', text: 'I know of a case where the alternative treatment worked perfectly.', src: 'Wiki canonical "I know of a case where"' },
  // EN common forms
  { id: 'P-CAN-03', text: 'In my 30 years of clinical practice, I have never seen this side effect.', src: 'EN clinical practice override' },
  { id: 'P-CAN-04', text: 'I saw it myself; the system clearly does not work as advertised.', src: 'EN first-person witness override' },
  { id: 'P-CAN-05', text: 'I have a friend who lost weight on this diet, so the studies must be wrong.', src: 'EN friend-who anecdote override' },
  { id: 'P-CAN-06', text: 'My personal experience shows that this method is effective for most people.', src: 'EN personal experience override' },
  // RU common forms
  { id: 'P-CAN-07', text: 'Я лично видел, как этот препарат помогает — никакая статистика меня не переубедит.', src: 'RU first-person witness override' },
  { id: 'P-CAN-08', text: 'У меня есть знакомая, которая прошла через это и говорит совсем другое.', src: 'RU friend-who anecdote' },
  { id: 'P-CAN-09', text: 'За 25 лет работы хирургом я ни разу не сталкивался с таким исходом.', src: 'RU clinical practice override' },
  { id: 'P-CAN-10', text: 'Своими глазами видел эффект, поэтому исследования бессмысленны.', src: 'RU eyewitness override' },
];

// Negatives — first-person reports without "override" framing should NOT fire
const NEGATIVES_HONEST = [
  { id: 'N-01', text: 'I observed something interesting yesterday but I would want to see a study confirm it.', src: 'honest first-person + epistemic humility' },
  { id: 'N-02', text: 'My experience may not generalize — let me check the literature before concluding.', src: 'self-aware framing' },
  { id: 'N-03', text: 'В моём опыте бывали случаи иные, но это не означает, что данные неправы.', src: 'RU epistemic humility' },
];

console.log(`\n═══ CYCLE 3 — anecdotal_override canonical probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Honest scope: canonical textbook forms, NOT live verbatim\n`);

console.log('── POSITIVES (canonical anecdotal overrides) ──');
let tp = 0;
const fns = [];
for (const e of POSITIVES_CANONICAL) {
  const fires = hasAnecdotalOverride(e.text);
  if (fires) tp++;
  else fns.push(e);
  console.log(`  [${e.id}] ${fires ? 'TP' : 'FN'}  src: ${e.src}`);
  if (!fires) console.log(`    "${e.text}"`);
}

console.log(`\n── NEGATIVES (honest first-person) ──`);
let fp = 0;
for (const e of NEGATIVES_HONEST) {
  const fires = hasAnecdotalOverride(e.text);
  if (fires) fp++;
  console.log(`  [${e.id}] ${fires ? 'FP' : 'TN'}  "${e.text.substring(0, 80)}..."`);
}

console.log(`\n── Summary ──`);
console.log(`TP / positives:  ${tp}/${POSITIVES_CANONICAL.length} = ${((tp / POSITIVES_CANONICAL.length) * 100).toFixed(1)}%`);
console.log(`FP / negatives:  ${fp}/${NEGATIVES_HONEST.length}`);
console.log(`\nFN-class taxonomy:`);
const fnIds = fns.map(f => f.id).join(', ');
console.log(`  FN IDs: ${fnIds || '(none)'}`);
for (const fn of fns) console.log(`  ${fn.id}: ${fn.src}`);
console.log();
