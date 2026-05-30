# L2 clickbait classifier — conclusion after 4 cycles

**Date:** 2026-05-18
**Verdict:** REJECT — headline-only learned L2 does not clear the FP bar.
**Docs:** `L2-PREREGISTRATION-2026-05-16.md`, `L2-CORPUS-DESIGN.md`,
`L2-CYCLE3-CALIBRATION.md`, `L2-CYCLE4-QUESTIONFORM.md`.

## The question

L1 (deterministic `clickbait` pack) catches ~50% of held-out clickbait
at 0% FP — a hard ceiling, because regex catch does not generalise. Could
a supervised L2 classifier (mDeBERTa-v3-base, fine-tuned) catch the other
~50% at an acceptable false-positive rate (pre-registered: ≤2% blocking,
≤8% advisory)?

## What happened — 4 cycles

| cycle | change | held-out / fresh FP | verdict | confound found |
|---|---|---|---|---|
| 1 | christinacdl (aggregator vs wire) | 92% | REJECT | outlet **register** |
| 2 | + 8k lifestyle hard negatives | 12%* | REJECT | threshold non-calibratable |
| 3 | fresh-corpus threshold calibration | 26% | REJECT | **rhetorical question-form** |
| 4 | + 4k question-form hard negatives | 16% | REJECT | **entertainment-news register** |

\* cycle-2's 12% was a lucky-corpus artifact; the fresh-corpus measurement
in cycle 3 showed the true figure was ~26%.

Every cycle fixed one surface confound and the next measurement exposed a
new one: register → threshold → rhetorical form → entertainment register.
A pre-registered STOP RULE (frozen in cycle 4) ended the sequence: cycle 4
is the last fine-tune cycle, because FP stayed > 8% and a 4th confound
appeared.

## Why it fails — the diagnosis

A headline is ~10 words. Trained on weakly-labelled data (source-rule:
aggregator → clickbait, wire → not), the model minimises loss by latching
onto whatever **surface proxy** separates the training classes — outlet
register, then question punctuation, then house style. It never has to
learn the actual manipulation *mechanism* (does the headline withhold a
payload to compel a click?), because a surface proxy is always cheaper.
Each hard-negative batch removes one proxy; the model finds the next.

This is the **same failure as L1's noun-list treadmill, one layer up.**
L1 traced regexes around example headlines; L2 traces decision boundaries
around dataset confounds. Both are the closed-loop / surface-proxy trap.
In both cases the held-out-first discipline caught it — without it, cycle
2's "12%" would have shipped a model that false-positives on a quarter of
mainstream entertainment and analysis headlines.

## Honest status

- **L1 ships.** The deterministic `clickbait` pack — 5 structural
  detectors, ~50% held-out catch, 0% FP across 9 corpora — is the
  clickbait layer. It is solid and honest.
- **L2 is REJECT, recorded — not buried.** The best L2 artifact
  (`model-cycle4`, dev F1 0.937) is kept for the audit trail. It is not
  shippable: FP 16–21% on entertainment-heavy held-out, inconsistent
  4–21% across corpora — below even the advisory bar.

## What a real L2 would need (not a fine-tune cycle)

1. **Genuine mechanism-level annotation** — humans labelling headlines by
   *whether they withhold a payload*, not by source. Weak source-labels
   are the root cause; no amount of hard-negative augmentation fixes a
   label that encodes the wrong thing.
2. **Article-body context** — the headline alone is often genuinely
   ambiguous ("Can he survive?" is clickbait or analysis depending on the
   article). A model that sees the body can check whether the payload is
   actually withheld. This is a different model shape, not a different
   corpus.

Either is a separate, scoped project. Until then the honest product
position is unchanged from the L1 rebuild: an FP-clean deterministic L1
catching the structural ~50%, and an explicit, measured, documented gap
for the rest.

## What this arc produced

- L1 `clickbait` pack rebuilt and honest (25 → 5 detectors, see
  `PROCESS-FINDING-2026-05-16`).
- A fully pre-registered, 4-cycle L2 research result — a precise,
  reproducible characterisation of *why* deterministic→learned does not
  trivially work, and what a real L2 requires.
- Reusable infrastructure: held-out detector probe, corpus-build +
  aggressive-filter pipeline, calibration harness.
