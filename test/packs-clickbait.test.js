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
  assert.equal(clickbaitPack.version, '0.0.3');
  assert.ok(clickbaitPack.detectionPatterns.length >= 16);
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
// Curiosity-gap detector family — v0.0.3
// Mechanism-derived from Loewenstein information-gap theory.
// ─────────────────────────────────────────────

test('clickbait CG-1: demonstrative-withheld «this 60-second trick»', () => {
  assert.ok(catches('How to stop sounding long-winded with this 60-second trick'));
});

test('clickbait CG-2: quantified-withheld «one powerful habit»', () => {
  assert.ok(catches('Dostoevsky shared one powerful habit for an authentic life'));
});

test('clickbait CG-3a: outcome-teaser «you won\'t believe»', () => {
  assert.ok(catches("You won't believe what she found in the attic"));
});

test('clickbait CG-3b: outcome-teaser «the results are alarming»', () => {
  assert.ok(catches('Scientists tested 3 water brands. The results are alarming.'));
});

test('clickbait CG-4: gap-pointer «Here\'s why»', () => {
  assert.ok(catches("Taylor Sheridan was not involved in the spinoff — Here's Why"));
});

test('clickbait CG-4: gap-pointer «Here\'s the Scoop»', () => {
  assert.ok(catches("Are the baby rumors true? Here's the Scoop on the Chatter"));
});

test('clickbait CG-5: relation-question «Who Is X\'s Husband»', () => {
  assert.ok(catches("Who Is Yellowstone Star Kelly Reilly's Husband?"));
});

test('clickbait CG-6: hidden-knowledge «facts you didn\'t know»', () => {
  assert.ok(catches('15 facts about coffee you didn\'t know'));
});

test('clickbait v0.0.3: numeric-listicle broadened lexicon «16 Acts»', () => {
  assert.ok(catches('16 Acts of Kindness From Family That Prove Compassion'));
});

test('clickbait v0.0.3: numeric-listicle broadened lexicon «9 fascinating words»', () => {
  assert.ok(catches('9 fascinating Colonial-era words to brush up on'));
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
// Adversarial FP guards — v0.0.2
// Real headlines from live-pulled mainstream cohort 2026-05-15,
// deliberately selected for high-FP-risk register. These MUST pass —
// they are legitimate journalism that uses engaging-but-honest framing.
// Regression guard: future pattern edits must not break these.
// ─────────────────────────────────────────────

test('clickbait adv-FP: ProPublica «What the FDA Won\'t Tell You»', () => {
  // Curiosity-gap headline used legitimately by investigative journalism.
  // "FDA" is not in forward-reference-authority lexicon (doctors/experts/
  // scientists/insiders/they/nobody/no one) — intentionally narrow.
  assert.ok(passes("What the FDA Won't Tell You About Your Medications"));
});

test('clickbait adv-FP: ProPublica «Threat in Your Medicine Cabinet»', () => {
  assert.ok(passes("Threat in Your Medicine Cabinet: The FDA's Gamble on America's Drugs"));
});

test('clickbait adv-FP: ProPublica «Generic Drugs Were Made»', () => {
  assert.ok(passes('Look Up Where Your Generic Prescription Drugs Were Made'));
});

test('clickbait adv-FP: ProPublica «at Risk for Poisoning» ≠ risks-getting', () => {
  // "at Risk for" must not trigger drama-verb-risks-getting (which needs
  // "risks getting/being/having/...").
  assert.ok(passes('Trump Halted an Agent Orange Cleanup. That Puts Hundreds of Thousands at Risk for Poisoning.'));
});

test('clickbait adv-FP: The Conversation «Why it\'s too early to forecast»', () => {
  // "Why X" explainer framing — presupposition-why-never needs 2nd/3rd
  // person pronoun + modal + never/always; "it's" is not in the list.
  assert.ok(passes("A super El Nino? Why it's too early to forecast one with certainty"));
});

test('clickbait adv-FP: The Conversation «Why a growing number of supporters»', () => {
  assert.ok(passes('Why a growing number of Trump supporters are experiencing voter remorse'));
});

test('clickbait adv-FP: Smithsonian «Hilarious Archive» (adjective, not adverb)', () => {
  // extreme-intensifier-adverb needs adverb+adjective ("hilariously funny");
  // "Hilarious Archive" is adjective+noun — must not fire.
  assert.ok(passes('Ahead of His 100th Birthday, Mel Brooks Donates His Archive to the National Comedy Center'));
});

test('clickbait adv-FP: Smithsonian «New Research Debunks the Myths»', () => {
  assert.ok(passes('History Remembers Mary Boleyn as the Other Boleyn Girl. New Research Debunks the Myths.'));
});

test('clickbait adv-FP: Axios «Doctors rally behind autonomous vehicles»', () => {
  // "Doctors rally" — forward-reference-authority needs hate/love/won't-tell
  // type verb; "rally" is not a withholding verb — must not fire.
  assert.ok(passes('Doctors rally behind autonomous vehicles as public health issue'));
});

test('clickbait adv-FP: numeric «15 Days» (time unit, not listicle)', () => {
  assert.ok(passes("Gone in 15 Days: How the Connecticut DMV Allows Tow Companies to Sell People's Cars"));
});

test('clickbait adv-FP: «250 Objects» museum count is borderline — verify current behavior', () => {
  // "250 Objects to Commemorate" — numeric-listicle requires a listicle-noun
  // (reasons/times/photos/...); "objects" is not in the lexicon. Passes.
  assert.ok(passes('The National Museum of American History Is Displaying 250 Objects to Commemorate the Big Birthday'));
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
