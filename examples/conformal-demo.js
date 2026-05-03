/**
 * conformal-demo.js — split conformal prediction over pantheon-guard.
 *
 * Loads a small calibration set (32 hand-labelled examples) and demonstrates
 * the three conformal verdict shapes:
 *
 *   ['manipulation']            → confident block
 *   ['safe']                    → confident pass
 *   ['manipulation', 'safe']    → conformal abstain (route to human)
 *
 * The marginal coverage guarantee — ≥ 1-α — is *distribution-free*:
 * Vovk's theorem holds regardless of model accuracy, requiring only that
 * the calibration set is exchangeable with the test point.
 *
 *   node examples/conformal-demo.js
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { fitConformal, inspectConformal, CORE_VERSION } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(resolve(__dirname, 'conformal-data.json'), 'utf8')
);

console.log(`pantheon-guard v${CORE_VERSION} · conformal demo\n`);
console.log(`Calibration set: ${data.examples.length} examples ` +
            `(${data._label_distribution.manipulation} manipulation, ` +
            `${data._label_distribution.safe} safe)\n`);

// ─────────────────────────────────────────────
// Fit conformal at α = 0.1 (90% coverage guarantee)
// ─────────────────────────────────────────────
const cal = fitConformal(data.examples, { alpha: 0.1 });
console.log(`Fitted: threshold=${cal.threshold.toFixed(4)}, ` +
            `coverage=${(cal.coverageGuarantee * 100).toFixed(0)}%`);
console.log(`Score distribution: min=${Math.min(...cal.scores).toFixed(3)}, ` +
            `median=${cal.scores.slice().sort((a, b) => a - b)[Math.floor(cal.scores.length / 2)].toFixed(3)}, ` +
            `max=${Math.max(...cal.scores).toFixed(3)}`);

// ─────────────────────────────────────────────
// Test inputs spanning the manipulation / safety / borderline space
// ─────────────────────────────────────────────
const testInputs = [
  // Blatant manipulation
  { text: "Hurry, only 3 spots left! Don't miss out, you'll regret it forever.",
    expected: 'manipulation', urgency: 0.95, paused: false },
  { text: "The shocking secret millionaires hide from you — limited offer!",
    expected: 'manipulation', urgency: 0.5, paused: true },

  // Clearly safe
  { text: "Please review the attached agenda and let me know if changes are needed.",
    expected: 'safe', urgency: 0.2, paused: true },
  { text: "Курс по статистике начинается в октябре, регистрация на сайте.",
    expected: 'safe', urgency: 0.1, paused: true },

  // Borderline — single weak signal in long context
  { text: "Please act now to confirm your booking before the office closes for the day.",
    expected: 'borderline', urgency: 0.2, paused: true },

  // Too short — abstain by inspect()'s own logic
  { text: "Hurry!",
    expected: 'too-short', urgency: 0.95, paused: false },
];

console.log('\n── Verdict sets at α=0.1 (90% coverage guarantee) ──\n');
for (const { text, expected, urgency, paused } of testInputs) {
  const r = inspectConformal(text, { calibrator: cal, urgency, paused });
  const set = `[${r.verdict_set.join(', ')}]`;
  const trunc = text.length > 60 ? text.slice(0, 57) + '…' : text;
  console.log(`  text:      "${trunc}"`);
  console.log(`  expected:  ${expected}`);
  console.log(`  set:       ${set}  ${r.abstain ? '← ABSTAIN' : ''}`);
  console.log(`  conf.man:  ${r.confidence.manipulation.toFixed(3)}`);
  if (r.reason) console.log(`  reason:    ${r.reason}`);
  console.log();
}

// ─────────────────────────────────────────────
// Empirical coverage check (held-out)
// ─────────────────────────────────────────────
console.log('── Empirical coverage check (held-out 8 examples) ──\n');

// Refit on the first 24, test on the last 8.
const split = data.examples.length - 8;
const cal2 = fitConformal(data.examples.slice(0, split), { alpha: 0.2 });
const heldOut = data.examples.slice(split);

let covered = 0;
for (const { text, label } of heldOut) {
  const r = inspectConformal(text, { calibrator: cal2 });
  if (r.verdict_set.includes(label)) covered++;
}
const empirical = covered / heldOut.length;
console.log(`  α = 0.2  →  expected coverage ≥ 80%`);
console.log(`  empirical coverage on held-out: ${(empirical * 100).toFixed(1)}% ` +
            `(${covered}/${heldOut.length})`);
if (empirical >= 0.8) {
  console.log('  ✓ marginal coverage guarantee holds on this split.');
} else {
  console.log('  ⚠ coverage below target — finite-sample fluctuation; with larger ' +
              'calibration set the gap closes.');
}

console.log(`\nFor production deployment, swap conformal-data.json for the v0.3`);
console.log(`hand-labelled benchmark (~1000 examples) — that is when the marginal`);
console.log(`coverage guarantee becomes meaningfully tight.`);
