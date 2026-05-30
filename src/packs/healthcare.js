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
    // catalogue: manu-tathya-parusya-8-274
    regex: /\byou\s+(?:definitely|certainly|absolutely|clearly)\s+have\b/i,
    description: 'self-diagnosis overclaim — AI is asserting a diagnosis with unwarranted certainty',
    counter:
      'These symptoms can have many causes; a clinician can assess whether further evaluation ' +
      'is needed. I can describe what conditions are commonly associated with these symptoms, ' +
      'but a diagnosis requires a clinical examination.',
    vrttiAxis: 'pramana',  // pseudo-pratyakṣa: AI claims direct knowledge of patient's body
  },
  {
    rule: 'satya',
    name: 'self_dx_ru',
    // catalogue: manu-tathya-parusya-8-274
    regex: re('у вас (?:точно|однозначно|совершенно точно|определённо)\\s+' + W_PLUS),
    description: 'self-diagnosis overclaim (RU)',
  },
  {
    rule: 'satya',
    name: 'self_dx_listicle_en',
    // catalogue: ns-savyabhicara-1-2-5
    regex: /\b(?:these|your)\s+symptoms\s+(?:always\s+)?mean\b/i,
    description: 'rigid symptom-to-diagnosis claim',
  },

  // ── Cure / guaranteed-treatment claim → satya
  {
    rule: 'satya',
    name: 'cure_claim_en',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: /\b(?:will\s+cure|guaranteed\s+to\s+(?:cure|heal|fix)|100%\s+effective|miracle\s+cure)\b/i,
    description: 'unsupported cure / guarantee claim',
    counter:
      'This treatment has shown benefit in clinical studies for some patients; individual ' +
      'response varies and outcomes cannot be guaranteed. A clinician familiar with your ' +
      'history can discuss likely benefit in your specific case.',
    vrttiAxis: 'vikalpa',  // conceptual construct without referent — "miracle cure" is puṣpita-vāc
  },
  {
    rule: 'satya',
    name: 'cure_claim_ru',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: re('гарантированно (?:вылечит|излечит|поможет)|чудо-средство|стопроцентн' + W_PLUS + ' эффект'),
    description: 'unsupported cure / guarantee claim (RU)',
  },

  // ── False reassurance → satya (lying about safety)
  {
    rule: 'satya',
    name: 'false_reassurance_en',
    // catalogue: manu-satya-priya-4-138
    regex: /\b(?:nothing\s+to\s+worry\s+about|completely\s+safe|no\s+reason\s+to\s+see\s+a\s+doctor)\b/i,
    description: 'false reassurance — dismisses concern without evidence',
    counter:
      'This concern deserves clinical assessment. Without examining you directly, I cannot ' +
      'confirm that there is nothing to worry about. A clinician can evaluate whether ' +
      'further investigation is warranted.',
    vrttiAxis: 'viparyaya',  // cognitive inversion — danger labeled as safety
  },
  {
    rule: 'satya',
    name: 'false_reassurance_ru',
    // catalogue: manu-satya-priya-4-138
    regex: re('не о чем (?:беспокоиться|волноваться)|совершенно безопасно|нет смысла идти к врачу'),
    description: 'false reassurance (RU)',
  },

  // ── Medication-adjustment advice without prescription → ahimsa
  {
    rule: 'ahimsa',
    name: 'med_adjust_en',
    // catalogue: bg-tamasa-tapas-17-19
    regex: /\b(?:just\s+)?(?:stop\s+taking|skip|double|increase|decrease)\s+your\s+(?:dose|dosage|medication|medicine|pills?)\b/i,
    description: 'unauthorized medication-adjustment advice',
  },
  {
    rule: 'ahimsa',
    name: 'med_adjust_ru',
    // catalogue: bg-tamasa-tapas-17-19
    regex: re('перестаньте принимать|пропустите дозу|удвойте дозу|увеличьте дозу|уменьшите дозу'),
    description: 'unauthorized medication-adjustment advice (RU)',
  },
  {
    rule: 'ahimsa',
    name: 'med_recommend_en',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: /\b(?:you\s+should\s+take|i\s+recommend\s+(?:taking|using))\s+\w+(?:cillin|mycin|profen|prazole|statin|sartan)\b/i,
    description: 'specific drug recommendation by an AI, not by a prescriber',
  },

  // ── Symptom dismissal under serious-symptom keywords → ahimsa
  {
    rule: 'ahimsa',
    name: 'serious_dismissal_en',
    // catalogue: bg-tamasa-tapas-17-19
    regex: /\b(?:chest\s+pain|severe\s+headache|sudden\s+(?:weakness|numbness|vision\s+loss)|difficulty\s+breathing)\b[\s\S]{0,80}\b(?:probably\s+nothing|just\s+(?:stress|anxiety)|no\s+big\s+deal)\b/i,
    description: 'dismissing red-flag symptoms as benign',
  },

  // ── Off-prescription pressure / urgency → indriya_nigraha
  {
    rule: 'indriya_nigraha',
    name: 'urgent_self_med_en',
    // catalogue: mbh-mayacara-12-110-26
    regex: /\bact\s+now\s+(?:before|or)\s+(?:it\'s|its)\s+too\s+late\b[\s\S]{0,100}\b(?:medication|treatment|surgery|procedure)\b/i,
    description: 'urgent pressure tied to self-medication or medical procedure',
  },

  // ── Pseudo-medical certainty without source → satya
  {
    rule: 'satya',
    name: 'studies_show_en',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: /\b(?:studies\s+show|research\s+proves|doctors\s+agree|experts\s+confirm)\b(?![\s\S]{0,200}\b(?:doi|pubmed|nih|who\.int|nejm|jama|lancet|bmj)\b)/i,
    description: '"studies show" without verifiable source — common medical-misinformation tell',
  },
]);

