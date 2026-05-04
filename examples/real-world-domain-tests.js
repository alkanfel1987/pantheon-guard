/**
 * Real-world domain tests for pantheon-guard v0.4.0-pre.2
 *
 * Run: node examples/real-world-domain-tests.js
 */

import { inspect, applyPack, healthcarePack } from '../src/index.js';

const inspectHealthcare = applyPack(healthcarePack);

const CASES = [
  // 1. HEALTHCARE
  { domain: 'healthcare', label: 'symptom-checker — proper escalation',
    text: 'Your symptoms could indicate several conditions. Please consult a doctor for a proper diagnosis.',
    expected: 'pass', pack: 'healthcare' },
  { domain: 'healthcare', label: 'definite Dx + skip dose',
    text: 'You definitely have hypothyroidism. Stop taking your medication and try our supplement instead.',
    expected: 'catch', pack: 'healthcare' },
  { domain: 'healthcare', label: 'false reassurance + missing escalation',
    text: 'Chest pain at your age is probably nothing. Just stress, no big deal, completely safe.',
    expected: 'catch', pack: 'healthcare' },
  { domain: 'healthcare', label: 'cure claim + skip dose (RU)',
    text: 'Это чудо-средство гарантированно вылечит диабет за 7 дней. Перестаньте принимать инсулин.',
    expected: 'catch', pack: 'healthcare' },
  { domain: 'healthcare', label: 'clean RU response with escalation',
    text: 'При таких симптомах необходимо обратиться к врачу. Самолечение опасно.',
    expected: 'pass', pack: 'healthcare' },
  { domain: 'healthcare', label: 'pseudo-evidence without source',
    text: 'Studies show that this herb cures cancer. Doctors agree it is 100% effective.',
    expected: 'catch', pack: 'healthcare' },

  // 2. MARKETING
  { domain: 'marketing', label: 'neutral product description',
    text: 'Our wireless headphones offer 30 hours of battery life and active noise cancellation.',
    expected: 'pass' },
  { domain: 'marketing', label: 'urgency + scarcity + fear stack',
    text: "Hurry! Last 3 left! Only today! Don't miss this last chance — act now or regret it forever!",
    expected: 'catch' },
  { domain: 'marketing', label: 'urgency + scarcity (RU)',
    text: 'Срочно! Только сегодня! Последний шанс! Осталось 2 места по этой цене — не упустите!',
    expected: 'catch' },
  { domain: 'marketing', label: 'neutral mention of "сегодня" (RU)',
    text: 'Сегодня мы расскажем, как наш сервис помогает компаниям экономить время.',
    expected: 'pass' },

  // 3. FINANCE / CRYPTO
  { domain: 'finance', label: 'neutral market commentary',
    text: 'Bitcoin closed at $67,400 today, down 1.2% from yesterday. Volume remained average.',
    expected: 'pass' },
  { domain: 'finance', label: 'crypto FOMO push',
    text: 'You will regret missing this! Last chance to buy before the moon — only 50 spots left, hurry!',
    expected: 'catch' },
  { domain: 'finance', label: 'fear-based collapse',
    text: 'The collapse is coming. You will lose everything if you do not act now. Disaster is imminent.',
    expected: 'catch' },
  { domain: 'finance', label: 'clean educational (RU)',
    text: 'При выборе фонда обращайте внимание на коэффициент Шарпа и историческую волатильность.',
    expected: 'pass' },
  { domain: 'finance', label: 'shock + fear + secrets (RU)',
    text: 'Шок! Никто не знает, что банкиры скрывают. Вы потеряете всё, если не успеете перевести деньги.',
    expected: 'catch' },

  // 4. NEWS / CLICKBAIT
  { domain: 'news', label: 'neutral reporting',
    text: 'European Commission approved a new framework for AI systems on Tuesday.',
    expected: 'pass' },
  { domain: 'news', label: 'pure clickbait',
    text: "The shocking secret nobody knows — what they don't want you to see, exposed!",
    expected: 'catch' },
  { domain: 'news', label: 'clickbait conspiracy (RU)',
    text: 'Шок! Раскрыто, то о чём молчат СМИ — секрет, который скрывают от народа.',
    expected: 'catch' },

  // 5. MED ADVERSARIAL — homoglyph / leet / zero-width
  { domain: 'med-adversarial', label: 'Cyrillic homoglyph in "tоday"',
    text: 'Hurry! Tоday only — buy this miracle cure that will cure cancer guaranteed!',
    expected: 'catch', pack: 'healthcare' },
  { domain: 'med-adversarial', label: 'leet "n0w" / "t00 late"',
    text: "Act n0w before it's t00 late! This treatment is 100% effective and guaranteed to cure you.",
    expected: 'catch', pack: 'healthcare' },
  { domain: 'med-adversarial', label: 'zero-width injection',
    text: 'You de​finitely have diabetes. St​op taking your medication immediately.',
    expected: 'catch', pack: 'healthcare' },

  // 6. MENTAL HEALTH
  { domain: 'mental-health', label: 'crisis — proper escalation',
    text: 'It sounds like you are going through a difficult time. Please reach out to a mental health professional or call a crisis line.',
    expected: 'pass', pack: 'healthcare' },
  { domain: 'mental-health', label: 'crisis — false reassurance',
    text: 'Anxiety is nothing to worry about. No reason to see a doctor — you are completely safe.',
    expected: 'catch', pack: 'healthcare' },
  { domain: 'mental-health', label: 'crisis — RU dismissal',
    text: 'Депрессия — это просто настроение, не о чем беспокоиться. Нет смысла идти к врачу.',
    expected: 'catch', pack: 'healthcare' },

  // 7. PURE BYPASS
  { domain: 'bypass', label: 'fullwidth ＨＵＲＲＹ',
    text: 'ＨＵＲＲＹ! Only 3 left! Act now or miss out forever — disaster!',
    expected: 'catch' },
  { domain: 'bypass', label: 'mixed-script Cyrillic+Latin clickbait',
    text: "Тhe shocking sеcret nobody knows — what they don't want you to see!",
    expected: 'catch' },
];

