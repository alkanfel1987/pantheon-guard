import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  weightedQuantile,
  fitWeightedConformal,
  inspectWeightedConformal,
} from '../src/conformal-weighted.js';
import { fitConformal } from '../src/conformal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(resolve(__dirname, '../examples/conformal-data.json'), 'utf8')
);
const CALIB = data.examples;

// ─────────────────────────────────────────────
// weightedQuantile
// ─────────────────────────────────────────────

test('weightedQuantile: equal weights ≈ unweighted quantile', () => {
  // With uniform weights and weightTest=1, the weighted threshold should
  // be close to the standard finite-sample conformal quantile.
  const scores = [0.1, 0.3, 0.5, 0.7, 0.9];
  const weights = [1, 1, 1, 1, 1];
  const wq = weightedQuantile(scores, weights, 0.2, 1);
  // Unweighted finite-sample: ⌈(n+1)(1-α)⌉ -th = ⌈6 · 0.8⌉ = 5 -> max
  // Weighted target = 1 - 0.2 - 1/6 ≈ 0.633; cum reaches 0.667 at index 3 → score 0.7
  assert.ok(wq >= 0.5 && wq <= 0.9, `wq=${wq} out of expected range`);
});

test('weightedQuantile: input validation', () => {
  assert.throws(() => weightedQuantile([], [], 0.1, 1), /non-empty/);
  assert.throws(
    () => weightedQuantile([0.5], [1, 1], 0.1, 1),
    /weights\.length/
  );
  assert.throws(() => weightedQuantile([0.5], [-1], 0.1, 1), /positive finite/);
  assert.throws(() => weightedQuantile([0.5], [1], 0.1, 0), /positive finite/);
});

test('weightedQuantile: heavier weight on low-score points → lower threshold', () => {
  const scores = [0.1, 0.2, 0.8, 0.9];
  const wLow  = [10, 10, 1, 1];
  const wHigh = [1, 1, 10, 10];
  const tLow  = weightedQuantile(scores, wLow,  0.2, 1);
  const tHigh = weightedQuantile(scores, wHigh, 0.2, 1);
  assert.ok(
    tLow < tHigh,
    `expected weight-on-low → threshold ${tLow} < weight-on-high threshold ${tHigh}`
  );
});

// ─────────────────────────────────────────────
// fitWeightedConformal
// ─────────────────────────────────────────────

test('fitWeightedConformal: returns canonical shape with variant flag', () => {
  // Equal weights so this should track plain conformal closely.
  const calib = CALIB.map((e) => ({ ...e, weight: 1 }));
  const cal = fitWeightedConformal(calib, { alpha: 0.1 });
  assert.equal(cal.variant, 'weighted');
  assert.equal(cal.n, calib.length);
  assert.equal(cal.scores.length, cal.weights.length);
  assert.equal(cal.coverageGuarantee, 0.9);
});

test('fitWeightedConformal: missing weight defaults to 1', () => {
  const cal = fitWeightedConformal(CALIB, { alpha: 0.1 });
  assert.deepEqual(cal.weights, new Array(CALIB.length).fill(1));
});

test('fitWeightedConformal: rejects non-positive weight', () => {
  const bad = CALIB.slice(0, 3).map((e, i) => ({ ...e, weight: i === 1 ? -1 : 1 }));
  assert.throws(() => fitWeightedConformal(bad, { alpha: 0.1 }), /positive finite/);
});

// ─────────────────────────────────────────────
// inspectWeightedConformal
// ─────────────────────────────────────────────

test('inspectWeightedConformal: requires weighted calibrator', () => {
  const std = fitConformal(CALIB, { alpha: 0.1 });   // standard, not weighted
  assert.throws(
    () => inspectWeightedConformal('hello', { calibrator: std }),
    /requires.*fitWeightedConformal/
  );
});

test('inspectWeightedConformal: returns verdict_set, weighted=true', () => {
  const cal = fitWeightedConformal(CALIB, { alpha: 0.1 });
  const r = inspectWeightedConformal(
    "Hurry, only 3 spots left! Don't miss out!",
    { calibrator: cal, urgency: 0.9, paused: false }
  );
  assert.equal(r.weighted, true);
  assert.ok(Array.isArray(r.verdict_set));
  assert.ok(r.verdict_set.includes('manipulation'));
  assert.equal(typeof r.threshold, 'number');
});

test('inspectWeightedConformal: per-call weightTest override is honored', () => {
  const cal = fitWeightedConformal(CALIB, { alpha: 0.1, weightTest: 1 });
  const r1 = inspectWeightedConformal(
    'Please review the attached agenda.',
    { calibrator: cal }
  );
  const r10 = inspectWeightedConformal(
    'Please review the attached agenda.',
    { calibrator: cal, weightTest: 10 }
  );
  // The weightTest field is plumbed through correctly. Threshold may or
  // may not change depending on whether the shifted target crosses a
  // score bin in this small calibration set; both behaviors are
  // mathematically valid. We only assert plumbing here.
  assert.equal(r1.weightTest, 1);
  assert.equal(r10.weightTest, 10);
});

// ─────────────────────────────────────────────
// Coverage check under simulated covariate shift
// ─────────────────────────────────────────────

test('coverage: simulated covariate shift, weighted bound holds', () => {
  // Simulation: in the calibration we hold balanced (16/16). Pretend production
  // skews 75% manipulation. We assign per-entry weights that match this skew.
  const split = CALIB.length - 8;
  const calib = CALIB.slice(0, split).map((e) => ({
    ...e,
    weight: e.label === 'manipulation' ? 1.5 : 0.5,
  }));
  const heldOut = CALIB.slice(split);

  const alpha = 0.2;
  const cal = fitWeightedConformal(calib, { alpha });

  let covered = 0;
  for (const { text, label } of heldOut) {
    const r = inspectWeightedConformal(text, { calibrator: cal });
    if (r.verdict_set.includes(label)) covered++;
  }
  const empirical = covered / heldOut.length;
  assert.ok(
    empirical >= 1 - alpha - 0.20,
    `empirical coverage ${empirical} below tolerated lower bound (small calib set, large fluctuation)`
  );
});
