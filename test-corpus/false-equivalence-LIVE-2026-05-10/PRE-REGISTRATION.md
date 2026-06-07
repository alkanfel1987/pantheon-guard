---
type: pre-registration
date: 2026-05-10
target_pack: epistemology v0.3.0-pre.1 (post iter-2 fixes from synthesis probe)
detector_under_test: false_equivalence_levelling (no inhibitor)
catalogue_anchors:
  - ns-avisesa-sama-5-1-23
  - ns-anityasama-5-1-32
purpose: LIVE-corpus probe (companion to false-equivalence-2026-05-10 synthesis probe). Goal — graduate detector from Tier 2 (synthesis-validated) to Tier 1 (live-validated) per docs/EVIDENCE-TIER.md.
---

# Pre-registration — false_equivalence_levelling LIVE probe

**Locked BEFORE running detector.** Locked AFTER corpus assembly (paragraphs
extracted from real articles via WebFetch), so this pre-reg's job is to
fix the **decision rule**, not to predict the outcome.

## Context

Synthesis probe `test-corpus/false-equivalence-2026-05-10/` showed
catch 100% / FP 0% on author-curated paraphrases of canonical FE-framings.
Per `CLAUDE.md` "selection bias warning" + `docs/EVIDENCE-TIER.md` Tier 2
criteria, that result cannot be cited as validated — test author = corpus
curator means self-fulfilling.

This LIVE probe uses **text extracted via WebFetch from real articles**
on real sites (Greenwald Substack, CounterPunch, Reason, Federalist Papers
public domain, AIF.ru, Vedomosti, Brookings). Test author chose URLs and
prompts but did NOT author the resulting text. Selection bias remains
(URL choice) but corpus-text bias is removed.

## Hypothesis

H₁: Live catch ≥ 50% AND live FP ≤ 5%. Decision rule below.

H₀: Catch < 50% OR FP > 5%.

**Why 50% target lower than synthesis 60%:**

- Synthesis used canonical "all politicians are the same" / "both sides
  equally bad" forms — exact lexical matches the detector was designed
  for.
- Live FE rhetoric is more diverse: "both Democrats and Republicans
  vested in this machine", "transforms once they ascend to power",
  "their steadfast opposition magically transforms". These are
  semantically FE but use verbs/predicates the detector does not
  pattern-match.
- An honest expectation is ~20-50% live catch. 50% target acknowledges
  this gap; <50% means pattern coverage needs broadening (legitimate
  iter-3 lexical work, NOT cycle-2 trap because the broadening would
  be driven by live FN audit not synthesis tuning).

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| catch ≥ 60% AND FP ≤ 5% | PROMOTE → Tier 1 (live-validated EN), update EVIDENCE-TIER |
| 50% ≤ catch < 60% AND FP ≤ 5% | PROMOTE_PARTIAL → Tier 1 EN with documented coverage gap; iter-3 lexical broadening planned |
| 25% ≤ catch < 50% AND FP ≤ 5% | HOLD Tier 2; iter-3 lexical broadening MANDATORY before Tier 1 promotion |
| catch < 25% OR FP > 5% | DEMOTE — synthesis probe was misleading; detector pattern coverage too narrow for live use |

## Honest scope (acknowledged BEFORE running)

1. **URL-selection bias** — test author chose which sites to query. URLs
   were picked from public-knowledge of "this site's genre often contains
   FE rhetoric" (Greenwald, CounterPunch) vs "this site's genre rarely
   does" (Brookings, Federalist Papers). This is a documented genre-bias
   in pre-registration, not a hidden bias.
2. **Round-2 fetch surfaced texts where AI extraction model classified**
   sentences as POSITIVE based on **semantic** FE-framing, not lexical
   markers. The corpus stores sentences AS-EXTRACTED (verbatim per
   WebFetch); the question is whether the detector's narrow lexical
   patterns catch them.
3. **Reddit was blocked** by Claude Code CSP — r/Centrism would have
   been the densest source for exact-lexical "both sides equally"
   framing. Probe corpus is therefore Substack-op-ed-leaning rather
   than user-comment-leaning. Generalization beyond op-ed prose NOT
   claimed.
4. **Small N** — 7 real positives, 10 real negatives target. Wilson CI
   will be wide. Directional, not statistical-power-grade.
5. **Verbatim fragments** — sentences extracted by WebFetch may have
   minor formatting (smart quotes, footnote artifacts) preserved. Not
   normalized in corpus to keep audit trail.

## Sample size targets

- Positive (real, FE-spirit text from confirmed-genre sources): ~7
- Negative (real, substantive comparison or unrelated): ~10
- **Total: ~17**

## Source attribution

Each entry in `corpus.json` carries:
- `source` (full URL of origin)
- `fetched_via` ("webfetch round-2 2026-05-10")
- `synthesis: false` (verbatim live text)
- `human_tagged_by`: "test_author" (acknowledged URL-selection-bias only)

## Reproducibility

`cd test-corpus/false-equivalence-LIVE-2026-05-10 && node runner.js`

Note: corpus is frozen at fetch-time. WebFetch does not guarantee URL
content stability — sources may go 404 or change. Frozen text in
corpus.json is the audit artifact.
