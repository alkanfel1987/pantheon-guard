# src/learning — temporarily excluded from build

`pantheon-learning.js` was copied as-is from the Avito-extension monolith
(`pantheon-bundle.js` lived in
`vault/04-Projects/Анализ Авито (пока на паузе)/files/avito-extension/`).

In its original location it sat next to `pantheon-core.js` and
`pantheon-agents.js` and uses both via relative `require`:

```js
// src/learning/index.js, around line 34–35
const { /* … */ } = require('./pantheon-core');
const { AGENTS, getAgent } = require('./pantheon-agents');
```

After extraction:

- `pantheon-core.js` was split into 7 modules in `src/`. The named exports
  it offered are now reachable as `require('../')` (i.e. `src/index.js`).
- **`pantheon-agents.js` was not copied.** It contains agent dossiers
  (Indra, Lakshmi, Shiva, Varuna, …) that are part of the Pantheon vault
  but not part of `pantheon-guard`'s public surface.

## TODO (Phase 3)

1. Decide whether `LearningCycle` belongs in `pantheon-guard` at all, or
   in a separate `@pantheon/agents` package.
2. If kept here:
   - Replace `require('./pantheon-core')` with `require('../')`.
   - Either inline the small subset of `AGENTS` actually used, or
     document the dependency and require callers to inject agent metadata.
3. Add storage adapters per B3-ACTION-PLAN Phase 3:
   - `storage-file.js`  — Node `fs` filesystem persistence
   - `storage-chrome.js` — `chrome.storage.local` adapter
4. Reintroduce as `./learning` subpath export in `package.json`.

For now: `src/learning/index.js` is preserved on disk for reference only.
It is **not bundled, not exported, and not tested.** The unit tests in
`test/` cover the seven modules of the deterministic core only.
