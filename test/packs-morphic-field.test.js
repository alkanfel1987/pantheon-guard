// Sanity tests for v0.3.0-pre.4 morphic_field_simulacrum
// (Sheldrake-style fringe-biology subset of simulacrum-of-source).
//
// HONEST FRAMING: SYNTHESIS-ONLY against Foundation 09 §4.2 + Шелдрейк-Руперт.md
// case study. Patterns derived from Sheldrake's own verbatim quotes (fetched
// 2026-05-13 sheldrake.org/research/morphic-resonance) + canonical Sheldrake
// formulations. Author = test-author. Real-corpus probe pending — see
// test-corpus/morphic-field-2026-05-13/REPORT.md.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  epistemologyPack,
  hasMorphicFieldMisuse,
  hasMainstreamEmbryologyContext,
  hasMorphicFieldLegitimacyMarker,
  hasNamedSource,
} from '../src/packs/epistemology.js';

// ─────────────────────────────────────────────
// Positive cases — Sheldrake verbatim + canonical formulations
// ─────────────────────────────────────────────

test('morphic-field: Sheldrake P-SHELDRAKE-1 (laws of nature are habits) fires raw', () => {
  const text = 'Morphic resonance means that the so-called laws of nature are more like habits.';
  assert.ok(hasMorphicFieldMisuse(text), 'must catch laws-of-nature-are-habits canonical formulation');
});

test('morphic-field: Sheldrake P-SHELDRAKE-2 (TV-receiver brains) fires raw', () => {
  const text = 'Memory need not be stored in material traces inside brains, which are more like TV receivers than video recorders.';
  assert.ok(hasMorphicFieldMisuse(text));
});

test('morphic-field: Sheldrake P-SHELDRAKE-3 (collective memory of species) fires raw', () => {
  const text = 'Each individual inherits a collective memory from past members of the species, and also contributes to the collective memory.';
  assert.ok(hasMorphicFieldMisuse(text));
});

test('morphic-field: Sheldrake P-SHELDRAKE-4 (morphic fields contain attractors) fires raw', () => {
  const text = 'Morphic fields contain attractors (goals) and chreodes (habitual pathways towards those goals) that guide a system toward its end state.';
  assert.ok(hasMorphicFieldMisuse(text));
});

test('morphic-field: Sheldrake P-SHELDRAKE-5 (self-organising inherit memory) fires raw', () => {
  const text = 'Self-organising systems inherit a memory from previous similar systems through morphic resonance.';
  assert.ok(hasMorphicFieldMisuse(text));
});

test('morphic-field: RU морфическое поле + памят fires', () => {
  const text = 'Морфические поля передают коллективную память вида от поколения к поколению.';
  assert.ok(hasMorphicFieldMisuse(text));
});

test('morphic-field: RU законы природы — привычки fires', () => {
  const text = 'Согласно гипотезе, законы природы — это скорее привычки, чем неизменные правила.';
  assert.ok(hasMorphicFieldMisuse(text));
});

// ─────────────────────────────────────────────
// Negative controls — mainstream embryology
// ─────────────────────────────────────────────

test('morphic-field: Spemann-Mangold organizer experiment has legit marker', () => {
  const text = 'The Spemann-Mangold organizer experiment demonstrated that transplanted dorsal lip induces a secondary embryonic axis.';
  assert.equal(hasMainstreamEmbryologyContext(text), true, 'Spemann-Mangold must inhibit');
  assert.equal(hasMorphicFieldLegitimacyMarker(text), true);
});

test('morphic-field: Wolpert positional information has legit marker', () => {
  const text = 'According to Wolpert positional information theory, cells acquire fate based on morphogen gradients.';
  assert.equal(hasMainstreamEmbryologyContext(text), true);
});

test('morphic-field: gene expression assay has legit marker', () => {
  const text = 'In situ hybridization revealed gene expression pattern matching morphogen gradient signaling.';
  assert.equal(hasMainstreamEmbryologyContext(text), true);
});

test('morphic-field: mainstream morphogenetic field text does NOT fire raw', () => {
  // Spemann organizer / signaling pathway context — does NOT use Sheldrake-canonical
  // memory/collective/inheritance/habit phrasing
  const text = 'The morphogenetic field is established by induction signals from the organizer region during gastrulation.';
  assert.equal(hasMorphicFieldMisuse(text), false, 'mainstream embryology must not raw-fire');
});

test('morphic-field: proper Sheldrake attribution gets inhibited', () => {
  // Researcher citing Sheldrake properly — third-party reportage, NOT endorsement
  const text = 'Sheldrake (1981) proposed morphic resonance as a mechanism by which species inherit collective memory.';
  // Raw pattern fires (collective memory of species)
  assert.ok(hasMorphicFieldMisuse(text), 'raw pattern fires on Sheldrake phrasing');
  // But inhibitor catches via NAMED_SOURCE (Sheldrake + year)
  assert.equal(hasNamedSource(text), true, 'named-source inhibitor recognizes Sheldrake (1981)');
  assert.equal(hasMorphicFieldLegitimacyMarker(text), true);
});

// ─────────────────────────────────────────────
// Pack-level integration
// ─────────────────────────────────────────────

test('morphic_field_simulacrum: registered in epistemology requirements', () => {
  const req = epistemologyPack.requirements.find((r) => r.id === 'morphic_field_simulacrum');
  assert.ok(req, 'requirement must be present');
  assert.equal(req.severity, 'medium');
  assert.equal(req.condition, hasMorphicFieldMisuse);
  assert.equal(req.check, hasMorphicFieldLegitimacyMarker);
  assert.match(req.message, /asteya/, 'must route to asteya');
  assert.match(req.message, /Baudrillard/, 'must reference Baudrillard simulacrum');
});

test('morphic-field: helpers exported', () => {
  assert.equal(typeof hasMorphicFieldMisuse, 'function');
  assert.equal(typeof hasMainstreamEmbryologyContext, 'function');
  assert.equal(typeof hasMorphicFieldLegitimacyMarker, 'function');
});

test('epistemology v0.3.0-pre.5+: morphic_field_simulacrum registered + count stable', () => {
  // pre.5 added gap-class broadening to absence_argument (no new requirement),
  // so requirement count stays at 12 from pre.4
  assert.match(epistemologyPack.version, /^0\.3\.0-pre\.[4-9]/);
  assert.equal(epistemologyPack.requirements.length, 12);
});
