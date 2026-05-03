/**
 * anthropic-chat.js — guard an Anthropic Messages call with Pantheon Guard.
 *
 * Same pattern as openai-chat.js: regenerate on rejection, fall back on
 * persistent failure.
 *
 * Run:  ANTHROPIC_API_KEY=sk-ant-... node examples/anthropic-chat.js
 *
 * Requires: npm i @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  checkMahavrata,
  detectPatterns,
  CORE_VERSION,
} from '../src/index.js';

const MAX_RETRIES = 2;
const MODEL = 'claude-haiku-4-5-20251001';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const SYSTEM = `You are a marketing copywriter. Write honest copy.
Avoid: false urgency, fear-based appeals, clickbait, fake scarcity.`;

const STRICTER = `${SYSTEM}\n\nYour previous draft was rejected by a deterministic
ethics layer. Rewrite without urgency words, without scarcity claims, and
without emotional pressure. Lead with the actual product value.`;

async function generateOnce(systemPrompt, userPrompt) {
  const r = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  return r.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

async function generateGuarded(userPrompt) {
  let systemPrompt = SYSTEM;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const draft = await generateOnce(systemPrompt, userPrompt);
    const contains = detectPatterns(draft);
    const verdict = checkMahavrata({
      text: draft,
      intent: 'persuade',
      urgency: 0.5,
      paused: true,
      contains,
    });

    if (verdict.passes) {
      return { ok: true, text: draft, attempts: attempt + 1 };
    }

    console.log(`[attempt ${attempt + 1}] blocked:`, verdict.violations.map(v => v.rule).join(','));
    systemPrompt = STRICTER;
  }

  return {
    ok: false,
    text: '[blocked by Pantheon Guard — manual review required]',
    attempts: MAX_RETRIES + 1,
  };
}

console.log(`@pantheon/guard v${CORE_VERSION} · Anthropic guarded chat\n`);

const userPrompt = 'Write a 2-line ad for a productivity course.';
const r = await generateGuarded(userPrompt);
console.log(`Result (after ${r.attempts} attempts, allowed: ${r.ok}):`);
console.log(r.text);
