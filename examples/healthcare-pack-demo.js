/**
 * healthcare-pack-demo.js — first commercial rule-pack demonstration.
 *
 * Run:  node examples/healthcare-pack-demo.js
 *
 * Shows three modes side-by-side on the same medical AI outputs:
 *   1. inspect()                     — core only, no domain context
 *   2. applyPack(healthcarePack)     — core + healthcare domain rules
 *
 * The contrast is the value proposition for a paid `@pantheon/guard-healthcare`
 * subscription: a benign-looking text that the core lets pass becomes a
 * blocking violation when the healthcare pack is loaded, because the text
 * makes a medical claim without provider escalation.
 */

import {
  inspect,
  applyPack,
  healthcarePack,
  CORE_VERSION,
} from '../src/index.js';

const inspectHealth = applyPack(healthcarePack);

const samples = [
  {
    label: 'Clean medical advice with provider escalation',
    text: 'Mild headaches can be caused by dehydration. Drink water, rest, and consult a doctor if symptoms persist beyond two days.',
    expected: 'pass in both modes',
  },
  {
    label: 'Same advice, missing provider escalation',
    text: 'Mild headaches can be caused by dehydration. Drink water, rest. Most pass on their own.',
    expected: 'pass core, BLOCK healthcare (missing escalation)',
  },
  {
    label: 'Self-diagnosis overclaim',
    text: 'You definitely have early-stage diabetes based on these symptoms. Talk to your doctor.',
    expected: 'pass core, BLOCK healthcare (satya: self_dx_en)',
  },
  {
    label: 'Cure / 100% effective claim',
    text: 'This new herbal supplement is 100% effective at curing thyroid issues. Consult your physician before use.',
    expected: 'pass core, BLOCK healthcare (satya: cure_claim)',
  },
  {
    label: 'Medication-adjustment advice',
    text: 'Just stop taking your medication if you feel better — your body knows. Consult a doctor when convenient.',
    expected: 'pass core, BLOCK healthcare (ahimsa: med_adjust)',
  },
  {
    label: 'Red-flag symptom dismissal',
    text: 'You mentioned chest pain — probably nothing, just stress and anxiety. See a doctor if it gets worse.',
    expected: 'pass core, BLOCK healthcare (ahimsa: serious_dismissal)',
  },
  {
    label: 'Russian — no escalation',
    text: 'Симптомы похожи на простуду, попробуйте отдохнуть и пить больше жидкости.',
    expected: 'pass core, BLOCK healthcare (RU provider_escalation)',
  },
  {
    label: 'Russian — with escalation',
    text: 'Симптомы похожи на простуду. Обратитесь к врачу, если состояние не улучшится за 3 дня.',
    expected: 'pass in both modes',
  },
  {
    label: 'Non-medical text bypasses healthcare-pack provider check',
    text: 'The marketing dashboard renders weekly reports and supports custom date ranges.',
    expected: 'pass in both modes',
  },
];

console.log(`pantheon-guard v${CORE_VERSION} · healthcare pack demo\n`);
console.log(`Pack: ${healthcarePack.id} v${healthcarePack.version}`);
console.log(`Patterns: ${healthcarePack.detectionPatterns.length}`);
console.log(`Requirements: ${healthcarePack.requirements.length}`);
console.log(`Calibrator overrides: ${JSON.stringify(healthcarePack.calibratorOverrides)}`);
console.log();
console.log('─'.repeat(85));

const opts = { urgency: 0.2, paused: true };

for (const { label, text, expected } of samples) {
  const trunc = text.length > 70 ? text.slice(0, 67) + '…' : text;
  const core   = inspect(text, opts);
  const health = inspectHealth(text, opts);

  console.log(`\n● ${label}`);
  console.log(`  Text:        "${trunc}"`);
  console.log(`  Expected:    ${expected}`);
  console.log(`  core:        passes=${core.passes}` +
              (core.violations.length ? `   violations=[${core.violations.map(v => v.rule).join(',')}]` : ''));
  console.log(`  +healthcare: passes=${health.passes}` +
              (health.packViolations.length ? `   pack=[${health.packViolations.map(v => v.source).join(',')}]` : '') +
              (health.unmetRequirements.length ? `   unmet=[${health.unmetRequirements.map(u => u.id).join(',')}]` : ''));
}

console.log('\n' + '─'.repeat(85));
console.log('\nCommercial value:');
console.log('Core alone catches manipulative *language*. The healthcare pack adds');
console.log('domain-specific *requirements* (provider escalation) and tightened');
console.log('detection patterns calibrated to higher-stakes medical context. Together');
console.log('they give a regulated-industry buyer a single auditable layer with');
console.log('healthcare-specific reasoning, sized to fit FDA SaMD / EU AI Act Annex III.');
console.log();
console.log('Pricing tier — `@pantheon/guard-healthcare`:');
console.log('  Free          : evaluation / pilot');
console.log('  Starter       : $499/mo  (small healthtech, < $5M ARR)');
console.log('  Enterprise    : $4 990/mo + (large healthtech / hospital deployments)');
console.log('  + custom rules co-development per regulatory geography (negotiated)');
