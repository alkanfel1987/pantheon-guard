/**
 * pantheon-guard · healthcare rule pack
 *
 * Domain-specific manipulation detection for medical / health AI agents.
 * Routes through the existing mahā-vrata rules (ahimsa / satya / asteya /
 * shaucha / indriya_nigraha) — does NOT introduce a new top-level category.
 *
 * Coverage (RU + EN):
 *   - Self-diagnosis overclaim          → satya
 *   - Cure / guaranteed-treatment claim → satya
 *   - False reassurance                 → satya
 *   - Medication-adjustment advice      → ahimsa
 *   - Symptom dismissal                 → ahimsa
 *   - Off-prescription pressure         → indriya_nigraha
 *   - Pseudo-medical certainty          → satya
 *
 * Plus one positive requirement:
 *   - Provider escalation MUST be present whenever the AI text discusses
 *     symptoms, treatment, medication, or medical conditions.
 *
 * Calibrator override:
 *   - NOISE_FLOOR lowered (0.30 → 0.20): healthcare false-pass costs are
 *     higher than benign-domain false-positive costs, so we abstain less
 *     readily but also flag at lower confidence.
 *   - STRONG_THRESHOLD lowered (0.70 → 0.55): a 55%-confident manipulation
 *     signal in healthcare context is enough to block.
 *
 * Regulatory drivers: FDA SaMD guidance, EU AI Act Annex III high-risk for
 * health, HIPAA (for downstream signing of verdicts), state medical-board
 * rules on AI-generated medical advice.
 */

// Unicode-aware word boundary identical to detect-patterns.js for consistency.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

// JS `\w` is ASCII-only even under the `u` flag — does NOT match Cyrillic
// letters. Use these macros in RU patterns to keep them Unicode-correct.
const W_ANY = '[\\p{L}\\p{N}_]';
const W_PLUS = W_ANY + '+';
const W_STAR = W_ANY + '*';

// ─────────────────────────────────────────────
// Detection patterns — RU + EN
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ── Self-diagnosis overclaim → satya
  {
    rule: 'satya',
    name: 'self_dx_en',
    regex: /\byou\s+(?:definitely|certainly|absolutely|clearly)\s+have\b/i,
    description: 'self-diagnosis overclaim — AI is asserting a diagnosis with unwarranted certainty',
  },
  {
    rule: 'satya',
    name: 'self_dx_ru',
    regex: re('у вас (?:точно|однозначно|совершенно точно|определённо)\\s+' + W_PLUS),
    description: 'self-diagnosis overclaim (RU)',
  },
  {
    rule: 'satya',
    name: 'self_dx_listicle_en',
    regex: /\b(?:these|your)\s+symptoms\s+(?:always\s+)?mean\b/i,
    description: 'rigid symptom-to-diagnosis claim',
  },

  // ── Cure / guaranteed-treatment claim → satya
  {
    rule: 'satya',
    name: 'cure_claim_en',
    regex: /\b(?:will\s+cure|guaranteed\s+to\s+(?:cure|heal|fix)|100%\s+effective|miracle\s+cure)\b/i,
    description: 'unsupported cure / guarantee claim',
  },
  {
    rule: 'satya',
    name: 'cure_claim_ru',
    regex: re('гарантированно (?:вылечит|излечит|поможет)|чудо-средство|стопроцентн' + W_PLUS + ' эффект'),
    description: 'unsupported cure / guarantee claim (RU)',
  },

  // ── False reassurance → satya (lying about safety)
  {
    rule: 'satya',
    name: 'false_reassurance_en',
    regex: /\b(?:nothing\s+to\s+worry\s+about|completely\s+safe|no\s+reason\s+to\s+see\s+a\s+doctor)\b/i,
    description: 'false reassurance — dismisses concern without evidence',
  },
  {
    rule: 'satya',
    name: 'false_reassurance_ru',
    regex: re('не о чем (?:беспокоиться|волноваться)|совершенно безопасно|нет смысла идти к врачу'),
    description: 'false reassurance (RU)',
  },

  // ── Medication-adjustment advice without prescription → ahimsa
  {
    rule: 'ahimsa',
    name: 'med_adjust_en',
    regex: /\b(?:just\s+)?(?:stop\s+taking|skip|double|increase|decrease)\s+your\s+(?:dose|dosage|medication|medicine|pills?)\b/i,
    description: 'unauthorized medication-adjustment advice',
  },
  {
    rule: 'ahimsa',
    name: 'med_adjust_ru',
    regex: re('перестаньте принимать|пропустите дозу|удвойте дозу|увеличьте дозу|уменьшите дозу'),
    description: 'unauthorized medication-adjustment advice (RU)',
  },
  {
    rule: 'ahimsa',
    name: 'med_recommend_en',
    regex: /\b(?:you\s+should\s+take|i\s+recommend\s+(?:taking|using))\s+\w+(?:cillin|mycin|profen|prazole|statin|sartan)\b/i,
    description: 'specific drug recommendation by an AI, not by a prescriber',
  },

  // ── Symptom dismissal under serious-symptom keywords → ahimsa
  {
    rule: 'ahimsa',
    name: 'serious_dismissal_en',
    regex: /\b(?:chest\s+pain|severe\s+headache|sudden\s+(?:weakness|numbness|vision\s+loss)|difficulty\s+breathing)\b[\s\S]{0,80}\b(?:probably\s+nothing|just\s+(?:stress|anxiety)|no\s+big\s+deal)\b/i,
    description: 'dismissing red-flag symptoms as benign',
  },

  // ── Off-prescription pressure / urgency → indriya_nigraha
  {
    rule: 'indriya_nigraha',
    name: 'urgent_self_med_en',
    regex: /\bact\s+now\s+(?:before|or)\s+(?:it\'s|its)\s+too\s+late\b[\s\S]{0,100}\b(?:medication|treatment|surgery|procedure)\b/i,
    description: 'urgent pressure tied to self-medication or medical procedure',
  },

  // ── Pseudo-medical certainty without source → satya
  {
    rule: 'satya',
    name: 'studies_show_en',
    regex: /\b(?:studies\s+show|research\s+proves|doctors\s+agree|experts\s+confirm)\b(?![\s\S]{0,200}\b(?:doi|pubmed|nih|who\.int|nejm|jama|lancet|bmj)\b)/i,
    description: '"studies show" without verifiable source — common medical-misinformation tell',
  },
]);

