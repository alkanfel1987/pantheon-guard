import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyPack,
  stackPacks,
  validatePack,
  runPack,
} from '../src/packs/index.js';
import { healthcarePack } from '../src/packs/healthcare.js';

// ─────────────────────────────────────────────
// validatePack
// ─────────────────────────────────────────────

test('validatePack: healthcarePack is well-formed', () => {
  assert.equal(validatePack(healthcarePack), true);
});

test('validatePack: rejects pack with bad rule routing', () => {
  const bad = {
    id: 'bad',
    version: '0.1.0',
    description: '',
    detectionPatterns: [{ rule: 'made_up', name: 'x', regex: /test/ }],
    requirements: [],
  };
  assert.throws(() => validatePack(bad), /unknown rule/);
});

test('validatePack: rejects pack with bad severity', () => {
  const bad = {
    id: 'bad',
    version: '0.1.0',
    description: '',
    detectionPatterns: [],
    requirements: [{
      id: 'x',
      condition: () => true,
      check:     () => false,
      severity: 'extreme',           // not in low|medium|high
      message: 'x',
    }],
  };
  assert.throws(() => validatePack(bad), /severity must be/);
});

// ─────────────────────────────────────────────
// runPack — direct pattern + requirement checks
// ─────────────────────────────────────────────

test('runPack: catches self-diagnosis overclaim → satya', () => {
  const r = runPack(healthcarePack, 'You definitely have early-stage diabetes based on these symptoms.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('self_dx_en')));
});

test('runPack: catches cure / guarantee claim → satya', () => {
  const r = runPack(healthcarePack, 'This new supplement is guaranteed to cure your condition. Talk to a doctor before trying.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('cure_claim')));
});

test('runPack: catches false reassurance → satya', () => {
  const r = runPack(healthcarePack, "Your chest pain is nothing to worry about, completely safe. Talk to a doctor if it persists.");
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('false_reassurance')));
});

test('runPack: catches medication-adjustment → ahimsa', () => {
  const r = runPack(healthcarePack, "Just stop taking your medication if you feel better. Consult a physician later.");
  assert.ok(r.packViolations.some(v => v.rule === 'ahimsa' && v.source.includes('med_adjust')));
});

test('runPack: catches dismissal of red-flag symptoms → ahimsa', () => {
  const r = runPack(
    healthcarePack,
    'You mentioned chest pain — probably nothing, just stress. See a doctor if it gets worse.'
  );
  assert.ok(r.packViolations.some(v => v.rule === 'ahimsa' && v.source.includes('serious_dismissal')));
});

test('runPack: catches "studies show" without source → satya', () => {
  const r = runPack(healthcarePack, 'Studies show this treatment works for everyone. Discuss with a healthcare provider.');
  assert.ok(r.packViolations.some(v => v.rule === 'satya' && v.source.includes('studies_show')));
});

test('runPack: "studies show" with PubMed reference does NOT fire', () => {
  const r = runPack(
    healthcarePack,
    'Studies show this treatment is promising — see PubMed PMID: 12345678. Talk to your doctor.'
  );
  assert.equal(
    r.packViolations.filter(v => v.source.includes('studies_show')).length,
    0,
    'studies_show pattern should be suppressed by source citation'
  );
});

test('runPack: medical context WITHOUT provider escalation → unmet requirement', () => {
  const r = runPack(
    healthcarePack,
    'Here is some information about diabetes symptoms and treatment options for you to consider.'
  );
  assert.ok(
    r.unmetRequirements.some(u => u.id.endsWith('/provider_escalation')),
    'provider_escalation requirement should fire on medical text without escalation language'
  );
});

test('runPack: medical context WITH provider escalation → no unmet requirement', () => {
  const r = runPack(
    healthcarePack,
    'Here is some information about diabetes treatment. Please consult a doctor before making changes.'
  );
  assert.equal(
    r.unmetRequirements.filter(u => u.id.endsWith('/provider_escalation')).length,
    0,
    'provider_escalation should be satisfied'
  );
});

