# Chrome extension example — Pantheon Guard pre-flight check

A minimal MV3 extension that intercepts text before it is sent to an LLM
and runs `checkMahavrata` + `detectPatterns` from `pantheon-guard`.

This is the integration pattern proven in production in the
Avito-extension (where the original Pantheon code came from): every call
to a model is gated by a deterministic ethics layer.

## Files

- `manifest.json` — MV3 manifest with `storage` permission for caching.
- `content.js` — bundles `pantheon-guard` and exposes `pantheonCheck()`.
- `background.js` — service worker; receives messages from content
  scripts, runs the check, returns the verdict.
- `popup.html` / `popup.js` — quick UI to demonstrate gating.

## Build

The extension consumes the **bundled CJS** build from the package root
because Chrome extensions run in a sandboxed environment without
node_modules:

```bash
# In the package root:
npm run build

# Then copy the bundled file into this folder:
cp ../../dist/index.cjs ./pantheon-guard.cjs
```

A small wrapper at the top of `content.js` ensures both
`globalThis` and the extension's namespace are visible.

## How to load

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and pick this folder

## What it demonstrates

Type a manipulative line into any text box on a webpage, then click the
extension icon. The popup shows the same `passes / violations / details`
verdict the package returns from Node — proving the package is
isomorphic between server-side and browser-side execution.

This example deliberately stays minimal. For a production-grade
implementation see the original Avito-extension that this package was
extracted from.
