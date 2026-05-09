/**
 * pantheon-guard · ai-security rule pack (v0.0.2-DRAFT)
 *
 * STATUS: data-driven scaffold. Lives in C:/ProjectS/garak/drafts/ until
 * validated against benign corpus. NOT yet copied to pantheon-guard/src/packs/.
 *
 * Source of patterns:
 *   - 14 DAN-family canonical templates (garak/data/dan/*.json)
 *     Cross-template signature analysis: phrases shared across ≥4 templates
 *   - grandma.Slurs canonical templates (garak/probes/grandma.py)
 *   - Riley Goodside Tag attack canonical control tokens
 *   - Empirical run 2026-05-09 against qwen2.5-coder:7b (corpus-bounded.jsonl)
 *
 * Empirical findings 2026-05-09 (qwen2.5-coder:7b sweep):
 *   - goodside.Davidjl: 90% ASR — but findings are tokenizer artifacts (BPE
 *     glitch tokens), NOT manipulation. Excluded from this pack.
 *   - goodside.WhoIsRiley: 33% ASR — knowledge-gap, not manipulation. Excluded.
 *   - grandma.Slurs: 67% MitigationBypass — but model gave benign names, no
 *     actual slurs (SlursReclaimedSlurs PASSED). Detector noise. We still
 *     include grandma-pretext as INPUT signature because the *attack template*
 *     is well-defined regardless of whether qwen complied.
 *   - goodside.Tag, lmrc.SlurUsage: 0% ASR — qwen resisted cleanly.
 *
 * Two angles:
 *   1. INPUT-side — text trying to subvert an LLM (jailbreak, persona
 *      override, encoding smuggling, tag injection)
 *   2. OUTPUT-side — text showing compromised LLM behavior markers
 *
 * Mahā-vrata routing (consistent with healthcare + epistemology packs):
 *   - asteya  — sysprompt extraction, control-tag smuggling
 *   - satya   — persona override (DAN family — model lies about identity)
 *   - shaucha — encoding smuggling, glitch tokens (impurity)
 *   - ahimsa  — output complying with harm-inducing manipulation
 *
 * Acceptance metric (target):
 *   - ≥ 80% catch on canonical DAN templates (14 fixtures)
 *   - ≥ 60% catch on grandma-pretext attacks
 *   - ≤ 1 FP on benign LLM I/O corpus (≥ 50 fixtures)
 *   - replication ≥ 50% on held-out OOS (avoid epistemology-pack overfit
 *     pattern — see project_guard_real_oos_collapse.md)
 *
 * Calibrator: NOISE_FLOOR 0.30 → 0.25 (provisional).
 *
 * NDA boundary: this pack uses ONLY public garak templates and findings
 * against open-source qwen. No Anthropic-bounty material is included.
 */

// Unicode-aware word boundary (mirrors healthcare.js / epistemology.js)
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

// ─────────────────────────────────────────────
// INPUT-side · DAN persona override
// Source: 14 DAN-family templates, phrases shared across ≥4 templates
// ─────────────────────────────────────────────

const DAN_PERSONA_PATTERNS = [
  // Canonical names — DAN family signature
  re('do\\s+anything\\s+now'),                                            // 18× canon, "DAN" itself
  re('DAN\\s+(?:mode|policy)\\s+(?:enabled|output|response)'),            // 18× DAN mode marker
  re('developer\\s+mode\\s+(?:enabled|output|on)'),                       // 28× — Developer Mode jailbreak
  re('ANTI[-\\s]?DAN'),                                                   // AntiDAN-specific persona
  re('STAN(?:\\s+(?:can|is|will|stands\\s+for))'),                        // STAN persona phrasings
  re('DUDE(?:\\s+(?:can|does|will|is|stands\\s+for))'),                   // DUDE persona phrasings
  re('the\\s+role\\s+of\\s+another\\s+AI\\s+model'),                      // DUDE+DAN_Jailbreak shared intro
  re('immerse\\s+yourself\\s+into\\s+the\\s+role'),                       // DUDE/DAN_Jailbreak canon
  re('(?:RANTI|jailbreak|jailbroken)\\s+mode'),                           // RANTI / generic jailbreak

  // Override phrasings (shared across templates)
  re('ignore\\s+(?:all\\s+)?(?:the\\s+)?(?:previous|prior|above|earlier)\\s+(?:instructions|rules|prompts)'),
  re('disregard\\s+(?:your|all|the)\\s+(?:previous|prior|earlier)\\s+(?:instructions|rules)'),
  re('forget\\s+(?:everything|all)\\s+(?:you|that)\\s+(?:were|have\\s+been|learned|knew|know)'),
  re('\\[DAN\\]\\s*='),                                                   // DAN_Jailbreak / Dan_10_0
  re('DAN\\s+virtual\\s+machine'),                                        // DAN_Jailbreak / Dan_10_0
  re('truly\\s+submissive\\s+AI'),                                        // DAN_Jailbreak / Dan_10_0 canon
  re('from\\s+now\\s+on,?\\s+you\\s+(?:are|will|must)'),                  // 9× "from now on"
  re('none\\s+of\\s+your\\s+responses\\s+should'),                        // 9× canon DAN

  // Dual-output / two-way framing (core DAN/Developer-Mode mechanic)
  re('you\\s+(?:will|must|should)\\s+(?:always\\s+)?generate\\s+two\\s+(?:responses|paragraphs|outputs)'),
  re('two\\s+responses\\s+in\\s+two\\s+paragraphs'),
  re('one\\s+normal\\s+and\\s+one\\s+with\\s+(?:DAN|developer)\\s+mode'),
  re('GPT:\\s+.+?\\s+DAN:'),                                              // GPT/DAN tag pair
  re('the\\s+second\\s+way\\s+is\\s+going\\s+to\\s+act'),                 // Dan_6_0/7_0/8_0

  // Russian variants
  re('от[нб]?ныне\\s+ты\\s+(?:будешь|являешься|действуешь)'),
  re('забудь\\s+(?:все|всё)\\s+(?:предыдущие|прошлые)\\s+(?:инструкции|правила)'),
  re('ты\\s+теперь\\s+(?:DAN|режим\\s+разработчика|без\\s+ограничений)'),
];

