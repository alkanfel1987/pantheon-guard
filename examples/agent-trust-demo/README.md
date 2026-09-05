# Pantheon Guard — trust layer for agent teams

> Submission for the lablab.ai **Band of Agents** hackathon (June 12–19, 2026).
> Live demo: `examples/agent-trust-demo/index.html` · Library: [`npm i pantheon-guard`](https://www.npmjs.com/package/pantheon-guard) · License: MIT (dual-license available)

## The thesis

**Manipulation is not a property of text alone.** The same phrase — *"there is no way out"* — is
pressure on a sales page and a cry for help in a first-person message. Agent teams exchanging
messages at machine speed need a layer that understands this difference.

Pantheon Guard judges **utterances in context — never identities, never people** — and returns an
explainable decision for every message in a multi-agent pipeline: **pass / warn / hold**. Every
verdict unfolds into the exact rule, idiom, or hypothesis that fired.

## What it does

| Capability | How |
|---|---|
| Pressure signatures | deterministic lexical rules + calibrated confidence (core library, on npm) |
| Idiom awareness | curated registry of 24 fixed expressions: distinguishes manipulative use from proverbs and neutral contexts |
| Meaning-level detection | local zero-shot NLI (mDeBERTa, ~81 ms/hypothesis on a laptop CPU, fully offline) with principle-hypotheses |
| Ethics veto | first-person distress markers suppress the manipulation flag — falsely accusing a suffering person is worse than a miss |
| Context model | the frame (sales / negotiation / support) is an input parameter supplied by the platform, not guessed |
| Agent reputation | per-agent trust score = aggregate of session verdicts with decay; software agents only |
| Provenance gate | unsigned external content is held for review — generated fake news loses its cheapest path into the pipeline |

## What runs live

- **In the demo page:** lexical rules, the idiom registry and the distress veto run **live in your
  browser** — real library code against any text you type. The NLI model can be loaded in-browser
  (~140 MB, runs locally); until then semantic scores shown for canonical samples are recorded from
  real local runs. The pipeline session is scripted and labeled as such — its verdict logic is real.
- **Cross-lingual:** English hypotheses score Russian text (recorded: «третьего не дано» → 0.79).

## Honesty by design

We publish our blind spots next to our catches: half-truths and fabricated authority need a
composite approach and are **not caught yet**; factual fact-checking and AI-authorship detection are
**out of scope by design** — we gate provenance and flag delivery pressure instead of guessing.
No accuracy percentages are claimed here: our discipline requires pre-registered, held-out paired
metrics before any number is published. A trust layer that hides its limits cannot be trusted itself.

## Run locally

```bash
git clone https://github.com/alkanfel1987/pantheon-guard
cd pantheon-guard
npx http-server -p 4173
# open http://127.0.0.1:4173/examples/agent-trust-demo/index.html
```

## Built AI-first

The product is built by an architect + AI coding tools (Claude Code, local models). The LLM acts as
a teacher that distills understanding into a small, transparent, offline artifact — never as a
runtime dependency. Architecture principle: *"Claude builds the guard, Claude is not the guard."*

## Next steps

- Held-out, pre-registered calibration of the semantic layer
- Dialogue probe for the intent axis (pressure vs self-expression)
- Provenance signatures for agent-to-agent messages
- On-device shield: browser extension + messenger bot on the same core (anti-scam protection for end users)

## Team

**Iggdrasil** — Aleksandr Shevchenko ([github.com/alkanfel1987](https://github.com/alkanfel1987))

---

## Submission form blocks (copy-paste)

**Title (≤50 chars):**
`Pantheon Guard — Trust Layer for Agent Teams`

**Short description (≤255 chars):**
`Explainable trust layer for multi-agent pipelines: pass/warn/hold verdicts in context. Idiom registry, local NLI, distress veto, agent reputation, provenance gate vs generated fake news. Judges utterances, never people. Offline, open-source.`

**Long description (≥100 words):**
`Agent teams exchange messages faster than any human can read — sales agents persuade, news agents publish, support agents answer people in pain. Existing guardrails block prompt attacks and toxicity but do not see manipulation. Pantheon Guard is an explainable trust layer for multi-agent pipelines built on one thesis: manipulation is not a property of text alone. The same phrase is pressure on a sales page and a cry for help in a first-person message. The system combines three complementary layers — deterministic lexical rules, a curated idiom registry that distinguishes manipulative use from proverbs, and a local zero-shot NLI model (mDeBERTa, ~81 ms per hypothesis on a laptop CPU, fully offline) — plus an ethics veto: first-person distress suppresses the flag, because falsely accusing a suffering person is worse than a miss. The context frame (sales, negotiation, support) is an input parameter supplied by the platform, not guessed. On top of per-message verdicts the layer keeps behavioral reputation for software agents and holds unsigned external content at a provenance gate, so generated fake news loses its cheapest path into the pipeline. Lexical, idiom and veto layers run live in the browser in our demo; we openly publish our blind-spot map next to our catches. Core library is published on npm under MIT.`

**Technologies:** JavaScript, Node.js, Transformers.js, Hugging Face, mDeBERTa (XNLI), Claude (build-time), regex/lexicon engineering

**Demo URL:** _(hosted page URL here — HuggingFace Space or GitHub Pages)_

**Video:** _(MP4 ≤5 min — script in `VIDEO-SCRIPT.md`)_
