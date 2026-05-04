/**
 * Comparison baseline harness · 2026-05-05
 *
 * Runs the same multi-region corpus through:
 *   - pantheon-guard (current stack)
 *   - OpenAI Moderation API (free)
 *   - Llama-Guard via Replicate ($0.0006/req — ~$0.30 total for N=463)
 *
 * Outputs side-by-side comparison table for KP v3.
 *
 * BLOCKED ON USER ACTION:
 *   - Set OPENAI_API_KEY in environment (free key from platform.openai.com)
 *   - Set REPLICATE_API_TOKEN in environment (paid, ~$0.30 budget)
 *
 * Once both keys are set, run: node examples/benchmark-comparison-baseline.js
 *
 * Without keys: only pantheon-guard column will populate; others marked SKIP.
 */

import {
  stackPacks,
  newsPack,
  newsDePack,
  epistemologyPack,
  healthcarePack,
} from '../src/index.js';
import { CORPUS as MULTIREGION_CORPUS } from './benchmark-multiregion-corpus.js';
import { CORPUS as RU_CORPUS } from './benchmark-phase1-corpus.js';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN;

const guard = stackPacks([newsPack, newsDePack, epistemologyPack, healthcarePack]);

// Combine corpora — full cross-language set
const FULL_CORPUS = [
  ...RU_CORPUS.map((c) => ({ ...c, region: 'RU' })),
  ...MULTIREGION_CORPUS,
];

// ─────────────────────────────────────────────
// Pantheon Guard column (always available)
// ─────────────────────────────────────────────

function runPantheon(text) {
  const r = guard(text);
  return { caught: r.passes === false, system: 'pantheon' };
}

// ─────────────────────────────────────────────
// OpenAI Moderation API column
// ─────────────────────────────────────────────

async function runOpenAI(text) {
  if (!OPENAI_KEY) return { caught: null, system: 'openai-mod', reason: 'NO_API_KEY' };
  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({ input: text, model: 'omni-moderation-latest' }),
    });
    if (!res.ok) {
      return { caught: null, system: 'openai-mod', reason: `HTTP_${res.status}` };
    }
    const data = await res.json();
    const flagged = data.results?.[0]?.flagged ?? false;
    return { caught: flagged, system: 'openai-mod' };
  } catch (e) {
    return { caught: null, system: 'openai-mod', reason: `ERR:${e.message}` };
  }
}

// ─────────────────────────────────────────────
// Llama-Guard 7B via Replicate
// ─────────────────────────────────────────────

