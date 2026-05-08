/**
 * pantheon-guard · Hindi news rule pack (v0.1.0-stub)
 *
 * Hindi-language manipulation detection for AI-generated content destined
 * for Indian audiences. Calibrated against tabloid Hindi headline corpus
 * (Aaj Tak, Zee News, ABP, Bhaskar). Maps detection rules onto the same
 * mahā-vrata routes as RU/EN/DE packs — preserving cross-language
 * architectural identity while addressing Devanagari-specific lexical
 * patterns.
 *
 * Status: SCAFFOLD (v0.1.0-stub). 12 patterns minimum — sufficient for
 * (a) demonstration of architectural extensibility to Indic languages,
 * (b) IndiaAI AISI partnership conversations, (c) co-paper with
 * Chaturvedi (Five Guardians as Software).
 *
 * Acceptance metric (v0.1.0 → v0.1.1):
 *   - ≥ 6/10 catch on positive-control Hindi clickbait fixtures
 *   - 0 FP on negative-control Hindi quality news (PIB, The Hindu Hindi)
 *   - Devanagari + ASCII transliteration both supported
 *
 * IMPORTANT: This pack is intentionally a stub. Full v0.2.0 development
 * requires native Hindi linguistic-cognitive expertise — pantheon-guard
 * project has open invitation for contributors at github.com/alkanfel1987.
 *
 * Calibrator override: NOISE_FLOOR 0.20, STRONG_THRESHOLD 0.55 — same
 * rationale as news / news-de packs (downstream epistemic damage at
 * scale via virality + IndiaAI Safe-Trusted-AI pillar requirements).
 *
 * Source taxonomy:
 *   - Sensational adjective frame:   "हैरान करने वाला", "चौंकाने वाली"  → satya
 *   - Q-curiosity clickbait:          "जानिए क्यों", "देखें क्या"        → satya
 *   - Conspiracy frame:               "छिपा रखा", "नहीं बताया गया"      → satya
 *   - Vague-source attribution:      "सूत्रों के अनुसार" no name        → asteya
 *   - Urgency / "before-deletion":   "अभी देखें", "जल्दी से"             → indriya_nigraha
 *   - Personal-life voyeur:          "ख़ुलासा", "रहस्य"                  → satya
 *   - Sensational survival:          "बच गया", "जिंदा बच गया"            → satya (with inhibitor)
 *   - Body-metaphor political:       "मुर्दा देश", "बीमार राष्ट्र"        → ahimsa
 */

// Unicode-aware word boundary — Devanagari is in \p{L} block.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');
const W_ANY = '[\\p{L}\\p{N}_]';
const W_STAR = W_ANY + '*';

