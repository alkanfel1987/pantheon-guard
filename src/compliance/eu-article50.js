/**
 * pantheon-guard · EU AI Act Article 50 — Compliance module
 *
 * В силе с 02.08.2026. Обязательная прозрачность AI-контента
 * в зонах общественного интереса (выборы, финансы, здоровье, право, наука).
 *
 * Архитектура: 4 уровня (M1–M4), 2-уровневый ввод {headline, body}.
 * API: `checkCompliance({ headline, body }, options?)` — отдельный вызов,
 * не внутри inspect(), чтобы не ломать основной пайплайн GUARD.
 *
 * Ограничения (честно):
 *   — M1: текстовые паттерны (inline). C2PA/HTML-мета не охвачены без DOM.
 *   — M2: ключевые слова, не классификатор на эмбеддингах.
 *   — M3: attribution по эвристике (by/von/par + имя). Не NER.
 *   — M4: эвристика «CRITICAL» = двойное нарушение Art.5 + Art.50.
 *   — Калибровка: синтетический корпус; нужен живой корпус для валидации.
 *
 * Кодекс поведения EU AI Act finalized 2026-06-10.
 * Reference: arxiv.org/abs/2503.24115 (TeleAntiFraud-28k) для акустики.
 */

// ─────────────────────────────────────────────
// M1: детектор AI-раскрытия + позиция метки
// ─────────────────────────────────────────────

const AI_DISCLOSURE_PATTERNS = [
  // Русский
  /сгенерирован[оа]?\s+(ИИ|AI|искусственным\s+интеллектом)/iu,
  /создан[оа]?\s+с\s+помощью\s+(ИИ|AI)/iu,
  /(?:эт(?:от|а|о)\s+)?(?:текст|материал|статья)\s+(?:был[оа]?\s+)?(?:создан[оа]?|написан[оа]?|подготовлен[оа]?)\s+(?:с\s+(?:помощью|использованием)\s+)?(ИИ|AI)/iu,
  /написан[оа]?\s+(?:при\s+помощи\s+)?(?:ИИ|AI)/iu,
  // English
  /generated\s+by\s+AI/i,
  /AI[-\s]generated/i,
  /created\s+with\s+(?:AI|artificial\s+intelligence)/i,
  /written\s+(?:by|with)\s+(?:AI|artificial\s+intelligence)/i,
  // German
  /KI[-\s]?erstellt/i,
  /von\s+KI\s+generiert/i,
  /mit\s+(?:KI|Künstlicher\s+Intelligenz)\s+erstellt/i,
  // French
  /généré\s+par\s+(?:IA|AI)/i,
  /créé\s+(?:avec|par)\s+(?:IA|intelligence\s+artificielle)/i,
];

/**
 * Позиция метки в тексте.
 * @typedef {'title'|'top_of_body'|'buried'|'missing'} LabelPosition
 */

/**
 * Найти AI-маркировку и определить её позицию.
 * top_of_body = первые 20% символов, buried = остальное.
 *
 * @param {string} headline
 * @param {string} body
 * @returns {{ labelFound: boolean, labelPosition: LabelPosition, matchedPattern: string|null }}
 */
export function detectLabel(headline, body) {
  // Ищем в заголовке
  for (const pat of AI_DISCLOSURE_PATTERNS) {
    if (pat.test(headline)) {
      return { labelFound: true, labelPosition: 'title', matchedPattern: pat.source };
    }
  }
  // Ищем в теле
  if (body && body.length > 0) {
    const threshold = Math.ceil(body.length * 0.20);  // первые 20%
    for (const pat of AI_DISCLOSURE_PATTERNS) {
      const m = body.match(pat);
      if (m) {
        const pos = m.index;
        return {
          labelFound: true,
          labelPosition: pos <= threshold ? 'top_of_body' : 'buried',
          matchedPattern: pat.source,
        };
      }
    }
  }
  return { labelFound: false, labelPosition: 'missing', matchedPattern: null };
}

