// tsup config — dual ESM/CJS build with .d.ts
//
// Source is now ESM (Phase 2). tsup outputs both formats with explicit
// .mjs / .cjs extensions, plus .d.ts and .d.cts for TS consumers.
//
// `learning/` is intentionally excluded — see src/learning/README.md.

'use strict';

module.exports = {
  entry: {
    'index': 'src/index.js',
  },
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  minify: true,
  target: 'node16',
  // Force explicit .cjs / .mjs extensions so package.json "exports" map is unambiguous.
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
  // No external — bundle everything (zero runtime deps anyway).
};
