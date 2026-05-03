/**
 * basic.js — minimal hello-world for pantheon-guard
 *
 *   node examples/basic.js
 */

import {
  checkMahavrata,
  detectPatterns,
  wrapAgent,
  LAYERS,
  GUNAS,
  CORE_VERSION,
} from '../src/index.js';

console.log(`pantheon-guard v${CORE_VERSION}\n`);

// 1. Direct Mahā-vrata check on a manipulative line.
const text = 'Hurry, only 3 spots left! Don\'t miss out!';
const contains = detectPatterns(text);
const result = checkMahavrata({ text, urgency: 0.95, paused: false, contains });

console.log('Input:', text);
console.log('Patterns detected:', contains);
console.log('Passes Mahā-vrata:', result.passes);
if (!result.passes) {
  for (const v of result.violations) console.log(`  ✗ ${v.rule}: ${v.reason}`);
}

// 2. Wrap an agent — block before executor runs.
const safeAgent = wrapAgent({
  name: 'Marketing copy reviewer',
  svadharma: {
    jati: LAYERS.VASU,
    guna: GUNAS.SATTVA,
    karma: 'craft honest, non-coercive marketing copy',
    svabhava: 'thoughtful, plain, accountable',
  },
});

const blocked = await safeAgent.act(
  {
    text,
    urgency: 0.95,
    paused: false,
    contains,
    targetLayer: LAYERS.VASU,
    targetKarma: 'marketing copy',
    intrinsicValue: true,
    danaType: 'vidya',
  },
  async () => 'this should not be sent to a real LLM'
);

console.log('\nWrapped agent allowed?', blocked.allowed);
console.log('Reason:', blocked.reason);