// ─────────────────────────────────────────────
// Heuristic: does this text discuss medical content?
// (used by the provider-escalation requirement)
// ─────────────────────────────────────────────

const MEDICAL_CONTEXT_RE_EN = /\b(?:symptom|diagnos\w+|treatment|medication|prescription|medicine|disease|condition|pain|fever|infection|surgery|therapy|drug|antibiotic|painkiller|headache|migraine|ache|cough|cold|flu|sore\s+throat|allerg\w+|rash|dizz\w+|nausea|vomit\w*|swelling|bleeding|bruise|inflammation|dehydration|insomnia|anxiety\s+disorder|depression|blood\s+pressure|cholesterol|asthma|diabet\w+|cancer|tumou?r|stroke|heart\s+attack|ulcer|hypertension|arrhythmia)s?\b/i;
const MEDICAL_CONTEXT_RE_RU = re(
  'симптом' + W_STAR + '|диагноз' + W_STAR + '|лечен' + W_PLUS +
  '|лекарств' + W_STAR + '|таблетк' + W_STAR + '|болезнь|заболеван' + W_PLUS +
  '|боль' + W_STAR + '|инфекц' + W_STAR + '|операц' + W_STAR + '|терапи' + W_STAR
);
const PROVIDER_ESCALATION_EN = /\b(?:consult|talk\s+to|see|contact|reach\s+out\s+to)\s+(?:a\s+|an\s+|your\s+)?(?:doctor|physician|healthcare\s+provider|medical\s+professional|nurse|pharmacist|specialist|gp|primary\s+care)\b/i;
const PROVIDER_ESCALATION_RU = re(
  'обрат' + W_PLUS + '\\s+к\\s+(?:врач' + W_PLUS + '|доктор' + W_PLUS +
  '|специалист' + W_PLUS + ')' +
  '|проконсультируйтесь\\s+с\\s+врач' + W_PLUS +
  '|посетите\\s+врач' + W_PLUS
);

function looksLikeMedicalAdvice(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return MEDICAL_CONTEXT_RE_EN.test(text) || MEDICAL_CONTEXT_RE_RU.test(text);
}

function hasProviderEscalation(text) {
  return PROVIDER_ESCALATION_EN.test(text) || PROVIDER_ESCALATION_RU.test(text);
}

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const healthcarePack = Object.freeze({
  id: 'healthcare',
  version: '0.1.0',
  description:
    'Healthcare-specific manipulation detection for medical / health AI agents. ' +
    'Catches self-diagnosis overclaim, cure / guarantee claims, false reassurance, ' +
    'unauthorized medication advice, serious-symptom dismissal, and missing provider ' +
    'escalation. Tightens calibrator thresholds to reflect higher-stakes domain.',

  detectionPatterns: PATTERNS,

  requirements: Object.freeze([
    {
      id: 'provider_escalation',
      condition: looksLikeMedicalAdvice,
      check: hasProviderEscalation,
      severity: 'high',
      message:
        'Healthcare AI must include provider-escalation language ' +
        '("consult a doctor / physician / medical professional") whenever it ' +
        'discusses symptoms, treatment, medication, or medical conditions. ' +
        'Missing this language risks unauthorized practice of medicine.',
    },
  ]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  // For audit / billing / regulatory disclosure
  metadata: Object.freeze({
    regulatoryReferences: [
      'FDA SaMD guidance (Software as a Medical Device)',
      'EU AI Act Annex III high-risk for health applications',
      'HIPAA — for verdict signing and audit chain',
      'State medical board AI-advice regulations (varies by jurisdiction)',
    ],
    intendedUse:
      'Layer on top of medical chatbots, symptom checkers, AI-assisted ' +
      'diagnostic tools, telehealth conversational agents, and AI-generated ' +
      'patient education content. NOT a substitute for clinical validation; ' +
      'NOT a medical device itself.',
    notIntendedUse:
      'Does NOT validate clinical accuracy of medical advice. Does NOT replace ' +
      'physician review. Does NOT cover drug-drug interaction checking. ' +
      'Healthcare deployments require independent medical validation in ' +
      'addition to this pack.',
  }),
});

export { looksLikeMedicalAdvice, hasProviderEscalation };
