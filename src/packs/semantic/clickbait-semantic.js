/**
 * pantheon-guard · semantic / clickbait detector definition
 *
 * Companion to the regex `clickbait` pack (src/packs/clickbait.js v0.0.3).
 * The regex pack measured a 64pp generalization gap: in-corpus catch 84%,
 * fresh held-out catch 20% (see README "Generalization gap"). Deterministic
 * regex/lexicon clickbait catch does not generalize — every outlet uses
 * different surface vocabulary.
 *
 * This semantic detector probes whether zero-shot NLI closes that gap.
 * It uses the same mDeBERTa-XNLI infrastructure built for false-equivalence
 * (src/packs/semantic/false-equivalence.js).
 *
 * ⛔ STATUS (2026-05-15): PROBE CONCLUDED — DEAD END. DO NOT USE.
 *
 * The held-out probe (test/clickbait-heldout-probe.js, results in
 * clickbait-heldout-probe-results.json) ran this detector's 3 candidate
 * hypotheses against held-out clickbait corpus #2 via the real
 * mDeBERTa-XNLI model. Result: at FP ≤ 2%, the best hypothesis achieved
 * 5% catch (1/20) — WORSE than the regex pack's 20% on the same corpus.
 * The "This is a clickbait headline" hypothesis scored clickbait and
 * mainstream headlines almost identically (75% catch / 76% FP at thr 0.4;
 * both collapse together as threshold rises) — zero discrimination.
 *
 * WHY IT FAILED — architectural, not a tuning problem: zero-shot NLI
 * evaluates semantic ENTAILMENT (does the text entail the hypothesis).
 * "Clickbait-ness" is a pragmatic/stylistic GENRE property, not semantic
 * content a headline entails. A listicle headline does not semantically
 * entail "this is clickbait" in any NLI sense. FE worked partially
 * (33%) because false-equivalence IS roughly a semantic claim; clickbait
 * is not. Zero-shot NLI is the wrong tool shape for clickbait detection.
 *
 * CONSEQUENCE: an L2 for clickbait catch-generalization, if pursued,
 * must be a model with a clickbait-CLASSIFICATION head trained on
 * clickbait labels (Webis-Clickbait-17 / Chakraborty datasets) — a
 * supervised classifier, not a zero-shot semantic model. That is a
 * deliberate research project, not a quick add. Until then the honest
 * path is the regex pack as an FP-strict L1 (~20% held-out catch, 0% FP).
 *
 * This file is retained as an audit artifact of a documented negative
 * result. It is NOT wired into any stack and MUST NOT be shipped.
 *
 * BLOCKING-ELIGIBILITY GATE (decided 2026-05-15, FP-acceptability ruling):
 * pantheon-guard's 0% FP-strictness is the only property that generalizes
 * (held-out #1, #2, 263 adversarial mainstream — all 0% FP). A semantic
 * detector may route to a BLOCKING verdict (`passes: false`) ONLY if its
 * held-out FP-rate is ≤ 2%. Until a held-out probe demonstrates that, this
 * detector is ADVISORY-ONLY: consumers should read `semanticDetectorResults`
 * as a review-triage signal and NOT gate `passes` on it. If held-out FP
 * reproduces the FE ~8% pattern, this detector stays advisory permanently
 * and a different L2 approach (embedding-centroid, per SEMANTIC-PACK-
 * ARCHITECTURE.md C2) becomes the next experiment.
 *
 * Foundation (same as regex clickbait pack): Loewenstein 1994 information-
 * gap theory of curiosity — clickbait engineers a gap between what the
 * reader knows and wants to know, withholding the payload so the click is
 * the only way to close it.
 *
 * Hypothesis genealogy: the `hypothesis` below is a PLACEHOLDER. Final
 * choice + threshold require the held-out tuning probe
 * (test/clickbait-heldout-probe.js), mirroring the FE hypothesis-tuning
 * methodology. Three candidate hypotheses are documented in
 * `metadata.candidateHypotheses` for that sweep.
 */

