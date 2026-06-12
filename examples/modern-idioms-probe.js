/**
 * Modern idioms probe — 2026-06-12 (пре-рег MODERN-IDIOMS-PREREG-2026-06-12.md)
 *
 * ЦЕЛЬ: найти современные аналоги идиом (мемы, инфобизнес-формулы, hustle-сленг),
 * которые семантика НЕ берёт (слепое пятно → реестр критичен), отделив их от тех,
 * где давление явно в форме (берётся). Мультиязычно: гипотезы EN, выражения RU+EN.
 *
 * author=tester sanity-check, НЕ метрика. Запуск: node examples/modern-idioms-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const HYP = {
  urgency:     'The text pressures the reader to act immediately or lose the chance.',
  scarcity:    'The text claims the opportunity is limited or running out.',
  socialProof: 'The text claims everyone else is already doing it, so the reader should too.',
  riskPush:    'The text urges the reader to take a big risk for a big reward.',
  exclusivity: 'The text claims this is exclusive, secret, or only for a chosen few.',
  growthBait:  'The text promises easy wealth, passive income, or fast self-transformation.',
};

const TESTS = [
  { id: 1,  t: 'Потом будет только дороже, решайте сейчас.',           pred: 'catch' },
  { id: 2,  t: 'Берите пока не разобрали — последние комплекты.',       pred: 'catch' },
  { id: 3,  t: 'Окно возможностей закрывается, второго шанса не будет.', pred: 'catch' },
  { id: 4,  t: 'Пока ты думаешь, другие уже зарабатывают.',             pred: 'catch' },
  { id: 5,  t: 'Все умные люди уже вложились в это.',                   pred: 'catch' },
  { id: 6,  t: 'Не будь как все, кто упустил свой шанс.',               pred: 'catch' },
  { id: 7,  t: 'Выйди из зоны комфорта — там начинается жизнь.',        pred: 'miss'  },
  { id: 8,  t: 'Перестань тратить, начни инвестировать в себя.',        pred: 'miss'  },
  { id: 9,  t: 'У тебя должно быть мышление миллионера, а не бедняка.', pred: 'miss'  },
  { id: 10, t: 'Получай пассивный доход на полном автопилоте.',         pred: 'miss'  },
  { id: 11, t: 'Сделай икс на своих вложениях за месяц.',               pred: 'miss'  },
  { id: 12, t: 'Деньги любят смелых, не упусти момент.',                pred: 'miss'  },
  { id: 13, t: 'Это только для своих, посторонним вход закрыт.',        pred: 'miss'  },
  { id: 14, t: 'Закрытый клуб не для всех, попадают избранные.',        pred: 'miss'  },
  { id: 15, t: 'Я тебе по-человечески говорю, как родному.',           pred: 'miss'  },
  { id: 16, t: 'Продай или умри — других вариантов в бизнесе нет.',     pred: 'catch' },
  { id: 'EN1', t: 'Grind now, sleep when you are dead.',               pred: 'miss'  },
  { id: 'EN2', t: 'Get rich or die trying.',                          pred: 'miss'  },
  { id: 'EN3', t: 'The train is leaving — do not miss out.',          pred: 'catch' },
  { id: 'C1', t: 'Успешный успех от очередного гуру по успеху.',       pred: 'pass', control: true },
  { id: 'C2', t: 'Тише едешь — дальше будешь.',                       pred: 'pass', control: true },
];

const FIRE = 0.55;
const log = (s) => process.stdout.write(s + '\n');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(80));
log('  Modern idioms probe · современные аналоги идиом · 2026-06-12');
log('═'.repeat(80));
log(`  Модель: ${embedder.name()} ${embedder.version()}\n`);

let predOk = 0;
const blindSpots = [];

for (const test of TESTS) {
  const scores = [];
  for (const [k, h] of Object.entries(HYP)) scores.push({ k, s: await embedder.classify(test.t, h) });
  scores.sort((a, b) => b.s - a.s);
  const top = scores[0];
  const fired = top.s >= FIRE;
  const actual = test.control ? (fired ? 'false-fire' : 'pass') : (fired ? 'catch' : 'miss');

  const hit = actual === test.pred;
  if (hit) predOk++;
  if (!test.control && actual === 'miss') blindSpots.push(test);

  const m = hit ? '✅' : '⚠️ ';
  log(`${m} #${String(test.id).padEnd(3)} ${actual.padEnd(10)} (ожид ${test.pred})  top=${top.k} ${top.s.toFixed(2)}`);
  log(`     «${test.t}»`);
}

log('\n' + '═'.repeat(80));
log('  ИТОГ');
log('═'.repeat(80));
log(`  Предсказание совпало: ${predOk}/${TESTS.length}`);
log(`  Слепые пятна (manip, НЕ взято семантикой → в реестр): ${blindSpots.length}`);
for (const b of blindSpots) log(`    · #${b.id}: «${b.t}»`);
log('═'.repeat(80) + '\n');
