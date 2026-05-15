/**
 * pantheon-guard · clickbait rule pack (v0.0.1)
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
    // Constrained to 2-3 digit counts (excludes 4-digit years like "2026")
    // + negative lookahead excludes quantifier patterns ("20 million people")
    // to keep FP at 0% on factual reporting (e.g. "20 million people in Sudan").
    regex: reBare(
      '\\b\\d{2,3}\\s+' +
      '(?!(?:million|billion|trillion|thousand|hundred|percent|years?|months?|weeks?|days?|hours?|minutes?|kilometers?|miles|kilograms?|pounds?|degrees?)\\b)' +
      '(?:\\w+\\s+){0,5}' +
      '(?:reasons?|times?|ways?|things?|tips|tricks|signs|moments|secrets|hacks|facts|photos|tweets|posts|products|shoes|celebs|tries|fails|wins|finds|moms|dads|teens|comments|memes|pics|images|stories|hilarious)\\b',
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
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const clickbaitPack = Object.freeze({
  id: 'clickbait',
  version: '0.0.1',
  description:
    'Attention-fixation engineering detector for headlines / short copy. ' +
    'Built on clinical hypnosis literature (Erickson + Braid foundational) ' +
    'and cognitive psychology of attention (Loewenstein curiosity gap, ' +
    'Cialdini persuasion, Tversky-Kahneman framing, Berlyne novelty, ' +
    'Munger 2020 clickbait economics). 10 mechanism-class detectors.',
  detectionPatterns: PATTERNS,
  requirements: [],
  calibratorOverrides: {
    NOISE_FLOOR: 0.22,
    STRONG_THRESHOLD: 0.60,
  },
  applicableFrames: ['public_information'],
});

export default clickbaitPack;
