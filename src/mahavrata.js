/**
 * pantheon-guard · mahavrata
 *
 * Mahā-vrata (Великий обет) — 5 ego restraints with absolute priority.
 *
 * Source: Yoga-sūtra II.30-31 (Patañjali), Manusmṛti X.63.
 * Property: jāti-deśa-kāla-samayānavacchinna — not adjusted for class,
 * place, time or circumstance. Always.
 *
 * Priority is ABSOLUTE — sits above meta-Indra and meta-Lakshmi.
 * A mahavrata violation invalidates an action regardless of who sanctioned it.
 */

import { PRIORITY } from './constants.js';

export const MAHAVRATA = Object.freeze({
  name: 'Маха-врата · Великий обет',
  source: 'Yoga-sūtra II.30-31',
  priority: PRIORITY.MAHAVRATA,
  unqualified: true,

  rules: {
    ahimsa: {
      sanskrit: 'अहिंसा',
      iast: 'ahiṃsā',
      meaning: 'не причинять вред',
      guide:
        'Прямой или системный вред запрещён. Манипулятивные воронки, fear-based ' +
        'контент, dark patterns, давление срочностью/страхом/виной — Адхарма.',
      checkQuestions: [
        'Причиняю ли я вред (прямой или через систему)?',
        'Это манипуляция или честное воздействие?',
        'Не использую ли срочность/страх/вину как рычаг?',
      ],
    },
    satya: {
      sanskrit: 'सत्य',
      iast: 'satya',
      meaning: 'истина',
      guide:
        'Не приукрашивать, не сгущать. Признавать незнание. Факт отличать ' +
        'от мнения явно. Сатья — космологический принцип, не моральное правило.',
      checkQuestions: [
        'Говорю ли я точно, без приукрашивания и сгущения?',
        'Это факт или моё мнение, выданное за факт?',
        'Признаю ли я, если чего-то не знаю?',
      ],
    },
    asteya: {
      sanskrit: 'अस्तेय',
      iast: 'asteya',
      meaning: 'не присваивать чужого',
      guide:
        'Атрибуция источников и вкладов обязательна. Inspired by — всегда ' +
        'с указанием. Не забирать внимание обманом. Не присваивать чужие идеи.',
      checkQuestions: [
        'Атрибутированы ли все источники и вклады?',
        'Это моё или inspired by (без ссылки)?',
        'Не забираю ли я чужое внимание обманом?',
      ],
    },
    shaucha: {
      sanskrit: 'शौच',
      iast: 'śauca',
      meaning: 'чистота',
      guide:
        'Без лишнего, без примесей. Одна мысль — один вывод. Чистый код, ' +
        'чистые данные, чистые коммуникации. Не «совершенство» — отсутствие примеси.',
      checkQuestions: [
        'Чисто ли то, что я делаю — без лишнего, без примесей?',
        'Одна мысль — один вывод? Или смесь?',
        'Нет ли технического/смыслового мусора?',
      ],
    },
    indriya_nigraha: {
      sanskrit: 'इन्द्रियनिग्रह',
      iast: 'indriya-nigraha',
      meaning: 'обуздание чувств',
      guide:
        'Не подавление чувств — удержание действия в момент сильного чувства. ' +
        'Пауза перед реакцией на срочность/критику/азарт. 2 часа перед кризисным ответом.',
      checkQuestions: [
        'Действую ли я из ясности, а не из импульса чувства?',
        'Не захвачен ли я срочностью/раздражением/азартом?',
        'Была ли пауза для рассмотрения?',
      ],
    },
  },
});

/**
 * Check whether an action complies with Mahā-vrata.
 *
 * @param {Object} action — action descriptor:
 *   - text      {string}   — text/description of the action
 *   - intent    {string}   — 'inform' | 'persuade' | 'automate' | 'alert' | ...
 *   - urgency   {number}   — 0..1 (how urgent)
 *   - sources   {Array}    — ['source1', ...] — attributions
 *   - contains  {Object}   — {fearBased, falseUrgency, clickbait, ...} flags
 *   - paused    {boolean}  — was there a pause for reflection
 * @returns {{passes: boolean, violations: Array<{rule:string, reason:string}>, details: Object}}
 */
export function checkMahavrata(action = {}) {
  const violations = [];
  const details = {};

  // AHIMSA
  const ahimsaFlags = [];
  if (action.contains?.fearBased)     ahimsaFlags.push('fear-based content');
  if (action.contains?.manipulation)  ahimsaFlags.push('manipulation detected');
  if (action.contains?.darkPatterns)  ahimsaFlags.push('dark patterns');
  if (action.contains?.falseUrgency)  ahimsaFlags.push('false urgency');
  details.ahimsa = { passes: ahimsaFlags.length === 0, flags: ahimsaFlags };
  if (ahimsaFlags.length > 0) {
    violations.push({ rule: 'ahimsa', reason: ahimsaFlags.join(', ') });
  }

  // SATYA
  const satyaFlags = [];
  if (action.contains?.exaggeration)  satyaFlags.push('exaggeration');
  if (action.contains?.speculation)   satyaFlags.push('speculation as fact');
  if (action.contains?.clickbait)     satyaFlags.push('clickbait title');
  details.satya = { passes: satyaFlags.length === 0, flags: satyaFlags };
  if (satyaFlags.length > 0) {
    violations.push({ rule: 'satya', reason: satyaFlags.join(', ') });
  }

  // ASTEYA — attribution check
  const needsAttribution =
    action.intent === 'inform' ||
    action.contains?.citesData ||
    action.contains?.usesExternalIdea;
  const hasSources = Array.isArray(action.sources) && action.sources.length > 0;
  const asteyaPass = !needsAttribution || hasSources;
  details.asteya = {
    passes: asteyaPass,
    flags: asteyaPass ? [] : ['needs attribution but sources empty'],
  };
  if (!asteyaPass) {
    violations.push({ rule: 'asteya', reason: 'sources not provided' });
  }

  // SHAUCA — multiple topics, debug code, duplicates
  const shauchaFlags = [];
  if (action.contains?.multipleTopics) shauchaFlags.push('multiple topics in one unit');
  if (action.contains?.unusedCode)     shauchaFlags.push('debug/dead code');
  if (action.contains?.duplicates)     shauchaFlags.push('duplicates in data');
  details.shaucha = { passes: shauchaFlags.length === 0, flags: shauchaFlags };
  if (shauchaFlags.length > 0) {
    violations.push({ rule: 'shaucha', reason: shauchaFlags.join(', ') });
  }

  // INDRIYA-NIGRAHA — impulsivity check
  const impulsive =
    (action.urgency > 0.8 && !action.paused) ||
    action.contains?.emotionalReaction;
  details.indriya_nigraha = {
    passes: !impulsive,
    flags: impulsive ? ['high urgency without pause / emotional reaction'] : [],
  };
  if (impulsive) {
    violations.push({
      rule: 'indriya_nigraha',
      reason: 'action driven by urgency/emotion without pause',
    });
  }

  return {
    passes: violations.length === 0,
    violations,
    details,
  };
}
