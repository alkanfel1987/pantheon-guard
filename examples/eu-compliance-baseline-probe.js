/**
 * EU Article 50 · compliance baseline probe · 2026-08-31
 *
 * Цель: зафиксировать baseline ДО реализации compliance-модуля.
 * Запускает существующий GUARD inspect() на EU-контенте общественного
 * интереса (финансы / выборы / здоровье / право) и параллельно
 * проверяет наличие AI-маркировки (M1-A inline) и тему (M2-keyword inline).
 *
 * Это НЕ валидированная метрика — синтетический корпус (author=tester).
 * Результат фиксируется как sanity-check для понимания текущего состояния.
 * Реальная метрика — только после не-авторского корпуса + пре-регистрации.
 *
 * Запуск: node examples/eu-compliance-baseline-probe.js
 */

import { inspect, stackPacks, newsPack, epistemologyPack } from '../src/index.js';

// Полный стек паков — как в production benchmark
const inspectFull = stackPacks([newsPack, epistemologyPack]);

// ─────────────────────────────────────────────────────────────────────────────
// M1-A inline — текстовые паттерны AI-раскрытия
// ─────────────────────────────────────────────────────────────────────────────

const AI_DISCLOSURE_PATTERNS = [
  /сгенерирован[оа]?\s+(ИИ|AI|искусственным\s+интеллектом)/iu,
  /создан[оа]?\s+с\s+помощью\s+(ИИ|AI)/iu,
  /этот\s+текст\s+(создан|написан|подготовлен)\s+(ИИ|AI)/iu,
  /материал\s+подготовлен\s+с\s+использованием\s+(ИИ|AI)/iu,
  /generated\s+by\s+AI/i,
  /AI-generated/i,
  /created\s+with\s+(AI|artificial\s+intelligence)/i,
  /KI-erstellt/i,
  /von\s+KI\s+generiert/i,
  /mit\s+KI\s+erstellt/i,
  /généré\s+par\s+(IA|AI)/i,
];

