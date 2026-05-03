'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const guard = require('../src');

test('public API exposes all expected names', () => {
  const expected = [
    // version
    'CORE_VERSION',
    // constants
    'LAYERS', 'GUNAS', 'PRIORITY',
    // frozen structures
    'MAHAVRATA', 'SVADHARMA_SCHEMA', 'FIVE_STEP_ALGORITHM',
    'PRINCIPLES', 'LAWS',
    // check functions
    'checkMahavrata', 'validateSvadharma', 'checkSvadharmaConsistency',
    'runFiveSteps', 'checkAction',
    // getters
    'getMahavrata', 'getAlgorithm', 'getPrinciple', 'getLaw',
  ];
  for (const name of expected) {
    assert.ok(name in guard, `public API exposes ${name}`);
  }
});

test('CORE_VERSION is semver', () => {
  assert.match(guard.CORE_VERSION, /^\d+\.\d+\.\d+$/);
});

test('checkAction is alias of runFiveSteps', () => {
  // both functions should produce equal output for the same input
  const agent = {
    name: 'X',
    svadharma: {
      jati: guard.LAYERS.VASU,
      guna: guard.GUNAS.SATTVA,
      karma: 'product research',
      svabhava: 'curious researcher',
    },
  };
  const action = {
    urgency: 0.2, paused: true,
    intrinsicValue: true, danaType: 'vidya',
    targetLayer: guard.LAYERS.VASU, targetKarma: 'research',
  };
  const a = guard.checkAction(agent, action);
  const b = guard.runFiveSteps(agent, action);
  assert.deepEqual(a.passes, b.passes);
  assert.deepEqual(a.failedStep, b.failedStep);
});

test('getPrinciple() returns whole map; getPrinciple("rita") returns single', () => {
  const all = guard.getPrinciple();
  assert.ok('rita' in all && 'dharma' in all && 'yajna' in all && 'dana' in all);
  const rita = guard.getPrinciple('rita');
  assert.equal(rita.name, 'Рита');
});

test('getLaw() returns array; getLaw(N) returns one; getLaw(99) returns null', () => {
  const all = guard.getLaw();
  assert.ok(Array.isArray(all));
  assert.equal(all.length, 11);
  const law5 = guard.getLaw(5);
  assert.equal(law5.name, 'Ганеша-валидация');
  assert.equal(guard.getLaw(99), null);
});

test('LAWS array contains all 11 laws including Apad-dharma at #11', () => {
  assert.equal(guard.LAWS.length, 11);
  const apad = guard.LAWS.find((l) => l.number === 11);
  assert.match(apad.name, /Апад/);
});

test('getMahavrata and getAlgorithm return same identity, top-level frozen', () => {
  const mv = guard.getMahavrata();
  assert.equal(mv, guard.MAHAVRATA);
  // top-level field write fails (shallow freeze)
  assert.throws(() => { mv.priority = 999; }, TypeError);

  const algo = guard.getAlgorithm();
  assert.equal(algo, guard.FIVE_STEP_ALGORITHM);
  assert.throws(() => { algo.name = 'fake'; }, TypeError);
});
