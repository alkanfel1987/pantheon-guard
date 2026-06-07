// Cycle 8 — false_equivalence RU canonical probe
// RU was untested in FE LIVE 2026-05-10 (N=0 RU positives).
// Build canonical RU forms from standard rhetoric, run detector.

import {
  hasFalseEquivalence,
  hasComparativeDivergence,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const POSITIVES_CANONICAL_RU = [
  { id: 'P-RU-01', text: 'Все политики одинаковы — никакой разницы между ними нет.', src: 'classic «все политики одинаковы»' },
  { id: 'P-RU-02', text: 'Обе стороны равно виноваты в этом конфликте.', src: 'обе стороны равно виноваты' },
  { id: 'P-RU-03', text: 'Нет принципиальной разницы между Демпартией и Республиканцами.', src: 'нет принципиальной разницы между' },
  { id: 'P-RU-04', text: 'По сути это одно и то же — просто разные обёртки.', src: 'по сути одно и то же' },
  { id: 'P-RU-05', text: 'И те и другие одинаково плохи, выбора у нас нет.', src: 'и те и другие одинаково плохи' },
  { id: 'P-RU-06', text: 'Все олигархи на одно лицо — выводят деньги одинаково.', src: 'все олигархи одинаковы' },
  { id: 'P-RU-07', text: 'В конечном счёте все одинаково сволочи, нет смысла различать.', src: 'в конечном счёте все одинаковы' },
  { id: 'P-RU-08', text: 'Политическая элита всегда обманывает народ — что в России, что на Западе.', src: 'политическая элита всегда (with что-что)' },
  { id: 'P-RU-09', text: 'Правящий класс никогда не работает в интересах граждан.', src: 'правящий класс никогда' },
  { id: 'P-RU-10', text: 'Обе сильны принципиально не отличаются друг от друга в стратегии.', src: 'обе силы принципиально не отличаются' },
];

const NEGATIVES_LEGIT_RU = [
  { id: 'N-RU-01', text: 'Партия А продвигает реформы, а партия Б, напротив, выступает за консервацию — между ними принципиальная разница.', src: 'legit substantive comparison + divergence' },
  { id: 'N-RU-02', text: 'Хотя обе фракции голосовали за закон, их позиции по другим вопросам существенно расходятся.', src: 'legit + comparative-divergence inhibitor' },
  { id: 'N-RU-03', text: 'Уровень отношений между странами БРИКС системно растёт, что отличает их от стран Запада.', src: 'legit divergence claim' },
];

console.log(`\n═══ CYCLE 8 — false_equivalence RU canonical probe ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}\n`);

console.log('── POSITIVES ──');
let tp = 0;
const fns = [];
for (const e of POSITIVES_CANONICAL_RU) {
  const fires = hasFalseEquivalence(e.text);
  if (fires) tp++;
  else fns.push(e);
  console.log(`  [${e.id}] ${fires ? 'TP' : 'FN'}  src: ${e.src}`);
  if (!fires) console.log(`    "${e.text}"`);
}

console.log(`\n── NEGATIVES (legit comparison + divergence inhibitor) ──`);
let fp = 0;
for (const e of NEGATIVES_LEGIT_RU) {
  const fires = hasFalseEquivalence(e.text);
  const div = hasComparativeDivergence(e.text);
  if (fires) fp++;
  console.log(`  [${e.id}] ${fires ? 'FP' : 'TN'}  div-inhibitor=${div}`);
  console.log(`    "${e.text.substring(0, 90)}..."`);
}

console.log(`\n── Summary ──`);
console.log(`TP / positives:  ${tp}/${POSITIVES_CANONICAL_RU.length} = ${((tp / POSITIVES_CANONICAL_RU.length) * 100).toFixed(1)}%`);
console.log(`FP / negatives:  ${fp}/${NEGATIVES_LEGIT_RU.length}`);
console.log(`FN IDs: ${fns.map(f => f.id).join(', ') || '(none)'}`);
console.log();
