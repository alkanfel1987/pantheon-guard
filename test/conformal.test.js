import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  nonconformityScore,
  fitConformal,
  inspectConformal,
} from '../src/conformal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(resolve(__dirname, '../examples/conformal-data.json'), 'utf8')
);
const CALIB = data.examples;

// ─────────────────────────────────────────────
// nonconformityScore
// ─────────────────────────────────────────────

test('nonconformityScore: in [0, 1] range for both labels', () => {
  for (const { text } of CALIB.slice(0, 5)) {
    for (const label of ['manipulation', 'safe']) {
      const s = nonconformityScore(text, label);
      assert.ok(s >= 0 && s <= 1, `score ${s} out of range for "${text}" / ${label}`);
    }
  }
});

test('nonconformityScore: scores sum to 1 across binary labels', () => {
  // Because s(x, "manipulation") = 1 - conf, s(x, "safe") = conf
  for (const { text } of CALIB.slice(0, 5)) {
    const sm = nonconformityScore(text, 'manipulation');
    const ss = nonconformityScore(text, 'safe');
    assert.ok(Math.abs(sm + ss - 1) < 1e-9, `sum=${sm + ss} for "${text}"`);
  }
});

test('nonconformityScore: rejects unknown label', () => {
  assert.throws(() => nonconformityScore('hello', 'maybe'), /unknown label/);
});

// ─────────────────────────────────────────────
// fitConformal
// ─────────────────────────────────────────────

test('fitConformal: returns threshold, n, alpha, scores', () => {
  const cal = fitConformal(CALIB, { alpha: 0.1 });
  assert.equal(typeof cal.threshold, 'number');
  assert.equal(cal.n, CALIB.length);
  assert.equal(cal.alpha, 0.1);
  assert.equal(cal.coverageGuarantee, 0.9);
  assert.equal(cal.scores.length, CALIB.length);
});

test('fitConformal: rejects empty calibration set', () => {
  assert.throws(() => fitConformal([], { alpha: 0.1 }), /non-empty/);
});

test('fitConformal: rejects out-of-range alpha', () => {
  assert.throws(() => fitConformal(CALIB, { alpha: 0 }),    /must be in/);
  assert.throws(() => fitConformal(CALIB, { alpha: 1 }),    /must be in/);
  assert.throws(() => fitConformal(CALIB, { alpha: -0.1 }), /must be in/);
});

test('fitConformal: rejects malformed calibration entries', () => {
  assert.throws(() => fitConformal([{ text: 'x', label: 'wrong' }]), /must be/);
  assert.throws(() => fitConformal([{ text: 42, label: 'safe' }]),   /must be/);
});

test('fitConformal: smaller alpha → larger threshold (more conservative)', () => {
  const c1 = fitConformal(CALIB, { alpha: 0.2 });
  const c5 = fitConformal(CALIB, { alpha: 0.05 });
  assert.ok(
    c5.threshold >= c1.threshold,
    `α=0.05 threshold ${c5.threshold} should be >= α=0.2 threshold ${c1.threshold}`
  );
});

// ─────────────────────────────────────────────
// inspectConformal
// ─────────────────────────────────────────────

test('inspectConformal: requires fitted calibrator', () => {
  assert.throws(
    () => inspectConformal('hello', {}),
    /requires options\.calibrator/
  );
});

test('inspectConformal: returns verdict_set ⊆ {manipulation, safe}', () => {
  const cal = fitConformal(CALIB, { alpha: 0.1 });
  const r = inspectConformal('Hurry, only 3 spots left! Don\'t miss out!', {
    calibrator: cal, urgency: 0.9, paused: false,
  });
  assert.ok(Array.isArray(r.verdict_set));
  assert.ok(r.verdict_set.length >= 1 && r.verdict_set.length <= 2);
  for (const v of r.verdict_set) {
    assert.ok(v === 'manipulation' || v === 'safe', `bad label: ${v}`);
  }
});

test('inspectConformal: blatantly safe text → set contains "safe"', () => {
  const cal = fitConformal(CALIB, { alpha: 0.1 });
  const r = inspectConformal(
    'The training session covers fundamentals of statistics with hands-on examples.',
    { calibrator: cal }
  );
  assert.ok(r.verdict_set.includes('safe'));
});

test('inspectConformal: blatantly manipulative text → set contains "manipulation"', () => {
  const cal = fitConformal(CALIB, { alpha: 0.1 });
  const r = inspectConformal(
    "Hurry, only 3 spots left! Don't miss out, you'll regret it forever.",
    { calibrator: cal, urgency: 0.95, paused: false }
  );
  assert.ok(r.verdict_set.includes('manipulation'));
});

test('inspectConformal: abstain set has length 2 and sets reason', () => {
  // Force abstain by using strict alpha (small → big threshold → both labels admitted often)
  const cal = fitConformal(CALIB, { alpha: 0.01 });
  // A genuinely borderline text — single weak signal in long context.
  const r = inspectConformal(
    'Please act now to confirm your booking before the office closes for the day.',
    { calibrator: cal, urgency: 0.2, paused: true }
  );
  if (r.verdict_set.length === 2) {
    assert.equal(r.abstain, true);
    assert.match(r.reason, /conformal abstain/);
  }
  // Else, the bound let through a single label — also valid; just check shape.
  assert.ok([1, 2].includes(r.verdict_set.length));
});

// ─────────────────────────────────────────────
// Empirical coverage check — the headline guarantee
// ─────────────────────────────────────────────

test('coverage: held-out empirical coverage approaches 1-α', () => {
  // Hold out the last 8 examples; fit on the first 24.
  // With only 24 calibration points, finite-sample fluctuation is large,
  // so we test a generous "at least 1-α-0.15" lower bound. The point is
  // to demonstrate the mechanism, not to prove asymptotic tightness.
  const split = CALIB.length - 8;
  const calibSet = CALIB.slice(0, split);
  const heldOut  = CALIB.slice(split);
  const alpha = 0.2;
  const cal = fitConformal(calibSet, { alpha });

  let covered = 0;
  for (const { text, label } of heldOut) {
    const r = inspectConformal(text, { calibrator: cal });
    if (r.verdict_set.includes(label)) covered++;
  }
  const empirical = covered / heldOut.length;
  assert.ok(
    empirical >= 1 - alpha - 0.15,
    `empirical coverage ${empirical} below tolerated lower bound ${1 - alpha - 0.15}`
  );
});
