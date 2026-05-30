// Cycle 4 — silence_as_concession canonical-form probe
// HONEST SCOPE: canonical textbook forms (Wikipedia, common rhetoric);
// fresh live verbatim sources blocked (paywalled/CSP).

import {
  hasSilenceAsConcession,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const POSITIVES_CANONICAL = [
  // EN canonical
  { id: 'P-CAN-01', text: 'Their silence speaks volumes about what they really think.', src: 'EN canonical' },
  { id: 'P-CAN-02', text: 'The company declined to comment, which tells you everything.', src: 'EN declined+tells' },
  { id: 'P-CAN-03', text: 'His failure to respond proves the accusation is correct.', src: 'EN failure proves' },
  { id: 'P-CAN-04', text: 'They refused to address the question — that refusal itself is the answer.', src: 'EN refusal-is-answer' },
  { id: 'P-CAN-05', text: 'The administration\'s silence on this matter is itself a confession.', src: 'EN silence is confession' },
  // RU canonical
  { id: 'P-CAN-06', text: 'Их молчание говорит само за себя.', src: 'RU canonical' },
  { id: 'P-CAN-07', text: 'Министерство отказалось комментировать, что многозначительно.', src: 'RU declined+meaningful' },
  { id: 'P-CAN-08', text: 'Не нашли, что ответить, значит, обвинения справедливы.', src: 'RU не нашли что ответить' },
  { id: 'P-CAN-09', text: 'Показательно промолчал на прямой вопрос — фактически признал.', src: 'RU показательно промолчал' },
  { id: 'P-CAN-10', text: 'Молчание в этом вопросе говорит о многом.', src: 'RU молчание говорит о многом' },
];

const NEGATIVES_HONEST = [
  { id: 'N-01', text: 'The company chose not to comment publicly, citing ongoing litigation as the reason.', src: 'EN legal-restraint legit' },
  { id: 'N-02', text: 'They have not yet responded; we will follow up in 48 hours.', src: 'EN procedural reportage' },
  { id: 'N-03', text: 'Компания пока воздержалась от комментариев, ссылаясь на коммерческую тайну.', src: 'RU legit confidentiality' },
];

console.log(`\n═══ CYCLE 4 — silence_as_concession canonical probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);

console.log('── POSITIVES ──');
let tp = 0;
const fns = [];
for (const e of POSITIVES_CANONICAL) {
  const fires = hasSilenceAsConcession(e.text);
  if (fires) tp++;
  else fns.push(e);
  console.log(`  [${e.id}] ${fires ? 'TP' : 'FN'}  src: ${e.src}`);
  if (!fires) console.log(`    "${e.text}"`);
}

console.log(`\n── NEGATIVES (legit reportage) ──`);
let fp = 0;
for (const e of NEGATIVES_HONEST) {
  const fires = hasSilenceAsConcession(e.text);
  if (fires) fp++;
  console.log(`  [${e.id}] ${fires ? 'FP' : 'TN'}  "${e.text.substring(0, 80)}..."`);
}

console.log(`\n── Summary ──`);
console.log(`TP / positives: ${tp}/${POSITIVES_CANONICAL.length} = ${((tp / POSITIVES_CANONICAL.length) * 100).toFixed(1)}%`);
console.log(`FP / negatives: ${fp}/${NEGATIVES_HONEST.length}`);
console.log(`FN IDs: ${fns.map(f => f.id).join(', ') || '(none)'}`);
console.log();
