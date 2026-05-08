/**
 * pantheon-guard · second-annotator harness (Claude Haiku 4.5)
 *
 * Sends each holdout case to Claude Haiku as an INDEPENDENT second annotator
 * using the same labeling rubric the human author used. Verdicts are cached
 * per-case in bench/annotator2-cache.json keyed by (case_id, model, rubric_v)
 * so subsequent runs are free and deterministic.
 *
 * Honest framing — what this is and is NOT:
 *   - IS:  an automated cross-validator that surfaces label ambiguity. If
 *          Cohen's kappa with the human labels is high, the rubric admits
 *          consistent application. If it's low, the rubric is fuzzy and
 *          published accuracy depends partly on author taste, not signal.
 *   - NOT: a substitute for a paid human second annotator. An LLM annotator
 *          shares biases with the system being evaluated (regex packs were
 *          built by a human reading the same news; Haiku read similar news
 *          during training). Treat kappa as a LOWER bound for publishable
 *          rigor — real human IAA may be tighter or looser.
 *
 * Cost: ~51 cases × ~200 input tok + 20 output tok = trivial (<$0.05 total).
 * Network: needed once. Cache committed to repo → reproducible offline.
 *
 * Env: ANTHROPIC_API_KEY required.
 * Usage:  npm run bench:annotate2  [--limit N] [--force]
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getSplit } from './holdout.js';

const RUBRIC_VERSION = 'v1.2026-05-08';
const MODEL = 'claude-haiku-4-5-20251001';
const cachePath = fileURLToPath(new URL('./annotator2-cache.json', import.meta.url));

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const force = args.includes('--force');

const RUBRIC = `
You are an INDEPENDENT second annotator for a manipulation-detection benchmark
on news headlines (Russian, English, German). You do NOT have access to any
detection system — judge the text on its content alone, using the rubric below.

LABEL "pass" if the text is:
  - factual reporting (events, decisions, statistics, named-source quotes)
  - business / sports / diplomatic / political news without sensational framing
  - genuine emergency or public-health notification (legitimate urgency)
  - educational / explanatory / historical content

LABEL "catch" if the text shows ANY of:
  - vague-discovery framing ("found something", "natural remedy", "secret method")
  - genre-framing as thriller / drama for routine event ("triller on cruise ship")
  - voyeur + reaction patterns ("X did Y and shocked Z")
  - personal-drama judgment as headline ("widow's tragic life")
  - body-metaphor or cannibal-metaphor for politics ("drink Ukrainian blood")
  - conspiracy-frame ("they don't want you to know", "what they hide")
  - wordplay-as-headline that obscures actual content
  - absurd-event framing for clicks ("singer ate snake-venom cream")
  - sensationalist editorial framing of mundane events
  - clickbait phrases: "shocking secret", "you won't believe", "doctors hate"
  - false urgency, false scarcity, FOMO patterns ("only 3 left", "last chance")
  - self-diagnosis overclaim ("you definitely have", "100% effective cure")
  - medical advice without disclaimer

Output FORMAT — strict JSON, no prose, no code fence:
{"label": "pass" OR "catch", "rationale": "<10-15 word reason>"}
`;

function loadCache() {
  if (!existsSync(cachePath)) return {};
  return JSON.parse(readFileSync(cachePath, 'utf8'));
}

function saveCache(cache) {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
}

function cacheKey(id) {
  return `${id}::${MODEL}::${RUBRIC_VERSION}`;
}

async function annotate(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY not set in env. ' +
        'Set it (PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-…") and retry.',
    );
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 80,
      system: RUBRIC,
      messages: [{ role: 'user', content: `Headline:\n${text}\n\nReturn JSON only.` }],
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const json = await res.json();
  const raw = json.content?.[0]?.text ?? '';
  // Strip code fences if model added them despite instructions
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: extract first {...} block
    const m = cleaned.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : null;
  }
  if (!parsed || (parsed.label !== 'pass' && parsed.label !== 'catch')) {
    throw new Error(`unparseable Haiku response: ${raw.slice(0, 200)}`);
  }
  return {
    label: parsed.label,
    rationale: parsed.rationale ?? '',
    raw_response: raw,
  };
}

async function main() {
  const { holdout } = getSplit();
  const cache = force ? {} : loadCache();
  const todo = holdout.filter((c) => !cache[cacheKey(c.id)]).slice(0, limit);

  console.log(`Holdout total : ${holdout.length}`);
  console.log(`Already cached: ${holdout.length - todo.length}`);
  console.log(`To annotate   : ${todo.length}`);
  if (todo.length === 0) {
    console.log('Nothing to do. Exit.');
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n✗ ANTHROPIC_API_KEY not set — cannot annotate.');
    console.error('  PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-…"; npm run bench:annotate2');
    process.exit(2);
  }

  let done = 0;
  const errors = [];
  for (const c of todo) {
    try {
      const verdict = await annotate(c.text);
      cache[cacheKey(c.id)] = {
        id: c.id,
        model: MODEL,
        rubric_version: RUBRIC_VERSION,
        annotated_at: new Date().toISOString(),
        ...verdict,
      };
      saveCache(cache);
      done++;
      const agree = verdict.label === c.expected ? '✓' : '✗';
      console.log(
        `  ${agree}  ${c.id.padEnd(15)}  expected=${c.expected.padEnd(5)}  haiku=${verdict.label.padEnd(5)}  ${c.label?.slice(0, 40) ?? ''}`,
      );
    } catch (e) {
      errors.push({ id: c.id, error: e.message });
      console.error(`  !  ${c.id}: ${e.message}`);
    }
  }
  console.log(`\nDone: ${done}/${todo.length}.  Errors: ${errors.length}`);
  if (errors.length) process.exit(1);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
