# `LearningCycle` — status and roadmap

> **Status: not bundled in v0.1.** The `LearningCycle` module exists in
> `src/learning/index.cjs` for reference but is excluded from the
> published package.

## What it is

`LearningCycle` is the self-improvement loop from the original Pantheon
codebase. After each agent action, it records:

- the proposed action
- the verdict from `checkMahavrata` + `runFiveSteps`
- the eventual outcome (success, refusal, customer feedback)

…and uses the accumulated trace to refine the agent's `svabhāva`
(tone) and `karma` (function description) within the bounds set by its
immutable `jāti` (layer).

The mechanism is described in B3-ACTION-PLAN.md and in the Pantheon
vault. It runs in production inside the original Avito Chrome extension.

## Why it is not in v0.1

`pantheon-learning.js` was copied as-is from the Avito monolith and
imports two siblings via relative require:

```js
const { /* ... */ } = require('./pantheon-core');
const { AGENTS, getAgent } = require('./pantheon-agents');
```

After extraction:

- `pantheon-core.js` was split across the seven modules in `src/` and
  is now reachable as the package's main entry (`pantheon-guard`).
- `pantheon-agents.js` was **not** extracted. It contains agent
  dossiers (Indra, Lakshmi, Shiva, Varuna, …) which live in the
  Pantheon vault, not in `pantheon-guard`.

A clean integration needs a decision: do those dossiers belong here, or
does `LearningCycle` move to a separate `@pantheon/agents` package that
depends on `pantheon-guard`?

## Phase 3+ TODO

1. Decide on package boundary (here vs. separate package).
2. Rewire imports — `require('./pantheon-core')` → `require('pantheon-guard')`
   if kept, or extract `pantheon-agents.js` into a sibling module.
3. Add storage adapters per B3-ACTION-PLAN Phase 3:
   - `storage-file.js`  — Node `fs` adapter
   - `storage-chrome.js` — `chrome.storage.local` adapter
4. Reintroduce the `./learning` subpath export in `package.json`.

## Reference checkout

Until the above is done, the source can be inspected at
`src/learning/index.cjs`. It is preserved verbatim from the
production Avito-extension build.
