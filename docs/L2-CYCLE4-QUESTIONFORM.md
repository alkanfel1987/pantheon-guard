# L2 cycle 4 — question-form hard negatives (pre-registration)

**Date:** 2026-05-18
**Parent:** `L2-CYCLE3-CALIBRATION.md` (cycle 3 = REJECT, FP on rhetorical form)
**Status:** registered before collection — frozen

## Why cycle 4

Cycle 3 diagnosed the residual failure: the cycle-2 model confidently
false-positives (score 0.96–0.999) on **question-form and narrative-
teaser headlines** — "Can he survive?", "Why Democrats are panicking",
"What Does X Mean?", "Colleges got more rural students … The challenge
is …". The register confound is fixed; this one remains. Cause: in the
training corpus, question-form headlines are overwhelmingly POSITIVE
(christinacdl clickbait class — "Can You Guess…", "What Happens When…"),
and question-form NEGATIVES are rare (wire press rarely uses question
headlines). The model learned question-form → clickbait.

Fix — the same targeted move that worked in cycle 2 (lifestyle hard
negatives broke the register confound, FP 92% → 12%): add non-
manipulative question-form headlines to the negative class so question-
form occurs in BOTH classes and stops being predictive.

## Method

- **Hard-negatives-v2 (~4,000):** from the HuffPost News Category Dataset
  (all categories), select question-form headlines — starts with an
  interrogative (Why/How/Can/What/Should/Is/Are/Will/Does/Do/Did/Could/
  Would/Who/When/Where) OR ends with "?". Then apply the aggressive
  clickbait filter (`clean_negatives.py`) to drop the genuinely
  manipulative ones ("What Happens When…", numeric listicles). Survivors
  are non-manipulative question-form headlines, label 0. Deduped against
  all prior corpora.
- New corpus = register-balanced corpus (37,496) + ~4,000 question-form
  hard negatives. Retrain mDeBERTa-v3-base, same recipe, seed 20260516.
- No change to positives — question-form clickbait positives already
  exist in christinacdl, so after this, question-form appears in both
  classes.

## Validation

- Threshold calibrated on the cycle-3 calibration corpus (calibration
  split) — re-scored under the cycle-4 model.
- Primary verdict on the cycle-3 calibration corpus final-test split
  (61 entries) — it contains the question-form FPs and is the direct
  test of whether cycle 4 fixed them. DISCLOSURE: this split was scored
  once under the cycle-3 model; the cycle-4 model is different but the
  split is semi-spent — disclosed, not the pristine ideal.
- Held-out #1/#2/control scored as corroboration.
- Decision rule unchanged (BLOCKING ≥70%/≤2%, ADVISORY ≥60%/≤8%, else
  REJECT).

## STOP RULE (frozen — this is the last fine-tune cycle)

Cycle 4 is the final headline-only fine-tune attempt. If after cycle 4:
- final-test FP is still > 8%, OR
- the diagnosis shows yet another new surface confound (a 4th in a row),

then the conclusion is fixed: **a headline-only learned classifier on
weakly-labelled data cannot clear the FP bar — REJECT, no cycle 5.** A
working L2 would then require genuine human annotation budget or article-
body context, which is a separate project, not a fine-tune cycle. This
rule exists so the effort cannot become an unbounded treadmill.

## Success criterion

Cycle 4 succeeds if final-test catch ≥ 60% and FP ≤ 8% (advisory-
shippable) AND the cycle-3 question-form false positives specifically
are resolved (the named headlines no longer score > 0.5).

## Result — 2026-05-18: REJECT — STOP RULE TRIGGERED

Retrained on the cycle-4 corpus (41,096 train, +4,000 question-form hard
negatives). dev F1 0.937. Threshold calibrated on the cycle-3 corpus —
calibration FP flat at 17.4% across thresholds 0.30–0.90 → fallback 0.99.

Final-test split (n=61), L1∪L2 @ 0.99: **catch 70%, FP 16.1%** →
**REJECT** (FP ≫ 8%). Held-out corroboration @ 0.99: heldout1 87%/21.4%,
heldout2 70%/8.0%, control 64%/3.9%.

The question-form hard negatives helped — final-test FP fell 25.8% →
16.1% vs cycle 3 — but did not break it. Diagnosis:
1. The cycle-3 question-form FPs are UNCHANGED — "Colleges got more
   rural students … The challenge is …", "The race to replace Starmer
   … momentous choice", "Can he survive?", "Why Democrats are panicking",
   "Can new Pakistan-Afghanistan tensions …" still score ~1.000. 4,000
   question-form negatives did not move them.
2. A NEW confound surface appeared — **entertainment/gaming-news
   register**: 7 ScreenRant headlines ("Steam Officially Makes 4 Great
   Games 100% Free", "Official Fable Update Has Fans Fearing A Delay",
   "Pokémon Officially Announces …") now score 0.94–0.998. (Some are
   genuinely borderline — ScreenRant's house style is engage-y — but the
   model is confidently flagging them.)

**Both STOP-RULE conditions are met:** final-test FP > 8% AND a 4th new
surface confound. Per the frozen STOP RULE, **L2 via headline-only
fine-tuning is concluded REJECT — there is no cycle 5.** See
`L2-CONCLUSION.md` for the full 4-cycle synthesis.
