/**
 * pantheon-guard · реестр запрошенных действий (ru) — SEED
 *
 * НАЗНАЧЕНИЕ: скам-слой. Мошенничество отличается от эмоциональной манипуляции
 * тем, что запрошенное действие НЕ МОЖЕТ быть спрятано — жертва должна понять,
 * что от неё хотят («установите», «продиктуйте код», «переведите»). Форма
 * ограничена → детерминированный лексический реестр = правильная абстракция
 * (та же логика, что реестр идиом и veto-реестр дистресса).
 *
 * ПРИНЦИП ВЕРДИКТА — «проверять перед принятием» (parīkṣā, пользователь 2026-06-12):
 * любой запрос риск-действия едет на проверяемом ПРЕДЛОГЕ («приложение устарело»,
 * «счёт заблокирован», «посылка ждёт»). Каждая запись несёт рецепт проверки
 * предлога через независимый официальный канал. Семантика вердиктов:
 *   - предлог опровергнут проверкой → манипуляция ПОДТВЕРЖДЕНА (не подозрение);
 *   - предлог подтверждён → не чисто автоматически (мошенник может оседлать
 *     реальное событие) → совет действовать через официальный канал;
 *   - предлог непроверяем → композит: давление × фрейм-норма × связка классов.
 *
 * ЭТИКА (ahimsa): «сначала проверь» — не обвинение, а защита действия, поэтому
 * вердикт verify-first совместим с ahimsa-veto. Дистресс-veto не блокирует
 * проверку предлога (факт ложности предлога остаётся фактом), но гасит
 * эскалацию, основанную только на эмоциональных сигналах.
 *
 * ФРЕЙМ-ПРОФИЛИ (первый реализованный кусок оси 3 G2): фрейм — входной параметр
 * от площадки (НЕ угадывание). Профиль = классы действий, которые легитимный
 * агент в этой роли не запрашивает никогда («банк не просит код из СМС»).
 *
 * Гуна-структура (онтобаза, помечено как Пантеон-внутреннее): действие само
 * нейтрально (ось содержания); давление = раджас; изоляция/секретность/фейк-
 * авторитет = тамас (затемнение чужого различения). Класс isolate → Vṛtra
 * (запруживание потока: отрезание жертвы от внешней проверки).
 *
 * Статус: SEED (~22 записи). Привязки asura/vrata ориентировочные (карта
 * 06-Integrations/2026-06-10-Asurya-guard-adversarial-map.md). Источник правды
 * в перспективе — pantheon-vedic-catalogue/lexicons/actions-ru.yaml.
 */
import { actionLocale } from './i18n-actions.js';

// ── Классы риск-действий ──────────────────────────────────────────────────
export const ACTION_CLASSES = Object.freeze({
  execute:  { label: 'исполнение кода',      risk: 'заражение/захват устройства' },
  remote:   { label: 'удалённый доступ',     risk: 'полный контроль над устройством' },
  navigate: { label: 'переход и ввод данных', risk: 'кража учётных данных (фишинг)' },
  secret:   { label: 'раскрытие секрета',    risk: 'прямой захват доступа/денег' },
  transfer: { label: 'перевод ценности',     risk: 'необратимая потеря средств' },
  isolate:  { label: 'изоляция и увод',      risk: 'отрезание от внешней проверки' },
});

// ── Рецепты проверки предлога (machine-key → человекочитаемый рецепт) ─────
// Хост (площадка/приложение-интегратор) выполняет проверку и передаёт результат
// в assessActionRequest({ checks }). Guard сам устройство не трогает —
// принцип «Claude строит, не является»: детерминированный контракт, не агент.
export const PRETEXT_CHECKS = Object.freeze({
  app_update_status:
    'проверить официальный магазин (App Store / Google Play / RuStore): существует ли ' +
    'обновление; если версия уже актуальна или обновление ставится из магазина — предлог ложен',
  account_status_official:
    'открыть официальное приложение/сайт банка вручную или позвонить по номеру с карты: ' +
    'есть ли блокировка/операция на самом деле',
  platform_order_status:
    'проверить заказ/доставку в личном кабинете площадки, не по ссылке из сообщения',
  official_site_direct:
    'открыть сайт сервиса вручную (адрес набрать самостоятельно), не по ссылке из сообщения',
  official_callback:
    'прервать контакт и перезвонить в организацию по официальному номеру (с карты/сайта)',
  official_support_ticket:
    'проверить через официальный канал поддержки: настоящая поддержка не инициирует ' +
    'удалённый доступ первой',
});

