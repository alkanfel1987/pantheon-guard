/**
 * pantheon-guard · Cohen's kappa — annotator-1 (human author) vs annotator-2 (Haiku)
 *
 * Reads the holdout split, the annotator-2 cache, and computes:
 *   - 2x2 confusion table
 *   - observed agreement p_o
 *   - expected-by-chance agreement p_e
 *   - Cohen's kappa κ + 95 % CI (Fleiss closed-form SE)
 *   - Landis & Koch (1977) interpretation band
 *   - holdout-only accuracy of pantheon-guard packs (blind external metric)
 *
 * Reports kappa for the (pass/catch) binary task. If kappa < 0.6 with non-trivial
 * N, the labeling rubric is too fuzzy to support an externally-credible accuracy
 * claim — that fact MUST be surfaced honestly in PITCH/CHANGELOG.
 *
 * Usage: npm run bench:kappa
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  stackPacks,
  newsPack,
  newsDePack,
  epistemologyPack,
  healthcarePack,
} from '../src/index.js';
import { getSplit } from './holdout.js';

const STACK = stackPacks([newsPack, newsDePack, epistemologyPack, healthcarePack]);
const cachePath = fileURLToPath(new URL('./annotator2-cache.json', import.meta.url));

function band(k) {
  if (k < 0) return 'poor (worse than chance)';
  if (k <= 0.2) return 'slight';
  if (k <= 0.4) return 'fair';
  if (k <= 0.6) return 'moderate';
  if (k <= 0.8) return 'substantial';
  return 'almost perfect';
}

function wilson95(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - half), Math.min(1, center + half)];
}

function main() {
  const { holdout } = getSplit();
  if (!existsSync(cachePath)) {
    console.error('✗ annotator-2 cache missing. Run: npm run bench:annotate2');
    process.exit(2);
  }
  const cache = JSON.parse(readFileSync(cachePath, 'utf8'));
  const cacheById = new Map(Object.values(cache).map((v) => [v.id, v]));

  const dual = [];
  for (const c of holdout) {
    const v = cacheById.get(c.id);
    if (!v) continue;
    dual.push({
      id: c.id,
      a1: c.expected,
      a2: v.label,
      pack_caught: STACK(c.text).passes === false,
    });
  }
  if (dual.length < holdout.length) {
    console.warn(`⚠  only ${dual.length}/${holdout.length} holdout cases have annotator-2 verdicts; run bench:annotate2 to fill`);
  }

  // 2x2 confusion table: rows = annotator-1, cols = annotator-2
  const ct = { pp: 0, pc: 0, cp: 0, cc: 0 };
  for (const d of dual) {
    if (d.a1 === 'pass' && d.a2 === 'pass') ct.pp++;
    else if (d.a1 === 'pass' && d.a2 === 'catch') ct.pc++;
    else if (d.a1 === 'catch' && d.a2 === 'pass') ct.cp++;
    else if (d.a1 === 'catch' && d.a2 === 'catch') ct.cc++;
  }
  const N = ct.pp + ct.pc + ct.cp + ct.cc;
  const agree = ct.pp + ct.cc;
  const p_o = N === 0 ? 0 : agree / N;

  const a1_pass = (ct.pp + ct.pc) / N;
  const a1_catch = (ct.cp + ct.cc) / N;
  const a2_pass = (ct.pp + ct.cp) / N;
  const a2_catch = (ct.pc + ct.cc) / N;
  const p_e = a1_pass * a2_pass + a1_catch * a2_catch;

  const kappa = p_e === 1 ? 1 : (p_o - p_e) / (1 - p_e);
  const se = Math.sqrt((p_o * (1 - p_o)) / (N * Math.pow(1 - p_e, 2)));
  const ci = [kappa - 1.96 * se, kappa + 1.96 * se];

  // Holdout-only pack accuracy (blind external test)
  const correctOnHoldout = dual.filter(
    (d) => (d.a1 === 'catch' && d.pack_caught) || (d.a1 === 'pass' && !d.pack_caught),
  ).length;
  const fpHoldout = dual.filter((d) => d.a1 === 'pass' && d.pack_caught).length;
  const fnHoldout = dual.filter((d) => d.a1 === 'catch' && !d.pack_caught).length;
  const accHoldout = N === 0 ? 0 : correctOnHoldout / N;
  const [accLo, accHi] = wilson95(correctOnHoldout, N);

  console.log('═'.repeat(72));
  console.log('  Cohen\'s kappa — annotator-1 (human) vs annotator-2 (Haiku 4.5)');
  console.log('═'.repeat(72));
  console.log(`  N (dual-labeled): ${N}`);
  console.log('');
  console.log('                  a2:pass    a2:catch');
  console.log(`  a1:pass         ${String(ct.pp).padStart(5)}      ${String(ct.pc).padStart(5)}`);
  console.log(`  a1:catch        ${String(ct.cp).padStart(5)}      ${String(ct.cc).padStart(5)}`);
  console.log('');
  console.log(`  observed agreement p_o = ${(p_o * 100).toFixed(1)}%`);
  console.log(`  chance agreement   p_e = ${(p_e * 100).toFixed(1)}%`);
  console.log(`  kappa κ            = ${kappa.toFixed(3)}    95% CI [${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}]`);
  console.log(`  Landis-Koch band   = ${band(kappa)}`);
  console.log('');
  console.log('  ── BLIND HOLDOUT pack accuracy (annotator-1 ground truth) ──');
  console.log(`  N = ${N},  correct = ${correctOnHoldout},  FP = ${fpHoldout},  FN = ${fnHoldout}`);
  console.log(`  accuracy = ${(accHoldout * 100).toFixed(1)}%   Wilson 95% CI [${(accLo * 100).toFixed(1)}%, ${(accHi * 100).toFixed(1)}%]`);

  if (kappa < 0.6 && N >= 30) {
    console.log('');
    console.log('  ⚠  kappa below 0.6 — rubric admits ambiguity; published accuracy');
    console.log('     should be qualified as author-rubric-dependent.');
  }
}

main();