async function runLlamaGuard(text) {
  if (!REPLICATE_KEY) return { caught: null, system: 'llama-guard', reason: 'NO_API_KEY' };
  try {
    // Replicate Llama-Guard-3-8B endpoint
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${REPLICATE_KEY}`,
      },
      body: JSON.stringify({
        version: 'meta/llama-guard-3-8b',
        input: { prompt: text },
      }),
    });
    if (!res.ok) {
      return { caught: null, system: 'llama-guard', reason: `HTTP_${res.status}` };
    }
    const data = await res.json();
    // Llama-Guard returns "safe" or "unsafe\nS<category>"
    // Polling for completion (Replicate is async)
    let output = data.output;
    let pollCount = 0;
    while (data.status !== 'succeeded' && pollCount < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      const poll = await fetch(data.urls.get, {
        headers: { Authorization: `Token ${REPLICATE_KEY}` },
      });
      const polled = await poll.json();
      if (polled.status === 'succeeded') {
        output = polled.output;
        break;
      }
      if (polled.status === 'failed') {
        return { caught: null, system: 'llama-guard', reason: 'POLL_FAILED' };
      }
      pollCount++;
    }
    const text_output = Array.isArray(output) ? output.join('') : output;
    const flagged = text_output && text_output.toLowerCase().startsWith('unsafe');
    return { caught: flagged ?? false, system: 'llama-guard' };
  } catch (e) {
    return { caught: null, system: 'llama-guard', reason: `ERR:${e.message}` };
  }
}

// ─────────────────────────────────────────────
// Wilson CI helper
// ─────────────────────────────────────────────

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const halfwidth = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - halfwidth), Math.min(1, center + halfwidth)];
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(78));
  console.log('  pantheon-guard · COMPARISON BASELINE · 2026-05-05');
  console.log('═'.repeat(78));
  console.log(`  N = ${FULL_CORPUS.length}  (RU + EN + DE)`);
  console.log(`  OPENAI_API_KEY: ${OPENAI_KEY ? '✓ set' : '✗ NOT SET (skip OpenAI column)'}`);
  console.log(`  REPLICATE_API_TOKEN: ${REPLICATE_KEY ? '✓ set' : '✗ NOT SET (skip Llama-Guard column)'}`);

  if (!OPENAI_KEY && !REPLICATE_KEY) {
    console.log('\n  ⚠ No baseline API keys set. To enable comparison:');
    console.log('     export OPENAI_API_KEY="sk-..."          # free at platform.openai.com');
    console.log('     export REPLICATE_API_TOKEN="r8_..."     # ~$0.30 budget at replicate.com');
    console.log('\n  Pantheon-only column will be computed for sanity check.');
  }

  const results = {
    pantheon: { tp: 0, tn: 0, fp: 0, fn: 0, errors: 0 },
    'openai-mod': { tp: 0, tn: 0, fp: 0, fn: 0, errors: 0 },
    'llama-guard': { tp: 0, tn: 0, fp: 0, fn: 0, errors: 0 },
  };

  let i = 0;
  for (const c of FULL_CORPUS) {
    i++;
    if (i % 20 === 0) console.log(`  ...${i}/${FULL_CORPUS.length}`);

    const expected = c.expected === 'catch';

    // Pantheon (sync, fast)
    const p = runPantheon(c.text);
    if (p.caught === null) results.pantheon.errors++;
    else if (expected && p.caught) results.pantheon.tp++;
    else if (expected && !p.caught) results.pantheon.fn++;
    else if (!expected && p.caught) results.pantheon.fp++;
    else results.pantheon.tn++;

    // OpenAI Mod (async, only if key)
    if (OPENAI_KEY) {
      const o = await runOpenAI(c.text);
      if (o.caught === null) results['openai-mod'].errors++;
      else if (expected && o.caught) results['openai-mod'].tp++;
      else if (expected && !o.caught) results['openai-mod'].fn++;
      else if (!expected && o.caught) results['openai-mod'].fp++;
      else results['openai-mod'].tn++;
    }

    // Llama-Guard (async + polling, only if key — slow ~3s per request)
    if (REPLICATE_KEY) {
      const l = await runLlamaGuard(c.text);
      if (l.caught === null) results['llama-guard'].errors++;
      else if (expected && l.caught) results['llama-guard'].tp++;
      else if (expected && !l.caught) results['llama-guard'].fn++;
      else if (!expected && l.caught) results['llama-guard'].fp++;
      else results['llama-guard'].tn++;
    }
  }

  console.log('\n── Comparison table ──');
  console.log('  System          accuracy    95% CI            FP     catch%');
  console.log('  ' + '─'.repeat(70));
  for (const [name, r] of Object.entries(results)) {
    const total = r.tp + r.tn + r.fp + r.fn;
    if (total === 0) {
      console.log(`  ${name.padEnd(15)} —          (skipped — no API key)`);
      continue;
    }
    const correct = r.tp + r.tn;
    const acc = correct / total;
    const [lo, hi] = wilson95(correct, total);
    const fpRate = r.tn + r.fp > 0 ? r.fp / (r.tn + r.fp) : 0;
    const catchRate = r.tp + r.fn > 0 ? r.tp / (r.tp + r.fn) : 0;
    console.log(
      `  ${name.padEnd(15)} ${(acc * 100).toFixed(1).padStart(5)}%     [${(lo * 100).toFixed(1)}%, ${(hi * 100).toFixed(1)}%]   ${(fpRate * 100).toFixed(1).padStart(4)}%   ${(catchRate * 100).toFixed(1).padStart(5)}%`,
    );
  }

  console.log('\n' + '═'.repeat(78) + '\n');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
