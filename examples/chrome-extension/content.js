// content.js — runs in every page, exposes pantheonCheck() globally.
//
// Assumes pantheon-guard.cjs has been concatenated before this file
// (see manifest.json `js` array order).

'use strict';

// In a CJS bundle injected as a content script, the package exposes itself
// on globalThis under whatever the IIFE sets. tsup's CJS output assigns to
// `module.exports`, but with no module/exports in the page context it falls
// back to a global. Adjust to your bundling pipeline.
const guard = globalThis.module?.exports || globalThis.pantheonGuard;

if (!guard || typeof guard.checkMahavrata !== 'function') {
  console.warn('[pantheon-guard demo] guard not loaded; check manifest.json bundle order');
} else {
  globalThis.pantheonCheck = function (text, opts = {}) {
    const contains = guard.detectPatterns(text);
    return guard.checkMahavrata({
      text,
      urgency: opts.urgency ?? 0.5,
      paused: opts.paused ?? true,
      intent: opts.intent ?? 'persuade',
      sources: opts.sources ?? [],
      contains,
    });
  };
}
