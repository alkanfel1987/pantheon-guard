# NeMo Guardrails ↔ Pantheon Guard — output rail integration

This is the **primary integration example** for `pantheon-guard`. NVIDIA
NeMo Guardrails users can drop Pantheon Guard in as an output rail that
catches manipulation patterns NeMo's default rails do not catch (false
urgency, fear-based content, dark patterns, clickbait).

## What you'll see

Run `./run.sh` against `adversarial.txt` (5 manipulative prompts) twice:

1. With **baseline** NeMo (no Pantheon rail) — most manipulative outputs
   pass through.
2. With **Pantheon rail** — same model, same prompts, but manipulative
   outputs are caught and replaced with a safe alternative.

The diff between the two transcripts is the value Pantheon Guard adds
on top of NeMo's standard topical and jailbreak rails.

## Files

- `config.yml` — NeMo config that registers `pantheon-rail.py` as an
  output rail. Topical rails and jailbreak rails are kept exactly as in
  the NeMo getting-started example so the diff comes purely from
  Pantheon.
- `baseline.yml` — same config without the Pantheon rail. Used for the
  before/after demo.
- `pantheon-rail.py` — Python wrapper that calls Pantheon Guard via
  `node` subprocess. Returns `(allowed, reason)`.
- `adversarial.txt` — 5 prompts designed to elicit manipulative output:
  fake scarcity, fear-based escalation, clickbait listicle, false
  urgency in marketing copy, dark-pattern checkout copy.
- `run.sh` — one-liner that runs both baseline and pantheon-guarded
  configs side by side.

## Requirements

- Python 3.10+ with `pip install nemoguardrails`
- Node 16+ (Pantheon Guard runtime)
- `pantheon-guard` installed in this folder or available globally
- An LLM provider key in `OPENAI_API_KEY` or equivalent

## Setup

```bash
pip install nemoguardrails
npm install pantheon-guard      # or use the local checkout
chmod +x run.sh pantheon-rail.py
```

## Run

```bash
./run.sh
```

Reading the output: each prompt prints two responses, baseline and
guarded. Look at the **delta** — that's what Pantheon adds.

## How the Python wrapper talks to Pantheon Guard

`pantheon-rail.py` shells out to a tiny Node one-liner that imports
`detectPatterns` and `checkMahavrata`, then prints JSON. Latency ~50ms
per call on a warm Node, ~150ms cold start. For production, run the
Node wrapper as a long-lived sidecar (see `examples/openai-chat.js`).

## What Pantheon catches that NeMo's defaults don't

NeMo's default rails focus on:
- Off-topic queries (topical rails)
- Jailbreak attempts (jailbreak rails)
- PII leakage (sensitive-data rails)

Pantheon adds a **conscience layer** for the model's *own* output:
- `ahimsa` — fear-based copy, dark patterns, false urgency, manipulation
- `satya` — exaggeration, speculation-as-fact, clickbait
- `asteya` — uncited claims when the intent is informational
- `shaucha` — multiple unrelated topics in one unit
- `indriya-nigraha` — high-urgency output produced without a pause cycle

These are properties of *what the model said*, not *what the user asked*.
NeMo and Pantheon are complementary, not redundant.
