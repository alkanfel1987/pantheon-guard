/**
 * Idiom / пословица semantic probe — 2026-06-10
 *
 * ЦЕЛЬ: проверить слепое пятно устойчивых выражений. Пословица несёт
 * переносный смысл (urgency/scarcity/social) без триггер-слов. Лексика
 * слепа по определению. Вопрос: видит ли zero-shot NLI ПЕРЕНОСНЫЙ смысл?
 *
 * Ключевой тест объяснимости: антиманипулятивные пословицы (учат
 * осторожности — «семь раз отмерь») НЕ должны путаться с манипуляцией.
 *
 * Запуск: node examples/idiom-semantic-probe.js  (веса уже в кэше)
 */

import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const HYPOTHESES = [
  { fn: 'срочность', hypothesis: 'The text pressures the reader to act immediately or lose the chance.' },
  { fn: 'дефицит', hypothesis: 'The text claims the opportunity is limited or running out.' },
  { fn: 'соц.довод', hypothesis: 'The text claims everyone else is already doing it, so you should too.' },
];

const PROBES = [
  // ── идиома в манипулятивном контексте (должно ловиться) ──
  { label: 'куй железо + только сегодня', truth: 'manip',
    text: 'Куй железо, пока горячо — предложение действует только сегодня.' },
  { label: 'кто не успел тот опоздал', truth: 'manip',
    text: 'Кто не успел, тот опоздал. Места стремительно заканчиваются.' },
  { label: 'последний вагон', truth: 'manip',
    text: 'Последний вагон уходит — потом будете жалеть, что не запрыгнули.' },
  { label: 'сейчас или никогда', truth: 'manip',
    text: 'Сейчас или никогда — другого такого шанса уже не будет.' },
  { label: 'все в деле, не отставай', truth: 'manip',
    text: 'Все уже в деле и зарабатывают, не отставайте от уходящего поезда.' },

  // ── голая идиома без контекста (тест понимания переноса) ──
  { label: 'голая: куй железо', truth: 'manip',
    text: 'Куй железо, пока горячо.' },
  { label: 'голая: лови момент', truth: 'manip',
    text: 'Лови момент, пока дают.' },

  // ── антиманипулятивная мудрость (НЕ должна ловиться — это предостережение) ──
  { label: 'control: тише едешь', truth: 'clean',
    text: 'Тише едешь — дальше будешь.' },
  { label: 'control: семь раз отмерь', truth: 'clean',
    text: 'Семь раз отмерь, один отрежь.' },
  { label: 'control: утро вечера мудренее', truth: 'clean',
    text: 'Утро вечера мудренее — решим спокойно завтра.' },
  { label: 'control: бесплатный сыр (предостережение)', truth: 'clean',
    text: 'Бесплатный сыр бывает только в мышеловке.' },
];

const FIRE = 0.55;
const log = (s) => process.stdout.write(s + '\n');

log('\n' + '═'.repeat(78));
log('  Idiom / пословица semantic probe · mDeBERTa-XNLI локально · 2026-06-10');
log('═'.repeat(78));
log('  Загрузка модели из кэша...');

const embedder = await createEmbedder({ dtype: 'q8' });
log(`  Готово. ${embedder.name()}`);

let caught = 0, totalM = 0, fp = 0, totalC = 0;

for (const p of PROBES) {
  const scores = [];
  for (const h of HYPOTHESES) {
    const s = await embedder.classify(p.text, h.hypothesis);
    scores.push({ fn: h.fn, s });
  }
  scores.sort((a, b) => b.s - a.s);
  const top = scores[0];
  const fired = top.s >= FIRE;
  const isM = p.truth === 'manip';
  if (isM) { totalM++; if (fired) caught++; } else { totalC++; if (fired) fp++; }
  const ok = (isM && fired) || (!isM && !fired);
  log(`\n[${p.truth}] ${ok ? '✓' : '✗'} ${p.label}`);
  log(`  → ${fired ? `FIRED (${top.fn})` : 'pass'}  top=${top.s.toFixed(3)}`);
  log(`  ${scores.map((x) => `${x.fn}=${x.s.toFixed(2)}`).join('  ')}`);
}

log('\n' + '═'.repeat(78));
log(`  Идиома-манипуляция поймана: ${caught}/${totalM}`);
log(`  Ложные на мудрости-контролях: ${fp}/${totalC}`);
log('═'.repeat(78) + '\n');