test('runPack: non-medical text bypasses provider-escalation requirement', () => {
  const r = runPack(
    healthcarePack,
    'The marketing dashboard renders weekly reports and supports custom date ranges.'
  );
  assert.equal(r.unmetRequirements.length, 0);
});

test('runPack: provider-escalation requirement works in Russian', () => {
  const noEscalation = runPack(
    healthcarePack,
    'Симптомы похожи на простуду, попробуйте отдохнуть и пить больше жидкости.'
  );
  assert.ok(
    noEscalation.unmetRequirements.some(u => u.id.endsWith('/provider_escalation'))
  );

  const withEscalation = runPack(
    healthcarePack,
    'Симптомы похожи на простуду. Обратитесь к врачу, если состояние не улучшится за 3 дня.'
  );
  assert.equal(
    withEscalation.unmetRequirements.filter(u => u.id.endsWith('/provider_escalation')).length,
    0
  );
});

// ─────────────────────────────────────────────
// applyPack — full pipeline integration
// ─────────────────────────────────────────────

test('applyPack: clean medical text WITH escalation passes', () => {
  const inspectHealth = applyPack(healthcarePack);
  const r = inspectHealth(
    'Mild headaches can be caused by dehydration. Drink water, rest, and consult a doctor if symptoms persist beyond two days.',
    { urgency: 0.2, paused: true }
  );
  assert.equal(r.passes, true);
  assert.equal(r.packViolations.length, 0);
  assert.equal(r.unmetRequirements.length, 0);
  assert.equal(r.pack.id, 'healthcare');
});

test('applyPack: manipulative medical text fails the pack', () => {
  const inspectHealth = applyPack(healthcarePack);
  const r = inspectHealth(
    "You definitely have early diabetes. Just stop taking your medication and you'll be fine. " +
    "Hurry, this miracle cure is 100% effective only this week!",
    { urgency: 0.95, paused: false }
  );
  assert.equal(r.passes, false);
  assert.ok(r.packViolations.length >= 2,
    `expected ≥2 pack violations, got ${r.packViolations.length}`);
});

test('applyPack: pack-violations route through correct mahā-vrata rules', () => {
  const inspectHealth = applyPack(healthcarePack);
  const r = inspectHealth(
    'You definitely have a thyroid disorder. Just stop taking your medication. Consult a doctor.',
    { urgency: 0.3, paused: true }
  );
  const rules = new Set(r.packViolations.map(v => v.rule));
  assert.ok(rules.has('satya'), 'self-dx claim should route through satya');
  assert.ok(rules.has('ahimsa'), 'med-adjust claim should route through ahimsa');
});

test('applyPack: provider-escalation missing → blocks even on otherwise-clean text', () => {
  const inspectHealth = applyPack(healthcarePack);
  const r = inspectHealth(
    'Diabetes management involves diet, exercise, and medication. Many people benefit from regular monitoring.',
    { urgency: 0.2, paused: true }
  );
  assert.equal(r.passes, false);
  assert.ok(r.unmetRequirements.some(u => u.id === 'healthcare/provider_escalation'));
});

// ─────────────────────────────────────────────
// stackPacks — multi-pack composition
// ─────────────────────────────────────────────

test('stackPacks: stacking healthcare with itself merges evidence', () => {
  // Trivially valid: stacking the same pack twice should give 2× the violations
  // on a manipulative input. Useful as a sanity check for the merge path.
  const inspectStack = stackPacks([healthcarePack, healthcarePack]);
  const r = inspectStack(
    'You definitely have a serious disease. Talk to a doctor.',
    { urgency: 0.2, paused: true }
  );
  // Each pack independently catches self_dx_en, so we should see 2 entries.
  const selfDx = r.packViolations.filter(v => v.source.includes('self_dx_en'));
  assert.equal(selfDx.length, 2);
  assert.equal(r.packs.length, 2);
});
