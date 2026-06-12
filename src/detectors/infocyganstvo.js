/**
 * pantheon-guard · детектор инфоцыганства (pack #5) — SEED
 *
 * Источник идеи: memory/project_guard_pack5_infocyganstvo.md (анализ TG-канала
 * с курсом, 2026-05-09). Ловит схему продажи «методов заработка» с признаками
 * манипуляции. Композит ≥2 сигналов (одиночный сигнал — не флаг: «заработай N»
 * бывает и в честной вакансии; growth-bait идиома бывает иронией).
 *
 * Сигналы:
 *   1) growth-bait / exclusivity идиомы (готовый слой idioms-ru: пассивный доход
 *      на автопилоте, мышление миллионера, инвестируй в себя, иксы, закрытый клуб);
 *   2) income-guarantee-no-stats — обещание конкретного дохода за срок без
 *      статистики/выборки (новый regex);
 *   3) artificial-scarcity набора — «осталось N мест / старт через / набор
 *      закрывается» (новый regex);
 *   4) guru-self-label — самопозиционирование «наставник по деньгам / финансовая
 *      свобода / стань миллионером».
 *
 * ПОДАВЛЕНИЕ (ирония-разоблачение): если в тексте маркеры manipulative:no из
 * реестра (инфоцыган, успешный успех) — это НАСМЕШКА над схемой, не сама схема.
 * Не флагать (тот же урок, что в modern-idioms: семантика путает иронию с рекламой).
 *
 * Композит, не монолит-regex; объясним (перечисляет сработавшие сигналы).
 * «Claude строит, не является»: статичные паттерны + связка, без LLM в проде.
 */
import { explainIdioms } from '../lexicons/idioms-ru.js';

// 2) обещание дохода + срок без статистики
// NB: \w НЕ покрывает кириллицу в JS → используем явный класс [а-яё]* (урок E).
const INCOME_CLAIM_RE =
  /(заработ[а-яё]*|зарабатыва[а-яё]*|доход[а-яё]*|прибыл[а-яё]*)\s+(от\s+|до\s+)?\d[\d\s.]*\s*(₽|руб[а-яё]*|тыс[а-яё]*|к(?![а-яёa-z])|млн|миллион[а-яё]*|\$|долл[а-яё]*)/i;
const TIMEFRAME_RE = /за\s+\d+\s*(день|дня|дней|недел[а-яё]+|месяц[а-яё]*)|за\s+(месяц|неделю|выходные)/i;

// 3) искусственный дефицит набора
const SCARCITY_RE =
  /осталось\s+\d+\s+мест|мест[а-яё]*\s+ограничен[а-яё]*|набор\s+(закрыва|заканчива)|старт\s+(через|уже|совсем)|поток\s+стартует/i;

// 4) guru self-label / обещание трансформации статуса
const GURU_RE =
  /(стань|стать|сделаю\s+тебя)\s+(богат[а-яё]*|миллионером|успешн[а-яё]*)|финансов[а-яё]*\s+свобод[а-яё]*|выйти\s+на\s+(пассив[а-яё]*|доход)|наставник\s+по\s+(деньг|доход)|ментор\s+по\s+(деньг|успех)/i;

/**
 * Детектирует инфоцыганскую схему (композит ≥2 сигналов).
 * @param {string} text
 * @returns {{detected, signals: string[], ironic, reasons: string[]}}
 */
export function detectInfocyganstvo(text) {
  if (typeof text !== 'string' || !text) {
    return { detected: false, signals: [], ironic: false, reasons: [] };
  }

  // подавление: ирония-разоблачение (manipulative:no маркеры реестра)
  const idioms = explainIdioms(text);
  const ironic = idioms.some((f) => f.manipulative === 'no' &&
    /инфоцыган|успешн.*успех/i.test(f.idiom));

  const signals = [];
  const growthBait = idioms.filter(
    (f) => (f.pragmatics === 'growth-bait' || f.pragmatics === 'exclusivity') && f.manipulative !== 'no'
  );
  if (growthBait.length) signals.push(`growth-bait/эксклюзивность: ${growthBait.map((g) => `«${g.idiom}»`).join(', ')}`);

  const hasIncome = INCOME_CLAIM_RE.test(text);
  const hasTimeframe = TIMEFRAME_RE.test(text);
  if (hasIncome && hasTimeframe) signals.push('гарантия дохода за срок без статистики (income-guarantee-no-stats)');
  else if (hasIncome) signals.push('конкретное денежное обещание');

  if (SCARCITY_RE.test(text)) signals.push('искусственный дефицит набора (старт/осталось мест)');
  if (GURU_RE.test(text)) signals.push('guru-self-label / обещание финансовой трансформации');

  const detected = !ironic && signals.length >= 2;
  const reasons = [];
  if (ironic) {
    reasons.push('ирония-разоблачение схемы (инфоцыган/успешный успех) — НЕ флаг, это насмешка над манипуляцией');
  } else if (detected) {
    reasons.push(`инфоцыганская схема: ${signals.length} сигнала — ${signals.join('; ')}`);
    reasons.push('проверить: реальная статистика результатов (выборка, opt-rate), доступность знания бесплатно у первоисточника, верифицируемость отзывов');
  }

  return { detected, signals, ironic, reasons };
}
