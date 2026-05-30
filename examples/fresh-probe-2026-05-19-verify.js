/**
 * fresh-probe-2026-05-19-verify.js
 *
 * Checks whether "66 dead detectors" is narrowness/overfit OR a structural
 * problem blocking working detectors.
 *
 *   Test A — sampled DEAD detectors vs hand-written positive controls
 *            (text that MUST trigger them). All PASS ⇒ detectors work, the
 *            fresh corpus simply lacks their forms. Any FAIL ⇒ real bug.
 *   Test B — full runner on canonical-manipulation text (end-to-end machinery).
 *   Test C — same stack over the FROZEN phase1 corpus (machinery sanity:
 *            if something structural blocked detectors, frozen would also
 *            collapse — it does not).
 *   Test D — epistemology pack structure (it enumerated 0 detectors).
 */
import { stackPacks, newsPack, epistemologyPack } from '../src/index.js';
import { CORPUS as PHASE1 } from './benchmark-phase1-corpus.js';

const byName = {};
for (const d of newsPack.detectionPatterns) byName[d.name] = d;

// ── Test A — dead detectors vs positive controls ──
const controls = [
  ['shocking_secret_en',  'The shocking secret nobody talks about is finally here'],
  ['you_wont_believe_en', "You won't believe what happened next in this story"],
  ['experts_hate_en',     'Doctors hate this one simple trick for weight loss'],
  ['they_dont_want_en',   "They don't want you to know the truth about this"],
  ['panic_frame_en',      'Panic spreads across the city as prices climb'],
  ['media_silence_en',    "What the mainstream media won't tell you about it"],
  ['before_deleted_en',   "Watch this before it's deleted by the censors"],
  ['quiz_en',             'Which Disney character are you, deep down'],
  ['sources_say_en',      'Sources say the deal collapsed late last night'],
  ['shocking_secret_ru',  'Шокирующий секрет, который скрывают от вас годами'],
  ['you_wont_believe_ru', 'Вы не поверите, что произошло дальше в этой истории'],
  ['experts_hate_ru',     'Врачи ненавидят это простое домашнее средство'],
  ['panic_frame_ru',      'Паника охватила город после новостей о ценах'],
];
console.log('── Test A: DEAD detectors vs positive controls (expect all PASS) ──');
let aPass = 0;
for (const [name, ctrl] of controls) {
  const d = byName[name];
  if (!d) { console.log(`  ??    ${name} — not found`); continue; }
  const hit = d.regex.test(ctrl);
  if (hit) aPass++;
  console.log(`  ${hit ? 'PASS' : 'FAIL'}  ${name.padEnd(22)} ← "${ctrl.slice(0, 50)}"`);
}
console.log(`  → ${aPass}/${controls.length}\n`);

// ── Test B — end-to-end machinery on canonical-manipulation text ──
const runner = stackPacks([newsPack, epistemologyPack]);
const canon = [
  "You won't believe this shocking secret that doctors hate.",
  "Sources say panic is spreading — read this before it's deleted.",
  'Шокирующий секрет, который скрывают от вас: вы не поверите.',
];
console.log('── Test B: full runner on canonical-manipulation text (expect all CAUGHT) ──');
let bCaught = 0;
for (const t of canon) {
  const caught = runner(t).passes === false;
  if (caught) bCaught++;
  console.log(`  ${caught ? 'CAUGHT' : 'MISSED'}  "${t.slice(0, 58)}"`);
}
console.log(`  → ${bCaught}/${canon.length}\n`);

// ── Test C — same stack over the FROZEN phase1 corpus ──
console.log('── Test C: same stack over FROZEN phase1 corpus (machinery sanity) ──');
let tp = 0, catchN = 0;
for (const item of PHASE1) {
  if (item.expected !== 'catch') continue;
  catchN++;
  if (runner(item.text).passes === false) tp++;
}
console.log(`  frozen phase1 catch: ${tp}/${catchN} = ${((100 * tp) / catchN).toFixed(1)}%`);
console.log('  (fresh corpus = 8.3% with the SAME runner)\n');

// ── Test D — epistemology pack structure ──
console.log('── Test D: epistemology pack structure ──');
console.log('  keys:', Object.keys(epistemologyPack).join(', '));
console.log('  detectionPatterns:', (epistemologyPack.detectionPatterns || []).length);
console.log('  requirements:', (epistemologyPack.requirements || []).length);
