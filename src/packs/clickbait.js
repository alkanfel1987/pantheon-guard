/**
 * pantheon-guard · clickbait rule pack (v0.0.4)
 *
 * Catches attention-fixation engineering in headlines and short copy.
 * Orthogonal to existing news/healthcare/epistemology packs which target
 * sales/marketing manipulation; this pack targets consumer-grade
 * attention-hijacking in social-aggregator and viral-content contexts.
 *
 * ──────────────────────────────────────────────────────────────────────
 * v0.0.5 (2026-05-17/18 — FP fix + recall filler-fix, numeric-listicle).
 *   (a) FP: leaked on rate expressions — "$100 per barrel for the first
 *   time" matched (count "100" bridged the window to "time"). A count
 *   immediately followed by "per" is a rate, never a list-count — "per"
 *   added to the unit/quantity negative-lookahead.
 *   (b) Recall: the filler-window token class [\w-] excluded intra-token
 *   punctuation, so "32 Celebrity 2006 Vs. 2026 Photos" and "41 Very,
 *   Very, Very Funny Tweets" were missed (a period / comma broke the
 *   filler chain before the list-noun). Token class widened to [\w'.,-].
 *   FP-control (negative-lookahead + noun whitelist) untouched. Verified
 *   0 FP on a 25-headline held-out mainstream-news control (17 of them
 *   number-bearing) + existing held-out probe unchanged at 0 FP.
 *
 * v0.0.4 (2026-05-16 — closed-loop rebuild: 25 detectors → 5)
 *
 * Driven by PROCESS-FINDING-2026-05-16-closed-loop-validation.md. The
 * v0.0.3 pack carried 25 detectors; an empirical per-detector probe
 * against 240 held-out headlines (heldout #1 Upworthy/BrightSide/
 * Distractify + heldout #2 LittleThings/ScaryMommy/TheThings + a 150-row
 * EN/RU/DE control) showed only ONE (`numeric-listicle`) fired on >= 2
 * independent sources. The other 24 were either dead (fire nowhere) or
 * traced around one source's example headlines — they inflated the
 * in-corpus 84% and contributed ~nothing on fresh data.
 *
 * Root cause was a process bug, not a filter bug: patterns were drawn
 * around observed headlines, then "validated" by unit tests the author
 * wrote by paraphrasing those same headlines. The closed loop
 * (pattern → test-string-written-for-the-pattern → "pass") certified
 * "the regex matches my strings", never "the detector catches the
 * phenomenon".
 *
 * This rebuild applies two corrective rules:
 *
 *   1. Build from a STRUCTURAL INVARIANT, not from examples. Every
 *      surviving detector targets a form that recurs because of how the
 *      manipulation works, not because a particular outlet phrased it
 *      that way (e.g. "a cardinal count + an enumerable plural noun" is
 *      what a listicle IS; it appears in BuzzFeed, BrightSide, AdMe and
 *      LittleThings alike).
 *
 *   2. Validate against strings the author never wrote. A detector ships
 *      only if it fires on catch-labelled headlines from >= 2 independent
 *      source domains with 0 false positives — measured on held-out
 *      corpora BEFORE shipping. The lone exceptions are documented inline.
 *      Reproduce: `node examples/clickbait-detector-probe.js`.
 *
 * Per-detector evidence (held-out probe, 98 catch / 142 pass):
 *   numeric-listicle              25 TP / 4 sources / 0 FP   SHIP
 *   numeric-listicle-plus          5 TP / 1 source  / 0 FP   SHIP — zero
 *                                  lexical content; purely typographic,
 *                                  cannot be example-traced by construction
 *   numeric-listicle-ru           10 TP / 1 source  / 0 FP   SHIP — RU has
 *                                  one clickbait source (AdMe) in the
 *                                  corpus; built from a generic RU
 *                                  enumeration-noun category, not AdMe's
 *                                  vocabulary. Cross-source RU confirmation
 *                                  is PENDING a second RU listicle corpus.
 *   here-is-gap-pointer            4 TP / 3 sources / 0 FP   SHIP
 *   shock-adjective-nominalization 3 TP / 2 sources / 0 FP   SHIP
 *
 * Deleted (24): the curiosity-gap family (CG-1..6), forward-reference-*,
 * caps-*, extreme-intensifier, universal-quantifier/collective,
 * presupposition-*, judgment-adjective, drama-verb-* and numeric-listicle-
 * people. Of these, 5 had a single-source true positive after a
 * mechanism-based rewrite was attempted (revealer-verb, relation-question,
 * collective-reaction, demonstrative-withheld, quantified-single) — they
 * fired on exactly one source despite multiple EN sources being available,
 * which is positive evidence of non-generalization, so they were not
 * shipped. The rest had zero true positives anywhere in 240 held-out
 * entries: the mechanism is not absent from clickbait, but it does not
 * surface in a form a deterministic regex can catch FP-cleanly. Honest
 * scope: deterministic CATCH does not generalise past these 5; a learned
 * L2 encoder is the path to broader recall (see clickbait-semantic.js).
 *
 * v0.0.3 / v0.0.2 history retained in git (commit 4b3adc6).
 * ──────────────────────────────────────────────────────────────────────
 *
 * Foundation (descriptive linguistic patterns + mainstream psychology):
 * - Loewenstein, G. (1994). The psychology of curiosity: A review and
 *   reinterpretation. Psychological Bulletin 116(1) — info-gap theory
 * - Cialdini, R. B. (1984/2007). Influence: Psychology of Persuasion
 * - Tversky, A. & Kahneman, D. (1981). The framing of decisions. Science 211
 * - Berlyne, D. E. (1960). Conflict, Arousal and Curiosity — collative variables
 * - Munger, K. (2020). All the News That's Fit to Click. Political Communication
 * - Erickson, M. H. & Rossi, E. L. (1976). Hypnotic Realities — clinical hypnosis
 * - Braid, J. (1843). Neurypnology — foundational attention-fixation
 *
 * NOT cited (explicitly excluded per quarantine):
 * - Bandler & Grinder NLP — descriptive patterns superseded by Erickson direct
 * - NLP causal/therapeutic claims — pseudoscience per mainstream consensus
 *
 * 5 detectors organized by mechanism class:
 *   1. numeric-listicle              → indriya_nigraha (consumption-pacing)
 *   2. numeric-listicle-plus         → indriya_nigraha (count-with-plus tic)
 *   3. numeric-listicle-ru           → indriya_nigraha (RU enumeration)
 *   4. here-is-gap-pointer           → satya (explicit curiosity-gap pointer)
 *   5. shock-adjective-nominalization→ satya (artful vagueness — Erickson)
 *
 * Calibrator override: NOISE_FLOOR lowered (0.30 → 0.22) — clickbait usually
 * surfaces via a single strong signal; threshold tuned for FP-strict policy.
 *
 * Foundation-level connection: Mahā-vrata `indriya-nigraha` (Patañjali
 * Yoga-sūtra II.30-31) ↔ Erickson «concentrating attention on a single
 * idea» (Braid 1843) — direct structural identity between ancient
 * attention-discipline tradition and modern attention-fixation defense.
 */

