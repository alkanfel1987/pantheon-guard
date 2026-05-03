'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { LAYERS, GUNAS } = require('../src/constants');
const {
  FIVE_STEP_ALGORITHM,
  runFiveSteps,
  checkDana,
  checkYajna,
} = require('../src/algorithm');

const validAgent = {
  name: 'Варуна',
  svadharma: {
    jati: LAYERS.ADITYA,
    guna: GUNAS.SATTVA,
    karma: 'комплаенс, правовые риски, аудит',
    svabhava: 'объективный страж',
  },
};

const validAction = {
  text: 'Спокойный правовой алерт с источником',
  urgency: 0.3,
  paused: true,
  sources: ['pravo.gov.ru'],
  currentGuna: 'Саттва',
  intrinsicValue: true,
  danaType: 'abhaya',
  targetLayer: LAYERS.ADITYA,
  targetKarma: 'правовые риски',
};

test('FIVE_STEP_ALGORITHM has 5 steps in correct order', () => {
  const names = FIVE_STEP_ALGORITHM.steps.map((s) => s.name);
  assert.deepEqual(names, ['Dharma', 'Svadharma', 'Guna', 'Yajna', 'Dana']);
  assert.deepEqual(
    Object.keys(FIVE_STEP_ALGORITHM.danaTypes),
    ['vidya', 'anna', 'abhaya', 'artha']
  );
});

test('runFiveSteps: clean valid action passes all 5 steps', () => {
  const r = runFiveSteps(validAgent, validAction);
  assert.equal(r.passes, true);
  assert.equal(r.failedStep, null);
  assert.equal(r.steps.length, 5);
  for (const s of r.steps) assert.equal(s.passes, true);
});

test('runFiveSteps: Mahavrata gate stops execution', () => {
  // false urgency violates Mahavrata; algorithm must NOT advance into the 5 steps
  const r = runFiveSteps(validAgent, {
    ...validAction,
    urgency: 0.95,
    paused: false,
    contains: { falseUrgency: true, fearBased: true },
  });
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'mahavrata');
  assert.equal(r.steps.length, 0);
  assert.equal(r.mahavrataResult.passes, false);
});

test('runFiveSteps: missing svadharma stops at step 2', () => {
  const r = runFiveSteps({ name: 'NoSvadharma' }, validAction);
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'Svadharma');
});

test('runFiveSteps: jati mismatch stops at step 2 with reason', () => {
  const r = runFiveSteps(validAgent, { ...validAction, targetLayer: LAYERS.KRIYA });
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'Svadharma');
  assert.match(r.recommendation, /Свадхарма/);
});

test('runFiveSteps: result-driven action without intrinsic value fails Yajna', () => {
  const r = runFiveSteps(validAgent, {
    ...validAction,
    intrinsicValue: undefined,
    resultDriven: true,
  });
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'Yajna');
});

test('runFiveSteps: missing danaType fails step 5', () => {
  const r = runFiveSteps(validAgent, { ...validAction, danaType: undefined });
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'Dana');
});

test('runFiveSteps: invalid danaType is rejected', () => {
  const r = runFiveSteps(validAgent, { ...validAction, danaType: 'gold-coin' });
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'Dana');
});

test('runFiveSteps: violatesLaws stops at Dharma', () => {
  const r = runFiveSteps(validAgent, { ...validAction, violatesLaws: ['Закон 5'] });
  assert.equal(r.passes, false);
  assert.equal(r.failedStep, 'Dharma');
});

test('checkYajna: explicit intrinsicValue passes', () => {
  assert.equal(checkYajna({ intrinsicValue: true }).passes, true);
});

test('checkDana: each of 4 valid types passes with descriptive detail', () => {
  for (const t of ['vidya', 'anna', 'abhaya', 'artha']) {
    const r = checkDana({ danaType: t });
    assert.equal(r.passes, true, `${t} should pass`);
    assert.ok(r.detail.length > 0);
  }
});
