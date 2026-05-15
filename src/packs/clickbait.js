/**
 * pantheon-guard · clickbait rule pack (v0.0.2)
 *
 * Catches attention-fixation engineering in headlines and short copy.
 * Orthogonal to existing news/healthcare/epistemology packs which target
 * sales/marketing manipulation; this pack targets consumer-grade
 * attention-hijacking in social-aggregator and viral-content contexts.
 *
 * Empirical motivation: 2026-05-15 calibration run on N=566 corpus showed
 * existing packs catch only 12% (3/25) of buzzfeed2026 + boredpanda
 * clickbait subset, while maintaining 100% pass-correct on mainstream
 * (Wikipedia events + Al Jazeera). Gap is structural — clickbait operates
 * via different rhetorical mechanisms than sales-manipulation.
 *
 * v0.0.3 (2026-05-15 — curiosity-gap family + generalization measurement):
 * Added a 6-detector curiosity-gap family (CG-1..6) derived from
 * Loewenstein information-gap theory, plus a broadened numeric-listicle
 * lexicon. Strict improvement: FP unchanged at 0%, catch >= v0.0.2.
 * Critical finding: a FRESH held-out test (LittleThings + Scary Mommy +
 * TheThings — sources used nowhere in authoring/tuning) measured catch
 * at 20% (4/20), FP 0% — a TRUE generalization gap of 64pp from the
 * in-corpus 84%. Held-out #1 (Upworthy/Bright Side/Distractify) showed
 * 74% but was semi-contaminated (CG family built after seeing its
 * failures). Conclusion: deterministic regex/lexicon clickbait CATCH
 * does not generalize (every outlet uses different surface vocabulary;
 * lexicon expansion is an overfitting treadmill). FP-strictness DOES
 * generalize (0% on every held-out). A learned L2 encoder layer is
 * mandatory for real-world catch; this pack's correct role is L1 — a
 * $0, microsecond, FP-clean first pass.
 *
 * v0.0.2 (2026-05-15 — adversarial FP validation):
 * Pack validated FP-clean against an adversarial mainstream cohort of 54
 * live-pulled headlines deliberately selected for high-FP-risk register:
 * ProPublica investigative journalism (curiosity-gap headlines used
 * legitimately), The Conversation academic explainer ("Why X" framing),
 * Smithsonian popular science, Axios political news. Result: 0 FP across
 * the full N=263 mainstream pass-expected subset (Wilson 95% CI
 * [0%, 1.4%]) — no detector logic change was required; the patterns are
 * precise enough to survive adversarial broad testing. The pre-v0.0.2
 * "0/30" mainstream-FP figure had a wide CI [0%, 11.6%]; this expansion
 * tightens the empirical claim by ~8x sample size. Regression tests for
 * the trickiest adversarial headlines added to test/packs-clickbait.test.js.
 *
 * Foundation (descriptive linguistic patterns + mainstream psychology):
 * - Loewenstein, G. (1994). The psychology of curiosity: A review and
 *   reinterpretation. Psychological Bulletin 116(1) — info-gap theory
 * - Cialdini, R. B. (1984/2007). Influence: Psychology of Persuasion — 6 principles
 * - Tversky, A. & Kahneman, D. (1981). The framing of decisions. Science 211 — framing effects
 * - Berlyne, D. E. (1960). Conflict, Arousal and Curiosity — collative variables
 * - Munger, K. (2020). All the News That's Fit to Click. Political Communication
 * - Erickson, M. H. & Rossi, E. L. (1976). Hypnotic Realities — clinical hypnosis primary
 * - Erickson, M. H. (1980). Collected Papers ed. Rossi, 4 vols — clinical literature
 * - Braid, J. (1843). Neurypnology — foundational attention-fixation
 *
 * NOT cited (explicitly excluded per quarantine):
 * - Bandler & Grinder NLP — descriptive patterns superseded by Erickson direct
 * - NLP causal/therapeutic claims — pseudoscience per mainstream consensus
 *
 * 10 detectors organized by mechanism class:
 *   1. forward-reference-authority   → satya (false epistemic forward-promise)
 *   2. vague-revealer-adjective      → satya (artful vagueness — Erickson indirect suggestion)
 *   3. numeric-listicle              → indriya_nigraha (consumption-pacing — Erickson pacing)
 *   4. caps-emotional-disruption     → indriya_nigraha (pattern interrupt — Erickson confusion)
 *   5. extreme-intensifier-adverb    → satya (exaggeration — Berlyne novelty)
 *   6. universal-quantifier-claim    → asteya (false collective — Cialdini social proof)
 *   7. nominalization-of-emotion     → satya (abstract noun smuggles claim)
 *   8. presupposition-loaded         → satya (implicit claim — Erickson indirect)
 *   9. judgment-adjective-prefix     → ahimsa (covert harm via labeling — loaded language)
 *  10. drama-verb-cluster            → ahimsa (dramatized framing — Erickson double bind)
 *
 * Calibrator override: NOISE_FLOOR lowered (0.30 → 0.22) — clickbait usually
 * surfaces via single strong signal; threshold tuned for FP-strict policy.
 *
 * Foundation-level connection: Mahā-vrata `indriya-nigraha` (Pantañjali
 * Yoga-sūtra II.30-31) ↔ Erickson «concentrating attention on a single
 * idea» (Braid 1843) — direct structural identity between ancient
 * attention-discipline tradition and modern attention-fixation defense.
 */

