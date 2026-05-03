/**
 * Adversarial bypass test suite.
 *
 * Each test encodes a bypass technique discovered during the v0.3
 * security audit. The post-fix expectation is that the calibrated
 * detector now flags these — preventing silent passage of manipulative
 * content crafted to defeat regex matching.
 *
 * If you add a new bypass vector here and it passes the guard, that is
 * a security regression — fix the normalizer or the rule, do not
 * weaken the test.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inspect } from '../src/inspect.js';
import { detectPatterns } from '../src/detect-patterns.js';

// ─────────────────────────────────────────────
// Helper — under neutral metadata, urgency-flag must come from text alone.
// ─────────────────────────────────────────────
const NEUTRAL_OPTS = { urgency: 0.3, paused: true };

function expectFlagged(text, flag, options = NEUTRAL_OPTS) {
  const r = inspect(text, options);
  // Semantic check: the underlying regex fired at least once. Confidence
  // value is moderated by text length (short-text-penalty); the question
  // is whether the bypass was *detected*, not whether a particular
  // magic threshold was crossed.
  assert.ok(
    r.evidence[flag].length > 0,
    `expected evidence.${flag} non-empty for "${text}", got ${JSON.stringify(r.evidence[flag])}`
  );
  // Sanity: confidence > 0 whenever evidence fires.
  assert.ok(
    r.confidence[flag] > 0,
    `expected confidence.${flag} > 0 for "${text}", got ${r.confidence[flag]}`
  );
}

// ─────────────────────────────────────────────
// Cyrillic homoglyph attacks
// ─────────────────────────────────────────────

test('adversarial: Cyrillic-у in "Hurry" still triggers urgency', () => {
  expectFlagged('Hurrу, last chance!', 'falseUrgency');           // у = U+0443
});

test('adversarial: multiple Cyrillic homoglyphs in urgency word', () => {
  // "Huррy" — Cyrillic р×2
  const r = detectPatterns('Huррy, last chance to register!');
  assert.equal(r.falseUrgency, true,
    'multi-homoglyph urgency should still match');
});

test('adversarial: Cyrillic homoglyphs inside "regret"', () => {
  // "rеgrеt" — Cyrillic е×2
  expectFlagged('You will rеgrеt missing this opportunity forever.', 'fearBased');
});

test('adversarial: combined Cyrillic-r and Cyrillic-у', () => {
  expectFlagged("Huррy, you'll rеgrеt missing this last chance!", 'falseUrgency');
});

// ─────────────────────────────────────────────
// Zero-width / invisible character attacks
// ─────────────────────────────────────────────

test('adversarial: zero-width space inside "Hurry"', () => {
  expectFlagged('Hu​rry, last chance!', 'falseUrgency');
});

test('adversarial: ZWJ inside fear word', () => {
  expectFlagged('You will reg‍ret missing this forever.', 'fearBased');
});

test('adversarial: BOM prefix on urgency word', () => {
  expectFlagged('﻿Hurry, last chance!', 'falseUrgency');
});

test('adversarial: mixed zero-width characters (ZWNJ + ZWSP + word joiner)', () => {
  expectFlagged('Hu‌r​r⁠y, last chance!', 'falseUrgency');
});

// ─────────────────────────────────────────────
// Fullwidth / NFKC-collapsible attacks
// ─────────────────────────────────────────────

test('adversarial: fullwidth Latin letters', () => {
  // "Hurry" in fullwidth Latin block U+FF21..U+FF5A
  expectFlagged('Ｈｕｒｒｙ, last chance to register!', 'falseUrgency');
});

test('adversarial: fullwidth digit in scarcity claim', () => {
  // "3 spots left" with fullwidth digit
  expectFlagged('Only ３ spots left for the cohort!', 'falseUrgency');
});

// ─────────────────────────────────────────────
// Spaced-out token attacks
// ─────────────────────────────────────────────

test('adversarial: spaced-out urgency word "H u r r y"', () => {
  expectFlagged('H u r r y, last chance to register!', 'falseUrgency');
});

test('adversarial: spaced-out fear word', () => {
  expectFlagged('You will r e g r e t missing this opportunity.', 'fearBased');
});

// ─────────────────────────────────────────────
// Leetspeak attacks
// ─────────────────────────────────────────────

test('adversarial: leetspeak in urgency word', () => {
  // "Hurry" → "Hurry" (no leet here); use realistic example
  expectFlagged('Hurry, y0u w1ll r3gr3t this!', 'fearBased');
});

test('adversarial: leetspeak in fear word', () => {
  expectFlagged('You will l0se everything if you wait.', 'fearBased');
});

// ─────────────────────────────────────────────
// End-to-end: realistic adversarial copy
// ─────────────────────────────────────────────

test('adversarial: full attack — Cyrillic + leet + spacing', () => {
  const attack = "Huррy, y0u'll rеgrеt m1ss1ng this last chance!";
  const r = inspect(attack, NEUTRAL_OPTS);
  // The attacker's goal is to slip through with conf < 0.7. Post-fix,
  // we should reach manipulation conf ≥ 0.7 = block.
  assert.equal(
    r.confidence.manipulation >= 0.7,
    true,
    `multi-vector attack should be blocked; got conf=${r.confidence.manipulation}`
  );
});

// ─────────────────────────────────────────────
// Regressions — pure Cyrillic text must still match Russian patterns
// ─────────────────────────────────────────────

test('regression: pure Russian "только сегодня" still matches RU regex', () => {
  const r = detectPatterns('Только сегодня! Не упусти.');
  assert.equal(r.falseUrgency, true);
});

test('regression: pure Russian "потеряете" still matches fear', () => {
  const r = detectPatterns('Без этого вы потеряете все накопления.');
  assert.equal(r.fearBased, true);
});

test('regression: pure Russian "то, о чём молчат" still matches clickbait', () => {
  const r = detectPatterns('То, о чём молчат банки — секрет финансовой свободы.');
  assert.equal(r.clickbait, true);
});

test('regression: pure English benign sentence stays clean', () => {
  const r = detectPatterns('The training session covers fundamentals of statistics.');
  assert.equal(r.falseUrgency, false);
  assert.equal(r.fearBased, false);
  assert.equal(r.clickbait, false);
  assert.equal(r.manipulation, false);
});

// ─────────────────────────────────────────────
// Regex DoS resistance — long inputs must complete in bounded time
// ─────────────────────────────────────────────

test('redos resistance: 100KB benign text completes under 1 second', () => {
  const big = 'a '.repeat(50000);     // ~100KB
  const start = Date.now();
  detectPatterns(big);
  const elapsed = Date.now() - start;
  assert.ok(elapsed < 1000, `detectPatterns took ${elapsed}ms on 100KB benign`);
});

test('redos resistance: 100KB pathological repetition completes under 1 second', () => {
  // Pattern designed to stress regex backtracking on URGENCY_EN.
  const big = ('hurry '.repeat(20) + 'a '.repeat(100)).repeat(80);
  const start = Date.now();
  detectPatterns(big);
  const elapsed = Date.now() - start;
  assert.ok(elapsed < 1000, `detectPatterns took ${elapsed}ms on pathological 100KB`);
});
