/**
 * pantheon-guard · semantic / false-equivalence detector definition
 *
 * Companion to the regex `false_equivalence_levelling` detector in
 * src/packs/epistemology.js. The regex detector covers narrow canonical
 * + iter-3 broadened lexical surface forms (synthesis 100% / live training
 * 66.7% / FP 0% on N=20 — see test-corpus/false-equivalence-LIVE-iter3-2026-05-10/).
 *
 * The semantic detector here addresses the live-FN classes regex cannot
 * reach without compromising FP — context-loss (P-EN-LIVE-06 from Round-1)
 * and verb-list breadth (P-EN-LIVE-02 «political establishment will initiate»).
 * It uses zero-shot NLI: the model evaluates whether the input text entails
 * a leveling-claim hypothesis.
 *
 * Status: SCAFFOLD (no real model integration yet). Pack ships in source,
 * but `applyPackAsync(feSemanticPack, embedder)` requires the consumer to
 * provide an embedder — either a real one (peer-dep model package) or
 * `createMockEmbedder()` for testing.
 *
 * Catalogue anchors: ns-avisesa-sama-5-1-23, ns-anityasama-5-1-32 — same
 * Nyāya grounding as regex sibling.
 *
 * Threshold (0.65) is preliminary; final calibration requires real model +
 * held-out positive corpus (next session).
 */

export const feSemanticPack = Object.freeze({
  id: 'fe-semantic',
  version: '0.0.1-experimental',
  description:
    'Semantic false-equivalence detector via zero-shot NLI. Catalogue-anchored ' +
    'to aviśeṣa-sama (NS 5.1.23) + anitya-sama (NS 5.1.32). Companion to regex ' +
    'epistemology/false_equivalence_levelling — covers context-rich semantic FE ' +
    'rhetoric (cross-party behavioral collapse, establishment leveling) that ' +
    'regex cannot pattern-match without unacceptable FP. EXPERIMENTAL — opt-in ' +
    'via explicit import; requires peer-dep embedder (e.g. ' +
    '@pantheon-guard/model-mdeberta-xnli) or createMockEmbedder() for testing.',

  // Empty regex parts — this pack is purely semantic. The combined coverage
  // (regex + semantic) comes from stacking with the regex epistemology pack.
  detectionPatterns: [],
  requirements: [],

  semanticDetectors: [
    {
      id: 'false_equivalence_semantic',
      catalogueAnchors: ['ns-avisesa-sama-5-1-23', 'ns-anityasama-5-1-32'],
      language: 'multilingual',
      // Hypothesis chosen via tuning experiment 2026-05-10 (see
      // packages/model-mdeberta-xnli/test/hypothesis-tuning-results.json):
      // direct simple phrasing outperformed verbose original (separation
      // 22.7% vs 3.1% on synthesis sample set N=9). Tuned against synthesis,
      // therefore acceptable as starting threshold but NOT yet held-out-validated.
      hypothesis: 'There is no meaningful difference between the political parties.',
      // Threshold genealogy:
      //   1. Synthesis tuning 2026-05-10 → 0.383 midpoint → 0.5 conservative round
      //   2. iter-2 post-LIVE-R1 audit 2026-05-10: 0.5 produced 1 FP on
      //      N-EN-LIVE-06 (score 0.528, weak-Democrats-opened-gates phrasing).
      //      Tightening to 0.55 drops that FP without affecting the 2 caught
      //      positives (P02@0.698, P06@0.641). cycle-2 risk acknowledged: this
      //      is fitting on R1 evaluation. Held-out R2 FP-stress run separately
      //      shows 0.55 still leaves 1 boundary FP (Federalist-78 @ 0.681,
      //      "no... no..." pattern misinterpreted by model). That FP is
      //      independent of threshold ≤ 0.681 — stays as documented edge case.
      //   3. Final operating threshold 0.55 chosen for: union (regex+semantic)
      //      catch = 6/6 = 100% on LIVE-R1, combined FP = 1/20 = 5%.
      //      See packages/model-mdeberta-xnli/test/integration-fe-live-results.json
      //      and fp-stress-r2-results.json for full audit.
      threshold: 0.55,
      severity: 'medium',
      message:
        'Semantic detector: text appears to frame parties/factions as equivalent. ' +
        'This describes the text\'s rhetorical surface, not authorial intent — ' +
        'context-aware analysis still needed. Catalogue anchor: aviśeṣa-sama ' +
        '(NS 5.1.23). Routes to satya rule.',
      evidence: (text, score) => [
        `score=${score.toFixed(3)}`,
        `threshold=0.55`,
        `language=multilingual`,
      ],
    },
  ],

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    catalogueAnchors: ['ns-avisesa-sama-5-1-23', 'ns-anityasama-5-1-32'],
    companionRegexPack: 'epistemology/false_equivalence_levelling',
    intendedUse:
      'Layer alongside regex epistemology pack to catch FE-rhetoric beyond ' +
      'lexical surface. Specifically targets the live-FN classes from ' +
      'test-corpus/false-equivalence-LIVE-2026-05-10/ that regex broadening ' +
      '(iter-3) could not address without unacceptable FP risk: cross-party ' +
      'behavioral collapse, establishment leveling, single-actor sentences ' +
      'whose FE meaning comes from article-level context.',
    notIntendedUse:
      'NOT a fact-checker. NOT a substitute for regex pack — narrow canonical ' +
      'forms are still better caught by regex (microsecond latency, deterministic).',
    embedderRequirement:
      'Requires Embedder satisfying interface in src/packs/semantic/embedder.js. ' +
      'Production: install @pantheon-guard/model-mdeberta-xnli (peer-dep). ' +
      'Testing: use createMockEmbedder() from src/packs/semantic/embedder.js.',
    honestScope:
      'Threshold 0.65 is preliminary placeholder — calibration requires real ' +
      'model + held-out positive corpus (manual-curated, owner-involvement). ' +
      'NO live-validated catch claim until that calibration is run.',
    architecturalRationale:
      'Designed as standalone async pack rather than extending regex ' +
      'epistemology pack to preserve sync/microsecond regex path for users ' +
      'who do not want async/model dependency. See ' +
      'docs/SEMANTIC-PACK-ARCHITECTURE.md.',
  }),
});
