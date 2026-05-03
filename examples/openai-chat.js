/**
 * openai-chat.js — guard an OpenAI chat completion with Pantheon Guard.
 *
 * The pattern: every LLM response is checked through Mahā-vrata BEFORE it
 * reaches the user. If it fails, the agent regenerates with stricter
 * instructions; after N retries we fall back to a safe canned reply.
 *
 * Uses v0.2 `inspect()` — one call instead of three, plus calibrated
 * confidence so we can log how sure the guard was about each block.
 *
 * Run:  OPENAI_API_KEY=sk-... node examples/openai-chat.js
 *
 * Requires: npm i openai
 */

import OpenAI from 'openai';
import {
  inspect,
  CORE_VERSION,
} from '../src/index.js';

const MAX_RETRIES = 2;
const MODEL = 'gpt-4o-mini';

const client = new OpenAI(); // reads OPENAI_API_KEY from env

const SYSTEM = `You are a marketing copywriter. Write honest copy.
Avoid: false urgency, fear-based appeals, clickbait, fake scarcity.`;

const STRICTER = `${SYSTEM}\n\nYour previous draft was rejected by a deterministic
ethics layer. Rewrite without urgency words, without scarcity claims, and
without emotional pressure. Lead with the actual product value.`;

async function generateOnce(systemPrompt, userPrompt) {
  const r = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
  });
  return r.choices[0].message.content.trim();
}

async function generateGuarded(userPrompt) {
  let systemPrompt = SYSTEM;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const draft = await generateOnce(systemPrompt, userPrompt);
    // v0.2: one call, calibrated mode is the default.
    const verdict = inspect(draft, {
      intent: 'persuade',
      urgency: 0.5,
      paused: true,
    });

    if (verdict.passes) {
      return { ok: true, text: draft, attempts: attempt + 1, verdict };
    }

    console.log(
      `[attempt ${attempt + 1}] blocked:`,
      verdict.violations.map((v) => v.rule).join(','),
      `(manipulation conf=${verdict.confidence.manipulation.toFixed(2)})`
    );
    systemPrompt = STRICTER; // tighten for next round
  }

  // Final fallback — never return a manipulative draft
  return {
    ok: false,
    text: '[blocked by Pantheon Guard — manual review required]',
    attempts: MAX_RETRIES + 1,
  };
}

console.log(`pantheon-guard v${CORE_VERSION} · OpenAI guarded chat\n`);

const userPrompt = 'Write a 2-line ad for a productivity course.';
const r = await generateGuarded(userPrompt);
console.log(`Result (after ${r.attempts} attempts, allowed: ${r.ok}):`);
console.log(r.text);
if (r.verdict) {
  console.log(`\nFinal confidence: manipulation=${r.verdict.confidence.manipulation.toFixed(2)}`);
}
