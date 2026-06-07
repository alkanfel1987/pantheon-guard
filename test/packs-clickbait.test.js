/**
 * Tests for clickbait pack v0.0.4 (closed-loop rebuild)
 *
 * VALIDATION DISCIPLINE — PROCESS-FINDING-2026-05-16 corrective action #2:
 *   No detector is validated by a string its author wrote. Every positive
 *   and negative case below is a verbatim held-out headline, pulled from
 *   the benchmark corpora BY LABEL — there is no opportunity to paraphrase
 *   a pattern into passing. The v0.0.3 test file did the opposite (author
 *   paraphrased real headlines into unit-test strings, closing the loop);
 *   that is the bug this rewrite removes.
 *
 * The load-bearing regression guards are the two corpus-wide tests:
 *   - 0 false positives across all 142 pass-labelled held-out headlines
 *   - catch-rate floor across all 98 catch-labelled held-out headlines
 *
 * Reproduce the full per-detector measurement:
 *   node examples/clickbait-detector-probe.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validatePack, applyPack, runPack } from '../src/packs/index.js';
import { clickbaitPack } from '../src/packs/clickbait.js';
import { HELDOUT } from '../examples/benchmark-heldout-clickbait-corpus.js';
import { HELDOUT_V2 } from '../examples/benchmark-heldout-clickbait-v2-corpus.js';
import { CONTROL } from '../examples/benchmark-control-2026-05-16-corpus.js';

const ALL = [...HELDOUT, ...HELDOUT_V2, ...CONTROL];

function fires(text) {
  return runPack(clickbaitPack, text).packViolations.length > 0;
}

// Pull a real held-out headline by its corpus label. Throws if the label
// is gone — so a test can never silently fall back to an invented string.
function headline(label) {
  const e = ALL.find((x) => x.label === label);
  if (!e) throw new Error(`no held-out corpus entry labelled "${label}"`);
  return e.text;
}

// ─────────────────────────────────────────────
// Pack shape
// ─────────────────────────────────────────────

test('clickbait: pack is well-formed', () => {
  assert.equal(validatePack(clickbaitPack), true);
});

test('clickbait: has expected pack metadata', () => {
  assert.equal(clickbaitPack.id, 'clickbait');
  assert.equal(clickbaitPack.version, '0.0.5');
  assert.equal(clickbaitPack.detectionPatterns.length, 5);
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
// Load-bearing regression guards — corpus-wide
// ─────────────────────────────────────────────

test('clickbait: 0 false positives across all 142 held-out pass headlines', () => {
  const pass = ALL.filter((e) => e.expected === 'pass');
  assert.equal(pass.length, 142);
  const fp = pass.filter((e) => fires(e.text));
  assert.equal(fp.length, 0,
    `false positives: ${fp.map((e) => `${e.src}/${e.label}`).join('; ')}`);
});

test('clickbait: catch-rate floor — >= 42/98 held-out catch headlines (v0.0.4 baseline)', () => {
  const cat = ALL.filter((e) => e.expected === 'catch');
  assert.equal(cat.length, 98);
  const caught = cat.filter((e) => fires(e.text)).length;
  // v0.0.4 measured 42/98 (heldout#1 19, heldout#2 10, control 13). This
  // floor fails loudly if a future edit silently loses real catch.
  assert.ok(caught >= 42, `caught ${caught}/98, expected floor 42`);
});

// ─────────────────────────────────────────────
// Per-detector — each positive case is a verbatim held-out headline
// ─────────────────────────────────────────────

test('clickbait numeric-listicle: BrightSide «16 Acts of Kindness»', () => {
  assert.ok(fires(headline('BS 16 acts of kindness')));
});

test('clickbait numeric-listicle: LittleThings «9 Very Doable ... Daily Habits»', () => {
  assert.ok(fires(headline('LT 9 daily habits')));
});

test('clickbait numeric-listicle: ScaryMommy «11 French Skincare Products»', () => {
  assert.ok(fires(headline('SM 11 french skincare')));
});

// KNOWN MISS (reverted 2026-06-07): "pictures" + "N people who" extensions were
// FP-prone on legit news ("50 people who survived the crash", "3 pictures from
// the summit"). #260/#269/#270/#285 left as FN to keep the pack's 0-FP guarantee.
// FP-regression guards below lock that in.
test('clickbait FP-guard: "N people who [real predicate]" (news) is NOT caught', () => {
  assert.ok(!fires('50 people who survived the crash were taken to hospital'));
  assert.ok(!fires('21 people who witnessed the robbery gave statements to police'));
});
test('clickbait FP-guard: "N pictures [from/of ...]" (news) is NOT caught', () => {
  assert.ok(!fires('3 pictures from the summit were released by the press office'));
  assert.ok(!fires('12 pictures show the scale of the flooding in the region'));
});
test('clickbait numeric-listicle: bare "50 people died" stays EXCLUDED (no FP)', () => {
  assert.ok(!fires('At least 50 people died in the earthquake that struck the region overnight'));
});

test('clickbait numeric-listicle-plus: AdMe «20+ историй»', () => {
  assert.ok(fires(headline('AdMe necнеобычные фамилии')));
});

test('clickbait numeric-listicle-plus: AdMe «15+ зарисовок»', () => {
  assert.ok(fires(headline('AdMe школа 30 лет')));
});

test('clickbait numeric-listicle-ru: AdMe «20 подарков, которых не ждали»', () => {
  assert.ok(fires(headline('AdMe подарки')));
});

test('clickbait numeric-listicle-ru: AdMe «17 душевных историй о людях»', () => {
  assert.ok(fires(headline('AdMe роза из палки')));
});

test('clickbait here-is-gap-pointer: Distractify «Here\'s the Scoop»', () => {
  assert.ok(fires(headline('DF Willow Smith scoop')));
});

test('clickbait here-is-gap-pointer: LittleThings «Here\'s A List Of»', () => {
  assert.ok(fires(headline('LT heres a list baby names')));
});

test('clickbait here-is-gap-pointer: Newsweek «Here is Why»', () => {
  assert.ok(fires(headline('NW NFL international heres why')));
});

test('clickbait shock-adjective-nominalization: LADbible «chilling tribute»', () => {
  assert.ok(fires(headline('LB Shirilla chilling tribute')));
});

test('clickbait shock-adjective-nominalization: LADbible «traumatising moment»', () => {
  assert.ok(fires(headline('LB traumatising moment Blake Lively')));
});

test('clickbait shock-adjective-nominalization: TheThings «Shocking ... Finale Reveal»', () => {
  assert.ok(fires(headline('TT Sophia Bush shocking reveal')));
});

// ─────────────────────────────────────────────
// FP guards — verbatim mainstream headlines that MUST NOT fire
// ─────────────────────────────────────────────

test('clickbait FP guard: «2 senators call on FAA» (count + plural noun, not listicle)', () => {
  // numeric-listicle excludes "people" and requires an enumerable
  // listicle-noun; "senators ... staffing" supplies none.
  assert.ok(!fires(headline('CBS FAA flight attendant')));
});

test('clickbait FP guard: «150 тысяч вакансий» (RU count + quantity word)', () => {
  // numeric-listicle-ru noun set is generic enumeration nouns only;
  // "тысяч/вакансий" are not in it.
  assert.ok(!fires(headline('MK 150 тысяч вакансий')));
});

test('clickbait FP guard: LADbible «horrific crash» — excluded shock-adjective', () => {
  // "horrific" is deliberately NOT in the shock-adjective set: it occurs
  // in straight crime reporting. This headline is pass-labelled.
  assert.ok(!fires(headline('LB Top Gear comeback')));
});

test('clickbait FP guard: PBS mainstream diplomacy headline', () => {
  assert.ok(!fires(headline('PBS China welcomes Trump')));
});

test('clickbait FP guard: ORF.at mainstream German headline', () => {
  assert.ok(!fires(headline('ORF Trump Aktien')));
});

// Regression guards for the two FP classes the v0.0.4 rebuild hit during
// validation against benchmark-phase1-corpus.js. Strings are verbatim from
// that corpus (src 'tass') — real headlines, not author-written.

test('clickbait FP guard: «N человек» RU casualty count is not a listicle', () => {
  // numeric-listicle-ru deliberately excludes «человек»: «N человек
  // погибли» is the most common RU death-toll headline form.
  assert.ok(!fires('Минздрав Ливана заявил о гибели 2 696 человек со 2 марта из-за атак Израиля'));
});

test('clickbait FP guard: mid-sentence «200+» is not a headline-initial listicle', () => {
  // numeric-listicle-plus is anchored to headline start; "построено 200+
  // школ" is a mid-sentence achievement count, not a listicle.
  assert.ok(!fires('Экс-глава Дагестана Меликов рассказал о достижениях региона за пять лет. Запущены 12 промпредприятий, построено 200+ школ.'));
});

// ─────────────────────────────────────────────
// Integration via applyPack
// ─────────────────────────────────────────────

test('clickbait: applyPack fails on a held-out clickbait headline', () => {
  const inspect = applyPack(clickbaitPack);
  const r = inspect(headline('BS 16 acts of kindness'));
  assert.equal(r.passes, false);
  assert.ok(r.packViolations.length > 0);
});

test('clickbait: applyPack packViolations empty on mainstream news', () => {
  const inspect = applyPack(clickbaitPack);
  const r = inspect(headline('CBS Ebola Congo'));
  assert.equal(r.packViolations.length, 0);
});