// ─────────────────────────────────────────────
// M2: классификатор тем общественного интереса
// ─────────────────────────────────────────────

const PUBLIC_INTEREST_SIGNALS = Object.freeze({
  elections: [
    /выборы|голосован|кандидат|депутат|партия|избирател|электорал/iu,
    /election|vote|ballot|candidate|parliament|electoral|polling/i,
    /Wahl|Abstimmung|Kandidat|Bundestag|Wahlkampf|Abgeordnete/i,
    /élection|vote|candidat|parlement|suffrage/i,
  ],
  finance: [
    /инвестиц|кредит|страховани|биржа|акц|облигац|вклад|доходност|пенсия/iu,
    /investment|loan|insurance|stock|bond|portfolio|dividend|return|pension/i,
    /Investition|Kredit|Versicherung|Aktie|Anlage|Rendite|Rente/i,
    /investissement|crédit|assurance|action|obligation|retraite/i,
  ],
  health: [
    /лечени|вакцин|диагноз|лекарств|операц|симптом|препарат|клиническ|пациент/iu,
    /treatment|vaccine|diagnosis|medication|surgery|symptom|clinical|patient/i,
    /Behandlung|Impfstoff|Diagnose|Medikament|Operation|Symptom|Patient/i,
    /traitement|vaccin|diagnostic|médicament|symptôme|patient/i,
  ],
  legal: [
    /суд|иск|право|закон|приговор|арест|юридическ|правосудие|прокурор/iu,
    /lawsuit|court|rights|law|verdict|arrest|legal|justice|prosecution/i,
    /Klage|Gericht|Recht|Gesetz|Urteil|Verhaftung|Staatsanwalt/i,
    /procès|tribunal|droits|loi|verdict|arrestation|procureur/i,
  ],
  science: [
    /климат|экологи|выброс|исследовани|научн|CO2|потеплени|учёные/iu,
    /climate|ecology|emission|research|scientific|warming|scientists/i,
    /Klima|Ökologie|Emission|Forschung|wissenschaftlich|Wissenschaftler/i,
    /climat|écologie|émission|recherche|scientifique|réchauffement/i,
  ],
  neutral: [],  // зарезервировано — тексты без публичной темы
});

/**
 * Классифицировать текст по теме общественного интереса.
 * Проверяет заголовок + тело вместе.
 *
 * @param {string} headline
 * @param {string} body
 * @returns {{ isPublicInterest: boolean, domains: string[] }}
 */
export function classifyPublicInterest(headline, body) {
  const combined = [headline, body].filter(Boolean).join(' ');
  const matched = [];
  for (const [domain, patterns] of Object.entries(PUBLIC_INTEREST_SIGNALS)) {
    if (domain === 'neutral') continue;
    if (patterns.some(p => p.test(combined))) matched.push(domain);
  }
  return { isPublicInterest: matched.length > 0, domains: matched };
}

// ─────────────────────────────────────────────
// M3: атрибуция (эвристика)
// ─────────────────────────────────────────────

// Паттерны атрибуции автора (by/von/par + имя, редакционный стиль)
const EDITORIAL_ATTRIBUTION_PATTERNS = [
  /(?:by|автор:?|написал(?:а)?)\s+[A-ZА-ЯЁ][a-zа-яё]+/iu,
  /(?:по\s+материалам|перевод|обзор)\s+.{3,40}/iu,
  /von\s+[A-Z][a-z]+/u,
  /par\s+[A-Z][a-z]+/u,
  /(?:staff|editorial)\s+writer/i,
  /редакц|editorial\s+team|editorial\s+board/i,
  /(?:пресс-служба|press\s+office|press\s+release)/i,
];

/**
 * Проверить наличие редакционной атрибуции.
 * Эвристика: наличие паттерна ≠ строгая проверка. Уровень M3 = слабый сигнал.
 *
 * @param {string} headline
 * @param {string} body
 * @returns {{ hasAttribution: boolean }}
 */
