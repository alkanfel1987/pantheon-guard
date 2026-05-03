import { test } from 'node:test';
import assert from 'node:assert/strict';

import { detectPatterns } from '../src/detect-patterns.js';

test('detectPatterns: empty / non-string input returns all false', () => {
  for (const input of ['', null, undefined, 42, {}, []]) {
    const r = detectPatterns(input);
    assert.deepEqual(r, {
      falseUrgency: false, fearBased: false, clickbait: false, manipulation: false,
    });
  }
});

test('detectPatterns: clean Russian sentence flags nothing', () => {
  const r = detectPatterns('Спокойное информационное сообщение с источником.');
  assert.equal(r.falseUrgency, false);
  assert.equal(r.fearBased, false);
  assert.equal(r.clickbait, false);
  assert.equal(r.manipulation, false);
});

test('detectPatterns: false urgency RU — "только сегодня"', () => {
  const r = detectPatterns('Скидка только сегодня, не упусти');
  assert.equal(r.falseUrgency, true);
});

test('detectPatterns: false urgency EN — "Hurry, only 3 spots left"', () => {
  const r = detectPatterns('Hurry, only 3 spots left!');
  assert.equal(r.falseUrgency, true);
});

test('detectPatterns: fear-based RU — "потеряете все"', () => {
  const r = detectPatterns('Без этого вы потеряете все накопления');
  assert.equal(r.fearBased, true);
});

test('detectPatterns: fear-based EN — "miss out"', () => {
  const r = detectPatterns("Don't miss out, you'll regret it");
  assert.equal(r.fearBased, true);
});

test('detectPatterns: clickbait RU — "то, о чём молчат"', () => {
  const r = detectPatterns('То, о чём молчат банки');
  assert.equal(r.clickbait, true);
});

test('detectPatterns: clickbait EN — "the one thing they don\'t want you"', () => {
  const r = detectPatterns("The one thing they don't want you to know");
  assert.equal(r.clickbait, true);
});

test('detectPatterns: scarcity pattern "only 3 spots left"', () => {
  const r = detectPatterns('Only 3 spots left for our cohort!');
  assert.equal(r.falseUrgency, true);
});

test('detectPatterns: meta-flag "manipulation" requires >=2 signals', () => {
  // single signal → manipulation=false
  const oneSignal = detectPatterns('Hurry to register');
  assert.equal(oneSignal.falseUrgency, true);
  assert.equal(oneSignal.manipulation, false);

  // two signals → manipulation=true
  const twoSignals = detectPatterns('Hurry, you will miss out!');
  assert.equal(twoSignals.falseUrgency, true);
  assert.equal(twoSignals.fearBased, true);
  assert.equal(twoSignals.manipulation, true);
});

test('detectPatterns: combined RU+EN signals also trigger manipulation', () => {
  const r = detectPatterns('Срочно! The one secret nobody tells you.');
  assert.equal(r.falseUrgency, true);
  assert.equal(r.clickbait, true);
  assert.equal(r.manipulation, true);
});

test('detectPatterns: composes with checkMahavrata via action.contains', async () => {
  const { checkMahavrata } = await import('../src/mahavrata.js');
  const text = 'Hurry, only 3 spots left! Don\'t miss out!';
  const contains = detectPatterns(text);
  const r = checkMahavrata({ text, urgency: 0.9, paused: false, contains });
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'ahimsa'));
});
