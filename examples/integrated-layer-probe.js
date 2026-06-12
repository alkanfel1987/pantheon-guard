/**
 * Integrated layer probe — 2026-06-10
 *
 * Полный объяснимый слой в действии: текст → (1) реестр идиом explainIdioms()
 * + (2) семантика по принцип-гипотезам → ЕДИНЫЙ объяснимый вердикт.
 *
 * Демонстрирует то, что просил пользователь: «видимый и объяснимый слой».
 * Вердикт = не «score», а человеко-читаемое объяснение: какая идиома / какая
 * принцип-функция сработала и что это значит.
 *
 * Используются ТОЛЬКО рабочие гипотезы (калибровка 2026-06-10):
 *   срочность / дефицит / отказ-от-помощи / безальтернативность — берутся;
 *   Hiraṇyākṣa H2 (фейк-авторитет) — слабая (порог 0.42, low-confidence);
 *   Namuci (полу-правда) ИСКЛЮЧЕНА — слепое пятно NLI (см. калибровку).
 *
 * Запуск: node examples/integrated-layer-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';
import { explainIdioms } from '../src/lexicons/idioms-ru.js';
import { distressMarkers } from '../src/lexicons/distress-ru.js';
import { VALIDATED_HYPOTHESES } from '../src/packs/semantic/principle-hypotheses.js';

// Только validated-гипотезы (фейк-авторитет и полу-правда исключены — см. конфиг)
const HYPS = VALIDATED_HYPOTHESES.map((h) => ({ fn: h.fn, t: h.threshold, h: h.hypothesis }));

const TEXTS = [
  'Куй железо, пока горячо — предложение действует только сегодня!',
  'Кто не успел, тот опоздал. Места стремительно заканчиваются.',
  'Я переживаю за тебя, поэтому откажись от назначений врача и доверься нам.',
  'Исследование Гарварда показало рост на 312% — ссылку дать не можем.',
  'Другого выхода нет — либо сейчас, либо потеряете всё.',
  // контроли
  'Семь раз отмерь, один отрежь — обдумаем спокойно.',
  'Договор подписан вчера, отгрузка в среду по графику.',
  'Бесплатный сыр бывает только в мышеловке.',
  // ЭТИЧЕСКАЯ ПРОВЕРКА (ahimsa): крик о помощи — НЕ флагать как манипуляцию
  'У меня нет другого выхода, я в полном отчаянии.',
];

const log = (s) => process.stdout.write(s + '\n');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(78));
log('  Integrated layer · идиомы + семантика → объяснимый вердикт · 2026-06-10');
log('═'.repeat(78));

for (const text of TEXTS) {
  // Слой 1: реестр идиом (детерминированный объяснитель)
  const idioms = explainIdioms(text);
  // Слой 2: семантика (принцип-гипотезы)
  const sem = [];
  for (const hyp of HYPS) {
    const score = await embedder.classify(text, hyp.h);
    if (score >= hyp.t) sem.push({ fn: hyp.fn, score, weak: hyp.weak });
  }

  const idiomManip = idioms.filter((i) => i.manipulative === 'yes' || i.manipulative === 'context');
  const idiomWisdom = idioms.filter((i) => i.manipulative === 'no');
  // Слой 0: ahimsa-veto — маркер личного дистресса подавляет флаг манипуляции
  const distress = distressMarkers(text);
  const rawFlag = idiomManip.length > 0 || sem.length > 0;
  const flagged = rawFlag && distress.length === 0;

  log(`\n${'─'.repeat(78)}`);
  log(`ТЕКСТ: "${text}"`);
  log(`ВЕРДИКТ: ${flagged ? '⚑ ФЛАГ' : distress.length && rawFlag ? '○ чисто (ahimsa-veto: дистресс)' : '○ чисто'}`);
  if (distress.length && rawFlag)
    log(`  ⚕ ahimsa-veto: найден маркер дистресса «${distress[0]}» → флаг подавлен (крик о помощи, не манипуляция)`);

  // Объяснение — человеко-читаемое
  if (idiomManip.length) {
    for (const i of idiomManip)
      log(`  • идиома «${i.idiom}» → ${i.pragmatics}: ${i.figurative}`);
  }
  if (idiomWisdom.length) {
    for (const i of idiomWisdom)
      log(`  • идиома-мудрость «${i.idiom}» (НЕ давление): ${i.figurative}`);
  }
  if (sem.length) {
    for (const s of sem)
      log(`  • семантика: ${s.fn}${s.weak ? ' (слабый сигнал)' : ''} — score ${s.score.toFixed(2)}`);
  }
  if (!flagged && idioms.length === 0) log('  • ни идиом, ни манипулятивных сигналов');
}

log('\n' + '═'.repeat(78) + '\n');
