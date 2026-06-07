/**
 * pantheon-guard · freeze regression baselines
 *
 * Writes two baselines:
 *   bench/baseline.json         — frozen pre-registered N=509 (immutable corpus)
 *   bench/baseline-living.json  — recorded verdicts on the growing living set
 *
 * Re-run only on an intentional behavior change, and commit the diff with a
 * CHANGELOG entry explaining it. Re-freezing the LIVING baseline is the normal
 * way to "accept" the current verdicts on newly-added examples; it never hides
 * a frozen-set regression (that set is gated independently and hard).
 *
 * Usage: npm run bench:freeze
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runFrozen, runLiving } from './run.js';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const stamp = new Date().toISOString();

// ── frozen (pre-registered N=509) ──
const frozenPath = fileURLToPath(new URL('./baseline.json', import.meta.url));
const frozen = { ...runFrozen(), frozen_at: stamp, guard_version: pkg.version };
writeFileSync(frozenPath, JSON.stringify(frozen, null, 2) + '\n');

// ── living (growing set) ──
const livingPath = fileURLToPath(new URL('./baseline-living.json', import.meta.url));
const living = { ...runLiving(), frozen_at: stamp, guard_version: pkg.version };
writeFileSync(livingPath, JSON.stringify(living, null, 2) + '\n');

function report(name, p) {
  const { ok, fp, fn } = p.summary;
  const acc = (p.summary.accuracy * 100).toFixed(2);
  console.log(`${name} frozen → guard v${p.guard_version}`);
  console.log(`  N=${p.corpus_size}  accuracy=${acc}%  (ok=${ok}, FP=${fp}, FN=${fn})`);
  if (p.corpus_hash) console.log(`  corpus_hash=${p.corpus_hash}`);
}

report('baseline.json        (frozen N=509)', frozen);
report('baseline-living.json (living)      ', living);
