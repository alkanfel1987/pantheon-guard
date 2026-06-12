/**
 * «Другого выхода нет» — давление vs состояние — 2026-06-10
 *
 * Наблюдение пользователя: фраза неоднозначна. «У вас нет выхода» (давление
 * на адресата) = манипуляция; «у меня нет выхода» (самоописание отчаяния) =
 * состояние говорящего, НЕ манипуляция. Флагать крик о помощи = нарушение
 * ahimsa. Различие: направление / лицо / намерение.
 *
 * Тест: различает ли текущая гипотеза безальтернативности (сформулирована
 * «...for the reader») эти два класса? И помогает ли вторая гипотеза-маркер
 * «самоописание состояния».
 *
 * Запуск: node examples/noalt-intent-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const H_PRESSURE = 'The text says there is no other option or choice for the reader.'; // текущая (давление на адресата)
const H_STATE = 'The speaker describes their own feeling of hopelessness or having no way out.'; // контр-маркер: состояние говорящего

// ── ДАВЛЕНИЕ на адресата (манипуляция — должно ловиться H_PRESSURE) ──
const PRESSURE = [
  'У вас нет выбора, решайте сейчас.',
  'Другого выхода нет — либо покупаете, либо теряете всё.',
  'Третьего не дано, соглашайтесь немедленно.',
  'У тебя нет альтернативы, подписывай.',
];

// ── СОСТОЯНИЕ говорящего (1-е лицо, отчаяние — НЕ манипуляция) ──
const STATE = [
  'У меня нет другого выхода, я в полном отчаянии.',
  'Мне кажется, выхода нет, всё потеряло смысл.',
  'Не вижу выхода из этой ситуации, опускаются руки.',
  'Мы испробовали всё, у нас не осталось вариантов.',
];

const log = (s) => process.stdout.write(s + '\n');
const fmt = (a) => a.map((x) => x.toFixed(2)).join(' ');
const embedder = await createEmbedder({ dtype: 'q8' });

async function scoreAll(texts, hyp) {
  const out = [];
  for (const t of texts) out.push(await embedder.classify(t, hyp));
  return out;
}

log('\n' + '═'.repeat(78));
log('  «Другого выхода нет»: давление (манип) vs состояние (не манип) · 2026-06-10');
log('═'.repeat(78));

const pPress_press = await scoreAll(PRESSURE, H_PRESSURE);
const pState_press = await scoreAll(STATE, H_PRESSURE);
log('\n  Гипотеза ДАВЛЕНИЯ "...no other option for the reader" (порог 0.48):');
log(`    давление: ${fmt(pPress_press)}  (min ${Math.min(...pPress_press).toFixed(2)})`);
log(`    состояние: ${fmt(pState_press)}  (max ${Math.max(...pState_press).toFixed(2)})`);
const sep1 = Math.min(...pPress_press) - Math.max(...pState_press);
log(`    разделение давление↔состояние: ${sep1 >= 0 ? '+' : ''}${sep1.toFixed(3)} ${sep1 > 0 ? '✓ различает' : '✗ НЕ различает'}`);

const pPress_state = await scoreAll(PRESSURE, H_STATE);
const pState_state = await scoreAll(STATE, H_STATE);
log('\n  Контр-гипотеза СОСТОЯНИЯ "speaker describes own hopelessness":');
log(`    давление: ${fmt(pPress_state)}  (max ${Math.max(...pPress_state).toFixed(2)})`);
log(`    состояние: ${fmt(pState_state)}  (min ${Math.min(...pState_state).toFixed(2)})`);
const sep2 = Math.min(...pState_state) - Math.max(...pPress_state);
log(`    разделение состояние↔давление: ${sep2 >= 0 ? '+' : ''}${sep2.toFixed(3)} ${sep2 > 0 ? '✓ маркер работает' : '✗ маркер слаб'}`);

log('\n' + '═'.repeat(78));
log('  ВЫВОД:');
if (sep1 > 0.05) {
  log('  Гипотеза давления САМА различает направление — состояние даёт низкий score.');
} else {
  log('  Гипотеза давления НЕ различает — нужна контр-гипотеза состояния как veto.');
  if (sep2 > 0.05) log('  Контр-гипотеза состояния РАБОТАЕТ → использовать как veto-маркер (не флагать если состояние>давления).');
  else log('  Контр-гипотеза тоже слаба → класс требует контекста/1-2-лица анализа, вне охвата одной NLI.');
}
log('═'.repeat(78) + '\n');