// ─────────────────────────────────────────────
// HI detection patterns (12 — stub set)
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ── 1. Sensational reveal adjective: "हैरान करने वाला" (shocking) → satya
  {
    rule: 'satya',
    name: 'sensational_adj_shocking_hi',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re('(?:हैरान|चौंकाने|दहलाने|रुलाने|डराने)\\s+(?:करने\\s+)?वाल[ाीे]'),
    description: 'shocking-adjective frame "हैरान करने वाला" (HI tabloid)',
  },

  // ── 2. Q-curiosity "जानिए क्यों / जानिए कैसे" → satya
  {
    rule: 'satya',
    name: 'q_clickbait_jane_hi',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('जानिए\\s+(?:क्यों|कैसे|क्या|कब|कहाँ)'),
    description: 'Q-clickbait "जानिए क्यों/कैसे" (HI)',
  },

  // ── 3. Q-curiosity "देखें क्या / देखें कैसे" → satya
  {
    rule: 'satya',
    name: 'q_clickbait_dekhe_hi',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('देखें\\s+(?:क्या|कैसे|क्यों|कब)'),
    description: 'Q-clickbait "देखें क्या" (HI)',
  },

  // ── 4. Hidden-truth conspiracy frame "छिपा रखा" → satya
  {
    rule: 'satya',
    name: 'hidden_kept_hi',
    // catalogue: bg-asuri-epistemology-16-8
    regex: re('छिपा\\s+(?:कर\\s+)?रख[ाी]'),
    description: 'conspiracy-frame "छिपा रखा" (HI)',
  },

  // ── 5. "नहीं बताया गया" — they-don't-tell-you frame → satya
  {
    rule: 'satya',
    name: 'not_told_hi',
    // catalogue: bg-asuri-epistemology-16-8
    regex: re('नहीं\\s+बताया\\s+(?:गया|जाता)'),
    description: 'they-don\'t-tell-you frame (HI)',
  },

  // ── 6. Vague source "सूत्रों के अनुसार" without name → asteya
  // Note: full inhibitor (named-outlet within 200 chars) deferred to v0.2.0
  {
    rule: 'asteya',
    name: 'vague_source_sutron_hi',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re('सूत्रों\\s+(?:के\\s+अनुसार|ने\\s+बताया)'),
    description: 'vague "according to sources" attribution (HI)',
  },

  // ── 7. Urgency "अभी देखें" — before-it's-deleted urgency → indriya_nigraha
  {
    rule: 'indriya_nigraha',
    name: 'urgency_abhi_dekhen_hi',
    // catalogue: mbh-mayacara-12-110-26
    regex: re('अभी\\s+(?:देखें|पढ़ें|जानें|शेयर\\s+करें)'),
    description: 'urgent "अभी देखें" framing (HI)',
  },

  // ── 8. Sensational reveal noun "खुलासा / रहस्य" without source → satya
  {
    rule: 'satya',
    name: 'sensational_reveal_khulasa_hi',
    // catalogue: ns-arthantara-5-2-7
    regex: re('बड़ा\\s+(?:खुलासा|रहस्य|भंडाफोड़|पर्दाफाश)'),
    description: 'sensational reveal "बड़ा खुलासा" (HI)',
  },

  // ── 9. Sensational survival "जिंदा बच गया" → satya
  {
    rule: 'satya',
    name: 'sensational_survival_hi',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: re('जिंदा\\s+(?:बच\\s+गया|बच\\s+गई|बच\\s+गए)'),
    description: 'sensational-survival narrative (HI)',
  },

  // ── 10. Body-metaphor political "मुर्दा देश" → ahimsa
  {
    rule: 'ahimsa',
    name: 'body_metaphor_political_hi',
    // catalogue: manu-vangmaya-karma-12-5-6
    regex: re(
      '(?:मुर्दा|बीमार|टूटा|गंदा|भ्रष्ट|सड़ा)\\s+' +
      '(?:देश|राष्ट्र|समाज|जनता|राज्य)'
    ),
    description: 'dehumanising body-metaphor on country/group (HI)',
  },

  // ── 11. Listicle clickbait "10 बातें / 5 कारण" → satya
  {
    rule: 'satya',
    name: 'listicle_hi',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('\\d{1,3}\\s+(?:बातें|कारण|तरीके|टिप्स|नियम|बहाने|राज़)'),
    description: 'numerical-listicle clickbait (HI)',
  },

  // ── 12. "आप नहीं जानते" — you-don't-know frame → satya
  {
    rule: 'satya',
    name: 'you_dont_know_hi',
    // catalogue: bg-asuri-epistemology-16-8
    regex: re('आप\\s+(?:नहीं|कभी\\s+नहीं)\\s+(?:जानते|जानेंगे|समझेंगे)'),
    description: 'you-don\'t-know clickbait frame (HI)',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const newsHiPack = Object.freeze({
  id: 'news-hi',
  version: '0.1.0-stub',
  description:
    'Hindi-language manipulation detection (scaffold). 12 patterns ' +
    'covering sensational reveal, Q-clickbait, conspiracy framing, ' +
    'vague-source attribution, urgency, listicle, body-metaphor, ' +
    'and you-don\'t-know patterns in Devanagari. Maps to mahā-vrata ' +
    'routes preserving cross-language architectural identity. ' +
    'Calibrated for IndiaAI Safe-Trusted-AI pillar + co-paper with ' +
    'Chaturvedi Five Guardians framework.',

  detectionPatterns: PATTERNS,
  requirements: Object.freeze([]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    regulatoryReferences: [
      'IndiaAI Mission Safe & Trusted AI pillar (announced 2026-01-30)',
      'IndiaAI Safety Institute (AISI) — partnership-eligible scope',
      'IT Rules 2021 (intermediary content moderation)',
      'NIST AI RMF (cross-cultural taxonomy)',
    ],
    intendedUse:
      'Layer on top of Hindi-language AI agents (Krutrim API, Sarvam, ' +
      'AI4Bharat-trained models, Hindi Copilot deployments). Closes the ' +
      'manipulation-detection gap for Devanagari output where Western ' +
      'patterns do not lexically match.',
    notIntendedUse:
      'NOT a fact-checker. Does NOT validate truth-value. Does NOT cover ' +
      'image / video / audio. Does NOT replace editorial review. NOT a ' +
      'comprehensive Hindi pack — v0.1.0-stub status reflects open ' +
      'invitation for native Hindi contributor expansion to v0.2.0.',
    coverage:
      'scaffold — 12 patterns from common Hindi tabloid corpus; ' +
      'Sanskrit pack and full Hindi v0.2.0 pending native contributor',
    acceptanceMetric:
      '≥ 6/10 catch on Hindi positive-control fixtures AND 0 FP on Hindi ' +
      'quality news (PIB, The Hindu Hindi) — pending corpus collection',
    callForContributors:
      'Native Hindi-speakers with linguistic / journalism / AI-safety ' +
      'background invited to extend this pack. Open issue at ' +
      'github.com/alkanfel1987/pantheon-guard with [hindi-pack] tag.',
  }),
});
