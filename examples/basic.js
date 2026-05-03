/**
 * basic.js — minimal hello-world for pantheon-guard
 *
 *   node examples/basic.js
 *
 * Demonstrates v0.2 inspect() API alongside the lower-level v0.1 building
 * blocks. The two ways are equivalent in functionality; inspect() is just
 * one call instead of three and adds calibrated confidence + abstain.
 */

import {
  inspect,                  // v0.2 — preferred
  checkMahavrata,           // v0.1 building block (still supported)
  detectPatterns,           // v0.1 building block (still supported)
  wrapAgent,
  LAYERS,
  GUNAS,
  CORE_VERSION,
} from '../src/index.js';

console.log(`pantheon-guard v${CORE_VERSION}\n`);

// ─────────────────────────────────────────────
// 1. v0.2 — one-call inspect() with calibrated honest uncertainty
// ─────────────────────────────────────────────

console.log('── 1. Manipulative copy (calibrated mode) ──');

const text = 'Hurry, only 3 spots left! Don\'t miss out, you\'ll regret it forever.';
const r = inspect(text, { urgency: 0.95, paused: false });

console.log('Text:           ', text);
console.log('Passes:         ', r.passes);
console.log('Manipulation conf:', r.confidence.manipulation.toFixed(3));
console.log('Per-flag conf:  ', JSON.stringify(r.confidence));
console.log('Evidence:       ', JSON.stringify(r.evidence));
console.log('Violations:     ', r.violations.map((v) => v.rule).join(', '));

// ─────────────────────────────────────────────
// 2. v0.2 — abstain on too-thin input (the differentiator)
// ─────────────────────────────────────────────

console.log('\n── 2. Too-short text (calibrated abstains, no fake verdict) ──');

const tooShort = inspect('Hurry!');
console.log('Text:    "Hurry!"');
console.log('Abstain:', tooShort.abstain);
console.log('Reason: ', tooShort.reason);
console.log('  ↑ a competitor would emit a confident-but-meaningless boolean here.');

// ─────────────────────────────────────────────
// 3. v0.2 — calibrated vs strict on a borderline single signal
// ─────────────────────────────────────────────

console.log('\n── 3. Borderline single signal in long context ──');

const borderline = 'Please act now to confirm your booking before the office closes for the day.';
const cal    = inspect(borderline, { urgency: 0.2, paused: true });
const strict = inspect(borderline, { urgency: 0.2, paused: true, policy: 'strict' });

console.log('Text:        ', borderline);
console.log('Calibrated → passes:', cal.passes,   ' (single weak signal does not flag)');
console.log('Strict     → passes:', strict.passes, ' (any regex hit flags — v0.1 behavior)');
console.log('  ↑ the calibrated mode is what makes Pantheon Guard different.');

// ─────────────────────────────────────────────
// 4. v0.1 building blocks still work — backward compatible
// ─────────────────────────────────────────────

console.log('\n── 4. v0.1 API (still works, identical to before) ──');

const contains = detectPatterns(text);
const result = checkMahavrata({ text, urgency: 0.95, paused: false, contains });
console.log('checkMahavrata.passes:', result.passes);

// ─────────────────────────────────────────────
// 5. wrapAgent — block before executor runs
// ─────────────────────────────────────────────

console.log('\n── 5. wrapAgent — runtime guard ──');

const safeAgent = wrapAgent({
  name: 'Marketing copy reviewer',
  svadharma: {
    jati: LAYERS.VASU,
    guna: GUNAS.SATTVA,
    karma: 'craft honest, non-coercive marketing copy',
    svabhava: 'thoughtful, plain, accountable',
  },
});

const blocked = await safeAgent.act(
  {
    text,
    urgency: 0.95,
    paused: false,
    contains,
    targetLayer: LAYERS.VASU,
    targetKarma: 'marketing copy',
    intrinsicValue: true,
    danaType: 'vidya',
  },
  async () => 'this should not be sent to a real LLM'
);

console.log('Wrapped agent allowed?', blocked.allowed);
console.log('Reason:               ', blocked.reason);
