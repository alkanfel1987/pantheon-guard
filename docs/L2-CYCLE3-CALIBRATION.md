# L2 cycle 3 — threshold calibration (pre-registration)

**Date:** 2026-05-17
**Parent:** `L2-PREREGISTRATION-2026-05-16.md` (cycle 2 = REJECT-on-threshold)
**Status:** registered before the calibration corpus is collected — frozen

## Why cycle 3

Cycle 2 produced a sound model (clean bimodal separation; L1∪L2 ~77%
catch / ~5% FP across held-out at a sane threshold). It was REJECTed only
because the dev-selected threshold (t_f1 = 0.30) is the argmax of a flat
dev curve — an in-distribution dev set cannot calibrate the operating
threshold. Cycle 3 fixes exactly that: pick the threshold on data that is
neither the training distribution nor the held-out gate. **No retraining
— the cycle-2 model is frozen.**

## Calibration corpus (collected after this doc is frozen)

Fresh headlines from outlets used in NEITHER L2 training (`christinacdl`
+ HuffPost News-Category) NOR the held-out corpora #1/#2/control. Register-
diverse: aggregator/listicle outlets + mainstream wire. Labelled by the
same external source rule the held-out corpora used — listicle/aggregator
farm → catch; mainstream wire → pass; per-entry adjustment when a headline
carries an obvious manipulation marker. Target ≈ 150–250 entries.

## Split (frozen)

The collected corpus is split **60% calibration / 40% final-test**, seed
20260517. Calibration picks the threshold; final-test is scored once.

## Threshold rule (FROZEN — decided before any score is seen)

Operating threshold = **the lowest threshold whose calibration-split
FP-rate ≤ 5%.** Rationale: maximise catch under a 5% FP budget, sitting
between the 2% blocking ceiling and the 8% advisory ceiling. A single
deterministic rule, no sweep-and-pick.

## Final evaluation

1. Score the 40% final-test split once at the chosen threshold → this is
   the **primary** result; apply the decision rule from
   `L2-PREREGISTRATION-2026-05-16.md` (BLOCKING ≥70% catch & ≤2% FP;
   ADVISORY ≥60% & ≤8%; else REJECT).
2. Score held-out #1/#2/control at the same threshold — reported as
   **corroboration only**. DISCLOSURE: their threshold sweeps were
   inspected during cycle-2 diagnosis, so they are a semi-spent gate
   (same status the L1 PROCESS-FINDING gave held-out #1). They are not
   the primary gate; the fresh final-test split is.

## Falsification

If the calibration-picked threshold yields final-test catch < 60% or
FP > 8% — cycle 3 fails and L2 is REJECT (the model cannot be operated
at a useful point). Recorded, not buried.

## Result — 2026-05-17: REJECT

Collected a 152-headline fresh calibration corpus (BBC / NPR / Al Jazeera
mainstream + Bored Panda / Mental Floss listicle + ScreenRant / E! mixed —
outlets used in neither L2 training nor the held-out corpora). Split
60/40 (seed 20260517). Threshold rule → chosen threshold 0.30.

Final-test split (n=61), L1∪L2 @ 0.30: **catch 80%, FP 25.8%** →
**REJECT** (FP ≫ 8%).

Diagnosis — and it is a NEW failure mode, not the cycle-1 register
confound (that is fixed). The model now confidently false-positives on
**rhetorical-question and narrative-teaser headlines**, scoring them
0.96–0.999 — no threshold removes a confident error. The high-scoring
pass headlines are: "The race to replace Starmer is on — but he still
faces a momentous choice", "Colleges got more rural students to apply.
The challenge is getting them to attend", "This Republican voted to
convict Trump … Can he survive?", "Why Democrats are panicking about
losing California", "Elephants eat their crops. Farmers strike back …",
"Can new Pakistan-Afghanistan tensions lead to another border clash?",
"What Does the Slang Term 'Lore Drop' Mean?". Several are clean
mainstream journalism (genuine model error); a few are genuinely
borderline question-headlines (label-boundary). Either way the model
keys on rhetorical *form*, not the manipulation mechanism.

The threshold curve is flat because these FPs are confident — raising
the threshold from 0.30 to 0.90 leaves calibration FP unchanged at 4.3%.
Cycle 2's heldout-#2 FP of 4% at t=0.90 was itself a lucky-corpus
artifact: heldout #2 happened to contain few question-form pass
headlines; the fresh corpus has more, and the true fresh-data FP is
~25%.

**Three cycles, three REJECTs** — cycle 1 (register confound, FP 92%),
cycle 2 (threshold non-calibratable), cycle 3 (confident FP on
rhetorical form, FP 26%). Each cycle fixed one surface confound and
exposed the next. This is the overfitting treadmill at the L2 layer,
structurally identical to the L1 noun-list treadmill. Honest conclusion:
a headline-only learned classifier on weakly-labelled data does not
reliably clear the 8% FP bar on fresh data. A working L2 would need
genuine annotation budget or article-body context — not another quick
fine-tune cycle.
