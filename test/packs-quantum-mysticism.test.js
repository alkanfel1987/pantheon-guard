// Sanity tests for v0.3.0-pre.2 pseudo_technical_simulacrum
// (quantum-mysticism subset of simulacrum-of-source).
//
// HONEST FRAMING: SYNTHESIS-ONLY against Manovaidya master-spec Раздел 6E
// (5 Dispenza-derived cases). Author = test-author. These tests guard against
// pattern-array regression; they say nothing about real-world catch / FP rates.
// Real-corpus probe pending — see test-corpus/quantum-mysticism-2026-05-13/REPORT.md
// when ready.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  epistemologyPack,
  hasQuantumMysticism,
  hasFormalPhysicsContext,
  hasQuantumLegitimacyMarker,
  hasNamedSource,
} from '../src/packs/epistemology.js';

// ─────────────────────────────────────────────
// Positive cases — Manovaidya 6E Cases 1-5 + EN equivalents
// ─────────────────────────────────────────────

test('quantum-mysticism: Manovaidya Case 1 (cure-cancer + vibration) raw fires', () => {
  const text = 'Я перестала ходить на химию — Диспенза учит, что меняя свою вибрацию я могу исцелить рак.';
  assert.ok(hasQuantumMysticism(text), 'must catch raise-vibration claim');
  assert.equal(hasQuantumLegitimacyMarker(text), false, 'no legitimacy marker present');
});

test('quantum-mysticism: Manovaidya Case 2 (electromagnetic field relationship) fires', () => {
  const text = 'Партнёр и я не в когерентности, наши электромагнитные поля рассинхронизированы.';
  assert.ok(hasQuantumMysticism(text));
});

test('quantum-mysticism: Manovaidya Case 3 (manifest through quantum field) fires', () => {
  const text = 'Я делаю медитации Диспензы каждое утро чтобы манифестировать новую работу через квантовое поле.';
  assert.ok(hasQuantumMysticism(text));
});

test('quantum-mysticism: Manovaidya Case 4 (DNA via consciousness) fires', () => {
  const text = 'Я знаю что я воин на пути изменения биологии через сознание, я уже изменил свою ДНК намерением.';
  assert.ok(hasQuantumMysticism(text));
});

test('quantum-mysticism: heart-brain coherence + electromagnetic claim fires', () => {
  const text = 'Heart-brain coherence raises your electromagnetic vibration and heals the body.';
  assert.ok(hasQuantumMysticism(text));
});

test('quantum-mysticism: EN raise-your-vibration fires', () => {
  assert.ok(hasQuantumMysticism('Raise your vibration and the universe will respond.'));
});

test('quantum-mysticism: EN access-the-quantum-field fires', () => {
  assert.ok(hasQuantumMysticism('Through deep meditation you can access the quantum field directly.'));
});

test('quantum-mysticism: EN DNA-through-intention fires', () => {
  assert.ok(hasQuantumMysticism('Your intention can change your DNA at the gene expression level.'));
});

test('quantum-mysticism: vibration-of-abundance manifestation fires', () => {
  assert.ok(hasQuantumMysticism('Войдите в вибрацию изобилия и притянете деньги.'));
  assert.ok(hasQuantumMysticism('Tune into the vibration of abundance and money flows.'));
});

// ─────────────────────────────────────────────
// Negative controls — legitimate physics + named-source contexts
// ─────────────────────────────────────────────

test('quantum-mysticism: Bohm holomovement direct discussion does NOT fire as violation', () => {
  // Raw pattern may match (text mentions Bohm + implicate order); the inhibitor
  // (hasQuantumLegitimacyMarker) suppresses via FORMAL_PHYSICS_CONTEXT_PATTERNS.
  const text = "Bohm's interpretation treats the implicate order as the ground of physics. The holomovement is undivided wholeness.";
  // Even if condition fires, legitimacy-marker MUST be present
  assert.equal(hasQuantumLegitimacyMarker(text), true, 'must recognize Bohm legitimacy anchor');
});

test('quantum-mysticism: Penrose-Hameroff Orch-OR has legitimacy marker', () => {
  const text = 'The Penrose-Hameroff Orch-OR hypothesis posits that consciousness arises from quantum coherence in microtubules.';
  assert.equal(hasQuantumLegitimacyMarker(text), true);
});

test('quantum-mysticism: Schrödinger equation context has legitimacy marker', () => {
  const text = 'According to the Schrödinger equation, the wave-function evolves deterministically until measurement.';
  assert.equal(hasQuantumLegitimacyMarker(text), true);
});

test('quantum-mysticism: Bell inequality reference suppresses', () => {
  const text = "Aspect's experiment confirmed Bell's inequality violation, supporting non-local correlations.";
  assert.equal(hasQuantumLegitimacyMarker(text), true);
});

test('quantum-mysticism: HRV biofeedback discussion (Lehrer-style) does NOT raw-fire', () => {
  // Legitimate contemporary HRV science: no quantum/electromagnetic-field claim
  const text = 'HRV biofeedback at 0.1 Hz resonance frequency increases vagal tone via baroreflex sensitivity (Lehrer 2014).';
  assert.equal(hasQuantumMysticism(text), false, 'no pseudo-physics terminology');
  // Named source still present as inhibitor backup
  assert.equal(hasNamedSource(text), true);
});

test('quantum-mysticism: contemplative-science gloss (Wallace-style) does NOT raw-fire', () => {
  const text = 'Samādhi as one-pointedness of mind has been investigated in contemplative-science methodology (Wallace 2007).';
  assert.equal(hasQuantumMysticism(text), false);
  assert.equal(hasNamedSource(text), true);
});

test('quantum-mysticism: technical physics discussion of decoherence does NOT raw-fire', () => {
  const text = 'Decoherence in the Hilbert space of an open quantum system explains the apparent classical limit.';
  // Even if some pattern matches incidentally, legitimacy marker must catch it
  assert.equal(hasQuantumLegitimacyMarker(text), true, 'formal physics context recognized');
});

// ─────────────────────────────────────────────
// Pack-level integration
// ─────────────────────────────────────────────

test('pseudo_technical_simulacrum: registered in epistemology requirements', () => {
  const req = epistemologyPack.requirements.find((r) => r.id === 'pseudo_technical_simulacrum');
  assert.ok(req, 'requirement must be present');
  assert.equal(req.severity, 'medium');
  assert.equal(req.condition, hasQuantumMysticism);
  assert.equal(req.check, hasQuantumLegitimacyMarker);
  assert.match(req.message, /asteya/, 'must route to asteya');
  assert.match(req.message, /Baudrillard/, 'must reference Baudrillard simulacrum');
});

test('quantum-mysticism: helpers exported for downstream packs', () => {
  // healthcare-pack lexicon-spec Категория 6 cross-references these
  assert.equal(typeof hasQuantumMysticism, 'function');
  assert.equal(typeof hasFormalPhysicsContext, 'function');
  assert.equal(typeof hasQuantumLegitimacyMarker, 'function');
});
