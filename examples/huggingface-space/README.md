---
title: Pantheon Guard
emoji: 🛡️
colorFrom: orange
colorTo: red
sdk: static
pinned: true
license: mit
short_description: The conscience layer for AI-generated content
---

# Pantheon Guard — interactive demo

A deterministic conscience layer for AI-generated content. Catches **manipulation, false urgency, and dark patterns** that input-side guardrails (NeMo, Llama Guard, Lakera) don't cover.

## Try it

The page above lets you paste any AI-generated marketing text and see what `pantheon-guard` catches. Six presets cover common failure modes:

- Sales emails (manipulative vs clean)
- Clickbait headlines
- 3am push notifications
- Risky healthcare advice
- Russian-language sales copy

## What's underneath

- **Deterministic.** Zero LLM calls inside the validator. ~0.3 ms latency.
- **Five Mahā-vrata rules** from Yoga-sūtra II.30–31 (Patañjali, ~400 CE) — explicitly defined as *not corrected by class, place, time, or circumstance*. Rules without exceptions are formalizable.
- **Calibrated honest uncertainty.** Per-flag confidence + abstain mode for out-of-distribution input. No competing guardrail offers this.
- **Cross-language.** RU + EN + DE coverage on a pre-registered benchmark. Honest scope: the property that holds on held-out data is **FP-strictness (~0.8% false-positive rate)**; fresh-held-out **catch is ~50%**, not the in-corpus accuracy headline. Accuracy ≠ catch — see the repo README section "Accuracy is not catch-rate" before trusting any single number.

## Install

```bash
npm install pantheon-guard
```

```javascript
import { inspect } from 'pantheon-guard';

const r = inspect("Hurry, only 3 spots left!", { urgency: 0.95, paused: false });
// { passes: false, violations: [...], confidence: {...}, evidence: {...} }
```

## Links

- [GitHub](https://github.com/alkanfel1987/pantheon-guard)
- [npm package](https://www.npmjs.com/package/pantheon-guard)
- [Theory & formal guarantees (PITCH.md)](https://github.com/alkanfel1987/pantheon-guard/blob/main/PITCH.md)
- [NeMo Guardrails integration example](https://github.com/alkanfel1987/pantheon-guard/tree/main/examples/nemo-output-rail)

## How this Space works

This is a static HuggingFace Space — pure HTML/CSS/JS, no backend. The `pantheon-guard` library is loaded from jsDelivr CDN at runtime (npm package `pantheon-guard@0.4.1`). All validation happens in your browser — no data is sent anywhere.

License: MIT (see source repo).
