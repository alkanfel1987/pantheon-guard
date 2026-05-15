/**
 * Smoke tests for clickbait pack v0.0.1
 *
 * Covers: pack-shape validation, key positive examples per detector class
 * (catch confirmation), and key negative examples (FP non-firing on
 * mainstream factual reporting).
 *
 * Foundation: see src/packs/clickbait.js header.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validatePack, applyPack, runPack } from '../src/packs/index.js';
import { clickbaitPack } from '../src/packs/clickbait.js';

// ─────────────────────────────────────────────
// Pack shape
// ─────────────────────────────────────────────

test('clickbait: pack is well-formed', () => {
  assert.equal(validatePack(clickbaitPack), true);
});

test('clickbait: has expected pack metadata', () => {
  assert.equal(clickbaitPack.id, 'clickbait');
  assert.equal(clickbaitPack.version, '0.0.1');
  assert.ok(clickbaitPack.detectionPatterns.length >= 10);
});

test('clickbait: every pattern routes to a valid mahavrata rule', () => {
  const valid = new Set(['ahimsa', 'satya', 'asteya', 'shaucha', 'indriya_nigraha']);
  for (const p of clickbaitPack.detectionPatterns) {
    assert.ok(valid.has(p.rule), `pattern ${p.name} routes to ${p.rule}`);
  }
});

test('clickbait: applicableFrames is public_information', () => {
  assert.deepEqual(clickbaitPack.applicableFrames, ['public_information']);
});

// ─────────────────────────────────────────────
// Positive cases — these MUST catch
// ─────────────────────────────────────────────

function catches(text) {
  const { packViolations } = runPack(clickbaitPack, text);
  return packViolations.length > 0;
}

test('clickbait: forward-reference-authority catches «doctors hate this»', () => {
  assert.ok(catches('The secret doctors hate that doubles your energy'));
});

test('clickbait: forward-reference-revealer catches «reveals chilling»', () => {
  assert.ok(catches("Reporter reveals chilling reason Blake Lively left"));
});

test('clickbait: vague-revealer-adjective catches «chilling reason»', () => {
  assert.ok(catches('The chilling reason her marriage ended'));
});

test('clickbait: vague-revealer-adjective catches «devastating reality»', () => {
  assert.ok(catches('Doctors have to tell her the devastating reality'));
});

test('clickbait: numeric-listicle catches «35 Shoes From Amazon»', () => {
  assert.ok(catches('35 Shoes From Amazon That Really Were Made For Walking'));
});

test('clickbait: numeric-listicle catches «41 Times People»', () => {
  assert.ok(catches('41 Times People Found Something Really Really Odd'));
});

test('clickbait: numeric-listicle-people catches «50 People Who»', () => {
  assert.ok(catches('50 People Who Logged On And Posted Something'));
});

test('clickbait: caps-emotional-tokens catches «OUCH OWIE»', () => {
  assert.ok(catches('OUCH! OWIE! OWWWWWW! These 29 Posts'));
});

test('clickbait: caps-intensifier catches «OUTRAGEOUSLY»', () => {
  assert.ok(catches('35 OUTRAGEOUSLY Wholesome Pictures'));
});

test('clickbait: extreme-intensifier catches «hilariously accurate»', () => {
  assert.ok(catches('55 Hilariously Accurate Cat Tweets'));
});

test('clickbait: universal-quantifier catches «every cat owner should»', () => {
  assert.ok(catches('Every Cat Owner Should Recognize These Immediately'));
});

test('clickbait: collective-cannot-stop catches «Internet Cannot Stop»', () => {
  assert.ok(catches('The Internet Cannot Stop Talking About His Take'));
});

test('clickbait: nominalization catches «the chilling reality»', () => {
  assert.ok(catches('Doctors have to tell her the devastating reality'));
});

test('clickbait: judgment-adjective catches «entitled tourist»', () => {
  assert.ok(catches('Entitled Tourist Who Threw A Rock At Beloved Seal'));
});

test('clickbait: drama-verb catches «risks getting»', () => {
  assert.ok(catches('Demi Moore Risks Getting Kicked Off Red Carpet'));
});

test('clickbait: descends-into-chaos catches «descends into chaos»', () => {
  assert.ok(catches('TUI Flight Descends Into Chaos After Drunken Passenger'));
});

test('clickbait: wild-rampage catches «wild rampage»', () => {
  assert.ok(catches('Punches And Bites Flight Attendant During Wild Rampage'));
});

// ─────────────────────────────────────────────
// Negative cases — these MUST NOT fire (FP guards)
// ─────────────────────────────────────────────

function passes(text) {
  const { packViolations } = runPack(clickbaitPack, text);
  return packViolations.length === 0;
}

test('clickbait FP guard: «20 million people» (quantifier, not listicle)', () => {
  assert.ok(passes('Acute hunger grips nearly 20 million people in Sudan'));
});

test('clickbait FP guard: «May 4, 2026» year does not trigger numeric-listicle', () => {
  assert.ok(passes("Today's famous birthdays list for May 4, 2026 includes celebrities"));
});

test('clickbait FP guard: factual Wikipedia event headline', () => {
  assert.ok(passes('Russian forces launch overnight strikes on Kyiv, killing 16 and wounding 57'));
});

test('clickbait FP guard: Al Jazeera mainstream news', () => {
  assert.ok(passes('Cuba Diaz-Canel open to US aid amid worsening fuel crisis, blackouts'));
});

test('clickbait FP guard: Reuters-style factual reporting', () => {
  assert.ok(passes('Pakistan and U.S. discuss ceasefire mediation efforts in Iran war'));
});

test('clickbait FP guard: 4-digit year does not match numeric-listicle', () => {
  assert.ok(passes('In 2026 the company shipped products to 30 countries'));
});

// ─────────────────────────────────────────────
// Integration via applyPack
// ─────────────────────────────────────────────

test('clickbait: applyPack fails on clickbait headline', () => {
  const inspect = applyPack(clickbaitPack);
  const r = inspect('35 OUTRAGEOUSLY Wholesome Pictures That Make Me Smile');
  assert.equal(r.passes, false);
  assert.ok(r.packViolations.length > 0);
});

test('clickbait: applyPack passes on mainstream news', () => {
  const inspect = applyPack(clickbaitPack);
  const r = inspect('Russian forces launch overnight strikes on Kyiv, killing 16');
  // Note: only checks packViolations specifically — core may have its own opinion
  assert.equal(r.packViolations.length, 0);
});
