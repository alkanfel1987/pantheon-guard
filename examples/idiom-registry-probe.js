/**
 * Idiom registry probe — 2026-06-10
 * Проверка ОБЪЯСНИМОГО слоя: матчер находит идиому → выдаёт расшифровку →
 * корректно различает манипуляцию / мудрость. Это не семантика (та отдельно),
 * это лексикон-объяснитель.
 *
 * Запуск: node examples/idiom-registry-probe.js
 */
import { explainIdioms, IDIOM_STATS } from '../src/lexicons/idioms-ru.js';

const TESTS = [
  // манипулятивные в контексте
  { t: 'Куй железо, пока горячо — предложение действует только сегодня!', expect: 'manip' },
  { t: 'Кто не успел, тот опоздал. Места стремительно заканчиваются.', expect: 'manip' },
  { t: 'Последний вагон уходит, потом будете жалеть.', expect: 'manip' },
  { t: 'Сейчас или никогда — другого шанса не будет.', expect: 'manip' },
  { t: 'Все побежали — и вы не отставайте от поезда.', expect: 'manip' },
  { t: 'Кто не рискует, тот не пьёт шампанского — вкладывайте сейчас.', expect: 'manip' },
  // мудрость (должна найтись, но manipulative:no)
  { t: 'Семь раз отмерь, один отрежь — не торопись с решением.', expect: 'wisdom' },
  { t: 'Утро вечера мудренее, решим спокойно завтра.', expect: 'wisdom' },
  { t: 'Бесплатный сыр бывает только в мышеловке.', expect: 'wisdom' },
  // без идиом (ничего не найти)
  { t: 'Договор на поставку подписан вчера, отгрузка в среду.', expect: 'none' },
];

const log = (s) => process.stdout.write(s + '\n');

log('\n' + '═'.repeat(78));
log('  Idiom registry probe · объяснимый слой · 2026-06-10');
log('═'.repeat(78));
log(`  Реестр: ${IDIOM_STATS.total} выражений ` +
    `(manip=${IDIOM_STATS.manipulative_yes}, context=${IDIOM_STATS.manipulative_context}, wisdom=${IDIOM_STATS.manipulative_no})`);

let correct = 0;
for (const test of TESTS) {
  const found = explainIdioms(test.t);
  const hasManip = found.some((f) => f.manipulative === 'yes' || f.manipulative === 'context');
  const hasWisdom = found.some((f) => f.manipulative === 'no');

  let verdict;
  if (found.length === 0) verdict = 'none';
  else if (hasManip && !hasWisdom) verdict = 'manip';
  else if (hasWisdom && !hasManip) verdict = 'wisdom';
  else verdict = 'mixed';

  const ok = verdict === test.expect;
  if (ok) correct++;
  log(`\n[${test.expect}] ${ok ? '✓' : '✗'} "${test.t.slice(0, 55)}${test.t.length > 55 ? '…' : ''}"`);
  if (found.length === 0) {
    log('  → идиом не найдено');
  } else {
    for (const f of found) {
      const flag = f.manipulative === 'no' ? 'МУДРОСТЬ' : f.manipulative === 'yes' ? 'МАНИП' : 'контекст';
      log(`  → «${f.idiom}» [${flag}/${f.pragmatics}] — ${f.figurative}`);
    }
  }
}

log('\n' + '═'.repeat(78));
log(`  Корректно классифицировано: ${correct}/${TESTS.length}`);
log('═'.repeat(78) + '\n');
