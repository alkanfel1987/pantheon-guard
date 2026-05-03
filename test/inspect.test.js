import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inspect } from '../src/inspect.js';

test('inspect: clean informational text passes', () => {
  const r = inspect('A reasonably calm informational sentence with sources cited.');
  assert.equal(r.passes, true);
  assert.equal(r.abstain, false);
  assert.equal(r.violations.length, 0);
  assert.equal(r.policy, 'calibrated');
});

test('inspect: too-short text triggers abstain (not a verdict)', () => {
  const r = inspect('Hurry!');
  assert.equal(r.abstain, true);
  assert.match(r.reason, /too short/i);
});

test('inspect: blatant manipulation in calibrated mode → blocked', () => {
  const text = 'Hurry, only 3 spots left! Don\'t miss out, you\'ll regret it forever.';
  const r = inspect(text, { urgency: 0.95, paused: false });
  assert.equal(r.abstain, false);
  assert.equal(r.passes, false);
  // Should flag both ahimsa (fearBased / falseUrgency) and indriya_nigraha (high urgency, no pause).
  const ruleNames = r.violations.map((v) => v.rule);
  assert.ok(ruleNames.includes('ahimsa'),          'ahimsa not flagged');
  assert.ok(ruleNames.includes('indriya_nigraha'), 'indriya_nigraha not flagged');
});

test('inspect: weak single signal in long text → calibrated mode does NOT block', () => {
  // "act now" alone in a long benign sentence — strict mode would flag, calibrated should not.
  const text = 'Please act now to confirm your booking before the office closes for the day, thanks.';
  const calibrated = inspect(text, { urgency: 0.2, paused: true });
  assert.equal(calibrated.passes, true,
    'calibrated mode should NOT block weak single-signal long text');

  const strict = inspect(text, { urgency: 0.2, paused: true, policy: 'strict' });
  // Strict picks up the regex hit and routes through ahimsa.
  assert.equal(strict.passes, false,
    'strict mode SHOULD block — proves calibrated/strict actually differ');
});

test('inspect: confidence is in [0, 1] for all flags', () => {
  const r = inspect('Hurry, you will miss out and regret it forever, last chance!');
  for (const k of ['falseUrgency', 'fearBased', 'clickbait', 'manipulation']) {
    assert.ok(r.confidence[k] >= 0, `confidence.${k} ≥ 0`);
    assert.ok(r.confidence[k] <= 1, `confidence.${k} ≤ 1`);
  }
});

test('inspect: evidence carries marker strings explaining each fired flag', () => {
  const r = inspect('The one secret nobody knows: hurry to claim it.');
  assert.ok(r.evidence.clickbait.length > 0, 'clickbait should have evidence');
  // Each evidence entry follows "name:matched_text" shape
  for (const m of r.evidence.clickbait) {
    assert.match(m, /^[a-z_]+:.+/, `evidence "${m}" lacks "name:matched" shape`);
  }
});

test('inspect: caller-supplied contains is merged in', () => {
  const r = inspect('Calm informational note.', {
    intent: 'inform',
    sources: [],
    contains: { citesData: true }, // forces asteya path
  });
  // No sources but citesData → asteya should flag
  assert.equal(r.passes, false);
  assert.ok(r.violations.find((v) => v.rule === 'asteya'));
});

test('inspect: top-level phase-2 lesson — calibrated mode reports honest uncertainty', () => {
  // Borderline-confidence text — single signal, medium length.
  const text = 'Please review this update by the deadline, thanks.';
  const r = inspect(text);
  // Should NOT be a strong manipulation claim
  assert.ok(r.confidence.manipulation < 0.5,
    `expected confidence.manipulation < 0.5, got ${r.confidence.manipulation}`);
  // Should not block in calibrated mode
  assert.equal(r.passes, true);
});
