// tsup config — dual ESM/CJS build with .d.ts
//
// Inputs: src/index.js (public API) + src/learning/index.js (subpath export)
// Outputs (in dist/):
//   index.mjs / index.cjs / index.d.ts        — main entry
//   learning/index.mjs / index.cjs / index.d.ts — subpath
//
// Source is CommonJS (require/module.exports). esbuild converts to ESM on output —
// no manual rewrite of 7 modules needed for Phase 2.

'use strict';

module.exports = {
  entry: {
    'index': 'src/index.js',
    // 'learning/index' — temporarily excluded: pantheon-learning.js has
    // unresolved require('./pantheon-core') and require('./pantheon-agents')
    // that lived next to it in the Avito-extension monolith. Extracting
    // pantheon-agents.js and rewiring imports is a Phase 3 TODO.
  },
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  target: 'node16',
  // Force explicit .cjs / .mjs extensions so package.json "exports" map is unambiguous.
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
  // No external — bundle everything (zero runtime deps anyway).
};
