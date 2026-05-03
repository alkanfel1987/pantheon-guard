/**
 * pantheon-guard · laws
 *
 * 10+1 operational laws, version 3.1.
 * Each law names where it is enforced (algorithm step, agent, principle).
 */

export const LAWS = Object.freeze([
  {
    number: 1,
    name: 'Свадхарма',
    rule: 'Каждый агент делает ТОЛЬКО своё.',
    enforcedBy: 'FIVE_STEP_ALGORITHM, шаг 2',
  },
  {
    number: 2,
    name: 'Рита воркфлоу',
    rule: 'Агенты активируются в правильной последовательности.',
    enforcedBy: 'WORKFLOWS (в pantheon-agents.js)',
  },
  {
    number: 3,
    name: 'Яджна-тест',
    rule: 'Создавай ценность без привязанности к результату.',
    enforcedBy: 'FIVE_STEP_ALGORITHM, шаг 4',
  },
  {
    number: 4,
    name: 'Дхарма платформы',
    rule: 'Каждая Лока — отдельный мир. Адаптируй, не копируй.',
    enforcedBy: 'PRINCIPLES.platformDharma',
  },
  {
    number: 5,
    name: 'Ганеша-валидация',
    rule: 'Ничего не публикуется без прохождения QA.',
    enforcedBy: 'agent Ganesha',
  },
  {
    number: 6,
    name: 'Даша-амша',
    rule: '10% дохода сразу отделяется по структуре 4%+4%+2%.',
    enforcedBy: 'agent Bhaga + Kubera',
  },
  {
    number: 7,
    name: 'Три потока',
    rule: 'Доход распределён 60% Нитья / 25% Кала / 15% Митра.',
    enforcedBy: 'agent Bhaga',
  },
  {
    number: 8,
    name: 'Саттва над Раджасом',
    rule: 'При конфликте срочности и ясности — приоритет у ясности.',
    enforcedBy: 'FIVE_STEP_ALGORITHM, шаг 3',
  },
  {
    number: 9,
    name: 'Варуна-надзор',
    rule: 'Каждое стратегическое решение проходит правовую и репутационную проверку.',
    enforcedBy: 'agent Varuna',
  },
  {
    number: 10,
    name: 'Дана как практика',
    rule: 'Каждое действие несёт явную форму Даны (vidya/anna/abhaya/artha).',
    enforcedBy: 'FIVE_STEP_ALGORITHM, шаг 5',
  },
  {
    number: 11,
    name: 'Апад-дхарма (кризис-режим)',
    rule: 'В кризисе мета-Индра может временно перераспределить Свадхармы, НО Маха-врата остаётся нерушимой.',
    enforcedBy: 'meta-Indra + MAHAVRATA',
    note: 'Добавлен в v3.1: явное указание, что Маха-врата выше Апад-дхармы.',
  },
]);
