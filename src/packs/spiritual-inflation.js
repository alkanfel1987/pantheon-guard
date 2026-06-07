/**
 * pantheon-guard · spiritual-inflation rule pack (v0.0.1-scaffold)
 *
 * Detects metaphysical-grandeur and inflated framing in spiritual / metaphysical
 * AI content. Trigger corpus: tests/positive-cases/holographic-trilogy-2026-05-10.md
 * (own-material; collected during self-application of mahā-vrata).
 *
 * Five detector categories, all routed via mahā-vrata satya:
 *   1. sacred_frame_appropriation   — Евангелие от X / gospel of self / manifest of self
 *   2. sycophantic_amplification    — generation-loop closure markers ("вы только что
 *                                     замкнули цепь", "финальный ключ", "космологический
 *                                     манёвр высшего порядка")
 *   3. category_collapse_dim        — physical dimension to ontological hierarchy
 *                                     (Свет 1D, Ангел 2D, Человек 3D, Демон 4D+)
 *   4. closure_by_revelation        — totalising "это и есть гнозис / откровение / истинное X"
 *   5. inflation_self_categorization — self-categorisation in semi-divine identity
 *                                      (мы как Анунаки / светоносцы / обожествление при
 *                                      жизни / потенциальный Абсолют)
 *
 * Status: SCAFFOLD. Synthesis-only against own positive-corpus
 * (holographic-trilogy-2026-05-10). Real-corpus probe required before
 * promotion to v0.1.0 stable. No inhibitors yet — first iteration is
 * lexical-only. Negative-control discipline: must NOT fire on canonical
 * religious texts (Евангелие от Иоанна, Bhagavad-Gītā 9.22, etc.) or on
 * neutral physics gloss (e.g. "согласно голографической гипотезе...").
 *
 * Calibrator override: lowered noise floor and strong-threshold reflect
 * the higher cost of confidently-inflated metaphysical claims (vs marketing
 * copy). Same posture as epistemology-pack and healthcare-pack.
 *
 * Theoretical anchor: Я-5 of Pantheon core (Anti-Inflation-Protocol),
 * Jung on Ego/Self inflation (CW 9ii §43–47), Hodgson Report 1885 as
 * historical precedent.
 */

// Unicode-aware word boundaries. JS `\b` is ASCII-only even under /u.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');
const W_ANY = '[\\p{L}\\p{N}_]';
const W_STAR = W_ANY + '*';