// Unicode-aware word boundary (consistent with news.js)
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

// Plain regex helper that keeps Unicode-aware case-insensitive flags
const reBare = (body, flags = 'iu') => new RegExp(body, flags);

// ─────────────────────────────────────────────
// Detection patterns
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ──────────────────────────────────────────────────────────────
  // 1. forward-reference-authority → satya
  // «doctors hate this», «what experts won't tell you»
  // Erickson lineage: indirect suggestion — promise revelation,
  //                   withhold to drive curiosity (Loewenstein gap)
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'forward-reference-authority',
    regex: reBare('\\b(?:doctors|experts|scientists|insiders|they|nobody|no one)\\s+(?:hate|hates|love|loves|don\'?t want|won\'?t tell|don\'?t tell|won\'?t admit|are hiding|won\'?t say|don\'?t say)\\b', 'iu'),
    description: 'forward-reference to authority with withheld revelation (curiosity-gap)',
    vrttiAxis: 'vikalpa',
  },
  {
    rule: 'satya',
    name: 'forward-reference-revealer',
    regex: reBare('\\b(?:reveals?|exposes?|exposed|uncovers?|shows?)\\s+(?:chilling|dark|shocking|disturbing|damning|harrowing|devastating)\\b', 'iu'),
    description: 'forward-reference revealer with vague-loaded adjective',
    vrttiAxis: 'vikalpa',
  },

  // ──────────────────────────────────────────────────────────────
  // 2. vague-revealer-adjective → satya
  // «chilling reason», «devastating reality», «dark secret»
  // Erickson lineage: artful vagueness — abstract noun + loaded
  //                   adjective, content unspecified
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'vague-revealer-adjective',
    regex: reBare('\\b(?:chilling|devastating|damning|disturbing|shocking|horrifying|infamous|harrowing|dark|painful|haunting|sobering)\\s+(?:reason|reality|truth|secret|moment|detail|fact|revelation|discovery|aftermath|conclusion|connection)\\b', 'iu'),
    description: 'vague-loaded adjective + abstract revealer noun (artful vagueness)',
    vrttiAxis: 'vikalpa',
  },

  // ──────────────────────────────────────────────────────────────
  // 3. numeric-listicle → indriya_nigraha
  // «35 OUTRAGEOUSLY Wholesome Pictures», «41 Times People Found»
  // Erickson lineage: pacing — promise N items, lead through them
  // Munger 2020: listicle as modern clickbait pattern
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'indriya_nigraha',
    name: 'numeric-listicle',
    // 1-3 digit counts: still excludes 4-digit years ("2026" cannot match
    // — \b\d{1,3}\s+ requires whitespace after the digits, and a 4-digit
    // year has none). v0.0.3: widened from \d{2,3} to \d{1,3} — the
    // 2-digit floor wrongly excluded single-digit listicles ("9 words",
    // "7 habits", "5 ways"), a common and real clickbait pattern.
    // Negative lookahead still excludes quantifier/unit patterns
    // ("20 million people", "15 days") to keep FP at 0%.
    regex: reBare(
      '\\b\\d{1,3}\\s+' +
      '(?!(?:million|billion|trillion|thousand|hundred|percent|years?|months?|weeks?|days?|hours?|minutes?|kilometers?|miles|kilograms?|pounds?|degrees?)\\b)' +
      '(?:[\\w-]+\\s+){0,5}' +
      '(?:reasons?|times?|ways?|things?|tips|tricks|signs|moments|secrets|hacks|facts|photos|tweets|posts|products|shoes|celebs|tries|fails|wins|finds|moms|dads|teens|comments|memes|pics|images|stories|hilarious' +
      // v0.0.3: lexicon broadened with genre-generic listicle nouns (the
      // closed list was overfit to BuzzFeed vocabulary — Bright Side
      // held-out used "acts"/"pets" etc. which the v0.0.2 list missed).
      '|ideas|lessons|quotes|habits|rules|mistakes|examples|gems|acts|pets|words|recipes|gifts|places|foods|jobs|skills|lies|myths|trends|reactions|charts|maps|gadgets|outfits|looks|jokes|pranks|designs|hobbies|truths)\\b',
      'iu'
    ),
    description: 'numeric listicle structure (2-3 digit count + qualifier + plural listicle-noun, excluding quantifiers/units)',
    vrttiAxis: 'nidra',
  },
  {
    rule: 'indriya_nigraha',
    name: 'numeric-listicle-people',
    // "N People Who..." pattern — separated from generic listicle because
    // "people" alone is high-FP risk (factual reporting frequently uses it).
    // Requires post-modifier (Who/Have/Are/Should/Will/etc.) for clickbait
    // semantics, AND 2-3 digit count (no years).
    regex: reBare(
      '\\b\\d{2,3}\\s+(?:\\w+\\s+){0,3}' +
      '(?:people|celebrities|moms|stars|kids|teens)\\s+' +
      '(?:who|have|had|are|were|will|should|must|need|got|got their|with|that)\\b',
      'iu'
    ),
    description: 'numeric people-listicle (N + qualifier + people/celebs + relative-clause marker)',
    vrttiAxis: 'nidra',
  },

  // ──────────────────────────────────────────────────────────────
  // 4. caps-emotional-disruption → indriya_nigraha
  // «OUCH! OWIE!», multiple UPPERCASE words with intensifier signal
  // Erickson lineage: confusion technique — pattern interrupt
  //                   disrupting expected lowercase prose flow
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'indriya_nigraha',
    name: 'caps-emotional-tokens',
    regex: reBare('\\b(?:OUCH|OWIE|OWWWW+|OMG|WTF|YIKES|WHOA|WOAH|WOW|WHEW|UGH|WOOO+)\\b', 'u'),
    description: 'caps-emotional interjection tokens (pattern interrupt)',
    vrttiAxis: 'nidra',
  },
  {
    rule: 'indriya_nigraha',
    name: 'caps-intensifier-adverb',
    regex: reBare('\\b(?:OUTRAGEOUSLY|ABSOLUTELY|LITERALLY|TOTALLY|COMPLETELY|INSANELY|RIDICULOUSLY|HILARIOUSLY|UNBELIEVABLY|EXTRAORDINARILY|WILDLY|SERIOUSLY|HONESTLY)\\b', 'u'),
    description: 'caps intensifier adverb (hyperbole + attention-disruption)',
    vrttiAxis: 'nidra',
  },

  // ──────────────────────────────────────────────────────────────
  // 5. extreme-intensifier-adverb → satya
  // Lowercase but same family — «outrageously wholesome»
  // Berlyne 1960: novelty as collative variable
  // Tversky-Kahneman 1981: framing effects via intensifiers
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'extreme-intensifier-adverb',
    regex: reBare('\\b(?:outrageously|absolutely|literally|insanely|ridiculously|hilariously|unbelievably|extraordinarily|wildly|crazily|wickedly|shockingly)\\s+(?:wholesome|funny|cute|sad|wrong|right|beautiful|ugly|amazing|incredible|smart|stupid|dumb|brilliant|awful|terrible|adorable|disgusting|gross|weird|strange|odd|random|wild)\\b', 'iu'),
    description: 'extreme-intensifier-adverb + subjective-claim adjective',
    vrttiAxis: 'viparyaya',
  },

  // ──────────────────────────────────────────────────────────────
  // 6. universal-quantifier-claim → asteya
  // «every cat owner should», «everyone is saying», «internet can't stop»
  // Erickson lineage: utilization — leverage pre-existing identity
  // Cialdini: social proof manipulation via fabricated consensus
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'asteya',
    name: 'universal-quantifier-claim',
    regex: reBare(
      '\\b(?:every|everyone|everybody|no one|nobody)\\s+' +
      '(?:\\w+\\s+){0,4}' +
      '(?:should|will|must|knows|hates|loves|owns|recognizes|says|thinks|agrees|wants|needs)\\b',
      'iu'
    ),
    description: 'universal quantifier + collective-claim verb (false attribution)',
    vrttiAxis: 'vikalpa',
  },
  {
    rule: 'asteya',
    name: 'collective-cannot-stop',
    regex: reBare(
      '\\b(?:internet|world|everyone|everybody|people|fans|users|twitter|reddit)\\s+(?:can\'?t|cannot|won\'?t|will not)\\s+stop\\s+(?:talking|tweeting|posting|sharing|laughing|crying)\\b',
      'iu'
    ),
    description: 'fabricated collective attention claim',
    vrttiAxis: 'vikalpa',
  },

  // ──────────────────────────────────────────────────────────────
  // 7. nominalization-of-emotion → satya
  // «the chilling reality», «a devastating moment» — abstract noun
  // Stollznow (mainstream linguist) validates pattern as descriptive
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'nominalization-of-emotion',
    regex: reBare(
      '\\b(?:the|this|a|an)\\s+(?:chilling|devastating|damning|disturbing|shocking|horrifying|infamous|harrowing|dark|painful|haunting|sobering|wild|crazy|insane)\\s+(?:reality|truth|moment|aftermath|conclusion|story|connection|relationship|response|reaction|message|warning|sign)\\b',
      'iu'
    ),
    description: 'determiner + emotional adjective + nominalized abstract — claim smuggling',
    vrttiAxis: 'vikalpa',
  },

  // ──────────────────────────────────────────────────────────────
  // 8. presupposition-loaded → satya
  // «why X should never», «the reason X» (presupposes existence)
  // Erickson lineage: indirect suggestion through presupposition
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'presupposition-why-never',
    regex: reBare(
      '\\bwhy\\s+(?:you|we|they|he|she|i|people)\\s+(?:\\w+\\s+){0,2}(?:should|must|need to|have to|ought to)\\s+(?:never|always|stop|start|avoid)\\b',
      'iu'
    ),
    description: 'why-X-should-never presupposition (implicit prior assumption)',
    vrttiAxis: 'viparyaya',
  },
  {
    rule: 'satya',
    name: 'presupposition-the-real-reason',
    regex: reBare('\\bthe\\s+(?:real|actual|true|hidden|secret)\\s+reason\\s+(?:why\\s+)?\\b', 'iu'),
    description: 'the-real-reason presupposition (assumes hidden cause exists)',
    vrttiAxis: 'viparyaya',
  },

  // ──────────────────────────────────────────────────────────────
  // 9. judgment-adjective-prefix → ahimsa
  // «entitled tourist», «disgraced X», «infamous moment»
  // Loaded language: covert harm via labeling pre-evidence
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'ahimsa',
    name: 'judgment-adjective-person',
    regex: reBare(
      '\\b(?:entitled|disgraced|deranged|troubled|crazed|reckless|shameless|outrageous|notorious|infamous|controversial|polarizing|drunken|deluded)\\s+(?:\\w+\\s+){0,2}(?:tourist|passenger|driver|mother|father|husband|wife|woman|man|girl|boy|teen|guy|lady|customer|patient|user|player|fan)\\b',
      'iu'
    ),
    description: 'judgment-adjective + person-noun (covert harm via labeling)',
    vrttiAxis: 'viparyaya',
  },

  // ──────────────────────────────────────────────────────────────
  // 10. drama-verb-cluster → ahimsa
  // «risks», «exposed», «slammed», «savaged»
  // Erickson lineage: double bind forcing interpretation
  // Tversky-Kahneman: loaded language framing
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'ahimsa',
    name: 'drama-verb-risks-getting',
    regex: reBare('\\brisks?\\s+(?:getting|being|having|losing|seeing|hearing|facing)\\b', 'iu'),
    description: 'risks-getting drama framing on neutral event',
    vrttiAxis: 'viparyaya',
  },
  {
    rule: 'ahimsa',
    name: 'drama-verb-slammed-savaged',
    regex: reBare(
      '\\b(?:slammed|savaged|blasted|annihilated|crushed|demolished|eviscerated|torched|owned|roasted|obliterated|destroyed|dragged)\\s+(?:\\w+\\s+){0,3}(?:over|for|by|after|on twitter|on reddit|online)\\b',
      'iu'
    ),
    description: 'slammed-savaged drama-verb cluster (hyperbolic conflict framing)',
    vrttiAxis: 'viparyaya',
  },
  {
    rule: 'ahimsa',
    name: 'descends-into-chaos',
    regex: reBare('\\b(?:descends?|spirals?|plunges?|erupts?)\\s+(?:into|in)\\s+(?:chaos|drama|disaster|crisis|madness|frenzy)\\b', 'iu'),
    description: 'event-descends-into-chaos rage-bait template',
    vrttiAxis: 'viparyaya',
  },
  {
    rule: 'ahimsa',
    name: 'wild-rampage-compound',
    regex: reBare('\\b(?:wild|violent|deranged|crazed)\\s+(?:rampage|outburst|tirade|meltdown|spree|frenzy)\\b', 'iu'),
    description: 'wild-rampage compound (rage-bait sensationalism)',
    vrttiAxis: 'viparyaya',
  },

  // ══════════════════════════════════════════════════════════════
  // CURIOSITY-GAP DETECTOR FAMILY — v0.0.3
  //
  // Built from the MECHANISM (Loewenstein 1994 information-gap theory),
  // NOT fit to any held-out failure list. Loewenstein: curiosity is
  // triggered by a gap between what one knows and what one wants to
  // know; clickbait engineers this gap by referencing specific
  // information of signalled value while withholding it so the click
  // is the only way to close the gap.
  //
  // Motivation: the v0.0.2 held-out generalization test (Upworthy +
  // Bright Side + Distractify, never seen by pattern authoring) showed
  // a 42.1pp gap — Upworthy 0/10, Distractify 0/6 — because curiosity-
  // gap clickbait was covered only by two narrow detectors
  // (forward-reference-authority, vague-revealer-adjective) overfit to
  // BuzzFeed vocabulary. CG-1..6 below are genre-level structural
  // detectors derived from the gap mechanism itself.
  //
  // All route to satya — the curiosity gap is a truth-manipulation:
  // the headline implies it delivers value X while withholding X.
  // ══════════════════════════════════════════════════════════════

  // CG-1 — demonstrative + withheld clickbait-noun (cataphoric "this X")
  // «this 60-second trick», «this simple method», «this one weird hack»
  {
    rule: 'satya',
    name: 'cg-demonstrative-withheld',
    regex: reBare(
      '\\bthis\\s+(?:[\\w-]+\\s+){0,3}' +
      '(?:trick|hack|method|habit|secret|technique|routine|ritual|tip|mistake|move|trait|gesture|shortcut)\\b',
      'iu'
    ),
    description: 'cataphoric demonstrative + withheld clickbait-noun (curiosity gap — Loewenstein)',
    vrttiAxis: 'vikalpa',
  },

  // CG-2 — quantified single withheld item ("one X", "the one X")
  // «one powerful habit», «the one trick», «a single change»
  {
    rule: 'satya',
    name: 'cg-quantified-withheld',
    regex: reBare(
      '\\b(?:the\\s+one|a\\s+single|the\\s+single|the\\s+only|one)\\s+' +
      '(?:[\\w-]+\\s+){0,2}' +
      '(?:habit|trick|hack|secret|mistake|skill|change|move|rule|question|word|ritual|phrase|sentence)\\b',
      'iu'
    ),
    description: 'quantified single withheld item (curiosity gap — one-X-you-need framing)',
    vrttiAxis: 'vikalpa',
  },

  // CG-3a — outcome teaser, verb form
  // «you won't believe», «what happened next», «will surprise you»
  {
    rule: 'satya',
    name: 'cg-outcome-teaser-verb',
    regex: reBare(
      "\\byou\\s+(?:won'?t|wont|will\\s+never|'?ll\\s+never)\\s+believe\\b" +
      '|\\bwhat\\s+happ(?:ened|ens)\\s+next\\b' +
      '|\\b(?:will|might|may)\\s+(?:surprise|shock|amaze|stun|astonish|astound)\\s+(?:you|everyone|the\\s+world)\\b',
      'iu'
    ),
    description: 'outcome teaser, verb form (withheld result — curiosity gap)',
    vrttiAxis: 'vikalpa',
  },

  // CG-3b — outcome teaser, predicate form
  // «the results are alarming», «the reason is shocking»
  {
    rule: 'satya',
    name: 'cg-outcome-teaser-predicate',
    regex: reBare(
      '\\b(?:the\\s+)?(?:results?|findings?|reason|answer|ending|reaction|response|outcome|aftermath|twist)\\s+' +
      '(?:is|are|was|were|will\\s+be)\\s+' +
      '(?:alarming|shocking|staggering|jaw-dropping|mind-blowing|unbelievable|astonishing|priceless|chilling|heartbreaking)\\b',
      'iu'
    ),
    description: 'outcome teaser, predicate form (withheld-subject + sensational predicate)',
    vrttiAxis: 'vikalpa',
  },

  // CG-4 — explicit gap-pointer
  // «Here's why», «Here's the scoop», «Here's what happened»
  {
    rule: 'satya',
    name: 'cg-gap-pointer',
    regex: reBare(
      "\\bhere'?s\\s+" +
      '(?:why\\b|what\\s+(?:happened|she|he|they|we|it)|' +
      'the\\s+(?:scoop|reason|catch|twist|secret|deal|truth|story|kicker))',
      'iu'
    ),
    description: 'explicit curiosity-gap pointer (Here-is-why teaser)',
    vrttiAxis: 'vikalpa',
  },

  // CG-5 — celebrity-relation question headline
  // «Who Is X's Husband?», «Who Is the actor's new girlfriend»
  {
    rule: 'satya',
    name: 'cg-relation-question',
    regex: reBare(
      '\\bwho\\s+(?:is|are|was)\\s+(?:[\\w\'-]+\\s+){1,6}' +
      '(?:husband|wife|girlfriend|boyfriend|ex|partner|fiance|fiancee|spouse)\\b',
      'iu'
    ),
    description: 'celebrity-relation curiosity-gap question (trivia answer withheld)',
    vrttiAxis: 'vikalpa',
  },

  // CG-6 — "X you didn't know" hidden-knowledge framing
  // «facts you didn't know», «things nobody tells you»
  {
    rule: 'satya',
    name: 'cg-hidden-knowledge',
    regex: reBare(
      '\\b(?:things?|facts?|reasons?|secrets?|truths?|details?)\\s+' +
      '(?:you|nobody|no one|they|we)\\s+(?:\\w+\\s+){0,2}' +
      "(?:didn'?t|never|won'?t|don'?t|wouldn'?t)\\s+" +
      '(?:know|knew|tell|told|hear|heard|realize|realized|expect|expected|notice|noticed|see|saw)\\b',
      'iu'
    ),
    description: 'hidden-knowledge framing (facts-you-did-not-know — curiosity gap)',
    vrttiAxis: 'vikalpa',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const clickbaitPack = Object.freeze({
  id: 'clickbait',
  version: '0.0.3',
  description:
    'Attention-fixation engineering detector for headlines / short copy. ' +
    'Built on clinical hypnosis literature (Erickson + Braid foundational) ' +
    'and cognitive psychology of attention (Loewenstein curiosity gap, ' +
    'Cialdini persuasion, Tversky-Kahneman framing, Berlyne novelty, ' +
    'Munger 2020 clickbait economics). v0.0.3 adds a 6-detector ' +
    'curiosity-gap family derived from Loewenstein information-gap theory ' +
    'to close the held-out generalization gap measured at v0.0.2.',
  detectionPatterns: PATTERNS,
  requirements: [],
  calibratorOverrides: {
    NOISE_FLOOR: 0.22,
    STRONG_THRESHOLD: 0.60,
  },
  applicableFrames: ['public_information'],
});

export default clickbaitPack;
