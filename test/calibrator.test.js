import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calibrate, flagConfidence, isStrong, CALIBRATOR_PARAMS }
  from '../src/calibrator.js';

test('flagConfidence: monotonically non-decreasing in hits', () => {
  let prev = 0;
  for (let h = 1; h <= 5; h++) {
    const c = flagConfidence(h);
    assert.ok(c >= prev, `hits=${h} produced ${c} < prev ${prev}`);
    prev = c;
  }
});

test('flagConfidence: zero hits → zero confidence', () => {
  assert.equal(flagConfidence(0), 0);
});

test('flagConfidence: caps below 1', () => {
  assert.ok(flagConfidence(100) < 1.0);
});

test('calibrate: empty text → abstain with reason "empty input"', () => {
  const r = calibrate('', {});
  assert.equal(r.abstain, true);
  assert.equal(r.reason, 'empty input');
  assert.equal(r.manipulation, 0);
});

test('calibrate: very short text → abstain', () => {
  const r = calibrate('Hurry!', { falseUrgency: ['urgency_en:Hurry'] });
  assert.equal(r.abstain, true);
  assert.match(r.reason, /too short/i);
});

test('calibrate: noise-floor abstain when only signals are weak', () => {
  // Just above MIN_TOKENS, no actual hits — confidence stays 0, no abstain
  // by floor (since maxFlag === 0 doesn't trigger noise-floor branch).
  const r = calibrate('A reasonably calm informational sentence here.', {
    falseUrgency: [], fearBased: [], clickbait: [],
  });
  assert.equal(r.manipulation, 0);
  // No flag fired → not an abstain by noise floor.
  assert.equal(r.abstain, false);
});

test('calibrate: single signal in long text → moderate confidence, no abstain', () => {
  const text = 'Please act now to confirm your booking before the day ends.';
  const r = calibrate(text, { falseUrgency: ['urgency_en:act now'] });
  assert.equal(r.abstain, false);
  // 1 hit, no penalty because length ≥ SHORT_TEXT_TOKENS
  assert.ok(r.confidence.falseUrgency >= 0.4);
  assert.ok(r.confidence.falseUrgency <= 0.6);
});

test('calibrate: two signals → manipulation confidence rises', () => {
  const text = 'Hurry, you will miss out and regret it forever, last chance!';
  const r = calibrate(text, {
    falseUrgency: ['urgency_en:Hurry', 'urgency_en:last chance'],
    fearBased:    ['fear_en:miss out', 'fear_en:regret'],
  });
  assert.equal(r.abstain, false);
  // With 2 hits each, confidences should be ≥ 0.6
  assert.ok(r.confidence.falseUrgency >= 0.6);
  assert.ok(r.confidence.fearBased >= 0.6);
  // Combined manipulation should reach 'strong' territory
  assert.ok(r.manipulation >= 0.7,
    `manipulation ${r.manipulation} < 0.7 with two strong flags`);
});

test('calibrate: short-text penalty cuts confidence', () => {
  const longText  = 'Hurry up to the next thing now or you will be sad later.';
  const shortText = 'Hurry up now.';
  const ev = { falseUrgency: ['urgency_en:Hurry'] };
  const longR  = calibrate(longText,  ev);
  const shortR = calibrate(shortText, ev);
  assert.ok(shortR.confidence.falseUrgency < longR.confidence.falseUrgency,
    'short-text confidence should be < long-text');
});

test('isStrong: respects threshold', () => {
  assert.equal(isStrong(CALIBRATOR_PARAMS.STRONG_THRESHOLD - 0.01), false);
  assert.equal(isStrong(CALIBRATOR_PARAMS.STRONG_THRESHOLD), true);
  assert.equal(isStrong(0.95), true);
  assert.equal(isStrong(0), false);
});

test('CALIBRATOR_PARAMS is frozen', () => {
  assert.throws(() => { CALIBRATOR_PARAMS.TAU = 999; }, /assign|read.only/i);
});
