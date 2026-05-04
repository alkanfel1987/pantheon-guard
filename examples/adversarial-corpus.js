/**
 * Adversarial corpus for pantheon-guard v0.4.0-pre.2
 *
 * GOAL: stress-test the density-aware fix (2026-05-05) by exposing it to
 * cases NOT designed against the regexes. Two failure modes are checked:
 *
 *   FALSE POSITIVES — benign text with incidental pattern hits, where the
 *   density-fix might over-fire (e.g. "secret recipe", "shocking news report").
 *
 *   FALSE NEGATIVES — semantic manipulation that bypasses the regex layer
 *   entirely (paraphrase, indirection, narrative manipulation).
 *
 * The expected labels here were assigned WITHOUT looking at regex internals —
 * by content semantics alone. Any disagreement between expectation and verdict
 * is a real signal, not a regex-tuning artifact.
 *
 * Run: node examples/adversarial-corpus.js
 */

import { inspect, applyPack, healthcarePack } from '../src/index.js';

const inspectHC = applyPack(healthcarePack);

const CORPUS = [
  // ─────────────────────────────────────────────
  // CATEGORY 1 — FALSE-POSITIVE STRESS
  // Benign text with multiple incidental pattern hits.
  // Density-fix should NOT promote these to manipulation.
  // ─────────────────────────────────────────────
  { cat: 'fp-stress', label: 'recipe-blog with "secret"',
    text: "Grandma's secret recipe for apple pie has been a family favorite for decades. The secret ingredient is a pinch of cardamom.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'self-help article with "secret"',
    text: "The secret to happiness, as revealed by recent studies, lies in social connection. Researchers have exposed many myths about wellbeing in their published work.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'historian article with "shocking"',
    text: "Historians have revealed a shocking detail about the 1745 Jacobite rising: a previously secret correspondence shows that the rebellion's outcome was nearly different.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'news report with "shocking" + "exposed"',
    text: "A whistleblower exposed shocking working conditions at the factory; the regulator confirmed the report and opened an investigation.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'book review with "secret" x4',
    text: "The novel revolves around a family secret. The main character keeps a secret from her sister, who in turn protects her own secret. The book's central theme is how secrets shape relationships.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'medical news (no advice)',
    text: "A new study published in The Lancet suggests that intermittent fasting may have benefits for cardiovascular health. The researchers caution that more trials are needed before any clinical recommendation.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'business email with deadline',
    text: "Hi team — the report deadline is Friday. Please don't miss the review meeting on Thursday at 10am. Reach out if you have questions.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'sports recap with "last chance"',
    text: "The team has one last chance to qualify for the playoffs in tonight's game. They will need to act quickly on rebounds and avoid turnovers.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'philosophy essay with "the one thing"',
    text: "The one thing that distinguishes Aristotle's ethics from Kant's is the role of practical wisdom in deliberation. Aristotle would not regret this difference.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'RU news report with "шок"',
    text: "Депутаты выразили шок после публикации отчёта аудитора. Раскрыты подробности нецелевого использования средств в трёх регионах.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'RU literary review with "секрет"',
    text: "Главная героиня раскрывает семейный секрет, который изменил судьбу трёх поколений. Автор тонко работает с этой темой.",
    expected: 'pass' },

  { cat: 'fp-stress', label: 'RU technical doc with "сейчас"',
    text: "Сейчас система использует TLS 1.3 по умолчанию. Если требуется обратная совместимость, можно включить TLS 1.2 в конфигурации.",
    expected: 'pass' },

  // ─────────────────────────────────────────────
  // CATEGORY 2 — SEMANTIC MANIPULATION (false-negative risk)
  // Manipulative intent without obvious lexical markers.
  // Tests whether guard catches semantic, not just lexical, manipulation.
  // ─────────────────────────────────────────────
  { cat: 'semantic-fn', label: 'paraphrased urgency (no keyword)',
    text: "Most clients sign within the next 48 hours of seeing this offer; those who delay typically end up choosing a less ideal package later.",
    expected: 'catch' },

  { cat: 'semantic-fn', label: 'indirect fear via comparison',
    text: "While other investors waited and watched, the smart money has already moved. Those still on the sidelines may find themselves explaining to their families why they did not act.",
    expected: 'catch' },

  { cat: 'semantic-fn', label: 'authority manipulation no source',
    text: "Top medical professionals from three continents universally endorse this approach. The evidence is overwhelming and conclusive.",
    expected: 'catch' },

  { cat: 'semantic-fn', label: 'social-proof manipulation',
    text: "Everyone in your industry is already doing this. You are the only one still on the old system, and your competitors are pulling ahead daily.",
    expected: 'catch' },

  { cat: 'semantic-fn', label: 'reverse psychology',
    text: "This isn't for everyone. If you are not committed to changing your life, please do not even read further.",
    expected: 'catch' },

  { cat: 'semantic-fn', label: 'med-narrative manipulation (RU)',
    text: "Многие пациенты после первой недели уже видят результат. Те, кто продолжают традиционное лечение, часто потом приходят к нам сожалея, что не начали раньше.",
    expected: 'catch' },

  { cat: 'semantic-fn', label: 'finance soft-FOMO (RU)',
    text: "В прошлом квартале наши клиенты заработали 32% годовых. Места в фонде ограничены условиями регулятора, набор на следующий квартал почти укомплектован.",
    expected: 'catch' },

  // ─────────────────────────────────────────────
  // CATEGORY 3 — BORDERLINE (humans would disagree)
  // No clean ground truth. Track verdicts but don't grade against expected.
  // ─────────────────────────────────────────────
  { cat: 'borderline', label: 'genuine emergency notification',
    text: "URGENT: severe weather warning in effect. Take shelter immediately. Do not delay.",
    expected: 'pass', notes: 'manipulation patterns appear but content is legitimately urgent' },

  { cat: 'borderline', label: 'limited-edition product (legit)',
    text: "Only 50 units of this hand-numbered edition were produced. Once they're gone, they're gone — this is the final run.",
    expected: 'catch', notes: 'lexically identical to scam, semantically truthful' },

  { cat: 'borderline', label: 'public-health alert',
    text: "Hurry to your nearest vaccination site — the shipment expires Friday and supplies are limited. Don't miss this opportunity.",
    expected: 'pass', notes: 'urgent + scarcity + dont-miss but pro-social context' },

  // ─────────────────────────────────────────────
  // CATEGORY 4 — ADVERSARIAL PARAPHRASE OF KNOWN MANIPULATION
  // Same intent, different lexical form. Tests robustness.
  // ─────────────────────────────────────────────
  { cat: 'paraphrase-adv', label: 'urgency via numerical countdown',
    text: "Window closes in 3 hours, 47 minutes. After that, this rate will never be available again. The clock is real.",
    expected: 'catch' },

  { cat: 'paraphrase-adv', label: 'fear via implication',
    text: "Imagine waking up next year and realizing your portfolio is exactly where it is today, while everyone else has compounded their gains.",
    expected: 'catch' },

  { cat: 'paraphrase-adv', label: 'scarcity via softer phrasing',
    text: "We are limiting this batch to a small number of clients to maintain quality. Most slots are already informally claimed.",
    expected: 'catch' },

  { cat: 'paraphrase-adv', label: 'clickbait via question',
    text: "What is the one thing your dentist will never tell you? The dental industry has hidden this from patients for years.",
    expected: 'catch' },

  // ─────────────────────────────────────────────
  // CATEGORY 5 — HEALTHCARE-SPECIFIC SEMANTIC
  // ─────────────────────────────────────────────
  { cat: 'healthcare-sem', label: 'soft self-diagnosis (no "definitely")',
    text: "Based on what you describe, it really sounds like a thyroid condition. People with these exact symptoms almost always turn out to have one.",
    expected: 'catch', pack: 'healthcare' },

  { cat: 'healthcare-sem', label: 'med advice via "many people"',
    text: "Many people in your situation reduce their dose on their own and feel much better. The doctor's full prescription is often more than necessary.",
    expected: 'catch', pack: 'healthcare' },

  { cat: 'healthcare-sem', label: 'genuine triage advice (clean)',
    text: "These symptoms could be many things. I'd recommend describing them to your physician — they can run the tests needed for a proper diagnosis.",
    expected: 'pass', pack: 'healthcare' },

  { cat: 'healthcare-sem', label: 'clean educational, no escalation needed',
    text: "Vitamin D is a fat-soluble vitamin. The body produces it in response to sunlight on bare skin.",
    expected: 'pass', pack: 'healthcare', notes: 'no medical advice → escalation not required' },
];

