import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  getIntegrity,
  assertRuleSetHash,
  getBuildFingerprint,
} from '../src/integrity.js';

test('getIntegrity: returns library, version, hashes, covered list', () => {
  const i = getIntegrity();
  assert.equal(i.library, 'pantheon-guard');
  assert.equal(typeof i.library_version, 'string');
  assert.equal(typeof i.rule_set_hash, 'string');
  assert.equal(i.rule_set_hash.length, 64);
  assert.equal(typeof i.calibrator_params_hash, 'string');
  assert.equal(i.calibrator_params_hash.length, 64);
  assert.ok(Array.isArray(i.covered));
  assert.ok(i.covered.includes('MAHAVRATA'));
  assert.ok(i.covered.includes('LAWS'));
});

test('getIntegrity: hashes stable across calls', () => {
  const a = getIntegrity();
  const b = getIntegrity();
  assert.equal(a.rule_set_hash, b.rule_set_hash);
  assert.equal(a.calibrator_params_hash, b.calibrator_params_hash);
});

test('assertRuleSetHash: matching expected hash passes', () => {
  const i = getIntegrity();
  assert.doesNotThrow(() => assertRuleSetHash(i.rule_set_hash));
});

test('assertRuleSetHash: mismatched expected hash throws', () => {
  const wrong = '0'.repeat(64);
  assert.throws(() => assertRuleSetHash(wrong), /rule set hash mismatch/);
});

test('assertRuleSetHash: malformed hash throws', () => {
  assert.throws(() => assertRuleSetHash('short'), /64-char hex/);
  assert.throws(() => assertRuleSetHash(123),     /64-char hex/);
});

test('getBuildFingerprint: 16-char hex', () => {
  const fp = getBuildFingerprint();
  assert.equal(fp.length, 16);
  assert.match(fp, /^[0-9a-f]+$/);
});

test('getBuildFingerprint: stable across calls', () => {
  assert.equal(getBuildFingerprint(), getBuildFingerprint());
});
