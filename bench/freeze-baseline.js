/**
 * pantheon-guard · freeze regression baseline
 *
 * Runs the production pack stack against the frozen N=509 corpus and writes
 * bench/baseline.json. Re-run only when an intentional behavior change ships
 * — and commit the diff with a CHANGELOG entry explaining it.
 *
 * Usage: npm run bench:freeze
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runCorpus } from './run.js';

const baselinePath = fileURLToPath(new URL('./baseline.json', import.meta.url));
const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

const out = runCorpus();
const payload = {
  ...out,
  frozen_at: new Date().toISOString(),
  guard_version: pkg.version,
};

writeFileSync(baselinePath, JSON.stringify(payload, null, 2) + '\n');

const { ok, fp, fn } = payload.summary;
const acc = (payload.summary.accuracy * 100).toFixed(2);
console.log(`baseline frozen → bench/baseline.json`);
console.log(`  guard_version : ${payload.guard_version}`);
console.log(`  corpus_hash   : ${payload.corpus_hash}`);
console.log(`  N             : ${payload.corpus_size}`);
console.log(`  packs         : ${payload.pack_stack.join(', ')}`);
console.log(`  accuracy      : ${acc}%  (ok=${ok}, FP=${fp}, FN=${fn})`);
