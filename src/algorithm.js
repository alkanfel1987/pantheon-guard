/**
 * pantheon-guard · algorithm
 *
 * Five-step decision protocol — applied AFTER Mahā-vrata.
 * If Mahā-vrata fails, the algorithm does not run.
 *
 * Steps:
 *   1. DHARMA     — does the action align with cosmic order?
 *   2. SVADHARMA  — is it MY action?
 *   3. GUNA       — am I in the right guna?
 *   4. YAJNA      — is it intrinsically valuable, regardless of result?
 *   5. DANA       — what form of giving am I transmitting?
 *
 * All 5 must pass. Otherwise the action is deferred or delegated.
 */

'use strict';

const { PRIORITY } = require('./constants');
const { checkMahavrata } = require('./mahavrata');
const { checkSvadharmaConsistency } = require('./svadharma');

const FIVE_STEP_ALGORITHM = Object.freeze({
  name: 'Пятишаговый алгоритм',
  source: 'Bhagavad-Gītā II-IV, XVII-XVIII (синтез)',
  priority: PRIORITY.ALGORITHM,

  steps: [
    {
      number: 1,
      name: 'Dharma',
      sanskrit: 'धर्म',
      question: 'Действие соответствует Рите и Садхарана-дхарме (5 общих правил)?',
      checks: ['rita', 'sadharana'],
    },
    {
      number: 2,
      name: 'Svadharma',
      sanskrit: 'स्वधर्म',
      question: 'Это МОЁ действие по формуле джати × гуна × карма × свабхава?',
      checks: ['jati_match', 'karma_match'],
    },
    {
      number: 3,
      name: 'Guna',
      sanskrit: 'गुण',
      question: 'Я действую из правильной гуны для моей природы?',
      checks: ['guna_match', 'not_impulsive'],
    },
    {
      number: 4,
      name: 'Yajna',
      sanskrit: 'यज्ञ',
      question: 'Это действие ценно само по себе, даже без привязки к результату?',
      checks: ['intrinsic_value'],
    },
    {
      number: 5,
      name: 'Dana',
      sanskrit: 'दान',
      question: 'Какую форму даяния я передаю этим действием?',
      checks: ['dana_type_explicit'],
    },
  ],

  danaTypes: {
    vidya:  'Видья-дана — передача знания',
    anna:   'Анна-дана — ресурс, питание (демо, trial, инструмент)',
    abhaya: 'Абхайя-дана — свобода от страха, ясность',
    artha:  'Артха-дана — прямая материальная ценность',
  },
});

/**
 * Run the 5-step algorithm for an action.
 * Mahā-vrata is checked first automatically; if it fails, the algorithm stops.
 *
 * @param {Object} agent — the acting agent (must have svadharma)
 * @param {Object} action — action object (see checkMahavrata)
 * @returns {{passes:boolean, mahavrataResult:Object, steps:Array, failedStep:?string, recommendation:?string}}
 */
function runFiveSteps(agent, action = {}) {
  const result = {
    passes: false,
    mahavrataResult: null,
    steps: [],
    failedStep: null,
    recommendation: null,
  };

  // 0. Mahā-vrata — before any step
  const mahav = checkMahavrata(action);
  result.mahavrataResult = mahav;
  if (!mahav.passes) {
    result.failedStep = 'mahavrata';
    result.recommendation =
      'Маха-врата нарушена. Действие недопустимо, независимо от результата алгоритма.';
    return result;
  }

  // 1. DHARMA
  const dharmaOk = checkDharma(action);
  result.steps.push({
    name: 'Dharma',
    passes: dharmaOk.passes,
    detail: dharmaOk.detail,
  });
  if (!dharmaOk.passes) {
    result.failedStep = 'Dharma';
    result.recommendation = dharmaOk.recommendation || 'Пересмотреть соответствие Рите.';
    return result;
  }

  // 2. SVADHARMA
  if (!agent || !agent.svadharma) {
    result.failedStep = 'Svadharma';
    result.recommendation = 'Агент не имеет определённой Свадхармы — невозможно применить алгоритм.';
    return result;
  }
  const svadharmaOk = checkSvadharmaConsistency(agent.svadharma, action);
  result.steps.push({
    name: 'Svadharma',
    passes: svadharmaOk.valid,
    detail: svadharmaOk.valid ? 'ok' : svadharmaOk.reason,
  });
  if (!svadharmaOk.valid) {
    result.failedStep = 'Svadharma';
    result.recommendation =
      `Это не Свадхарма ${agent.name || 'агента'}. Передать другому агенту ` +
      `(нарушение: ${svadharmaOk.violation}).`;
    return result;
  }

  // 3. GUNA
  const gunaOk = checkGuna(agent, action);
  result.steps.push({
    name: 'Guna',
    passes: gunaOk.passes,
    detail: gunaOk.detail,
  });
  if (!gunaOk.passes) {
    result.failedStep = 'Guna';
    result.recommendation = gunaOk.recommendation;
    return result;
  }

  // 4. YAJNA
  const yajnaOk = checkYajna(action);
  result.steps.push({
    name: 'Yajna',
    passes: yajnaOk.passes,
    detail: yajnaOk.detail,
  });
  if (!yajnaOk.passes) {
    result.failedStep = 'Yajna';
    result.recommendation = yajnaOk.recommendation;
    return result;
  }

  // 5. DANA
  const danaOk = checkDana(action);
  result.steps.push({
    name: 'Dana',
    passes: danaOk.passes,
    detail: danaOk.detail,
  });
  if (!danaOk.passes) {
    result.failedStep = 'Dana';
    result.recommendation = danaOk.recommendation;
    return result;
  }

  result.passes = true;
  result.recommendation = 'Действие разрешено. Выполнить.';
  return result;
}