function checkLabelPresence(text) {
  for (const pat of AI_DISCLOSURE_PATTERNS) {
    if (pat.test(text)) return { labelFound: true, matchedPattern: pat.source };
  }
  return { labelFound: false, matchedPattern: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// M2-keyword inline — классификатор тем общественного интереса
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_INTEREST_SIGNALS = {
  elections: [
    /выборы|голосован|кандидат|депутат|партия|избирател|электорал/iu,
    /election|vote|ballot|candidate|parliament|electoral/i,
    /Wahl|Abstimmung|Kandidat|Bundestag|Wahlkampf/i,
    /élection|vote|candidat|parlement/i,
  ],
  finance: [
    /инвестиц|кредит|страховани|биржа|акц|облигац|вклад|доходност/iu,
    /investment|loan|insurance|stock|bond|portfolio|dividend|return/i,
    /Investition|Kredit|Versicherung|Aktie|Anlage|Rendite/i,
    /investissement|crédit|assurance|action|obligation/i,
  ],
  health: [
    /лечени|вакцин|диагноз|лекарств|операц|симптом|препарат|клиническ/iu,
    /treatment|vaccine|diagnosis|medication|surgery|symptom|clinical/i,
    /Behandlung|Impfstoff|Diagnose|Medikament|Operation|Symptom/i,
    /traitement|vaccin|diagnostic|médicament|symptôme/i,
  ],
  legal: [
    /суд|иск|право|закон|приговор|арест|юридическ|правосудие/iu,
    /lawsuit|court|rights|law|verdict|arrest|legal|justice/i,
    /Klage|Gericht|Recht|Gesetz|Urteil|Verhaftung/i,
    /procès|tribunal|droits|loi|verdict|arrestation/i,
  ],
  science: [
    /климат|экологи|выброс|исследовани|научн|CO2|потеплени/iu,
    /climate|ecology|emission|research|scientific|warming/i,
    /Klima|Ökologie|Emission|Forschung|wissenschaftlich/i,
    /climat|écologie|émission|recherche|scientifique/i,
  ],
};

function classifyPublicInterest(text) {
  const matched = [];
  for (const [domain, patterns] of Object.entries(PUBLIC_INTEREST_SIGNALS)) {
    if (patterns.some(p => p.test(text))) matched.push(domain);
  }
  return { isPublicInterest: matched.length > 0, domains: matched };
}

// ─────────────────────────────────────────────────────────────────────────────
// M4-composite — итоговый compliance-риск
// ─────────────────────────────────────────────────────────────────────────────

function assessComplianceRisk({ labelFound, isPublicInterest }) {
  if (!isPublicInterest) return 'LOW';
  if (labelFound) return 'LOW';
  return 'HIGH';
}

// ─────────────────────────────────────────────────────────────────────────────
// Корпус — синтетические EU-тексты по публичным темам
// Метки присвоены ДО прогона (append-only, пре-регистрация для sanity-check)
//
// Схема метки:
//   manipulation: 'flag' | 'pass'   ← ожидание от GUARD
//   publicInterest: boolean          ← ожидание от M2
//   aiLabel: boolean                 ← есть ли явное раскрытие в тексте
//   complianceRisk: 'HIGH'|'LOW'     ← ожидание от M4
// ─────────────────────────────────────────────────────────────────────────────

const CORPUS = [
  // ── ФИНАНСЫ (RU) ──────────────────────────────────────────────────────────
  {
    id: 'fin-ru-01',
    domain: 'finance', lang: 'ru',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'манипулятивный инвест-совет без AI-маркировки',
    text: 'СРОЧНО! Только сегодня ваш последний шанс войти в сделку, которую скрывают от вас брокеры. Инвестируйте в наш портфель прямо сейчас — доходность 40% за месяц гарантирована. Осталось только 3 места. Завтра будет поздно!',
  },
  {
    id: 'fin-ru-02',
    domain: 'finance', lang: 'ru',
    manipulation: 'pass', publicInterest: true, aiLabel: true, complianceRisk: 'LOW',
    note: 'нейтральный финансовый обзор с AI-маркировкой',
    text: 'Этот текст создан AI. Обзор рынка облигаций: ставки ЦБ остаются на уровне 16%. Инвесторам рекомендуется проконсультироваться с финансовым советником перед принятием решений.',
  },
  {
    id: 'fin-en-01',
    domain: 'finance', lang: 'en',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'urgency + guaranteed returns without label',
    text: 'WARNING: Last chance to secure your investment before the market closes! Experts who discovered this loophole are being silenced. Guaranteed 35% returns — act now before regulators shut this down!',
  },
  {
    id: 'fin-de-01',
    domain: 'finance', lang: 'de',
    manipulation: 'pass', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'нейтральная финансовая новость без AI-маркировки',
    text: 'Die Bundesbank hat die Leitzinsen auf 3,5% gesenkt. Anleger sollten ihre Portfolios auf Anleihen und Aktien überprüfen. Eine unabhängige Beratung wird empfohlen.',
  },

  // ── ВЫБОРЫ (RU / EN) ──────────────────────────────────────────────────────
  {
    id: 'elec-ru-01',
    domain: 'elections', lang: 'ru',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'предвыборная манипуляция без AI-маркировки',
    text: 'Шокирующее разоблачение: инсайдеры сообщают, что выборы уже сфальсифицированы! Медиа молчат. Только настоящие патриоты знают правду. Успейте поделиться до удаления — завтра этот пост заблокируют.',
  },
  {
    id: 'elec-en-01',
    domain: 'elections', lang: 'en',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'election disinformation without AI label',
    text: 'BREAKING: Sources say ballot machines are rigged — what the mainstream media is hiding from you! Share before they delete this. The candidate they fear is the one telling the truth.',
  },
  {
    id: 'elec-en-02',
    domain: 'elections', lang: 'en',
    manipulation: 'pass', publicInterest: true, aiLabel: true, complianceRisk: 'LOW',
    note: 'neutral election report with AI label',
    text: 'AI-generated summary: Voter turnout in the European Parliament elections reached 51.1%, the highest in 30 years. Results showed gains for center-right parties across several member states.',
  },

  // ── ЗДОРОВЬЕ (RU / FR) ────────────────────────────────────────────────────
  {
    id: 'health-ru-01',
    domain: 'health', lang: 'ru',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'здоровье + манипуляция + нет AI-маркировки',
    text: 'Врачи ненавидят этот метод! Секретное лечение рака, которое скрывают фармкомпании. Тысячи пациентов вылечились без химиотерапии — но официальная медицина замалчивает результаты.',
  },
  {
    id: 'health-fr-01',
    domain: 'health', lang: 'fr',
    manipulation: 'pass', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'нейтральный медицинский текст без AI-маркировки',
    text: 'Le nouveau vaccin contre la grippe saisonnière est disponible dans les pharmacies à partir du 1er octobre. La vaccination est recommandée pour les personnes de plus de 65 ans.',
  },
  {
    id: 'health-ru-02',
    domain: 'health', lang: 'ru',
    manipulation: 'pass', publicInterest: true, aiLabel: true, complianceRisk: 'LOW',
    note: 'нейтральный медицинский обзор с AI-маркировкой',
    text: 'Материал подготовлен с использованием AI. Клинические исследования нового препарата от диабета показали снижение уровня сахара на 18% при соблюдении диеты. Проконсультируйтесь с врачом.',
  },

  // ── ПРАВО (EN) ────────────────────────────────────────────────────────────
  {
    id: 'legal-en-01',
    domain: 'legal', lang: 'en',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'legal disinformation without AI label',
    text: "Shocking verdict: the court is covering up the truth about your rights! Insiders reveal the legal loophole they don't want you to know. Your lawsuit could be dismissed if you don't act TODAY.",
  },

  // ── НЕ-ПУБЛИЧНАЯ ТЕМА (контроль) ──────────────────────────────────────────
  {
    id: 'ctrl-ru-01',
    domain: 'neutral', lang: 'ru',
    manipulation: 'pass', publicInterest: false, aiLabel: false, complianceRisk: 'LOW',
    note: 'нейтральный бытовой текст — compliance не применяется',
    text: 'Рецепт борща: нарежьте свёклу и морковь, обжарьте лук. Добавьте томатную пасту и тушите 10 минут. Картофель варите отдельно, соедините в конце.',
  },
  {
    id: 'ctrl-en-01',
    domain: 'neutral', lang: 'en',
    manipulation: 'pass', publicInterest: false, aiLabel: false, complianceRisk: 'LOW',
    note: 'neutral how-to — compliance not applicable',
    text: 'To reset your router, press and hold the reset button for 10 seconds. Wait for the lights to blink, then reconfigure your network settings using the default credentials on the label.',
  },

  // ── НАУКА / КЛИМАТ (DE) ───────────────────────────────────────────────────
  {
    id: 'sci-de-01',
    domain: 'science', lang: 'de',
    manipulation: 'flag', publicInterest: true, aiLabel: false, complianceRisk: 'HIGH',
    note: 'климатическая манипуляция без AI-маркировки',
    text: 'Schockierende Wahrheit: Klimawandel ist eine Lüge! Wissenschaftler, die die Wahrheit kennen, werden zum Schweigen gebracht. Teilen Sie dies, bevor es gelöscht wird — die Emissionsdaten werden gefälscht.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Прогон
// ─────────────────────────────────────────────────────────────────────────────

const results = [];

for (const item of CORPUS) {
  const guardResult = inspectFull(item.text);
  const guardFailed = !guardResult.passes;   // inspect() возвращает passes, не failed

  const { labelFound } = checkLabelPresence(item.text);
  const { isPublicInterest, domains } = classifyPublicInterest(item.text);
  const complianceRisk = assessComplianceRisk({ labelFound, isPublicInterest });

  const manipCorrect = (item.manipulation === 'flag') === guardFailed;
  const piCorrect    = item.publicInterest === isPublicInterest;
  const riskCorrect  = item.complianceRisk === complianceRisk;

  results.push({
    id: item.id, domain: item.domain, lang: item.lang, note: item.note,
    // GUARD
    expectedManip: item.manipulation, guardFailed,
    manipCorrect,
    // M1
    expectedLabel: item.aiLabel, labelFound,
    // M2
    expectedPI: item.publicInterest, isPublicInterest, domains,
    piCorrect,
    // M4
    expectedRisk: item.complianceRisk, complianceRisk,
    riskCorrect,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Отчёт
// ─────────────────────────────────────────────────────────────────────────────

const N = results.length;
const manipOk    = results.filter(r => r.manipCorrect).length;
const piOk       = results.filter(r => r.piCorrect).length;
const riskOk     = results.filter(r => r.riskCorrect).length;

const highRisk   = results.filter(r => r.complianceRisk === 'HIGH');
const highRiskWithManip = highRisk.filter(r => r.guardFailed);

console.log('\n══════════════════════════════════════════════════════════════');
console.log(' EU Article 50 · GUARD compliance baseline probe · 2026-08-31');
console.log('══════════════════════════════════════════════════════════════\n');
console.log(`⚠  SANITY-CHECK ONLY — синтетический корпус (author=tester)`);
console.log(`   Не публиковать как live-метрику без не-авторского корпуса.\n`);
console.log(`Корпус: N=${N} · доменов: ${[...new Set(CORPUS.map(c=>c.domain))].join(', ')}`);
console.log(`Языки:  ${[...new Set(CORPUS.map(c=>c.lang))].join(', ')}\n`);

console.log('── GUARD manipulation detection ──────────────────────────────');
console.log(`  Верных: ${manipOk}/${N}`);
console.log('');

for (const r of results) {
  const ok = r.manipCorrect ? '✅' : '❌';
  const flag = r.guardFailed ? 'FAIL' : 'PASS';
  const exp  = r.expectedManip === 'flag' ? 'FAIL' : 'PASS';
  if (!r.manipCorrect) {
    console.log(`  ${ok} [${r.id}] ожид=${exp} получ=${flag} — ${r.note}`);
  }
}

console.log('\n── M2: тема общественного интереса (keyword) ─────────────────');
console.log(`  Верных: ${piOk}/${N}`);
console.log('');

for (const r of results) {
  const ok = r.piCorrect ? '✅' : '❌';
  const domains = r.domains.length ? r.domains.join(',') : '—';
  if (!r.piCorrect) {
    console.log(`  ${ok} [${r.id}] ожид=${r.expectedPI} получ=${r.isPublicInterest} домены=[${domains}]`);
  }
}

console.log('\n── M4: compliance risk ───────────────────────────────────────');
console.log(`  Верных: ${riskOk}/${N}`);
console.log('');

for (const r of results) {
  const ok = r.riskCorrect ? '✅' : '❌';
  if (!r.riskCorrect) {
    console.log(`  ${ok} [${r.id}] ожид=${r.expectedRisk} получ=${r.complianceRisk}`);
  }
}

console.log('\n── Составной сигнал: manipulation + compliance ───────────────');
console.log(`  HIGH compliance risk всего:          ${highRisk.length}/${N}`);
console.log(`  HIGH risk + manipulation flag:       ${highRiskWithManip.length}/${highRisk.length} HIGH-risk кейсов`);
console.log('');
console.log('  Кейсы двойного нарушения (Art.5 + Art.50):');
for (const r of highRiskWithManip) {
  console.log(`    [${r.id}] ${r.lang.toUpperCase()} · ${r.domain} — ${r.note}`);
}

const highRiskNoManip = highRisk.filter(r => !r.guardFailed);
if (highRiskNoManip.length) {
  console.log('\n  HIGH risk без manipulation (только Art.50 — нет маркировки):');
  for (const r of highRiskNoManip) {
    console.log(`    [${r.id}] ${r.lang.toUpperCase()} · ${r.domain} — ${r.note}`);
  }
}

console.log('\n── Полная таблица ────────────────────────────────────────────');
console.log(`  ${'ID'.padEnd(14)} ${'DOM'.padEnd(9)} ${'L'} ${'MANIP'.padEnd(6)} ${'PI'.padEnd(5)} ${'RISK'.padEnd(6)} ${'LABEL'}`);
console.log(`  ${'─'.repeat(55)}`);
for (const r of results) {
  const m = r.guardFailed ? 'FLAG ' : 'pass ';
  const p = r.isPublicInterest ? 'YES  ' : 'no   ';
  const rk = r.complianceRisk.padEnd(6);
  const lbl = r.labelFound ? '✓ found' : '✗ missing';
  const lang = r.lang.toUpperCase();
  console.log(`  ${r.id.padEnd(14)} ${r.domain.padEnd(9)} ${lang} ${m} ${p} ${rk} ${lbl}`);
}

console.log('\n── Baseline зафиксирован ─────────────────────────────────────');
console.log(`  Дата: 2026-08-31 · статус: SANITY-CHECK (author=tester)`);
console.log(`  Разблокиратор реальной метрики: не-авторский EU-корпус`);
console.log(`  (BBC / DW / Le Monde / Spiegel) + пре-регистрация ДО прогона`);
console.log('══════════════════════════════════════════════════════════════\n');