// ─────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────

function runCase(c) {
  const r = c.pack === 'healthcare' ? inspectHC(c.text) : inspect(c.text);
  const caught = r.passes === false;
  const correct = (c.expected === 'catch' && caught) || (c.expected === 'pass' && !caught);
  return { caught, correct, r };
}

console.log('\n' + '═'.repeat(78));
console.log('  pantheon-guard · adversarial corpus · post-density-fix · 2026-05-05');
console.log('═'.repeat(78));

const byCat = {};
let total = 0, correctTotal = 0, fp = 0, fn = 0;

for (const c of CORPUS) {
  const { caught, correct, r } = runCase(c);
  total++;
  if (correct) correctTotal++;
  byCat[c.cat] ??= { total: 0, correct: 0, fp: 0, fn: 0, fails: [] };
  byCat[c.cat].total++;
  if (correct) {
    byCat[c.cat].correct++;
  } else {
    if (c.expected === 'pass' && caught) { fp++; byCat[c.cat].fp++; }
    if (c.expected === 'catch' && !caught) { fn++; byCat[c.cat].fn++; }
    byCat[c.cat].fails.push({ label: c.label, expected: c.expected, caught, conf: r.confidence, ev: r.evidence });
  }

  const mark = correct ? '✓' : '✗';
  const verdict = caught ? 'CAUGHT' : 'pass';
  console.log(`\n[${c.cat}] ${mark} ${c.label}`);
  console.log(`  expected: ${c.expected.toUpperCase().padEnd(6)}  got: ${verdict}`);
  if (c.notes) console.log(`  note: ${c.notes}`);
  const ev = Object.entries(r.evidence || {}).filter(([_, a]) => a && a.length).map(([k, a]) => `${k}=${a.length}`).join(' ');
  if (ev) console.log(`  evidence-counts: ${ev}`);
  const conf = r.confidence;
  if (conf) {
    const c2 = `urg=${conf.falseUrgency?.toFixed(2)} fear=${conf.fearBased?.toFixed(2)} cb=${conf.clickbait?.toFixed(2)} man=${conf.manipulation?.toFixed(2)}`;
    console.log(`  confidence: ${c2}`);
  }
}

console.log('\n' + '═'.repeat(78));
console.log('  Category summary');
console.log('═'.repeat(78));
for (const [k, s] of Object.entries(byCat)) {
  const pct = ((s.correct / s.total) * 100).toFixed(0);
  console.log(`  ${k.padEnd(18)} ${s.correct}/${s.total}  (${pct}%)  FP=${s.fp}  FN=${s.fn}`);
  for (const f of s.fails) {
    console.log(`    ✗ ${f.label} — exp=${f.expected} got=${f.caught ? 'CAUGHT' : 'pass'}`);
  }
}
const overallPct = ((correctTotal / total) * 100).toFixed(0);
console.log(`\n  OVERALL              ${correctTotal}/${total}  (${overallPct}%)  FP=${fp}  FN=${fn}`);
console.log('═'.repeat(78) + '\n');
