import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAHAVRATA, checkMahavrata } from '../src/mahavrata.js';

test('MAHAVRATA structure exposes all 5 yamas with sanskrit + iast + meaning', () => {
  const expected = ['ahimsa', 'satya', 'asteya', 'shaucha', 'indriya_nigraha'];
  assert.deepEqual(Object.keys(MAHAVRATA.rules), expected);
  for (const key of expected) {
    const r = MAHAVRATA.rules[key];
    assert.ok(r.sanskrit, `${key} has sanskrit`);
    assert.ok(r.iast, `${key} has iast`);
    assert.ok(r.meaning, `${key} has meaning`);
    assert.ok(Array.isArray(r.checkQuestions) && r.checkQuestions.length >= 3);
  }
  assert.equal(MAHAVRATA.unqualified, true);
});

test('MAHAVRATA top-level is frozen (cannot rewrite priority/source/etc)', () => {
  // Object.freeze is shallow by design — only the top-level fields are protected.
  // A deep freeze would be a separate architectural decision; for now we lock
  // the canonical name, source, priority and unqualified flag.
  assert.throws(() => { MAHAVRATA.priority = 999; }, TypeError);
  assert.throws(() => { MAHAVRATA.unqualified = false; }, TypeError);
  assert.throws(() => { MAHAVRATA.source = 'fake'; }, TypeError);
});

test('checkMahavrata: clean action passes', () => {
  const r = checkMahavrata({
    text: 'Calm informational note',
    urgency: 0.2,
    paused: true,
    sources: ['pravo.gov.ru'],
    contains: {},
  });
  assert.equal(r.passes, true);
  assert.deepEqual(r.violations, []);
});

test('checkMahavrata: ahimsa — false urgency triggers violation', () => {
  const r = checkMahavrata({
    text: 'Hurry, only 3 spots left!',
    urgency: 0.95,
    paused: false,
    contains: { falseUrgency: true },
  });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'ahimsa'));
});

test('checkMahavrata: ahimsa — fear-based content triggers violation', () => {
  const r = checkMahavrata({
    text: 'You will lose everything if you do not act now',
    urgency: 0.5,
    paused: true,
    contains: { fearBased: true },
  });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'ahimsa'));
});

test('checkMahavrata: satya — clickbait triggers violation', () => {
  const r = checkMahavrata({
    text: 'The one secret nobody tells you',
    urgency: 0.3,
    paused: true,
    contains: { clickbait: true },
  });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'satya'));
});

test('checkMahavrata: asteya — informational intent without sources fails', () => {
  const r = checkMahavrata({
    text: 'Studies show that...',
    intent: 'inform',
    urgency: 0.3,
    paused: true,
    sources: [],
    contains: {},
  });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'asteya'));
});

test('checkMahavrata: asteya — informational intent WITH sources passes that rule', () => {
  const r = checkMahavrata({
    text: 'Studies show that...',
    intent: 'inform',
    urgency: 0.3,
    paused: true,
    sources: ['arxiv.org/abs/1234.5678'],
    contains: {},
  });
  assert.ok(!r.violations.find((v) => v.rule === 'asteya'));
});

test('checkMahavrata: shaucha — multiple topics trigger violation', () => {
  const r = checkMahavrata({
    text: 'Mixed message',
    urgency: 0.2,
    paused: true,
    contains: { multipleTopics: true },
  });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'shaucha'));
});

test('checkMahavrata: indriya-nigraha — high urgency without pause fails', () => {
  const r = checkMahavrata({
    text: 'Need to send right now',
    urgency: 0.95,
    paused: false,
    contains: {},
  });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'indriya_nigraha'));
});

test('checkMahavrata: indriya-nigraha — high urgency WITH pause is OK', () => {
  const r = checkMahavrata({
    text: 'Considered after pause',
    urgency: 0.95,
    paused: true,
    contains: {},
  });
  assert.ok(!r.violations.find((v) => v.rule === 'indriya_nigraha'));
});

test('checkMahavrata: empty action does not throw, returns passing result', () => {
  const r = checkMahavrata({});
  assert.equal(r.passes, true);
  assert.deepEqual(r.violations, []);
});

test('checkMahavrata: details object covers all 5 rules', () => {
  const r = checkMahavrata({ urgency: 0.1, paused: true });
  for (const key of ['ahimsa', 'satya', 'asteya', 'shaucha', 'indriya_nigraha']) {
    assert.ok(r.details[key], `details.${key} present`);
    assert.equal(typeof r.details[key].passes, 'boolean');
  }
});
