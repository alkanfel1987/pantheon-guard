---
type: pre-registration
date: 2026-05-10
target_pack: epistemology v0.3.0-pre.1
detector_under_test: absence_argument + hasScopeQualifier inhibitor
catalogue_anchor: ns-anupalabdhi-sama-5-1-29
purpose: Real-corpus probe for absence-of-evidence detector — graduate from scaffold to release-candidate (or iter-2). Critically tests inhibitor effectiveness: bounded-scope absence claims must NOT fire.
---

# Pre-registration — absence_argument probe

**Locked BEFORE running detector.**

## Hypothesis

H₁: The `absence_argument` detector catches ≥60% of universal-absence framings
("no one has ever shown X") in pseudoscience / conspiracy / alt-med commentary
text (RU + EN). The `hasScopeQualifier` inhibitor reduces FP on bounded
absence-claims that legitimately appear in scientific abstracts ("no evidence
within the scope of this study").

H₀: catch <60% OR FP-effective >5% — promotion blocked, iter-2 needed.

## What this detector targets (catalogue grounding)

`anupalabdhi-sama` (NS 5.1.29) — futile rejoinder treating non-perception as
proof of non-existence. The contemporary form is the "absence of evidence
proves absence" fallacy, dense in conspiracy commentary, anti-vaccine
threads, climate-skepticism, alt-medicine forums.

**Critical distinction**: bounded-absence claims with explicit scope are
legitimate scientific framing, NOT this fallacy. ("Within the scope of this
trial, no adverse events were observed" ≠ "Nobody has ever proven this.")
The inhibitor is what makes the detector usable — without it the detector
would fire on every methods section in a research paper.

## Honest scope (acknowledged BEFORE running)

1. **Selection bias** — same constraint as previous probes: I am test author
   + corpus curator. Mitigation: explicit inclusion criteria; default-EXCLUDE
   on ambiguous; positive samples paraphrase patterns I have encountered.
2. **Synthesis-leaning**: positive class is paraphrase-of-canonical-conspiracy-
   commentary; negative class mixes public-domain (research-paper-style) with
   paraphrased analytical text. Per CLAUDE.md selection-bias discipline this
   is structured sanity, NOT external validation.
3. **Inhibitor sub-hypothesis**: even if catch hits target, inhibitor MUST
   correctly distinguish bounded-absence claims (legitimate science) from
   universal-absence claims (fallacy). Failure mode: inhibitor fires on
   positives (false suppression) OR fails on bounded negatives (FP raw =
   FP effective).
4. **Domain bias**: probe-corpus is pseudoscience-commentary-heavy +
   research-abstract-heavy on negative side. Generalization to political
   commentary or other domains NOT claimed.

## Corpus criteria (LOCKED)

### Positive class — universal-absence fallacy

Inclusion (ALL must hold):
1. Claim treats absence of perception / report / evidence as proof of
   non-existence.
2. NO scope qualifier (no "within this study", no "as of <year>", no "to
   our current knowledge").
3. Function: claim is used to dismiss a phenomenon, person, or category.
4. Source: opinion / forum / commentary text — NOT scientific paper.

Exclusion:
- Genuinely-bounded absence claims with explicit scope.
- Direct quotes from named scientists who legitimately note absence-of-
  data within their field (reportage of bounded claim).

### Negative class A — comparative / different-topic

Inclusion: text discusses a similar topic-class (presence/absence of evidence,
data-availability) but does not use universal-absence framing.

### Negative class B — bounded-absence WITH scope qualifier

Inclusion (ALL must hold):
1. Text explicitly contains an absence claim AND a scope qualifier.
2. Construction matches one of the inhibitor patterns: «в рамках исследования»,
   «по данным на <год>», «согласно имеющимся данным», "within the scope of",
   "to my/our knowledge", "as of <year>".
3. Source: research abstract, policy paper, careful analytical text.

This class is the inhibitor stress-test: detector must FIRE raw, then
inhibitor must SUPPRESS.

## Sample size targets

- Positive: 12 (RU 6, EN 6)
- Negative-A (comparative): 6 (RU 3, EN 3)
- Negative-B (bounded with scope): 8 (RU 4, EN 4) — inhibitor stress-test
- **Total: 26**

## Pre-registered metrics

- catch-rate raw + effective (with inhibitor) with Wilson 95% CI
- FP-rate raw + effective with Wilson 95% CI
- inhibitor specificity: %(neg-B inhibited correctly)
- inhibitor false-suppression: %(positives wrongly inhibited)
- per-language breakdown
- explicit synthesis-vs-public-domain tagging on each entry

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| catch-eff ≥ 60% AND FP-eff ≤ 5% AND inhibitor-false-supp ≤ 10% | PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required |
| catch-eff ≥ 40% AND FP-eff ≤ 5% | HOLD scaffold; iter-2 plan |
| catch-eff < 40% OR FP-eff > 5% OR inhibitor-false-supp > 25% | ITER-2 MANDATORY |

## Reproducibility

`cd test-corpus/absence-argument-2026-05-10 && node runner.js`