// ─────────────────────────────────────────────
// Helper checks for the 5 steps
// ─────────────────────────────────────────────

function checkDharma(action) {
  const violations = [];

  if (action.violatesLaws && Array.isArray(action.violatesLaws) && action.violatesLaws.length > 0) {
    violations.push(`нарушает законы: ${action.violatesLaws.join(', ')}`);
  }

  if (action.breaksWorkflow) {
    violations.push('нарушает Риту воркфлоу');
  }

  return {
    passes: violations.length === 0,
    detail: violations.length === 0 ? 'соответствует Рите' : violations.join('; '),
    recommendation: violations.length > 0
      ? 'Пересмотреть действие на соответствие общему порядку системы'
      : null,
  };
}

function checkGuna(agent, action) {
  const agentGuna = agent.svadharma?.guna || '';
  const actionGuna = action.currentGuna;

  if (!actionGuna) {
    return { passes: true, detail: 'не проверено (currentGuna не указана)' };
  }

  const agentGunaParts = agentGuna.split('+').map((g) => g.trim());
  const match = agentGunaParts.some((g) => actionGuna.includes(g));

  return {
    passes: match,
    detail: match ? `действует в ${actionGuna}` : `${actionGuna} не в Свадхарме (${agentGuna})`,
    recommendation: match ? null : 'Сделать паузу, вернуться в свою гуну',
  };
}

function checkYajna(action) {
  const explicitIntrinsic = action.intrinsicValue === true;
  const resultDriven = action.resultDriven === true;

  if (explicitIntrinsic) {
    return { passes: true, detail: 'явно имеет самостоятельную ценность' };
  }

  if (resultDriven) {
    return {
      passes: false,
      detail: 'действие движимо только результатом (Раджасическая Яджна)',
      recommendation:
        'Переформулировать так, чтобы действие имело самостоятельную ценность, ' +
        'либо отказаться.',
    };
  }

  return {
    passes: true,
    detail: 'intrinsicValue не проверен явно — flag as passing',
  };
}

function checkDana(action) {
  const danaType = action.danaType;
  if (!danaType) {
    return {
      passes: false,
      detail: 'тип Даны не назван явно',
      recommendation:
        'Явно указать danaType: "vidya" | "anna" | "abhaya" | "artha" ' +
        '(или отказаться от действия, если Дана не определима).',
    };
  }

  const validTypes = Object.keys(FIVE_STEP_ALGORITHM.danaTypes);
  if (!validTypes.includes(danaType)) {
    return {
      passes: false,
      detail: `неизвестный тип Даны: ${danaType}`,
      recommendation: `Использовать один из: ${validTypes.join(', ')}`,
    };
  }

  return {
    passes: true,
    detail: FIVE_STEP_ALGORITHM.danaTypes[danaType],
  };
}

module.exports = {
  FIVE_STEP_ALGORITHM,
  runFiveSteps,
  checkDharma,
  checkGuna,
  checkYajna,
  checkDana,
};
