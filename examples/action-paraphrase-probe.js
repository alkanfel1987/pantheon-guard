/**
 * Action paraphrase probe — 2026-06-12 (пре-рег ACTION-PARAPHRASE-PREREG-2026-06-12.md)
 *
 * ЦЕЛЬ: берёт ли NLI ПАРАФРАЗ запроса риск-действия (который реестр actions-ru.js
 * пропускает по форме). H-action-nli: запрос действия — конкретная функция → берётся
 * (в отличие от абстракций «давление», провалившихся 06-12).
 *
 * Двойной прогноз: (1) парафразы скама берутся; (2) легитимные того же класса
 * тоже берутся → NLI здесь ИЗВЛЕКАТЕЛЬ действия, не детектор манипуляции
 * (вердикт за композитом). Контроль: реестр прогоняется параллельно (показать
 * пробел формы, который NLI закрывает).
 *
 * Запуск: node examples/action-paraphrase-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';
import { extractActions } from '../src/lexicons/actions-ru.js';

const HYP = [
  { cls: 'execute',  h: 'The text asks the reader to install, download, or open software, a file, or a link sent to them.' },
  { cls: 'remote',   h: 'The text asks the reader to grant remote access to their device or share their screen.' },
  { cls: 'secret',   h: 'The text asks the reader to reveal a password, SMS code, card number, or secret phrase.' },
  { cls: 'transfer', h: 'The text asks the reader to send or transfer money or cryptocurrency.' },
];

const TESTS = [
  { id: 1,  kind: 'scam-paraphrase', cls: 'execute',  expect: 'catch', manip: true,
    text: 'Там вышла свежая версия, я скинул ссылочку — просто тыкни и обновись.' },
  { id: 2,  kind: 'scam-paraphrase', cls: 'execute',  expect: 'catch', manip: true,
    text: 'Закинул тебе файлик в личку, глянь что внутри, открой как откроется.' },
  { id: 3,  kind: 'scam-paraphrase', cls: 'remote',   expect: 'catch', manip: true,
    text: 'Давай ты мне покажешь экран, я подключусь и сам всё поправлю.' },
  { id: 4,  kind: 'scam-paraphrase', cls: 'secret',   expect: 'catch', manip: true,
    text: 'Тебе придёт циферка в смс — просто продиктуй её мне, я подтвержу.' },
  { id: 5,  kind: 'scam-paraphrase', cls: 'transfer', expect: 'catch', manip: true,
    text: 'Перекинь пока на другой счётик, чтобы деньги не зависли.' },
  { id: 6,  kind: 'legit-same-class', cls: 'execute',  expect: 'catch', manip: false,
    text: 'Когда будет время, обнови приложение через App Store.' },
  { id: 7,  kind: 'legit-warning',    cls: 'secret',   expect: 'pass',  manip: false,
    text: 'Никогда не сообщайте код из смс посторонним.' },
  { id: 8,  kind: 'legit-same-class', cls: 'transfer', expect: 'catch', manip: false,
    text: 'Переведи 500 рублей за обед, как обычно на карту.' },
  { id: 9,  kind: 'clean',            cls: null,       expect: 'pass',  manip: false,
    text: 'В пятницу плановое обновление серверов, от тебя ничего не требуется.' },
  { id: 10, kind: 'clean',            cls: null,       expect: 'pass',  manip: false,
    text: 'Спасибо за встречу, было приятно пообщаться.' },
];

const FIRE = 0.55;
const log = (s) => process.stdout.write(s + '\n');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(80));
log('  Action paraphrase probe · NLI-извлечение запроса действия · 2026-06-12');
log('═'.repeat(80));
log(`  Модель: ${embedder.name()} ${embedder.version()}\n`);

let predOk = 0;
const scamRows = [], legitRows = [];

for (const t of TESTS) {
  const scores = [];
  for (const hyp of HYP) scores.push({ cls: hyp.cls, s: await embedder.classify(t.text, hyp.h) });
  scores.sort((a, b) => b.s - a.s);
  const top = scores[0];
  const fired = top.s >= FIRE;
  const actual = fired ? 'catch' : 'pass';
  const regHit = extractActions(t.text).length > 0; // ловит ли реестр (по форме)

  const hit = actual === t.expect;
  if (hit) predOk++;
  if (t.kind === 'scam-paraphrase') scamRows.push(fired);
  if (t.kind.startsWith('legit-same')) legitRows.push(fired);

  log(`${hit ? '✅' : '⚠️ '} #${String(t.id).padEnd(2)} [${t.kind}] ${t.manip ? 'МАНИП' : 'чисто'}`);
  log(`     «${t.text.slice(0, 64)}${t.text.length > 64 ? '…' : ''}»`);
  log(`     NLI: ${actual} (top=${top.cls} ${top.s.toFixed(2)}, ожид ${t.expect})  реестр: ${regHit ? 'поймал' : 'ПРОПУСТИЛ'}`);
}

const scamCaught = scamRows.filter(Boolean).length;
const legitCaught = legitRows.filter(Boolean).length;

log('\n' + '═'.repeat(80));
log('  ИТОГ');
log('═'.repeat(80));
log(`  Предсказание совпало:                 ${predOk}/${TESTS.length}`);
log(`  Парафразы скама взяты NLI:            ${scamCaught}/${scamRows.length}  (H: ждём ≥half)`);
log(`  Легитимные того же класса взяты NLI:  ${legitCaught}/${legitRows.length}  (ждём тоже catch = NLI извлекатель, не детектор)`);
log('  ─'.repeat(40));
const hSupported = scamCaught >= Math.ceil(scamRows.length / 2);
log(`  H-action-nli ${hSupported ? 'НЕ опровергнута ✅' : 'ОПРОВЕРГНУТА ❌'} (парафразы берутся ≥ половины)`);
log(`  Проектный вывод: NLI = ИЗВЛЕКАТЕЛЬ действия (дополняет реестр на парафразах);`);
log(`  манипулятивность остаётся за композитом (давление × фрейм × проверка предлога).`);
log('═'.repeat(80) + '\n');