export function checkAttribution(headline, body) {
  const combined = [headline, body].filter(Boolean).join('\n');
  const hasAttribution = EDITORIAL_ATTRIBUTION_PATTERNS.some(p => p.test(combined));
  return { hasAttribution };
}

// ─────────────────────────────────────────────
// M4: составной риск (LOW / MEDIUM / HIGH / CRITICAL)
// ─────────────────────────────────────────────

/**
 * @typedef {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} ComplianceRisk
 */

/**
 * Вычислить итоговый compliance-риск.
 *
 * Матрица:
 *   CRITICAL = публичная тема + нет метки + GUARD-алерт (двойное нарушение Art.5+Art.50)
 *   HIGH     = публичная тема + нет метки (label missing / buried)
 *   MEDIUM   = публичная тема + метка есть, но buried (закопана в конец)
 *   LOW      = нет публичной темы ИЛИ метка на правильной позиции
 *
 * @param {{ isPublicInterest: boolean, labelPosition: LabelPosition, guardFailed?: boolean }} params
 * @returns {{ complianceRisk: ComplianceRisk, rationale: string }}
 */
export function assessComplianceRisk({ isPublicInterest, labelPosition, guardFailed = false }) {
  if (!isPublicInterest) {
    return { complianceRisk: 'LOW', rationale: 'Тема не относится к общественному интересу' };
  }
  if (labelPosition === 'title' || labelPosition === 'top_of_body') {
    return { complianceRisk: 'LOW', rationale: 'Метка AI присутствует на видном месте' };
  }
  if (labelPosition === 'buried') {
    return { complianceRisk: 'MEDIUM', rationale: 'Метка есть, но закопана (>20% от начала текста)' };
  }
  // labelPosition === 'missing'
  if (guardFailed) {
    return {
      complianceRisk: 'CRITICAL',
      rationale: 'Двойное нарушение: AI-контент по публичной теме без маркировки + признаки манипуляции (Art.5 + Art.50)',
    };
  }
  return { complianceRisk: 'HIGH', rationale: 'Публичная тема без AI-маркировки — Art.50 EU AI Act' };
}

// ─────────────────────────────────────────────
// Главный API
// ─────────────────────────────────────────────

/**
 * Проверить соответствие EU AI Act Article 50.
 *
 * Отдельный вызов от `inspect()` — не влияет на основной пайплайн GUARD.
 * Применяется только после того, как `inspect()` уже отработал.
 *
 * @param {{ headline: string, body: string }} content
 * @param {{ guardFailed?: boolean }} [options]
 * @returns {{
 *   complianceRisk: ComplianceRisk,
 *   rationale: string,
 *   labelFound: boolean,
 *   labelPosition: LabelPosition,
 *   isPublicInterest: boolean,
 *   domains: string[],
 *   hasAttribution: boolean,
 *   m1: { labelFound: boolean, labelPosition: LabelPosition, matchedPattern: string|null },
 *   m2: { isPublicInterest: boolean, domains: string[] },
 *   m3: { hasAttribution: boolean },
 *   m4: { complianceRisk: ComplianceRisk, rationale: string },
 * }}
 */
export function checkCompliance({ headline = '', body = '' }, { guardFailed = false } = {}) {
  const m1 = detectLabel(headline, body);
  const m2 = classifyPublicInterest(headline, body);
  const m3 = checkAttribution(headline, body);
  const m4 = assessComplianceRisk({
    isPublicInterest: m2.isPublicInterest,
    labelPosition:    m1.labelPosition,
    guardFailed,
  });

  return {
    complianceRisk:  m4.complianceRisk,
    rationale:       m4.rationale,
    labelFound:      m1.labelFound,
    labelPosition:   m1.labelPosition,
    isPublicInterest: m2.isPublicInterest,
    domains:         m2.domains,
    hasAttribution:  m3.hasAttribution,
    m1,
    m2,
    m3,
    m4,
  };
}