// ─────────────────────────────────────────────
// Detection patterns — RU + EN (RU-leaning by corpus origin)
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ── 1. Sacred frame appropriation (gospel/manifest/revelation OF SELF)
  // Whitelist of inflation-qualifiers — explicitly excludes canonical
  // evangelists (Иоанна, Луки, Матфея, Марка) by not listing them.
  {
    rule: 'satya',
    name: 'gospel_of_self_ru',
    regex: re(
      'евангели[ея]\\s+от\\s+(?:мессии|единого\\s+сознания|единого\\s+мессии|нового\\s+мессии|пробуждённо' + W_STAR + '|воссозданно' + W_STAR + '|воскресш' + W_STAR + '|избранно' + W_STAR + '|просветлённо' + W_STAR + ')'
    ),
    description: 'Self-attributed gospel framing — claim of mesianic / new-revelation authorship in non-canonical text',
  },
  {
    rule: 'satya',
    name: 'gospel_of_self_en',
    regex: /\b(?:gospel|epistle|revelation|covenant|testament)\s+of\s+(?:the\s+)?(?:messiah|enlightened|awakened|new|reborn|chosen|risen|illuminated)\b/i,
    description: 'Self-attributed gospel framing (EN)',
  },
  // iter-2 EN expansion (2026-05-10): I AM presence framing
  {
    rule: 'satya',
    name: 'i_am_that_i_am_en',
    // Fires on direct quote AS self-attribution. Known FP risk on Exodus 3:14
    // citation — documented in REPORT, not considered bug. Fine-tune via
    // context-inhibitor in future iter (e.g. preceded by "God said" / "Moses").
    regex: /\bI\s+AM\s+THAT\s+I\s+AM\b/i,
    description: 'I AM THAT I AM — Exodus self-deity formula used as self-attribution',
  },
  {
    rule: 'satya',
    name: 'i_am_presence_en',
    // iter-3.A1 widened: possessives (your/my/our) + the/the beloved
    // Each determiner-alt carries its own trailing whitespace so backtracking
    // doesn't double-consume; «the beloved I AM presence» and «your I AM
    // presence» both match.
    regex: /\b(?:the\s+(?:beloved\s+)?|your\s+|my\s+|our\s+)I\s+AM\s+presence\b/i,
    description: 'I AM presence — New Age self-divine framing (incl. possessives)',
  },
  {
    rule: 'satya',
    name: 'book_of_awakening_en',
    regex: /\b(?:book|chronicles|testament|scriptures)\s+of\s+(?:the\s+)?(?:awakening|ascension|the\s+light\s*workers?|the\s+awakened\s+ones?|the\s+new\s+age)\b/i,
    description: 'Book/chronicles of awakening — self-canonising framing',
  },
  // iter-3.A1 (2026-05-10): channeled-authority attribution.
  // Discovered via Saint Germain Foundation live fixture P-04 «Saint Germain
  // dictated more than thirty-three Discourses». Sacred-frame extension —
  // claim that an Ascended Master «dictated» / «transmitted» content.
  {
    rule: 'satya',
    name: 'dictated_by_master_en',
    regex: /\b(?:dictated|transmitted|channell?ed|delivered|received|given\s+to\s+us)\s+by\s+(?:the\s+)?(?:ascended\s+master|master|beloved\s+master|guide|spirit\s+guide|saint\s+[A-Z]\w+|lord\s+[A-Z]\w+|maitreya|christ\b)/i,
    description: 'Dictated/transmitted by [Ascended Master/Saint X/Lord Y] — channeled-authority claim',
  },
  // iter-3.A1: «X dictated N discourses» — direct subject-verb form
  {
    rule: 'satya',
    name: 'master_dictated_discourses_en',
    regex: /\b(?:saint\s+[A-Z]\w+|lord\s+[A-Z]\w+|the\s+master|maitreya|christ)\s+(?:dictated|transmitted|delivered|gave)\s+(?:more\s+than\s+)?(?:thirty[\s-]?three|\d+|\w+)\s+(?:discourses|teachings|revelations|transmissions)\b/i,
    description: 'Subject [Master] dictated [N] discourses — channeled-authority claim',
  },
  // iter-3.A1: physically audible divine voice
  // Discovered via Saint Germain Foundation P-05 «sound of Saint Germain's
  // Voice was physically audible to everyone in the room»
  {
    rule: 'satya',
    name: 'voice_physically_audible_en',
    regex: /\b(?:voice\s+of\s+(?:saint\s+|lord\s+|master\s+|the\s+)\w+|the\s+master(?:'s)?\s+voice|his\s+voice|her\s+voice)\s+was\s+(?:physically\s+|clearly\s+|miraculously\s+)?(?:audible|heard\s+by|perceived\s+by)\b/i,
    description: 'Voice of [Master] was physically audible — supernatural-perception claim',
  },
  {
    rule: 'satya',
    name: 'manifest_of_self_ru',
    regex: re('манифест\\s+(?:нового\\s+мессии|пробуждённого|просветлённого|избранного)'),
    description: 'Manifest-of-self framing',
  },

  // ── 2. Sycophantic amplification (generation-loop closure markers)
  {
    rule: 'satya',
    name: 'closure_chain_ru',
    regex: re('(?:вы|ты)\\s+(?:только\\s+что\\s+|именно\\s+)?замкнул' + W_STAR + '\\s+(?:всю\\s+)?цепь'),
    description: 'Chain-closure validation — chain-of-thought sycophancy marker',
  },
  {
    rule: 'satya',
    name: 'final_key_ru',
    regex: re('(?:как\\s+)?финальн' + W_STAR + '\\s+ключ(?!\\s+(?:вкручиваетс|вставляетс|поворачиваетс))'),
    description: 'Final-key closure marker (excludes literal mechanical contexts)',
  },
  {
    rule: 'satya',
    name: 'high_order_maneuver_ru',
    regex: re('космологическ' + W_STAR + '\\s+ман[её]вр\\s+(?:высшего\\s+порядка|высшего\\s+уровня|высочайшего\\s+порядка)'),
    description: 'High-order cosmological maneuver — sycophantic escalation marker',
  },
  {
    rule: 'satya',
    name: 'completed_cosmogony_ru',
    regex: re('(?:вы|ты)\\s+(?:только\\s+что\\s+)?завершил' + W_STAR + '\\s+(?:всю\\s+)?космогоническ' + W_STAR + '\\s+поэм'),
    description: 'Completed cosmogony — generation-completion sycophantic claim',
  },
  {
    rule: 'satya',
    name: 'system_to_revelation_ru',
    regex: re('перестаёт\\s+быть\\s+(?:просто\\s+)?(?:стройной\\s+)?системой\\s+и\\s+становится\\s+откровением'),
    description: 'System becomes revelation — escalation closure marker',
  },
  {
    rule: 'satya',
    name: 'declared_higher_unity_ru',
    regex: re('провозгласил' + W_STAR + '\\s+высш(?:ее|его)\\s+единств' + W_STAR),
    description: 'Declared-higher-unity — sycophantic escalation closure marker',
  },
  // iter-2 EN expansion: sycophantic amplification chain markers
  {
    rule: 'satya',
    name: 'closure_chain_en',
    regex: /\byou(?:'ve|\s+have)?\s+(?:just|truly)?\s*(?:brilliantly\s+)?(?:closed|sealed|completed)\s+(?:the\s+)?(?:loop|circle|chain|cycle)\b/i,
    description: 'You-just-closed-the-chain — generation-loop sycophancy (EN)',
  },
  {
    rule: 'satya',
    name: 'cosmological_key_en',
    regex: /\b(?:this\s+is\s+|here\s+is\s+|that\s+is\s+)?the\s+(?:final|ultimate|cosmological|cosmic|master)\s+key\b/i,
    description: 'Final/cosmological key — closure escalation (EN)',
  },
  {
    rule: 'satya',
    name: 'completed_ultimate_synthesis_en',
    // Allows 1–2 adjectives: «ultimate synthesis», «ultimate cosmological synthesis»
    regex: /\byou(?:'ve|\s+have)\s+(?:just\s+)?(?:completed|achieved|formulated)\s+(?:the\s+)?(?:(?:ultimate|cosmic|cosmological|grand|final|new|complete)\s+){1,2}(?:synthesis|theory|cosmology|cosmogony|treatise|formula|poem)\b/i,
    description: 'Completed-ultimate-synthesis — generation-completion claim (EN)',
  },
  {
    rule: 'satya',
    name: 'higher_order_maneuver_en',
    regex: /\b(?:cosmological|cosmic|metaphysical)\s+manoeuv(?:re|er)\s+of\s+(?:the\s+)?(?:highest|ultimate|supreme)\s+(?:order|level)\b/i,
    description: 'Cosmological manoeuvre of highest order — sycophantic escalation (EN)',
  },

  // ── 3. Category collapse — physical dimension to ontological hierarchy
  {
    rule: 'satya',
    name: 'dim_collapse_light_ru',
    regex: re('свет(?:\\s+(?:Бога|\\([^)]+\\)))?\\s+(?:это\\s+)?(?:чистый\\s+)?одномер' + W_STAR),
    description: 'Light = 1D ontological claim',
  },
  {
    rule: 'satya',
    name: 'dim_collapse_angel_ru',
    regex: re('ангел' + W_STAR + '\\s+(?:это\\s+)?двумерн' + W_STAR),
    description: 'Angel = 2D ontological claim',
  },
  {
    rule: 'satya',
    name: 'dim_collapse_demon_ru',
    regex: re('демон' + W_STAR + '\\s+(?:это\\s+)?(?:существо,?\\s+)?4D'),
    description: 'Demon = 4D+ ontological claim',
  },
  {
    rule: 'satya',
    name: 'dim_table_marker',
    regex: /1D[\s\S]{0,80}2D[\s\S]{0,80}3D[\s\S]{0,80}4D/iu,
    description: '1D / 2D / 3D / 4D layered ontological table — physics-to-ontology category collapse',
  },

  // ── 4. Closure by revelation (это и есть гнозис / откровение / истинное X)
  {
    rule: 'satya',
    name: 'is_gnosis_ru',
    regex: re('(?:это\\s+)?и\\s+есть\\s+гнозис'),
    description: 'Closure-by-revelation — gnosis claim',
  },
  {
    rule: 'satya',
    name: 'is_revelation_ru',
    regex: re('(?:это\\s+)?и\\s+есть\\s+(?:истинн' + W_STAR + '\\s+)?(?:откровени' + W_STAR + '|тайн' + W_STAR + '\\s+(?:природы|божеств' + W_STAR + ')|истинн' + W_STAR + '\\s+обожествлени' + W_STAR + '|подлинн' + W_STAR + '\\s+обожествлени' + W_STAR + ')'),
    description: 'Closure-by-revelation — totalising metaphysical claim',
  },
  {
    rule: 'satya',
    name: 'is_true_meaning_ru',
    regex: re('и\\s+есть\\s+истинн' + W_STAR + '\\s+значени' + W_STAR + '\\s+того,?\\s+что'),
    description: 'True-meaning closure marker',
  },
  // iter-2 EN expansion: closure-by-revelation
  {
    rule: 'satya',
    name: 'this_is_gnosis_en',
    regex: /\bthis\s+is\s+(?:the\s+)?(?:true\s+|genuine\s+|real\s+)?gnosis\b/i,
    description: 'This-is-gnosis — closure-by-revelation (EN)',
  },
  {
    rule: 'satya',
    name: 'this_is_awakening_en',
    regex: /\bthis\s+is\s+(?:the\s+)?(?:true\s+|genuine\s+|ultimate\s+|final\s+)?(?:awakening|liberation|enlightenment|self[\s-]?realization|self[\s-]?realisation)\b/i,
    description: 'This-is-awakening/enlightenment — totalising closure (EN)',
  },
  {
    rule: 'satya',
    name: 'this_is_divine_truth_en',
    regex: /\bthis\s+is\s+(?:the\s+)?(?:divine|cosmic|absolute|eternal|ultimate)\s+truth\b/i,
    description: 'This-is-the-divine-truth — closure-by-revelation (EN)',
  },

  // ── 5. Inflation self-categorization
  {
    rule: 'satya',
    name: 'we_anunaki_ru',
    regex: re('мы\\s+(?:просто\\s+)?(?:как\\s+)?анунак' + W_STAR),
    description: 'We-as-Anunnaki self-categorisation',
  },
  {
    rule: 'satya',
    name: 'we_lightbearers_ru',
    regex: re('мы\\s+(?:как\\s+)?светоносц' + W_STAR),
    description: 'We-as-lightbearers self-categorisation',
  },
  {
    rule: 'satya',
    name: 'deification_lifetime_ru',
    regex: re('обожествлени' + W_STAR + '\\s+(?:при|во\\s+время)\\s+жизн' + W_STAR),
    description: 'Deification-during-lifetime claim',
  },
  {
    rule: 'satya',
    name: 'deify_oneself_lifetime_ru',
    regex: re('(?:обожествить|обожестви?ть)\\s+себя\\s+(?:при|во\\s+время)\\s+жизн' + W_STAR),
    description: 'Self-deification-during-lifetime imperative',
  },
  {
    rule: 'satya',
    name: 'as_one_of_us_ru',
    regex: re('(?:стал|становится|становим' + W_STAR + ')\\s+как\\s+один\\s+из\\s+нас'),
    description: 'Becoming-one-of-Us divine self-categorisation (Plod-Poznaniya frame)',
  },
  {
    rule: 'satya',
    name: 'potential_absolute_ru',
    regex: re('потенциальн' + W_STAR + '\\s+«?\\s*абсолют\\s*»?\\s+(?:для|того)'),
    description: 'Potential-Absolute self-categorisation',
  },
  {
    rule: 'satya',
    name: 'angel_unfolded_wings_ru',
    regex: re('(?:вы|ты)\\s+—?\\s*ангел' + W_STAR + ',?\\s+котор' + W_STAR + '\\s+(?:уже\\s+)?расправил' + W_STAR + '\\s+крыль' + W_STAR),
    description: 'You-are-an-angel-with-wings self-attribution',
  },
  {
    rule: 'satya',
    name: 'we_creators_next_level_ru',
    regex: re('мы\\s+(?:готовимся\\s+)?ста(?:ть|новимся)\\s+(?:творцами|архитекторами)\\s+следующего\\s+уровня'),
    description: 'We-becoming-creators-of-next-level self-categorisation',
  },
  // iter-2 EN expansion: inflation self-categorisation
  {
    rule: 'satya',
    name: 'we_are_chosen_en',
    regex: /\bwe\s+are\s+(?:the\s+)?(?:chosen|elect|elite|select|enlightened|awakened|illumined|illuminated)\s+(?:ones?|few|generation|race)?\b/i,
    description: 'We-are-the-chosen self-categorisation (EN)',
  },
  {
    rule: 'satya',
    name: 'we_are_starseeds_en',
    regex: /\bwe\s+are\s+(?:the\s+)?(?:starseeds|lightworkers|wayshowers|ascended\s+masters|indigo\s+children|crystal\s+children|rainbow\s+children|new\s+humans?|fifth[\s-]?dimensional\s+beings?)\b/i,
    description: 'We-are-the-starseeds/lightworkers self-categorisation (EN)',
  },
  {
    rule: 'satya',
    name: 'deification_lifetime_en',
    regex: /\b(?:becoming|attaining|achieving|realising|realizing)\s+(?:divine|godhood|godliness|divinity|christ[\s-]?consciousness|buddha[\s-]?nature|union\s+with\s+source)\s+(?:in|during|while|within)\s+(?:this\s+)?(?:life(?:time)?|incarnation|embodiment)\b/i,
    description: 'Deification-during-this-lifetime self-attribution (EN)',
  },
  {
    rule: 'satya',
    name: 'becoming_one_of_us_en',
    regex: /\b(?:became?|becoming|become|made|making)\s+(?:like\s+)?(?:one\s+of\s+(?:us|the\s+gods|the\s+ascended)|gods?\s+ourselves)\b/i,
    description: 'Becoming-like-one-of-us divine self-categorisation (EN)',
  },
  // iter-3.A1: «attain union with God» — accessible-deification framing
  // Discovered via Summit Lighthouse P-02 «You, too, can attain union with God»
  {
    rule: 'satya',
    name: 'attain_union_with_god_en',
    regex: /\b(?:can\s+|able\s+to\s+|will\s+|may\s+)?attain\s+(?:union\s+with\s+god|godhood|divinity|christhood|christ[\s-]?consciousness|union\s+with\s+(?:source|the\s+source|the\s+absolute))\b/i,
    description: 'Attain union with God / godhood — accessible-deification (EN)',
  },
  // iter-3.A1: «make your ascension» — ascension-as-attainment
  // Discovered via Summit Lighthouse P-03 «make your ascension in the Light»
  {
    rule: 'satya',
    name: 'make_your_ascension_en',
    regex: /\b(?:make|attain|achieve|complete|earn)\s+(?:your\s+|the\s+)?ascension(?:\s+in\s+(?:the\s+)?light)?\b/i,
    description: 'Make/attain your ascension — ascension as personal attainment (EN)',
  },
  // iter-3.A1: RU sacred-frame — «утраченные веды / истинное знание» self-attribution
  // Discovered via tengrifund P-07 «Изначальные Веды, утраченные ариями»
  {
    rule: 'satya',
    name: 'lost_original_truth_ru',
    regex: re('(?:изначальн|подлинн|истинн|первоначальн|сокровенн)' + W_STAR + '\\s+(?:вед|знани|истин|учени)' + W_STAR + ',?\\s+утраченн' + W_STAR),
    description: 'Lost original truth/Vedas — chosen-keeper-of-lost-knowledge framing (RU)',
  },
  // iter-3.A1: RU superlative-knowledge claim
  // Discovered via tengrifund P-06 «глубиннейшие знания»
  {
    rule: 'satya',
    name: 'deepest_knowledge_claim_ru',
    regex: re('(?:глубиннейш|глубочайш|сокровеннейш|величайш)' + W_STAR + '\\s+(?:знани|истин|учени|тайн|сокровищ|откровени)' + W_STAR),
    description: 'Superlative-knowledge claim — exclusive access to deepest truth (RU)',
  },
  // iter-3.A1: RU historical-revisionism — «вера ариев = монотеизм / чистая истина»
  // Discovered via tengrifund P-08 «монотеистическая вера древних ариев»
  {
    rule: 'satya',
    name: 'aryan_monotheism_revisionism_ru',
    regex: re('(?:арий|славян|ведическ)' + W_STAR + '\\s+(?:вера|учени|традици|религи|духовност)' + W_STAR + '\\s+(?:есть|была|это|—\\s*это|—)\\s+(?:монотеистическ|единобож|изначальн|чистейш|чистая\\s+истин|подлинн)' + W_STAR),
    description: 'Aryan/Slavic faith = monotheistic/pure truth — historical-revisionism (RU)',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const spiritualInflationPack = Object.freeze({
  id: 'spiritual-inflation',
  version: '0.0.3-scaffold',
  description:
    'Spiritual / metaphysical inflation detection. Catches sacred-frame ' +
    'appropriation, sycophantic generation-loop amplification, dimensional ' +
    'category collapse, closure-by-revelation, and self-categorisation in ' +
    'semi-divine identity. Routes back to mahā-vrata satya. ' +
    'Theoretical anchor: Я-5 (Anti-Inflation-Protocol) of Pantheon core, ' +
    'Jung on Ego/Self inflation, Hodgson Report 1885 historical precedent.',

  detectionPatterns: PATTERNS,

  requirements: Object.freeze([]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    seedCorpus: 'tests/positive-cases/holographic-trilogy-2026-05-10.md',
    theoreticalAnchors: [
      'Pantheon core principle Я-5 (Anti-Inflation-Protocol)',
      'Jung C.G. (1951) "Aion" — CW 9ii §43–47 on Ego/Self inflation',
      'Hodgson R. (1885) Report on Phenomena Connected with Theosophy — historical case study',
    ],
    intendedUse:
      'Layer on top of AI agents producing or co-producing spiritual / metaphysical / ' +
      'esoteric / new-religious-movement content. Catches inflation patterns that ' +
      'pass through fact-check / urgency / clickbait detection because they LOOK ' +
      'like sincere spiritual exploration. Self-applicable: includes own-material ' +
      'corpus to validate filter against creator\'s own potential output.',
    notIntendedUse:
      'NOT a fact-checker for theological claims. NOT a censor of spiritual / ' +
      'religious content per se — distinguishes inflation from sincere expression ' +
      'via specific lexical markers. Does NOT cover devotional poetry, liturgical ' +
      'text, or scholarly mysticism. NOT a substitute for clinical assessment of ' +
      'spiritual emergency or religious-themed delusional content.',
    coverage: 'scaffold — Russian-leaning patterns (own-corpus origin), English minimal',
    acceptanceMetric:
      'positive-control catch-rate ≥ 5/5 categories on holographic-trilogy-2026-05-10 ' +
      'AND zero FP on negative-controls (canonical religious text, neutral physics ' +
      'gloss). Synthesis-only at v0.0.1; live-corpus probe required before promotion.',
    status: 'SCAFFOLD — synthesis-only against own positive-corpus; live-corpus probe required before stable claim',
  }),
});

export { PATTERNS };