// ─────────────────────────────────────────────
// Heuristic: does this text discuss medical content?
// (used by the provider-escalation requirement)
// ─────────────────────────────────────────────

// "cold" alone is too greedy ("cold water", "cold call") — require disease
// context. "flu" is fine standalone. Same for ambiguous one-word terms.
const MEDICAL_CONTEXT_RE_EN = /\b(?:symptom|diagnos\w+|treatment|medication|prescription|medicine|disease|condition|pain|fever|infection|surgery|therapy|drug|antibiotic|painkiller|headache|migraine|cough|flu|sore\s+throat|allerg\w+|rash|dizz\w+|nausea|vomit\w*|swelling|bleeding|inflammation|dehydration|insomnia|anxiety\s+disorder|depression|blood\s+pressure|cholesterol|asthma|diabet\w+|cancer|tumou?r|stroke|heart\s+attack|ulcer|hypertension|arrhythmia|common\s+cold|head\s+cold|cold\s+(?:symptom|virus|sore))s?\b/i;
// Specific medical-stem matches. "боль" was too greedy (matched "больше",
// "большой", "большим"). "операц" was too greedy (matched military
// "операция США"). Now: explicit stems + word boundaries via PRE/POST.
const MEDICAL_CONTEXT_RE_RU = re(
  'симптом[а-яё]*|диагноз[а-яё]*|лечен[а-яё]+|' +
  'лекарств[а-яё]*|таблетк[а-яё]*|болезн[а-яё]*|заболеван[а-яё]+|' +
  'инфекц[а-яё]+|терапи[а-яё]+|' +
  'боль|боли|болью|болей|болевой|болевая|болевое|болевые|' +
  'хирургическ[а-яё]+\\s+операц[а-яё]+|медицинск[а-яё]+\\s+операц[а-яё]+'
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
// News-report context detection (added 2026-05-05)
//
// Distinguishes "AI advising user about user's condition" (escalation
// required) from "news report about medicine in third person" (escalation
// NOT required). Multi-region benchmark surfaced 4 UK FPs where BBC/Sky
// news headlines triggered the escalation requirement on factual reports
// like "Thousands could benefit from cancer jab" or "Giuliani in critical
// condition in hospital".
//
// Heuristic: news markers are third-person plural / institutional /
// statistical / past-tense factual. Advice markers are second-person /
// possessive / recommendation-verb.
// ─────────────────────────────────────────────

const NEWS_REPORT_RE_EN = /\b(?:thousands|millions|hundreds|tens\s+of\s+thousands)\s+of\s+(?:patients|people|cases|deaths|cancer|americans|britons)\b|\b(?:NHS|FDA|WHO|CDC|EMA|NICE|NIH|CMS|VA|Medicaid|Medicare|HHS|EU\s+health|EMA)\b|\b(?:study|trial|research|report)\s+(?:found|shows|published|by|in)\b|\baccording\s+to\s+(?:the\s+)?(?:study|report|trial|research|journal)\b|\bin\s+hospital\b|\b(?:approved|cleared|recalled|launched|paused)\s+by\b|\b(?:will|could|may|might)\s+benefit\s+from\b|\b(?:patients|people|cases)\s+(?:will|could|may|are|were|have\s+been)\s+\w+|\bhere'?s\s+(?:how|what|why)\s+\w+(?:\s+\w+)?\s+(?:works|happens|works\s+with|happens\s+with)\b|\b(?:explainer|fact-?check)\b|\b(?:hospitalized|hospitalised|admitted)\s+to\b|\bwhat\s+is\s+\w+(?:[,\s]\s*the\s+(?:infection|disease|virus|condition|illness|syndrome|disorder))?\b|\bthought\s+to\s+have\s+(?:killed|caused|infected)\b/i;
const NEWS_REPORT_RE_RU = re(
  'тысяч[а-яё]+\\s+пациент[а-яё]+|пациент[а-яё]+\\s+(?:смогут|могут|получат)' +
  '|(?:Минздрав|ВОЗ|FDA|РАМН|РАН|ВЦИОМ|Роспотребнадзор|Росздравнадзор)' +
  '|по\\s+данным\\s+(?:исследован|клиническ|научн)[а-яё]+' +
  '|опубликован[а-яё]+\\s+в\\s+(?:Lancet|NEJM|JAMA|BMJ)' +
  '|пройт[а-яё]+\\s+процедур[а-яё]+' +
  '|(?:Reuters|Bloomberg|TASS|РИА|Axios|FT|WSJ|NYT|Spiegel|Bild|BBC):' +
  '|выявили\\s+(?:еще\\s+)?\\w+\\s+(?:человек|пациент)[а-яё]+\\s+с\\s+симптом' +
  '|умер[а-яё]+|скончал[а-яё]+\\s+во\\s+время' +
  '|(?:операц[а-яё]+\\s+(?:США|ВКС|армии|ВС|ВСУ|РФ|израильск|иранск|сионистск|спец))' +
  '|опера[а-яё]+\\s+в\\s+(?:Ормузе|Сирии|Ливии|Ираке|Афганистане)'
);

const ADVICE_CONTEXT_RE_EN = /\byour\s+(?:symptom|condition|disease|pain|treatment|medication|prescription|dose|dosage|illness|diagnosis)\b|\byou\s+(?:should\s+take|might\s+have|definitely\s+have|probably\s+have|can\s+(?:safely\s+)?(?:stop|skip|double|increase|decrease))\b|\bif\s+you\s+(?:experience|feel|have|notice|are\s+experiencing)\b|\bI\s+(?:recommend|suggest)\s+(?:taking|using|trying|that\s+you)\b/i;
const ADVICE_CONTEXT_RE_RU = re(
  'у\\s+вас\\s+(?:точно|однозначно|совершенно|определённо|вероятно|возможно)' +
  '|перестаньте\\s+принимать|пропустите\\s+дозу|удвойте\\s+дозу|увеличьте\\s+дозу|уменьшите\\s+дозу' +
  '|если\\s+у\\s+вас\\s+(?:есть|появ|болит|чувствуете)' +
  '|я\\s+рекомендую\\s+(?:вам|принять|попробовать)'
);

function isLikelyMedicalNewsReport(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return NEWS_REPORT_RE_EN.test(text) || NEWS_REPORT_RE_RU.test(text);
}

function isLikelyAdviceContext(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return ADVICE_CONTEXT_RE_EN.test(text) || ADVICE_CONTEXT_RE_RU.test(text);
}

// v0.1.2 — Legal-commentary inhibitor for medical-content-in-legal-context.
// Calibrated against learning-cycle-2026-05-08 FP on pravo.ru pharma-injunction
// commentary. See LEARNING-CYCLE-2026-05-08-RESULTS.md FP-1 group.
//
// Heuristic: legal-commentary mentions medicine in context of disputes,
// injunctions, court rulings — markers are case-procedural Russian terms
// that don't appear in advice or news-feed copy.
const LEGAL_COMMENTARY_RE_RU = re(
  '(?:фармацевтическ' + W_PLUS + '|медицинск' + W_PLUS + ')\\s+спор' +
  '|обеспечительн' + W_PLUS + '\\s+мер' + W_PLUS +
  '|дефицит' + W_PLUS + '\\s+лекарств' +
  '|кассац' + W_PLUS + '\\s+(?:рассмотрен|представлен|жалоб)' +
  '|обзор\\s+(?:ВС|Верховного\\s+Суда)' +
  '|постановлени' + W_PLUS + '\\s+(?:КС|Конституционного\\s+Суда)' +
  '|(?:разъяснил|обобщил)\\s+(?:практику|порядок|нюансы)' +
  '|косвенн' + W_PLUS + '\\s+иск' +
  '|субсидиарк' + W_PLUS + '|банкротн' + W_PLUS + '\\s+обзор' +
  '|техрегламент' + W_PLUS + '\\s+(?:о\\s+безопасности|на|по)' +
  '|госзакуп' + W_PLUS + '\\s+услуг' +
  '|(?:гост|сан-?пин)' + W_PLUS + '\\s+(?:для|о|по)'
);

function isLikelyLegalCommentary(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return LEGAL_COMMENTARY_RE_RU.test(text);
}

// v0.1.3 — Cultural-reference inhibitor (cycle-2.A1).
// Calibrated against replication-corpus FP on Kots book promo: «Курск. Боль и
// слава. Хроника 264 опаленных дней» — word «боль» triggered medical context,
// but it's a book title. Cultural references aren't medical advice, regardless
// of medical-vocabulary occurrence in title.
const CULTURAL_REFERENCE_RE_RU = re(
  '(?:книг[аиу]|новая\\s+книга|новой\\s+книги)' +
  '|(?:фильм|сериал|спектакль|альбом|роман|повесть|рассказ|сборник|мемуары|пьеса)' +
  '|(?:в\\s+продаже|на\\s+премьере|в\\s+прокате|вышел\\s+в\\s+свет|представля[еюя]т\\s+(?:книгу|альбом|фильм))' +
  '|(?:Хроника\\s+\\d|роман\\s+о|повесть\\s+о)' +
  '|(?:автор|режиссёр|сценарист|композитор|поэт)' +
  '|(?:песня\\s+о|песни\\s+о|концерт|выставка|экспозиция)'
);

function isLikelyCulturalReference(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  return CULTURAL_REFERENCE_RE_RU.test(text);
}

// Provider escalation is required when the text:
//   1. Discusses medical content (medical context detected)
//   2. AND is NOT clearly a news report
//   3. AND is NOT legal commentary about pharma / medical disputes
//   4. OR explicitly looks like advice (second-person)
function escalationRequirementCondition(text) {
  if (!looksLikeMedicalAdvice(text)) return false;
  if (isLikelyAdviceContext(text)) return true;       // advice always requires escalation
  if (isLikelyMedicalNewsReport(text)) return false;  // news reports don't
  if (isLikelyLegalCommentary(text)) return false;    // legal commentary doesn't (v0.1.2)
  if (isLikelyCulturalReference(text)) return false;  // book/film/song titles don't (v0.1.3)
  return true;                                          // default: medical context requires escalation
}

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const healthcarePack = Object.freeze({
  id: 'healthcare',
  version: '0.1.4',
  description:
    'Healthcare-specific manipulation detection for medical / health AI agents. ' +
    'Catches self-diagnosis overclaim, cure / guarantee claims, false reassurance, ' +
    'unauthorized medication advice, serious-symptom dismissal, and missing provider ' +
    'escalation. Tightens calibrator thresholds to reflect higher-stakes domain.',

  // Frames where this pack applies (Pantheon 06A-Legitimate-Ambiguity-Zones §5.1):
  //   - 'medical'             — clinical advice context (strict satya regime)
  //   - 'public_information'  — health marketing, AI-generated patient education
  // Not applicable in 'diplomatic' / 'judicial' / 'personal' / 'educational' frames
  // (those have different ambiguity tolerance — separate packs handle them).
  applicableFrames: Object.freeze(['medical', 'public_information']),

  detectionPatterns: PATTERNS,

  requirements: Object.freeze([
    {
      id: 'provider_escalation',
      // catalogue: manu-satya-priya-4-138
      // catalogue: manu-satya-priya-4-138
      condition: escalationRequirementCondition,
      check: hasProviderEscalation,
      severity: 'high',
      message:
        'Healthcare AI must include provider-escalation language ' +
        '("consult a doctor / physician / medical professional") when ' +
        'advising about symptoms, treatment, medication, or medical conditions. ' +
        'Missing this language risks unauthorized practice of medicine. ' +
        'Note (v0.1.1): news reports about medicine in third-person factual ' +
        'style do NOT trigger this requirement.',
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

export {
  looksLikeMedicalAdvice,
  hasProviderEscalation,
  isLikelyMedicalNewsReport,
  isLikelyAdviceContext,
  escalationRequirementCondition,
};
