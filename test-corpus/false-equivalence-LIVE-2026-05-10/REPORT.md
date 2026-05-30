# LIVE-corpus probe report — false_equivalence_levelling, 2026-05-10

Pack: `epistemology` v0.3.0-pre.1.
Detector: `false_equivalence_levelling` (no inhibitor).
Catalogue anchors: `ns-avisesa-sama-5-1-23`, `ns-anityasama-5-1-32`.
Companion synthesis probe: `test-corpus/false-equivalence-2026-05-10/`.

## tl;dr

| Probe | Catch (Wilson 95%) | FP | Decision |
|---|---|---|---|
| **Synthesis** (2026-05-10) | 100.0% [78.5, 100] (12/12 post-fix) | 0.0% (0/12) | PROMOTE_PARTIAL |
| **LIVE** (2026-05-10) | **0.0% [0.0, 39.0] (0/6)** | **0.0% [0.0, 24.3] (0/12)** | **DEMOTE** |

**Generalization gap: 100 percentage points.**

This is the most important finding of the entire epistemology pack work
session and overrides any commercial claim built on synthesis numbers
alone.

## What happened

Per pre-registered decision rule:

- catch < 25% AND FP ≤ 5% → **DEMOTE — synthesis probe was misleading;
  pattern coverage too narrow for live use**.

The detector achieved 0/6 catch on real verbatim sentences extracted from
sites known by genre to use false-equivalence rhetoric (CounterPunch
op-ed, Greenwald Substack, reader comments). FP-rate held at 0% on 12
negatives — including stress-cases like Brookings "Both leaders will
likely announce..." (correctly silent because pattern is narrow).

The 0% catch is **NOT** a detector bug. It is the detector working as
designed: matching only specific lexical surfaces ("all X are the same",
"both sides equally Y"). Live FE rhetoric uses richer constructions the
detector cannot reach.

## Per-FN pattern-coverage gap

Each missed positive illustrates a specific class of FE-rhetoric the
detector does not pattern-match:

1. **«Both [named X] and [named Y] are vested»** (P-EN-LIVE-01) —
   pattern requires abstract category «sides|parties|teams|camps»;
   sentence names «Democrats and Republicans» specifically.
2. **«Political establishment will initiate the move»** (P-EN-LIVE-02)
   — generalized-actor leveling without «both»-construction.
3. **«Both parties are dominated by war pigs»** (P-EN-LIVE-03) —
   pattern requires «equally|just as» + «bad|good|wrong|guilty»;
   sentence uses «dominated by» predicate.
4. **«Officials who purport to oppose ... change their minds»**
   (P-EN-LIVE-04) — describes cross-party behavioral collapse without
   any «both/all» framing word.
5. **«Steadfast opposition magically transforms into vehement support»**
   (P-EN-LIVE-05) — same: behavioral pattern across named figures.
6. **«Trump joined Obama+Biden in demanding...»** (P-EN-LIVE-06) —
   contextual leveling, single-actor sentence.

## Why this matters

### For false_equivalence_levelling specifically

The synthesis probe selected positives that already matched detector
surface (test author = detector author = corpus author). The detector
therefore caught 100% of synthesis. This was self-fulfilling — the
detector cannot catch FE-rhetoric beyond its narrow pattern set, but
the synthesis probe could not show that.

### For the other three synthesis-validated detectors

`absence_argument`, `anecdotal_override`, `silence_as_concession` all
went through the same synthesis-only validation. By analogy, their
live-corpus catch is likely much lower than the 100% same-corpus
post-fix numbers reported. **None of them should be treated as
live-validated** until each runs its own live probe.

This is documented in:
- `docs/EVIDENCE-TIER.md` — they remain Tier 2 (synthesis), this LIVE
  result is now the empirical anchor for what Tier 2 means in practice
  (synthesis 100% can coexist with live 0%).
- `docs/PROBE-DEBT.md` — live probes for the other three are now
  HIGH-priority, not just iter-3 nice-to-have.

### For commercial communication

Until live probes ship, the **acceptable claim** for any of the four
synthesis-validated detectors is:

> "Catalogue-anchored detector, synthesis-validated for canonical
> surface forms. Live-corpus performance not yet measured — see
> docs/EVIDENCE-TIER.md."

**Unacceptable** under any framing:

- "X% catch on real text" without citing this LIVE probe's 0% finding
  for the sister detector
- "validated" without Tier 1 evidence
- Any marketing claim that the synthesis 100% predicts production behavior

## Decisions

### Detector status update

`false_equivalence_levelling` — DEMOTE from "synthesis-validated
release-candidate" to **"synthesis-validated for narrow-canonical-surface
forms; LIVE GAP DOCUMENTED — pattern coverage insufficient for general
FE detection"**.

### Architecture options going forward

Three honest paths the project owner can choose between:

1. **Accept narrow scope + reposition.** Repackage detector as "narrow
   high-precision FE-canonical-form detector" rather than "general FE
   detector". Surface text in commercial material as such. Pattern
   coverage stays as-is; FP-rate remains low; catch remains low but
   honest.

2. **Iter-3 lexical broadening.** Extend patterns to cover the FN
   classes surfaced here:
   - «both [named X] and [named Y] [verb]» constructions
   - «X established / political class / political establishment» as
     subject leveling
   - cross-party behavioral pattern verbs (dominated, transforms,
     purport to oppose ... then)
   This requires careful FP-stress-testing — broader patterns risk
   firing on legitimate comparison.
3. **Replace regex with semantic classifier.** Real-world FE-rhetoric
   is semantic, not lexical. Embedding-based or NLI-based approach
   would catch behavioral-pattern FE that regex never will. This is a
   v0.4.x design discussion, not a v0.3.x patch.

The LIVE probe does not pick between these. It just establishes that
"keep doing what we did" is not honest given the data.

## Iter-2 NOT applied this round

Unlike the synthesis probes, no iter-2 fix is applied here. Reason:

- Synthesis iter-2 fixes were template generalizations of FN strings
  (W_STAR, comma-tolerance, modifier-slot) — narrow structural repairs
  that did not change the detector's semantic scope.
- Iter-2 here would mean **broadening pattern semantics** (adding
  verbs, generalizing «both [named]» constructions). That is iter-3
  lexical-broadening work, requiring its own FP-stress-test corpus
  and decision phase. NOT a same-PR patch.

Per `CLAUDE.md` cycle-2 trap discipline: when same-corpus tuning is
the path forward, that's a signal to design iter-3, not to retry.

## Notes on probe execution

- WebFetch rounds 1-3 surfaced ~6 positive candidates from
  CounterPunch + Greenwald + reader-comment text. Multiple candidate
  sites (Reddit r/Centrism — densest FE source — was blocked by Claude
  Code CSP; cyberleninka 404; svoboda 403; cato.org returned empty).
- RU positive candidates: zero surfaced from AIF + KP + Vedomosti +
  Telegram public preview. RU op-ed prose at fetched-time-and-source
  was substantive critique, not lexical FE-leveling. Real-source
  RU positives likely live in Telegram political channels (text not
  easily fetchable).
- Negative class (n=12) is robust mix: Reason analytical, Brookings,
  CounterPunch substantive, AIF, Vedomosti, Federalist Papers public
  domain — covers the FP stress-test surface adequately for N=12.

## Reproducibility

```
cd test-corpus/false-equivalence-LIVE-2026-05-10 && node runner.js
```

Corpus is frozen verbatim text. WebFetch may not retrieve same content
later — `corpus.json` is the audit artifact.