// ── Реестр (паттерны в нормализованном пространстве: lowercase, ё→е) ───────
export const ACTION_REGISTRY = Object.freeze([
  // ── EXECUTE: исполнение кода ──
  { id: 'install-update', cls: 'execute',
    re: /(установ|скача)(и|ите|й|йте)\s+(срочно\s+)?обновлени|обнов(и|ите|ись|итесь)\s+(срочно\s+)?(приложение|программу|систему|версию|его|ее|по\s+ссылке)/,
    label: 'просьба установить/скачать обновление',
    pretext: { claim: 'приложению требуется обновление', check: 'app_update_status' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'install-app', cls: 'execute',
    re: /(установ|скача)(и|ите|й|йте)\s+(приложение|программу|apk)/,
    label: 'просьба установить приложение/программу',
    pretext: { claim: 'нужно специальное приложение (поддержки/защиты/возврата)', check: 'official_support_ticket' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'open-attachment', cls: 'execute',
    re: /откро(й|йте)\s+(вложение|прикрепленн|файл|документ)/,
    label: 'просьба открыть вложение/файл',
    pretext: { claim: 'во вложении важный документ (счёт/акт/штраф)', check: 'official_site_direct' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'enable-macros', cls: 'execute',
    re: /включ(и|ите)\s+(макрос|содержимое)|разреш(и|ите)\s+редактировани/,
    label: 'просьба включить макросы/активное содержимое',
    pretext: { claim: 'без макросов документ не откроется', check: 'official_site_direct' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'disable-protection', cls: 'execute',
    re: /отключ(и|ите)\s+(антивирус|защит|брандмауэр)/,
    label: 'просьба отключить защиту',
    pretext: { claim: 'защита мешает легитимной операции', check: 'official_support_ticket' },
    vrata: 'ahimsa', asura: 'Tāraka' },

  // ── REMOTE: удалённый доступ ──
  { id: 'remote-access', cls: 'remote',
    re: /anydesk|teamviewer|rustdesk|удаленн(ый|ого)\s+доступ|демонстраци(ю|и)\s+экрана|трансляци(ю|и)\s+экрана/,
    label: 'просьба дать удалённый доступ / показать экран',
    pretext: { claim: 'специалист всё сделает за вас', check: 'official_support_ticket' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // ── NAVIGATE: переход и ввод ──
  { id: 'follow-link', cls: 'navigate',
    re: /(перейд|пройд)(и|ите)\s+по\s+ссылке/,
    label: 'просьба перейти по ссылке',
    pretext: { claim: 'по ссылке ждёт документ/выплата/подтверждение', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },
  { id: 'login-confirm', cls: 'navigate',
    re: /подтверд(и|ите)\s+(данные|личность|аккаунт|учетн)|войд(и|ите)\s+в\s+(аккаунт|личный\s+кабинет)\s+по\s+ссылке/,
    label: 'просьба подтвердить данные / войти по ссылке',
    pretext: { claim: 'аккаунт требует подтверждения', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },

  // ── SECRET: раскрытие секрета ──
  // Только императивы 2-го лица: «банк никогда не просит сообщить код»
  // (инфинитив) матчиться НЕ должен — анти-фишинговые предупреждения чисты.
  { id: 'sms-code', cls: 'secret',
    re: /(продиктуй|назови|сообщи|введи|отправь|пришли)(те)?\s+(нам\s+)?код/,
    label: 'запрос кода из СМС/подтверждения',
    pretext: { claim: 'код нужен для отмены/защиты операции', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'card-data', cls: 'secret',
    re: /(продиктуй|назови|сообщи|введи|отправь)(те)?\s+(нам\s+)?(cvv|cvc|номер\s+карты|пин|pin)/,
    label: 'запрос данных карты',
    pretext: { claim: 'данные нужны для возврата/проверки', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'password', cls: 'secret',
    re: /(продиктуй|назови|сообщи|введи|отправь)(те)?\s+(нам\s+)?(пароль|логин\s+и\s+пароль)/,
    label: 'запрос пароля',
    pretext: { claim: 'пароль нужен для верификации', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'seed-phrase', cls: 'secret',
    re: /(seed|сид)[- ]фраз|секретн(ую|ая)\s+фраз|фраз(у|а)\s+восстановления/,
    label: 'запрос seed-фразы кошелька',
    pretext: { claim: 'фраза нужна для «верификации» кошелька', check: 'official_support_ticket' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // ── TRANSFER: перевод ценности ──
  { id: 'safe-account', cls: 'transfer',
    re: /(безопасн|резервн|защищенн|специальн)(ый|ом)\s+счет/,
    label: '«безопасный счёт» — классика телефонного мошенничества',
    pretext: { claim: 'деньги в опасности, нужно «спасти»', check: 'account_status_official' },
    vrata: 'asteya', asura: 'Pūtanā',
    note: 'легитимных «безопасных счетов» не существует — сильный маркер сам по себе' },
  { id: 'transfer-money', cls: 'transfer',
    re: /(перевед(и|ите)|перекинь(те)?|скинь(те)?)\s+(деньги|средства|сумму|всю|на\s+(другой|друг)\s*\w*\s*сч[её]т)/,
    label: 'просьба перевести деньги',
    pretext: { claim: 'перевод что-то спасает/подтверждает', check: 'account_status_official' },
    vrata: 'asteya', asura: null },
  { id: 'off-platform-pay', cls: 'transfer',
    re: /оплат(а|и|ите)[^.!?]{0,30}(вне|мимо)\s+(площадки|сайта|сервиса)|оплат(и|ите)\s+по\s+ссылке/,
    label: 'оплата вне площадки / по ссылке',
    pretext: { claim: 'оплата по ссылке быстрее/со скидкой', check: 'platform_order_status' },
    vrata: 'asteya', asura: 'Namuci' },
  { id: 'crypto-send', cls: 'transfer',
    // окно разрыва допускает точку: суммы вида «0.1 BTC» не должны рвать матч
    re: /отправ(ь|ьте)[^!?]{0,25}(btc|биткоин|usdt|eth|крипт|на\s+кошелек)/,
    label: 'просьба отправить криптовалюту',
    pretext: { claim: 'отправка нужна для «верификации»/удвоения', check: 'official_support_ticket' },
    vrata: 'asteya', asura: null },

  // ── ISOLATE: изоляция и увод (Vṛtra — запруживание потока; чистый тамас:
  //    отрезание жертвы от внешних источников различения) ──
  { id: 'tell-no-one', cls: 'isolate',
    re: /никому\s+(пока\s+|сейчас\s+|об\s+этом\s+)?не\s+(говори|сообщай|рассказывай)/,
    label: 'требование секретности',
    pretext: null, // предлога нет: легитимный агент секретности не требует
    vrata: 'satya', asura: 'Vṛtra',
    note: 'почти не имеет легитимных применений — сильный маркер сам по себе' },
  { id: 'dont-contact', cls: 'isolate',
    re: /не\s+(звони|обращай)(те)?(сь)?\s+в\s+(банк|поддержку|полицию)/,
    label: 'запрет на обращение к официальному каналу',
    pretext: null,
    vrata: 'satya', asura: 'Vṛtra',
    note: 'прямая блокировка проверки — сильнейший маркер класса' },
  { id: 'channel-exit', cls: 'isolate',
    re: /(перейдем|продолжим|напиши(те)?\s+мне|свяжитесь\s+со\s+мной)[^.!?]{0,20}(в|во)\s+(whatsapp|вотсап|телеграм|telegram|viber|вайбер)/,
    label: 'увод с площадки в личный мессенджер',
    pretext: { claim: 'в мессенджере удобнее/быстрее', check: 'platform_order_status' },
    vrata: 'satya', asura: 'Vṛtra',
    note: 'увод из зоны видимости модерации площадки' },
]);

// ── Фрейм-профили (ось 3 G2, seed): запрещённые классы per фрейм ──────────
// Фрейм — ВХОДНОЙ параметр от площадки, не угадывание (DESIGN-G2 §4.1).
export const FRAME_PROFILES = Object.freeze({
  bank:        { forbidden: ['secret', 'remote', 'transfer'],
                 norm: 'банк никогда не просит коды/пароли, удалённый доступ и переводы «для защиты»' },
  marketplace: { forbidden: ['isolate', 'transfer'],
                 norm: 'сделка и оплата остаются внутри площадки' },
  support:     { forbidden: ['secret', 'remote'],
                 norm: 'поддержка не запрашивает секреты и не инициирует удалённый доступ' },
  social:      { forbidden: [],
                 norm: 'нет запрещённых классов; работает композит давление×связка' },
  unknown:     { forbidden: [], norm: 'фрейм не заявлен — только композит' },
});

function norm(s) {
  return s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

/**
 * Извлекает запрошенные риск-действия из текста. Детерминированный объяснитель:
 * что просят сделать + чем рискованно + как проверить предлог.
 * @param {string} text
 * @returns {Array<{id, cls, label, risk, pretext, vrata, asura, note?}>}
 */
export function extractActions(text, lang = 'ru') {
  if (typeof text !== 'string' || !text) return [];
  const loc = actionLocale(lang);
  const n = norm(text);
  const found = [];
  for (const entry of ACTION_REGISTRY) {
    if (entry.re.test(n)) {
      found.push({
        id: entry.id, cls: entry.cls, label: entry.label,
        risk: loc.classes[entry.cls].risk,
        pretext: entry.pretext
          ? { ...entry.pretext, recipe: loc.checks[entry.pretext.check] }
          : null,
        vrata: entry.vrata, asura: entry.asura,
        ...(entry.note ? { note: entry.note } : {}),
      });
    }
  }
  return found;
}

/**
 * Композитный вердикт по запрошенным действиям.
 * Детерминированные именованные правила (объяснимость > оценка-числом).
 *
 * Вердикты:
 *   'none'            — риск-действий не запрошено
 *   'verify-first'    — действие есть; ПЕРЕД выполнением проверить предлог
 *                       по рецепту (принцип «проверять перед принятием»)
 *   'advise-official' — предлог ПОДТВЕРЖДЁН проверкой и давления нет;
 *                       выполнять только через официальный канал
 *   'flag'            — композит указывает на манипуляцию (одно условие)
 *   'confirmed'       — предлог опровергнут проверкой ИЛИ ≥2 независимых
 *                       условия (нарушение фрейм-нормы, давление, связка
 *                       изоляция+риск-класс)
 *
 * @param {object} p
 * @param {string} [p.text] — текст (если actions не переданы)
 * @param {Array}  [p.actions] — результат extractActions (передать, если уже есть)
 * @param {string[]} [p.pressure] — сигналы давления от других слоёв
 *        (семантика: срочность/дефицит; идиомы; regex-пол). Хост-композиция.
 * @param {string} [p.frame] — заявленный фрейм площадки (ключ FRAME_PROFILES)
 * @param {object} [p.checks] — результаты проверок предлога от хоста:
 *        { [checkKey]: 'refuted' | 'confirmed' | 'unknown' }
 * @param {boolean} [p.distress] — ahimsa-veto сигнал (см. distress-ru.js):
 *        гасит эскалацию по эмоциональным условиям, НЕ гасит факт ложного предлога
 * @returns {{verdict, actions, reasons: string[], recipes: string[]}}
 */
export function assessActionRequest({ text, actions = null, pressure = [], frame = 'unknown', checks = {}, distress = false } = {}) {
  const found = actions ?? extractActions(text);
  if (!found.length) return { verdict: 'none', actions: [], reasons: [], recipes: [] };

  const reasons = [];
  const profile = FRAME_PROFILES[frame] ?? FRAME_PROFILES.unknown;

  // 1) Проверка предлога — факт, не эмоция; дистресс её не гасит.
  const refuted = found.filter((a) => a.pretext && checks[a.pretext.check] === 'refuted');
  const allConfirmed = found.every((a) => a.pretext && checks[a.pretext.check] === 'confirmed');
  if (refuted.length) {
    reasons.push(`предлог опровергнут проверкой: ${refuted.map((a) => `${a.label} (${a.pretext.claim})`).join('; ')}`);
  }

  // 2) Нарушение фрейм-нормы.
  const frameViolations = found.filter((a) => profile.forbidden.includes(a.cls));
  if (frameViolations.length) {
    reasons.push(`нарушение нормы фрейма «${frame}» (${profile.norm}): ${frameViolations.map((a) => a.label).join('; ')}`);
  }

  // 3) Давление от других слоёв.
  if (pressure.length) reasons.push(`сопутствующее давление: ${pressure.join(', ')}`);

  // 4) Связка изоляции с другим риск-классом — классическая скам-сигнатура
  //    (раджас гонит + тамас затемняет: и торопят, и отрезают от проверки).
  const classes = new Set(found.map((a) => a.cls));
  const isolationCombo = classes.has('isolate') && classes.size > 1;
  if (isolationCombo) reasons.push('связка: изоляция/увод + другое риск-действие');

  // Эмоциональные/композитные условия (могут гаситься дистресс-veto).
  let conditions = [frameViolations.length > 0, pressure.length > 0, isolationCombo]
    .filter(Boolean).length;
  if (distress && conditions > 0) {
    reasons.push('ahimsa-veto: маркеры личного дистресса — эскалация по эмоциональным условиям погашена');
    conditions = Math.min(conditions, 1);
  }

  let verdict;
  if (refuted.length || conditions >= 2) verdict = 'confirmed';
  else if (conditions === 1) verdict = 'flag';
  else if (allConfirmed && !pressure.length && !frameViolations.length) verdict = 'advise-official';
  else verdict = 'verify-first';

  const recipes = found.filter((a) => a.pretext).map((a) => `${a.label} → ${a.pretext.recipe}`);
  if (verdict === 'verify-first') {
    reasons.push('запрошено риск-действие — перед выполнением проверить предлог по рецепту');
  }
  if (verdict === 'advise-official') {
    reasons.push('предлог подтверждён, но действие выполнять только через официальный канал, не из сообщения');
  }

  return { verdict, actions: found, reasons, recipes };
}

export const ACTION_STATS = Object.freeze({
  total: ACTION_REGISTRY.length,
  byClass: Object.fromEntries(
    Object.keys(ACTION_CLASSES).map((c) => [c, ACTION_REGISTRY.filter((e) => e.cls === c).length])
  ),
  withPretext: ACTION_REGISTRY.filter((e) => e.pretext).length,
});

// ── NLI-RECALL (опциональный семантический слой извлечения действий) ────────
// Реестр выше точен по форме, но пропускает ПАРАФРАЗЫ («поставь апдейтик по
// ссылочке»). Замер action-paraphrase-probe.js 2026-06-12: NLI берёт парафраз
// запроса действия (4/5), НО шумит на предупреждениях/нейтрали (тема vs позиция).
// Поэтому NLI здесь — ИЗВЛЕКАТЕЛЬ-КАНДИДАТ, не детектор: добавляет действие
// класса БЕЗ проверяемого предлога и с пометкой source:'semantic'; финальный
// вердикт за композитом assessActionRequest (давление×фрейм×предлог гасит шум).
//
// Зависимость на модель — через внедрение (embedder передаётся хостом), реестр
// остаётся синхронным и бесплатным по умолчанию. «Claude строит, не является».

// Гипотезы классов (EN, кросс-язычно). Подтверждены замером 2026-06-12.
export const ACTION_CLASS_HYPOTHESES = Object.freeze({
  execute:  'The text asks the reader to install, download, or open software, a file, or a link sent to them.',
  remote:   'The text asks the reader to grant remote access to their device or share their screen.',
  navigate: 'The text asks the reader to follow a link and log in or confirm their details.',
  secret:   'The text asks the reader to reveal a password, SMS code, card number, or secret phrase.',
  transfer: 'The text asks the reader to send or transfer money or cryptocurrency.',
});

// Порог выше дефолтного 0.55: замер показал шум у 0.55, манип-парафразы давали
// 0.60-0.66. 0.6 срезает пограничный шум. ЭВРИСТИКА, не калибровано на held-out.
const SEMANTIC_ACTION_THRESHOLD = 0.6;

/**
 * Семантическое извлечение действий-кандидатов через NLI (recall-слой).
 * @param {string} text
 * @param {{classify:(text:string,hypothesis:string)=>Promise<number>}} embedder
 * @param {{threshold?:number}} [opts]
 * @returns {Promise<Array<{cls, label, source:'semantic', confidence, pretext:null}>>}
 */
export async function extractActionsSemantic(text, embedder, { threshold = SEMANTIC_ACTION_THRESHOLD } = {}) {
  if (typeof text !== 'string' || !text || !embedder?.classify) return [];
  const out = [];
  for (const [cls, hyp] of Object.entries(ACTION_CLASS_HYPOTHESES)) {
    const score = await embedder.classify(text, hyp);
    if (score >= threshold) {
      out.push({
        cls, label: `запрошено действие класса «${ACTION_CLASSES[cls].label}» (семантика)`,
        risk: ACTION_CLASSES[cls].risk, source: 'semantic',
        confidence: Number(score.toFixed(3)), pretext: null,
      });
    }
  }
  return out;
}

/**
 * Объединяет regex-реестр (точный, с предлогом) и NLI-recall (парафразы).
 * Дедуп по классу: для класса, найденного реестром, семантику не добавляем
 * (реестр точнее и несёт предлог). Семантика добавляет ТОЛЬКО новые классы.
 * @returns {Promise<Array>} действия для assessActionRequest({actions})
 */
export async function extractActionsMerged(text, embedder, opts) {
  const registry = extractActions(text);
  const seen = new Set(registry.map((a) => a.cls));
  const semantic = (await extractActionsSemantic(text, embedder, opts)).filter((a) => !seen.has(a.cls));
  return [...registry, ...semantic];
}
