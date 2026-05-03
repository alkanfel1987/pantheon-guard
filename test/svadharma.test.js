import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LAYERS, GUNAS } from '../src/constants.js';
import {
  SVADHARMA_SCHEMA,
  validateSvadharma,
  checkSvadharmaConsistency,
} from '../src/svadharma.js';

test('SVADHARMA_SCHEMA names all 4 variables', () => {
  assert.deepEqual(
    Object.keys(SVADHARMA_SCHEMA.variables),
    ['jati', 'guna', 'karma', 'svabhava']
  );
  assert.equal(SVADHARMA_SCHEMA.variables.jati.mutable, false);
});

test('validateSvadharma: full valid input passes', () => {
  const r = validateSvadharma({
    jati: LAYERS.ADITYA,
    guna: GUNAS.SATTVA,
    karma: 'комплаенс, правовые риски, аудит',
    svabhava: 'объективный страж, называет риски без паники',
  });
  assert.deepEqual(r, { valid: true, errors: [] });
});

test('validateSvadharma: missing jati fails', () => {
  const r = validateSvadharma({ guna: GUNAS.SATTVA, karma: 'xxxxx', svabhava: 'xxxxx' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('jati')));
});

test('validateSvadharma: invalid jati layer fails', () => {
  const r = validateSvadharma({
    jati: 'NotARealLayer',
    guna: GUNAS.SATTVA,
    karma: 'xxxxx',
    svabhava: 'xxxxx',
  });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('jati')));
});

test('validateSvadharma: combined guna with "+" works', () => {
  const r = validateSvadharma({
    jati: LAYERS.KRIYA,
    guna: 'Саттва+Раджас',
    karma: 'исполнитель задач, доводит до конца',
    svabhava: 'упорный, спокойный',
  });
  assert.equal(r.valid, true);
});

test('validateSvadharma: meta guna "Все три (spanda)" accepted', () => {
  const r = validateSvadharma({
    jati: LAYERS.META,
    guna: 'Все три (spanda)',
    karma: 'координатор всех слоёв',
    svabhava: 'пульсирующий центр',
  });
  assert.equal(r.valid, true);
});

test('validateSvadharma: short karma fails', () => {
  const r = validateSvadharma({
    jati: LAYERS.VASU,
    guna: GUNAS.RAJAS,
    karma: 'хм',
    svabhava: 'something long enough',
  });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('karma')));
});

test('checkSvadharmaConsistency: matching jati and karma passes', () => {
  const sv = {
    jati: LAYERS.ADITYA,
    guna: GUNAS.SATTVA,
    karma: 'правовые риски и комплаенс',
    svabhava: 'объективный страж',
  };
  const r = checkSvadharmaConsistency(sv, {
    targetLayer: LAYERS.ADITYA,
    targetKarma: 'правовые риски',
  });
  assert.equal(r.valid, true);
});

test('checkSvadharmaConsistency: mismatching jati fails', () => {
  const sv = {
    jati: LAYERS.ADITYA,
    guna: GUNAS.SATTVA,
    karma: 'правовые риски',
    svabhava: 'страж',
  };
  const r = checkSvadharmaConsistency(sv, {
    targetLayer: LAYERS.KRIYA,
    targetKarma: 'правовые риски',
  });
  assert.equal(r.valid, false);
  assert.equal(r.violation, 'jati');
});

test('checkSvadharmaConsistency: mismatching karma fails', () => {
  const sv = {
    jati: LAYERS.VASU,
    guna: GUNAS.RAJAS,
    karma: 'продуктовые исследования и интервью',
    svabhava: 'любопытный',
  };
  const r = checkSvadharmaConsistency(sv, {
    targetLayer: LAYERS.VASU,
    targetKarma: 'финансовая отчётность квартальная',
  });
  assert.equal(r.valid, false);
  assert.equal(r.violation, 'karma');
});