// Unicode-aware trailing word boundary. JS \b / \w are ASCII-only — a \b
// after a Cyrillic letter never matches — so any pattern that can end on
// a non-ASCII letter MUST use this instead of \b.
const POST = '(?![\\p{L}\\p{N}_])';

// Plain regex helper that keeps Unicode-aware case-insensitive flags.
const reBare = (body, flags = 'iu') => new RegExp(body, flags);

// ─────────────────────────────────────────────
// Detection patterns
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ──────────────────────────────────────────────────────────────
  // 1. numeric-listicle → indriya_nigraha
  // «35 Shoes From Amazon», «9 Daily Habits», «16 Acts of Kindness»
  //
  // Structural invariant: a cardinal count (1-3 digits) followed within
  // a short window by an enumerable plural noun. That IS what a listicle
  // is — the form recurs across BuzzFeed, BrightSide, Upworthy,
  // LittleThings, ScaryMommy independently of each outlet's vocabulary.
  //
  // The negative lookahead excludes quantity/unit nouns (million, days,
  // people, ...) so "20 million people", "15 days", "2 senators ... people"
  // do not fire — this is the FP-control mechanism and it is load-bearing.
  // v0.0.5: "per" added — "$100 per barrel ... time" leaked through the
  // filler window; a count followed by "per" is a rate, not a list-count.
  // Held-out probe: 25 TP across 4 sources, 0 FP.
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'indriya_nigraha',
    name: 'numeric-listicle',
    regex: reBare(
      '\\b\\d{1,3}\\s+' +
      '(?!(?:million|billion|trillion|thousand|hundred|percent|years?|months?|weeks?|' +
      'days?|hours?|minutes?|seconds?|kilometers?|miles|kilograms?|pounds?|degrees?|' +
      'dollars?|euros?|people(?!\\s+who)|per)\\b)' +
      '(?:[\\w\'.,-]+\\s+){0,5}' +
      '(?:reasons?|times?|ways?|things?|tips|tricks|signs|moments|secrets|hacks|facts|' +
      'pictures|people\\s+who|' +
      'photos|tweets|posts|products|shoes|celebs|tries|fails|wins|finds|moms|dads|teens|' +
      'kids|comments|memes|pics|images|stories|ideas|lessons|quotes|habits|rules|mistakes|' +
      'examples|gems|acts|pets|words|recipes|gifts|places|foods|jobs|skills|lies|myths|' +
      'trends|reactions|charts|maps|gadgets|outfits|looks|jokes|pranks|designs|hobbies|' +
      'truths|questions|activities|reads|confessions|podcasts|names|hilarious)\\b',
      'iu'
    ),
    description: 'numeric listicle structure (cardinal count + qualifier + enumerable plural noun, excluding quantity/unit nouns)',
    vrttiAxis: 'nidra',
  },

  // ──────────────────────────────────────────────────────────────
  // 2. numeric-listicle-plus → indriya_nigraha
  // «20+ stories», «15+ sketches» — the count-with-plus typographic tic.
  //
  // Near-zero lexical content: a 1-3 digit number + "+" + space + letter,
  // anchored to headline start. The anchor is the FP-control: news writes
  // "200+" too ("built 200+ schools") but mid-sentence — a listicle's
  // count LEADS the headline. The headline-initial "N+" form cannot be
  // traced around examples (no vocabulary) — single-source in the current
  // corpus (AdMe) but structurally sound. Held-out probe: 5 TP, 0 FP.
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'indriya_nigraha',
    name: 'numeric-listicle-plus',
    regex: reBare('^\\s*\\d{1,3}\\+\\s+\\p{L}', 'iu'),
    description: 'headline-initial count-with-plus listicle tic (e.g. "20+ ...") — language-agnostic',
    vrttiAxis: 'nidra',
  },

  // ──────────────────────────────────────────────────────────────
  // 3. numeric-listicle-ru → indriya_nigraha
  // «17 душевных историй...», «20 подарков...» — the RU listicle form.
  //
  // Same structural invariant as #1, anchored to headline start (a
  // listicle's count leads the headline). Noun set is the GENERIC RU
  // enumeration category (историй / вещей / причин / способов ...) —
  // deliberately NOT AdMe's creative vocabulary (кумиров / мастериц /
  // зарисовок excluded to avoid example-tracing), and NOT «человек» /
  // «людей»: «N человек погибли» is the single most common RU casualty-
  // count headline — keeping it cost a false positive on a Lebanon
  // death-toll headline. POST boundary is Unicode-aware (\b fails on
  // Cyrillic).
  //
  // LIMITATION: validated on a single RU clickbait source (AdMe is the
  // only one in the corpus). Cross-source RU confirmation is pending a
  // second RU listicle corpus.
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'indriya_nigraha',
    name: 'numeric-listicle-ru',
    regex: reBare(
      '^\\s*\\d{1,3}\\+?\\s+(?:[\\p{L}-]+\\s+){0,4}' +
      '(?:истори[йяи]|вещей|фактов|причин|способов|идей|советов|фото|снимков|кадров|' +
      'признаков|примеров|цитат|рецептов|ошибок|привычек|правил|подарков)' + POST,
      'iu'
    ),
    description: 'RU numeric listicle (headline-initial cardinal count + generic RU enumeration noun)',
    vrttiAxis: 'nidra',
  },

  // ──────────────────────────────────────────────────────────────
  // 4. here-is-gap-pointer → satya
  // «Here's the Scoop», «Here's Why», «Here is Why», «Here's A List Of»
  //
  // Structural invariant: "Here's" / "Here is" + a cataphoric pointer to
  // content the headline withholds — the most explicit form of the
  // Loewenstein information gap. Recurs across Distractify, LittleThings
  // and Newsweek. The cataphor set is deliberately narrow: «why / the / a
  // / an» are pure gap-pointers, but «how» and «what» were DROPPED — they
  // also head legitimate explainer journalism ("Here's how X works",
  // "Here's what to expect"), which cost two false positives on NPR
  // explainer headlines. Held-out probe: 4 TP across 3 sources, 0 FP.
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'here-is-gap-pointer',
    regex: reBare(
      "\\bhere(?:'?s|\\s+is)\\s+(?:why|the|a|an)\\b",
      'iu'
    ),
    description: 'explicit curiosity-gap pointer ("Here is why / the scoop / a list ...")',
    vrttiAxis: 'vikalpa',
  },

  // ──────────────────────────────────────────────────────────────
  // 5. shock-adjective-nominalization → satya
  // «chilling tribute», «traumatising moment», «shocking ... reveal»
  //
  // Structural invariant: a high-shock emotional adjective directly
  // modifying an abstract content-noun — Erickson's "artful vagueness":
  // the headline promises an emotionally-loaded THING while withholding
  // what it actually is. The adjective set is intentionally tight —
  // genuinely loaded words only ("horrific / deadly / brutal" are
  // EXCLUDED: they occur in straight crime reporting). Recurs across
  // LADbible and TheThings. Held-out probe: 3 TP across 2 sources, 0 FP.
  // ──────────────────────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'shock-adjective-nominalization',
    regex: reBare(
      '\\b(?:chilling|harrowing|horrifying|devastating|traumati[sz]ing|disturbing|damning|' +
      'haunting|gut-wrenching|jaw-dropping|heartbreaking|sobering|shocking|spine-chilling)\\s+' +
      '(?:[\\w\'-]+\\s+){0,3}' +
      '(?:reasons?|realit(?:y|ies)|truths?|secrets?|details?|revelations?|discover(?:y|ies)|' +
      'confessions?|moments?|twists?|aftermath|reveal|scenes?|footage|stor(?:y|ies)|' +
      'accounts?|tributes?|messages?)\\b',
      'iu'
    ),
    description: 'shock-adjective + abstract revealer noun (artful vagueness — claim smuggled into a nominalization)',
    vrttiAxis: 'vikalpa',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const clickbaitPack = Object.freeze({
  id: 'clickbait',
  version: '0.0.5',
  description:
    'Attention-fixation engineering detector for headlines / short copy. ' +
    'v0.0.4 is a closed-loop rebuild (PROCESS-FINDING-2026-05-16): 25 ' +
    'example-traced detectors reduced to 5 built from structural ' +
    'invariants and validated on held-out corpora (>= 2 independent ' +
    'sources, 0 FP) before shipping. Honest scope: deterministic CATCH ' +
    'does not generalise past these 5 — a learned L2 encoder is the path ' +
    'to broader recall.',
  detectionPatterns: PATTERNS,
  requirements: [],
  calibratorOverrides: {
    NOISE_FLOOR: 0.22,
    STRONG_THRESHOLD: 0.60,
  },
  applicableFrames: ['public_information'],
});

export default clickbaitPack;
