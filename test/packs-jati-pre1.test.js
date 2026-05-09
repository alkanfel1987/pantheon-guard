// Sanity tests for v0.x.0-pre.1 jāti-anchored detectors:
//   - epistemology v0.3.0-pre.1: 5 Nyāya jāti detectors
//   - news v0.5.0-pre.1:        3 Manu/parikīrtana detectors
//
// HONEST FRAMING: these are sanity probes, NOT accuracy claims.
// Author = test-author until real-corpus probe runs (per pack metadata).
// These tests guard against regression of the pattern arrays themselves;
// they say nothing about real-world catch / FP rates.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  epistemologyPack,
  hasNaturalizationFrame,
  hasFalseEquivalence,
  hasAbsenceArgument,
  hasAnecdotalOverride,
  hasSilenceAsConcession,
  hasTemporalQualifier,
  hasScopeQualifier,
} from '../src/packs/epistemology.js';
import { newsPack } from '../src/packs/news.js';

// ─────────────────────────────────────────────
// epistemology v0.3.0-pre.1
// ─────────────────────────────────────────────

test('epistemology v0.3.0-pre.1: pack metadata declares pre.1 status', () => {
  assert.equal(epistemologyPack.id, 'epistemology');
  assert.equal(epistemologyPack.version, '0.3.0-pre.1');
  assert.equal(epistemologyPack.requirements.length, 10);
  assert.equal(epistemologyPack.metadata.v030pre1.addedDetectors.length, 5);
});

test('epistemology v0.3.0-pre.1: naturalization fires on RU + EN positive', () => {
  assert.ok(hasNaturalizationFrame('Бюрократия — это человеческая природа, всегда так было.'));
  assert.ok(hasNaturalizationFrame('Inequality is part of human nature, always been this way.'));
});

test('epistemology v0.3.0-pre.1: naturalization inhibited by temporal qualifier', () => {
  const text = 'В XX веке отношение к этому изменилось радикально.';
  assert.equal(hasNaturalizationFrame(text), false);
  assert.equal(hasTemporalQualifier(text), true);
});

test('epistemology v0.3.0-pre.1: false equivalence fires on RU + EN', () => {
  assert.ok(hasFalseEquivalence('Все политики одинаковы — нет принципиальной разницы.'));
  assert.ok(hasFalseEquivalence('Both sides are equally bad, no real difference between them.'));
});

test('epistemology v0.3.0-pre.1: absence argument inhibited by scope qualifier', () => {
  assert.ok(hasAbsenceArgument('Никто никогда не видел этого, значит этого нет.'));
  const scoped = 'В рамках имеющихся данных по состоянию на 2024 год нет ни одного случая.';
  assert.equal(hasAbsenceArgument(scoped), false);
  assert.equal(hasScopeQualifier(scoped), true);
});

test('epistemology v0.3.0-pre.1: anecdotal override fires on first-person experience', () => {
  assert.ok(hasAnecdotalOverride('Я лично видел обратное, поэтому исследования бессмысленны.'));
  assert.ok(hasAnecdotalOverride('In my 20 years of practice I have never seen this.'));
});

test('epistemology v0.3.0-pre.1: silence as concession fires on RU + EN', () => {
  assert.ok(hasSilenceAsConcession('Министерство отказалось комментировать, что говорит само за себя.'));
  assert.ok(hasSilenceAsConcession('Their silence speaks volumes about what they really think.'));
});

test('epistemology v0.3.0-pre.1: neutral text does not fire jāti detectors', () => {
  const neutral = 'Согласно отчёту Reuters от 14 марта, компания подтвердила сделку.';
  assert.equal(hasNaturalizationFrame(neutral), false);
  assert.equal(hasFalseEquivalence(neutral), false);
  assert.equal(hasAbsenceArgument(neutral), false);
  assert.equal(hasAnecdotalOverride(neutral), false);
  assert.equal(hasSilenceAsConcession(neutral), false);
});

// ─────────────────────────────────────────────
// news v0.5.0-pre.1
// ─────────────────────────────────────────────

test('news v0.5.0-pre.1: pack metadata declares pre.1 status', () => {
  assert.equal(newsPack.id, 'news');
  assert.equal(newsPack.version, '0.5.0-pre.1');
  assert.equal(newsPack.metadata.v050pre1.addedDetectors.length, 3);
});

test('news v0.5.0-pre.1: parikīrtana detectors loaded into pack', () => {
  const parikPatterns = newsPack.detectionPatterns.filter(p => p.name.includes('parikirtana'));
  assert.equal(parikPatterns.length, 3);
  // Each must route to satya — parikīrtana is a satya-class violation
  for (const p of parikPatterns) {
    assert.equal(p.rule, 'satya');
  }
});

test('news v0.5.0-pre.1: parikīrtana fires on first-person quantified giving (RU)', () => {
  const patterns = newsPack.detectionPatterns.filter(p => p.name.includes('parikirtana'));
  const samples = [
    'Мы помогли уже 500 семьям в этом году.',
    'Наша компания инвестировала более 10 млн в благотворительность.',
  ];
  for (const text of samples) {
    const hit = patterns.some(p => p.regex.test(text));
    assert.ok(hit, `expected hit on RU sample: ${text}`);
  }
});

test('news v0.5.0-pre.1: parikīrtana fires on first-person quantified giving (EN)', () => {
  const patterns = newsPack.detectionPatterns.filter(p => p.name.includes('parikirtana'));
  const samples = [
    'We have donated over $5 million to community projects this year.',
    'Our firm invested $200 million in green initiatives.',
  ];
  for (const text of samples) {
    const hit = patterns.some(p => p.regex.test(text));
    assert.ok(hit, `expected hit on EN sample: ${text}`);
  }
});

test('news v0.5.0-pre.1: parikīrtana skips third-party reportage', () => {
  const patterns = newsPack.detectionPatterns.filter(p => p.name.includes('parikirtana'));
  // Third-party reportage with attribution — should NOT fire (no inhibitor wired
  // yet in pre.1, but the patterns require first-person voice at minimum).
  const samples = [
    'Компания "Сбер" пожертвовала 100 млн рублей в фонд по сообщению Reuters.',
    'According to Bloomberg, Microsoft donated $50 million.',
    'Reuters сообщает, что фирма выделила средства на проект.',
  ];
  for (const text of samples) {
    const hit = patterns.some(p => p.regex.test(text));
    assert.equal(hit, false, `unexpected FP on third-party sample: ${text}`);
  }
});

test('news v0.5.0-pre.1: dharma-flag self-label fires on responsible-self framing', () => {
  const patterns = newsPack.detectionPatterns.filter(p => p.name.includes('responsible_self_label'));
  assert.equal(patterns.length, 1);
  assert.ok(patterns[0].regex.test('Как ответственная компания, мы продолжаем поддерживать инициативы.'));
});
