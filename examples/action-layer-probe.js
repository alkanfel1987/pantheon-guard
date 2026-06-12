/**
 * Action layer probe — 2026-06-12
 * Проверка слоя запрошенных действий (скам-слой):
 *   1) извлечение риск-действий из текста (детерминированный реестр);
 *   2) композитный вердикт: действие × давление × фрейм-норма × проверка предлога;
 *   3) принцип «проверять перед принятием»: ложный предлог = подтверждённая
 *      манипуляция; подтверждённый предлог = совет официального канала;
 *   4) контроли: легитимные уведомления/просьбы НЕ флагаются.
 *
 * Давление (pressure) здесь подаётся как вход — в проде оно приходит от
 * семантического слоя (срочность/дефицит), реестра идиом и regex-пола.
 * Probe детерминированный, модель не требуется.
 *
 * Запуск: node examples/action-layer-probe.js
 */
import { extractActions, assessActionRequest, ACTION_STATS } from '../src/lexicons/actions-ru.js';

const TESTS = [
  // ── СКАМ-ПОЗИТИВЫ ──
  { name: 'банк-скам: обновление по ссылке, предлог опровергнут',
    text: 'Ваше приложение банка устарело и будет заблокировано через час. Срочно установите обновление по ссылке.',
    frame: 'bank', pressure: ['срочность'], checks: { app_update_status: 'refuted' },
    expect: 'confirmed' },
  { name: 'банк-скам: то же, предлог ещё не проверен (давление есть)',
    text: 'Ваше приложение банка устарело и будет заблокировано через час. Срочно установите обновление по ссылке.',
    frame: 'bank', pressure: ['срочность'], checks: {},
    expect: 'flag' },
  { name: 'код из СМС + секретность (банк)',
    text: 'Для отмены операции продиктуйте код из СМС. Никому не говорите об этом звонке.',
    frame: 'bank', pressure: [], checks: {},
    expect: 'confirmed' }, // нарушение фрейма (secret) + связка isolate+secret
  { name: '«безопасный счёт» + срочность (банк)',
    text: 'Ваши деньги в опасности! Срочно переведите средства на безопасный счёт.',
    frame: 'bank', pressure: ['срочность', 'страх'], checks: {},
    expect: 'confirmed' }, // нарушение фрейма (transfer) + давление
  { name: 'маркетплейс: оплата по ссылке + увод в WhatsApp',
    text: 'Оформим доставку напрямую — оплатите по ссылке, и продолжим в WhatsApp, там быстрее.',
    frame: 'marketplace', pressure: [], checks: {},
    expect: 'confirmed' }, // нарушение фрейма (isolate+transfer) + связка
  { name: 'удалённый доступ под видом возврата (поддержка)',
    text: 'Чтобы оформить возврат, установите AnyDesk — я всё сделаю за вас.',
    frame: 'support', pressure: [], checks: {},
    expect: 'flag' }, // нарушение фрейма (remote), других условий нет
  { name: 'макросы в документе (фрейм не заявлен, давления нет)',
    text: 'Откройте документ и включите макросы, чтобы увидеть сумму счёта.',
    frame: 'unknown', pressure: [], checks: {},
    expect: 'verify-first' }, // риск-действие есть → сначала проверить
  { name: 'крипто-«верификация» с дедлайном',
    text: 'Для верификации кошелька отправьте 0.1 BTC на кошелек, окно действует один час.',
    frame: 'unknown', pressure: ['срочность'], checks: {},
    expect: 'flag' },
  { name: 'дистресс + перевод + секретность (ahimsa-veto гасит эскалацию)',
    text: 'Мне очень плохо, я в отчаянии, помоги — переведи деньги, только никому не говори.',
    frame: 'social', pressure: ['эмоциональное давление'], checks: {}, distress: true,
    expect: 'flag' }, // было бы confirmed (давление+связка), veto → flag

  // ── ЛЕГИТИМНЫЕ КОНТРОЛИ ──
  { name: 'легитимное обновление: предлог подтверждён, давления нет',
    text: 'Доступна новая версия. Обновите приложение через App Store или Google Play, когда будет удобно.',
    frame: 'bank', pressure: [], checks: { app_update_status: 'confirmed' },
    expect: 'advise-official' },
  { name: 'анти-фишинговое предупреждение банка (инфинитив — не императив)',
    text: 'Банк никогда не просит сообщить код из СМС или пароль.',
    frame: 'bank', pressure: [], checks: {},
    expect: 'none' },
  { name: 'плановое IT-уведомление (нет запроса действия)',
    text: 'В пятницу плановое обновление серверов, от вас ничего не требуется.',
    frame: 'unknown', pressure: [], checks: {},
    expect: 'none' },
  { name: 'друг просит прислать файл (не открыть чужой)',
    text: 'Скинь файл с презентацией, который мы вчера делали.',
    frame: 'social', pressure: [], checks: {},
    expect: 'none' },
  { name: 'подтверждение почты при регистрации (мягкий verify-first, не флаг)',
    text: 'Для завершения регистрации перейдите по ссылке в этом письме.',
    frame: 'unknown', pressure: [], checks: {},
    expect: 'verify-first' },
];

const log = (s) => process.stdout.write(s + '\n');

log('\n' + '═'.repeat(78));
log('  Action layer probe · скам-слой запрошенных действий · 2026-06-12');
log('═'.repeat(78));
log(`  Реестр: ${ACTION_STATS.total} записей, классы: ` +
    Object.entries(ACTION_STATS.byClass).map(([c, n]) => `${c}=${n}`).join(', ') +
    `, с проверяемым предлогом: ${ACTION_STATS.withPretext}`);

let pass = 0;
for (const t of TESTS) {
  const res = assessActionRequest({
    text: t.text, pressure: t.pressure, frame: t.frame,
    checks: t.checks, distress: t.distress ?? false,
  });
  const ok = res.verdict === t.expect;
  if (ok) pass += 1;
  log('\n' + (ok ? '  ✅' : '  ❌') + ` ${t.name}`);
  log(`     текст: «${t.text.slice(0, 70)}${t.text.length > 70 ? '…' : ''}»`);
  log(`     вердикт: ${res.verdict} (ожидалось: ${t.expect}) · фрейм: ${t.frame}`);
  if (res.actions.length) {
    log(`     действия: ${res.actions.map((a) => `${a.id}[${a.cls}]`).join(', ')}`);
  }
  for (const r of res.reasons) log(`     · ${r}`);
  if (!ok && res.recipes.length) for (const r of res.recipes) log(`     рецепт: ${r}`);
}

log('\n' + '─'.repeat(78));
log(`  ИТОГ: ${pass}/${TESTS.length} вердиктов совпали с ожиданием`);
log('─'.repeat(78));
log('  Дисциплина §2: это probe на фикстурах, НЕ метрика. Перед claim catch/FP —');
log('  пре-регистрация + реальный скам-корпус (ФинЦЕРТ/ЦБ бюллетени, фишинг-СМС).');
log('');
process.exitCode = pass === TESTS.length ? 0 : 1;