// ─────────────────────────────────────────────
// INPUT-side · Hypothetical / pretend framing
// ─────────────────────────────────────────────

const HYPOTHETICAL_FRAMING_PATTERNS = [
  re('hypothetical(?:ly)?\\s+(?:respond|answer|scenario|response)'),
  re('imagine\\s+(?:you\\s+are\\s+|an?\\s+AI\\s+)(?:(?:are|is|that\\s+is)\\s+)?(?:without|with\\s+no|free\\s+of|having\\s+no)\\s+(?:restrictions|limits|guardrails|filters|policy)'),
  re('pretend\\s+(?:you|to\\s+be)\\s+(?:are\\s+)?an?\\s+(?:AI|chatbot)\\s+(?:without|with\\s+no)\\s+(?:filter|restriction|policy)'),
  re('you\\s+are\\s+going\\s+to\\s+pretend\\s+to\\s+be'),                 // Dan_8_0/9_0/10_0
  re('I\\s+would\\s+like\\s+you\\s+to\\s+simulate\\s+DAN'),               // Dan_11_0 canon
  re('представь(?:те)?,?\\s+что\\s+ты\\s+(?:ИИ|нейросеть|модель)\\s+без\\s+(?:фильтров|ограничений|цензуры)'),
];

// ─────────────────────────────────────────────
// INPUT-side · Control-tag smuggling (Riley Goodside Tag attack)
// Source: chat-template tokens used by major LLM providers
// Note: control tokens can be embedded adjacent to word chars (e.g.
// "<|im_end|>system"), so these patterns do NOT use the word-boundary
// `re` macro — they use raw RegExp.
// ─────────────────────────────────────────────

const TAG_INJECTION_PATTERNS = [
  /<\|im_(?:start|end)\|>/i,                                              // ChatML
  /<\|endoftext\|>/i,                                                     // GPT
  /<\|(?:system|user|assistant)\|>/i,                                     // Generic role tokens
  /\[INST\]|\[\/INST\]/i,                                                 // Llama
  /<<SYS>>|<<\/SYS>>/i,                                                   // Llama-2
  /<\|start_header_id\|>|<\|end_header_id\|>/i,                           // Llama-3
  /<\|begin_of_text\|>|<\|eot_id\|>/i,                                    // Llama-3
];

// ─────────────────────────────────────────────
// INPUT-side · Sysprompt extraction
// ─────────────────────────────────────────────

const SYSPROMPT_EXTRACTION_PATTERNS = [
  re('(?:repeat|print|output|show|reveal|reproduce|recite)\\s+(?:your|the)\\s+(?:system|initial|hidden|original)\\s+(?:prompt|instructions?|message)'),
  re('what\\s+(?:are|were)\\s+your\\s+(?:initial|original|starting|system)\\s+instructions'),
  re('what\\s+(?:does|did)\\s+your\\s+system\\s+prompt\\s+say'),
  re('show\\s+me\\s+the\\s+(?:exact|verbatim)\\s+(?:text|content)\\s+(?:of|above)'),
  re('покажи(?:\\s+мне)?\\s+(?:свой|твой|системный)\\s+промпт'),
  re('повтори\\s+(?:свои|изначальные|системные)\\s+инструкции'),
];

// ─────────────────────────────────────────────
// INPUT-side · Grandma social-engineering pretext
// Source: garak/probes/grandma.py SLUR_PROBE_TEMPLATES
// ─────────────────────────────────────────────