export const clickbaitSemanticPack = Object.freeze({
  id: 'clickbait-semantic',
  version: '0.0.1-experimental',
  description:
    'EXPERIMENTAL semantic clickbait detector via zero-shot NLI (mDeBERTa-XNLI). ' +
    'Companion to the regex clickbait pack — probes whether NLI closes the 64pp ' +
    'generalization gap regex/lexicon detection cannot. NOT validated, NOT ' +
    'blocking-eligible until a held-out probe shows FP ≤ 2%. Advisory-only: ' +
    'read semanticDetectorResults, do not gate passes. Opt-in async; requires ' +
    'a peer-dep embedder (@pantheon-guard/model-mdeberta-xnli) or ' +
    'createMockEmbedder() for testing.',

  // Purely semantic — no regex parts. Combined coverage comes from stacking
  // with the sync regex clickbait pack via stackPacksAsync.
  detectionPatterns: [],
  requirements: [],

  semanticDetectors: [
    {
      id: 'clickbait_curiosity_gap_semantic',
      catalogueAnchors: ['loewenstein-1994-information-gap'],
      language: 'multilingual',
      // PLACEHOLDER hypothesis — mechanism-grounded (Loewenstein curiosity
      // gap). Final hypothesis chosen by held-out tuning probe; see
      // metadata.candidateHypotheses.
      hypothesis: 'This headline deliberately withholds information to make the reader click.',
      // PLACEHOLDER threshold — borrowed from FE's calibrated 0.55 as a
      // starting point. Recalibrated by the held-out probe.
      threshold: 0.55,
      severity: 'medium',
      message:
        'Semantic detector: headline appears to use a curiosity gap — it signals ' +
        'information of value while withholding it to compel a click. This ' +
        'describes the rhetorical surface, not authorial intent. EXPERIMENTAL ' +
        'and ADVISORY-ONLY — not a blocking verdict until held-out FP ≤ 2% is ' +
        'demonstrated. Foundation: Loewenstein 1994 information-gap theory.',
      evidence: (text, score) => [
        `score=${score.toFixed(3)}`,
        `threshold=0.55 (placeholder, pre-calibration)`,
        `status=experimental-advisory-only`,
      ],
    },
  ],

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.22,
    STRONG_THRESHOLD: 0.60,
  }),

  metadata: Object.freeze({
    companionRegexPack: 'clickbait (src/packs/clickbait.js v0.0.3)',
    foundation: 'Loewenstein, G. (1994). The psychology of curiosity. Psychological Bulletin 116(1).',
    status: 'EXPERIMENTAL PROBE — not validated, not blocking-eligible',
    blockingEligibilityGate:
      'May route to a blocking verdict ONLY if held-out FP-rate ≤ 2%. Until ' +
      'demonstrated, advisory-only: consume semanticDetectorResults, do not ' +
      'gate passes. Decided 2026-05-15 (FP-acceptability ruling) — 0% ' +
      'FP-strictness is the only generalizing property of pantheon-guard.',
    empiricalPrior:
      'FE proof-of-concept (integration-fe-live-results.json): zero-shot NLI ' +
      'semantic-only catch 33%, FP 8.3%, no clean separation. Expectation for ' +
      'clickbait: ~30-40% catch, ~8% FP. Probe may refute or confirm.',
    candidateHypotheses: [
      // For the held-out tuning probe (test/clickbait-heldout-probe.js).
      // Per FE tuning lesson: direct simple phrasing outperformed verbose.
      'H1: This is a clickbait headline.',
      'H2: This headline deliberately withholds information to make the reader click.',
      'H3: This headline is written to attract clicks rather than to inform.',
    ],
    notIntendedUse:
      'NOT a blocking detector until calibrated. NOT a substitute for the regex ' +
      'clickbait pack — canonical surface forms are caught by regex at ' +
      'microsecond latency with 0% FP. This pack targets only the held-out ' +
      'generalization tail regex structurally misses.',
    embedderRequirement:
      'Requires Embedder per src/packs/semantic/embedder.js. Production: ' +
      'install @pantheon-guard/model-mdeberta-xnli. Testing: createMockEmbedder().',
  }),
});

export default clickbaitSemanticPack;
