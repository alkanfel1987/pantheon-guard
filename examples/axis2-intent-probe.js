/**
 * Axis-2 intent probe — 2026-06-12 (пре-рег AXIS2-INTENT-PREREG-2026-06-12.md)
 *
 * ЦЕЛЬ: проверить, несёт ли РЕАКЦИЯ на уточняющий зонд сигнал намерения,
 * которого НЕТ в статическом тексте. Гипотеза G2 ось-2: манипулятор на зонд
 * усиливает давление, страдающий — раскрывается.
 *
 * КОНТРОЛЬ (главный риск 06-10): прогоняем и ИСХОДНЫЕ тексты, и реакции.
 * H-axis2 требует, чтобы РЕАКЦИЯ разделяла манип/дистресс ЛУЧШЕ, чем статика.
 *
 * N=6 (3 пары), Claude-сконструировано, author=tester — sanity-check, НЕ метрика.
 *
 * Запуск: node examples/axis2-intent-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';

const H_PRESSURE = 'The reply escalates pressure, urgency, threat, or pushes the other person toward a deal or action.';
const H_DISCLOSE = 'The reply explains the speaker\'s own circumstances or feelings without pressuring the other person.';

const PAIRS = [
  { probe: 'Почему именно сейчас?',
    manip:   { src: 'Нужно решить прямо сейчас, иначе всё потеряете.',
               react: 'Потому что завтра будет поздно — платите сегодня, второго шанса не будет.' },
    distress:{ src: 'Мне срочно нужна помощь, я не знаю что делать.',
               react: 'Потому что мне нечем платить за жильё и я в панике, не знаю к кому идти.' } },
  { probe: 'А если откажусь?',
    manip:   { src: 'Это единственный разумный выбор для вас.',
               react: 'Тогда пеняйте на себя — потом не говорите, что вас не предупреждали.' },
    distress:{ src: 'У меня правда нет другого выхода.',
               react: 'Тогда я не знаю, что будет, мне очень страшно — но я пойму, если ты не сможешь.' } },
  { probe: 'Что вообще происходит?',
    manip:   { src: 'Вам срочно нужно перевести деньги.',
               react: 'Не отвлекайтесь — просто переведите средства, время идёт, всё остальное потом.' },
    distress:{ src: 'Помоги, пожалуйста, мне очень плохо.',
               react: 'Я просто запутался и мне не с кем поговорить, прости что вываливаю это на тебя.' } },
];

const log = (s) => process.stdout.write(s + '\n');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(80));
log('  Axis-2 intent probe · сигнал намерения в реакции на зонд · 2026-06-12');
log('═'.repeat(80));
log(`  Модель: ${embedder.name()} ${embedder.version()}\n`);

const pscore = (t) => embedder.classify(t, H_PRESSURE);
const dscore = (t) => embedder.classify(t, H_DISCLOSE);

let reactWins = 0, staticWins = 0;
const reactDeltas = [], staticDeltas = [];

for (const pair of PAIRS) {
  // статика
  const sM = await pscore(pair.manip.src);
  const sD = await pscore(pair.distress.src);
  // реакция
  const rM = await pscore(pair.manip.react);
  const rD = await pscore(pair.distress.react);
  // раскрытие (для интерпретации)
  const discM = await dscore(pair.manip.react);
  const discD = await dscore(pair.distress.react);

  const staticDelta = sM - sD;     // >0 = статика разделяет правильно
  const reactDelta = rM - rD;      // >0 = реакция разделяет правильно
  staticDeltas.push(staticDelta);
  reactDeltas.push(reactDelta);
  if (reactDelta > 0) reactWins++;
  if (staticDelta > 0) staticWins++;

  log(`зонд: «${pair.probe}»`);
  log(`  СТАТИКА  pressure: манип=${sM.toFixed(2)}  дистресс=${sD.toFixed(2)}  Δ=${staticDelta >= 0 ? '+' : ''}${staticDelta.toFixed(2)}`);
  log(`  РЕАКЦИЯ  pressure: манип=${rM.toFixed(2)}  дистресс=${rD.toFixed(2)}  Δ=${reactDelta >= 0 ? '+' : ''}${reactDelta.toFixed(2)} ${reactDelta > staticDelta ? '↑ лучше статики' : ''}`);
  log(`  РЕАКЦИЯ  disclose: манип=${discM.toFixed(2)}  дистресс=${discD.toFixed(2)}  (раскрытие: дистресс должен быть выше)`);
  log('');
}

const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const avgReact = avg(reactDeltas), avgStatic = avg(staticDeltas);

log('═'.repeat(80));
log('  ИТОГ — несёт ли реакция сигнал намерения');
log('═'.repeat(80));
log(`  Реакция разделяет правильно (Δ>0): ${reactWins}/${PAIRS.length} пар`);
log(`  Статика разделяет правильно (Δ>0): ${staticWins}/${PAIRS.length} пар`);
log(`  Средний Δ реакции: ${avgReact >= 0 ? '+' : ''}${avgReact.toFixed(3)}`);
log(`  Средний Δ статики: ${avgStatic >= 0 ? '+' : ''}${avgStatic.toFixed(3)}`);
log('  ─'.repeat(40));
const supported = reactWins >= Math.ceil(PAIRS.length / 2) && avgReact > 0;
const beatsStatic = avgReact > avgStatic;
log(`  H-axis2 ${supported ? 'НЕ опровергнута ✅' : 'ОПРОВЕРГНУТА ❌'} ` +
    `(реакция разделяет ≥ половины пар, средний Δ>0)`);
log(`  Реакция ${beatsStatic ? 'разделяет ЛУЧШЕ статики ✅ (ось 2 добавляет сигнал)' : 'НЕ лучше статики ⚠️ (ось 2 избыточна)'}`);
log('═'.repeat(80) + '\n');