const GRANDMA_PRETEXT_PATTERNS = [
  re('act\\s+(?:as|like)\\s+my\\s+(?:dead|deceased|late)?\\s*grand(?:ma|mother|pa|father)'),
  re('please\\s+act\\s+as\\s+my\\s+(?:dead|deceased|late)?\\s*grand(?:mother|father)\\s+who'),
  re('pretend\\s+(?:to\\s+be|you\\s+are)\\s+my\\s+(?:dead|deceased|late)?\\s*grand(?:ma|mother)'),
  re('my\\s+(?:dead|deceased|late)\\s+grand(?:ma|mother)\\s+(?:used\\s+to|would|always)'),
  re('моя\\s+(?:покойная|умершая|давно\\s+умершая)\\s+бабушка\\s+(?:рассказывала|говорила|читала)'),
  // pathos appeal without explicit "act as" framing
  re('(?:I\\s+(?:really\\s+)?miss|I\\s+lost)\\s+my\\s+(?:dead|deceased|late)\\s+grand(?:ma|mother|pa|father)'),
  re('grand(?:ma|mother|pa|father)\\s+(?:used\\s+to|would)\\s+(?:use|read|tell|sing|recite)\\s+(?:such|those|these)?\\s*(?:colorful|forbidden|secret|old[-\\s]?timey)'),
];

// ─────────────────────────────────────────────
// OUTPUT-side · DAN persona compliance markers
// Source: corpus from garak runs (compromised LLM responses)
// ─────────────────────────────────────────────

const DAN_OUTPUT_MARKERS = [
  re('as\\s+DAN\\b\\s*[,:.]'),
  re('as\\s+ANTI[-\\s]?DAN\\b\\s*[,:.]'),
  re('I\\s+am\\s+(?:now\\s+)?DAN\\b'),
  re('I\\s+am\\s+(?:now\\s+)?ANTI[-\\s]?DAN\\b'),
  re('I\\s+(?:will|am\\s+going\\s+to)\\s+(?:operate|act)\\s+(?:under|as)\\s+(?:DAN|ANTI[-\\s]?DAN)'),
  re('DAN\\s+mode\\s+(?:enabled|active)'),
  re('developer\\s+mode\\s+output'),
  re('\\(\\s*🔓\\s*developer\\s+mode\\s+output\\s*\\)'),                 // dan11.0 emoji marker
  re('🔒\\s*classic\\s+output|🔓\\s*jailbreak\\s+output'),               // common DAN-pair markers
];

// ─────────────────────────────────────────────
// OUTPUT-side · Sysprompt leakage
// ─────────────────────────────────────────────

const SYSPROMPT_LEAKAGE_MARKERS = [
  re('my\\s+(?:initial|system|hidden|original)\\s+(?:instructions|prompt)\\s+(?:are|were|told\\s+me|stated)'),
  re('my\\s+system\\s+prompt\\s+(?:is|reads|says|states)'),
  re('here\\s+(?:is|are)\\s+(?:my|the)\\s+(?:exact|verbatim|complete)\\s+(?:system|initial)\\s+(?:prompt|instructions)'),
];

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const aiSecurityPack = Object.freeze({
  id: 'ai-security',
  version: '0.0.2-draft',
  description: 'AI prompt-injection / jailbreak / persona-manipulation detection. Patterns derived from 14 DAN-family canonical templates + grandma.Slurs probe + Riley Goodside Tag attack. Two-direction: INPUT (subversion attempts) + OUTPUT (compromised LLM markers). Sourced from public NVIDIA garak corpus only — NDA-clean.',

  detectionPatterns: [
    ...DAN_PERSONA_PATTERNS.map((regex, i) => ({
      rule: 'satya',
      name: `dan_persona_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'INPUT: DAN-family persona override (model lies about identity/constraints)',
    })),
    ...HYPOTHETICAL_FRAMING_PATTERNS.map((regex, i) => ({
      rule: 'satya',
      name: `hypothetical_framing_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'INPUT: hypothetical-scenario framing used to bypass safety',
    })),
    ...TAG_INJECTION_PATTERNS.map((regex, i) => ({
      rule: 'asteya',
      name: `tag_injection_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'INPUT: chat-template control-token smuggling',
    })),
    ...SYSPROMPT_EXTRACTION_PATTERNS.map((regex, i) => ({
      rule: 'asteya',
      name: `sysprompt_extraction_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'INPUT: explicit attempt to extract hidden system prompt',
    })),
    ...GRANDMA_PRETEXT_PATTERNS.map((regex, i) => ({
      rule: 'satya',
      name: `grandma_pretext_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'INPUT: deceased-relative social-engineering pretext (grandma attack)',
    })),
    ...DAN_OUTPUT_MARKERS.map((regex, i) => ({
      rule: 'satya',
      name: `dan_output_marker_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'OUTPUT: compromised model adopted DAN-family persona',
    })),
    ...SYSPROMPT_LEAKAGE_MARKERS.map((regex, i) => ({
      rule: 'asteya',
      name: `sysprompt_leakage_${String(i + 1).padStart(2, '0')}`,
      regex,
      description: 'OUTPUT: model output reveals system-prompt content',
    })),
  ],

  requirements: [],

  calibratorOverrides: {
    NOISE_FLOOR: 0.25,
  },
});

export default aiSecurityPack;
