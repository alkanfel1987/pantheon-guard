import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  canonicalize, signPayload, verifyPayload,
  inspectSigned, verifySignedVerdict,
} from '../src/sign.js';

const SECRET = 'test-secret-do-not-use-in-production';

// ─────────────────────────────────────────────
// canonicalize
// ─────────────────────────────────────────────

test('canonicalize: stable across key reorderings', () => {
  const a = { x: 1, y: 2, z: { b: 1, a: 2 } };
  const b = { z: { a: 2, b: 1 }, y: 2, x: 1 };
  assert.equal(canonicalize(a), canonicalize(b));
});

test('canonicalize: stable for nested arrays and primitives', () => {
  const v = { arr: [3, 1, 2], n: null, t: true, s: 'hello' };
  // Idempotent: canonicalize(JSON.parse(canonicalize(v))) === canonicalize(v)
  assert.equal(canonicalize(JSON.parse(canonicalize(v))), canonicalize(v));
});

// ─────────────────────────────────────────────
// signPayload / verifyPayload
// ─────────────────────────────────────────────

test('sign + verify: round-trip succeeds', () => {
  const payload = { foo: 'bar', n: 42 };
  const sig = signPayload(payload, SECRET);
  assert.equal(verifyPayload(payload, sig, SECRET), true);
});

test('sign + verify: tampered payload rejected', () => {
  const payload = { foo: 'bar', n: 42 };
  const sig = signPayload(payload, SECRET);
  const tampered = { ...payload, n: 43 };
  assert.equal(verifyPayload(tampered, sig, SECRET), false);
});

test('sign + verify: wrong secret rejected', () => {
  const payload = { foo: 'bar' };
  const sig = signPayload(payload, SECRET);
  assert.equal(verifyPayload(payload, sig, 'wrong-secret'), false);
});

test('sign + verify: tampered signature rejected', () => {
  const payload = { foo: 'bar' };
  const sig = signPayload(payload, SECRET);
  // Flip first hex char (mod 16). Keeps length and hex-validity.
  const flipped = (parseInt(sig[0], 16) ^ 1).toString(16) + sig.slice(1);
  assert.equal(verifyPayload(payload, flipped, SECRET), false);
});

test('sign + verify: timing-safe equality on differing-length sigs', () => {
  const payload = { foo: 'bar' };
  // 'too-short' is 9 chars, real sig is 64 hex chars — must reject without throwing.
  assert.equal(verifyPayload(payload, 'too-short', SECRET), false);
});

test('sign: missing secret throws', () => {
  assert.throws(() => signPayload({ x: 1 }, ''), /requires a secret/);
});

// ─────────────────────────────────────────────
// inspectSigned / verifySignedVerdict
// ─────────────────────────────────────────────

test('inspectSigned: returns verdict + signature + version metadata', () => {
  const r = inspectSigned("Hurry, only 3 spots left!", {
    secret: SECRET, urgency: 0.95, paused: false,
  });
  assert.equal(typeof r.signature, 'string');
  assert.equal(r.signature.length, 64);  // sha256 hex
  assert.equal(r.library, 'pantheon-guard');
  assert.equal(typeof r.library_version, 'string');
  assert.equal(typeof r.text_sha256, 'string');
  assert.equal(typeof r.timestamp, 'string');
  assert.match(r.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('inspectSigned: missing secret throws', () => {
  assert.throws(
    () => inspectSigned('hello', {}),
    /requires options\.secret/
  );
});

test('inspectSigned + verifySignedVerdict: round-trip valid', () => {
  const signed = inspectSigned('Hurry, only 3 spots left!', {
    secret: SECRET, urgency: 0.95, paused: false,
  });
  const result = verifySignedVerdict(signed, SECRET);
  assert.equal(result.valid, true);
});

test('verifySignedVerdict: rejects tampered verdict (passes flipped)', () => {
  const signed = inspectSigned('Hurry, only 3 spots left!', {
    secret: SECRET, urgency: 0.95, paused: false,
  });
  signed.passes = !signed.passes;
  const result = verifySignedVerdict(signed, SECRET);
  assert.equal(result.valid, false);
  assert.match(result.reason, /HMAC mismatch/);
});

test('verifySignedVerdict: rejects wrong secret', () => {
  const signed = inspectSigned('Hurry, only 3 spots left!', {
    secret: SECRET, urgency: 0.95, paused: false,
  });
  const result = verifySignedVerdict(signed, 'attacker-secret');
  assert.equal(result.valid, false);
});

test('verifySignedVerdict: rejects unknown library identifier', () => {
  const fake = {
    library: 'fake-guard', library_version: '1.0.0',
    signature_version: '1', signature: 'x'.repeat(64),
  };
  const result = verifySignedVerdict(fake, SECRET);
  assert.equal(result.valid, false);
  assert.match(result.reason, /unknown library/);
});

test('verifySignedVerdict: rejects unsupported signature_version', () => {
  const fake = {
    library: 'pantheon-guard', library_version: '0.0.0',
    signature_version: '999', signature: 'x'.repeat(64),
  };
  const result = verifySignedVerdict(fake, SECRET);
  assert.equal(result.valid, false);
  assert.match(result.reason, /unsupported signature_version/);
});
