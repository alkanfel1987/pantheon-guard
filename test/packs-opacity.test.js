/**
 * test/packs-opacity.test.js — opacity pack v0.3.1 sanity + Я-4 evidence surface
 *
 * Coverage:
 *   1. detectOpacity returns expected verdict for clean / opaque text
 *   2. anyOpacityViolation gates the requirement
 *   3. NEW (Я-4): unmetRequirements item carries `evidence: string[]` of
 *      matched lexicon tokens when the rule fires — material the upstream
 *      caller can show to the author for shadow-integration / rephrase,
 *      rather than a blanket block.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyPack } from '../src/packs/index.js';
import { opacityPack, detectOpacity } from '../src/packs/opacity.js';

const inspectWithOpacity = applyPack(opacityPack);

test('opacity: clean technical prose passes', () => {
  const text =
    'The function takes a list of integers and returns their sum. ' +
    'Edge case: empty list returns zero.';
  const r = inspectWithOpacity(text);
  assert.equal(r.unmetRequirements.length, 0);
});

test('opacity: marketing-style jargon-stack triggers requirement', () => {
  const text =
    'Our scalable, end-to-end customer-engagement platform leverages ' +
    'AI-driven insights to optimize your conversion funnel, accelerate ' +
    'growth, and unlock unprecedented ROI through synergistic, ' +
    'omnichannel touchpoints across every customer segment.';
  const r = inspectWithOpacity(text);
  const opacityUnmet = r.unmetRequirements.filter(
    (u) => u.id === 'opacity/jargon_density_opacity'
  );
  assert.equal(opacityUnmet.length, 1, 'expected exactly one opacity unmet');
});

test('opacity: unmetRequirements carries evidence array (Я-4 shadow-integration)', () => {
  const text =
    'Our scalable, end-to-end customer-engagement platform leverages ' +
    'AI-driven insights to optimize conversion funnel growth ROI ' +
    'omnichannel customer segment retention engagement automation.';
  const r = inspectWithOpacity(text);
  const opacityUnmet = r.unmetRequirements.find(
    (u) => u.id === 'opacity/jargon_density_opacity'
  );
  assert.ok(opacityUnmet, 'opacity requirement must fire on jargon-stack');
  assert.ok(Array.isArray(opacityUnmet.evidence), 'evidence must be array');
  assert.ok(opacityUnmet.evidence.length > 0, 'evidence must list matched tokens');
  // Evidence format: "<lang>:<token>"
  for (const ev of opacityUnmet.evidence) {
    assert.match(ev, /^[a-z]{2}:[\p{L}\p{N}_-]+$/u);
  }
});

test('opacity: clean text yields no evidence (no rule fire)', () => {
  const text =
    'The HTTP request returned a 404 status code. The function should ' +
    'handle this case by logging the error and retrying once.';
  const r = inspectWithOpacity(text);
  const opacityUnmet = r.unmetRequirements.find(
    (u) => u.id === 'opacity/jargon_density_opacity'
  );
  assert.equal(opacityUnmet, undefined);
});

test('opacity: detectOpacity verdict and matchedWords align', () => {
  const text =
    'Scalable end-to-end platform leverages AI-driven insights to optimize ' +
    'conversion funnel growth ROI omnichannel segment retention engagement.';
  const r = detectOpacity(text, 'en');
  assert.ok(['opacity_violation_high', 'opacity_violation_medium'].includes(r.verdict));
  assert.ok(r.matchedWords.length > 0);
  assert.ok(r.uniqueCount >= 3);
});

test('opacity: pack metadata has v0.3.1 + correct catalogue anchors', () => {
  assert.match(opacityPack.version, /^0\.3\.1/);
  assert.deepEqual(
    [...opacityPack.metadata.catalogueAnchors].sort(),
    ['ns-avijnatartha-5-2-9', 'ns-nirarthaka-5-2-8'].sort()
  );
});