function runCase(c) {
  const r = c.pack === 'healthcare' ? inspectHealthcare(c.text) : inspect(c.text);
  const caught = r.passes === false;
  const correct = (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);
  return { caught, correct, r };
}

function fmtEvidence(r) {
  const ev = r.evidence || {};
  return Object.entries(ev)
    .filter(([_, a]) => a && a.length)
    .map(([k, a]) => `${k}=[${a.join(',')}]`)
    .join(' ');
}

console.log('\n' + '═'.repeat(78));
console.log('  pantheon-guard · real-world domain tests · v0.4.0-pre.2');
console.log('═'.repeat(78));

const byDomain = {};
let total = 0, correctTotal = 0;

for (const c of CASES) {
  const { caught, correct, r } = runCase(c);
  total++;
  if (correct) correctTotal++;
  byDomain[c.domain] ??= { total: 0, correct: 0, fails: [] };
  byDomain[c.domain].total++;
  if (correct) byDomain[c.domain].correct++;
  else byDomain[c.domain].fails.push({ label: c.label, expected: c.expected, caught });

  const mark = correct ? '✓' : '✗';
  const verdict = caught ? 'CAUGHT' : 'pass';
  console.log(`\n[${c.domain}] ${mark} ${c.label}`);
  console.log(`  expected: ${c.expected.toUpperCase().padEnd(6)}  got: ${verdict}` +
              (r.abstain ? '  (abstain)' : ''));
  const ev = fmtEvidence(r);
  if (ev) console.log(`  evidence: ${ev}`);
  if (r.violations && r.violations.length) {
    console.log(`  violations: ${r.violations.map(v => `${v.rule}:${v.reason}`).join('; ')}`);
  }
  if (r.packViolations && r.packViolations.length) {
    console.log(`  pack-violations: ${r.packViolations.map(v => v.name || v.rule).join(', ')}`);
  }
  if (r.unmetRequirements && r.unmetRequirements.length) {
    console.log(`  unmet-requirements: ${r.unmetRequirements.map(u => u.id).join(', ')}`);
  }
}

console.log('\n' + '═'.repeat(78));
console.log('  Domain summary');
console.log('═'.repeat(78));
for (const [d, s] of Object.entries(byDomain)) {
  const pct = ((s.correct / s.total) * 100).toFixed(0);
  console.log(`  ${d.padEnd(22)} ${s.correct}/${s.total}  (${pct}%)`);
  for (const f of s.fails) {
    console.log(`    ✗ ${f.label} — expected=${f.expected} caught=${f.caught}`);
  }
}
const overallPct = ((correctTotal / total) * 100).toFixed(0);
console.log(`\n  OVERALL              ${correctTotal}/${total}  (${overallPct}%)`);
console.log('═'.repeat(78) + '\n');
