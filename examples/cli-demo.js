/**
 * cli-demo.js — smoke test from the CLI
 *
 * Reproduces the pretty-printed self-check that lived inside the original
 * pantheon-core.js (`if (require.main === module) { … }` block).
 *
 *   node examples/cli-demo.js
 */

import {
  CORE_VERSION,
  LAYERS,
  GUNAS,
  MAHAVRATA,
  SVADHARMA_SCHEMA,
  FIVE_STEP_ALGORITHM,
  LAWS,
  checkMahavrata,
  runFiveSteps,
} from '../src/index.js';

console.log('\n' + '═'.repeat(72));
console.log('  ПАНТЕОН · CORE v' + CORE_VERSION);
console.log('═'.repeat(72) + '\n');

console.log('Маха-врата (5 сдерживателей Эго):');
Object.entries(MAHAVRATA.rules).forEach(([key, r]) => {
  console.log(`  ${r.sanskrit.padEnd(6)} ${r.iast.padEnd(18)} — ${r.meaning}`);
});

console.log('\nФормула Свадхармы:');
Object.entries(SVADHARMA_SCHEMA.variables).forEach(([key, v]) => {
  const mutable = v.mutable ? '(изменяемая)' : '(НЕИЗМЕНЯЕМАЯ)';
  console.log(`  ${key.padEnd(10)} ${mutable.padEnd(16)} — ${v.description}`);
});

console.log('\nПятишаговый алгоритм:');
FIVE_STEP_ALGORITHM.steps.forEach((s) => {
  console.log(`  ${s.number}. ${s.name.padEnd(10)} ${s.sanskrit.padEnd(6)} — ${s.question}`);
});

console.log('\n10+1 законов:');
LAWS.forEach((l) => {
  console.log(`  ${String(l.number).padStart(2)}. ${l.name.padEnd(22)} · ${l.rule}`);
});

console.log('\n── Тест checkMahavrata() ──');
const testAction = {
  text: 'Спешная рассылка со срочным предложением',
  urgency: 0.95,
  paused: false,
  contains: { falseUrgency: true, fearBased: true },
};
const mvResult = checkMahavrata(testAction);
console.log(`  passes: ${mvResult.passes}`);
if (!mvResult.passes) {
  mvResult.violations.forEach((v) => console.log(`  ✗ ${v.rule}: ${v.reason}`));
}

console.log('\n── Тест runFiveSteps() ──');
const testAgent = {
  name: 'Варуна',
  svadharma: {
    jati: LAYERS.ADITYA,
    guna: GUNAS.SATTVA,
    karma: 'комплаенс, правовые риски, аудит',
    svabhava: 'объективный страж, называет риски без паники',
  },
};
const goodAction = {
  text: 'Спокойный правовой алерт с источником',
  urgency: 0.3,
  paused: true,
  sources: ['pravo.gov.ru'],
  currentGuna: 'Саттва',
  intrinsicValue: true,
  danaType: 'abhaya',
  targetLayer: LAYERS.ADITYA,
  targetKarma: 'правовые риски',
};
const fsResult = runFiveSteps(testAgent, goodAction);
console.log(`  passes: ${fsResult.passes}`);
fsResult.steps.forEach((s) => {
  console.log(`  ${s.passes ? '✓' : '✗'} ${s.name.padEnd(10)} — ${s.detail}`);
});

console.log('\n✓ pantheon-guard v' + CORE_VERSION + ' готов к работе\n');
