---
type: pre-registration
date: 2026-05-10
target_pack: epistemology v0.3.0-pre.1 (post iter-3 broadening + hasComparativeDivergence inhibitor)
detector_under_test: false_equivalence_levelling iter-3
catalogue_anchors:
  - ns-avisesa-sama-5-1-23
  - ns-anityasama-5-1-32
purpose: Measure iter-3 lexical broadening (Option B from architectural decision) on combined LIVE corpus — Round-1 (training-set, FN-driven) + Round-2 (held-out FP-stress, 0 positives surfaced).
---

# Pre-registration — false_equivalence_levelling iter-3 LIVE probe

**Locked BEFORE running detector iter-3.**

## Context

After Option B was chosen, iter-3 added:
- 6 broad patterns (Class 1-5 + RU collective-leveling) addressing 5 of 6
  FN classes from Round-1 LIVE audit
- `hasComparativeDivergence` inhibitor — suppresses broad patterns when text
  contains substantive divergence markers («differ», «while X..., Y»,
  «однако», «отличаются», etc.)
- Canonical patterns kept untouched, fire unconditionally
- One Class-6 FN (P-EN-LIVE-06 — single-actor sentence whose FE meaning
  comes from article-level context not sentence-level lexical surface)
  remains explicitly out-of-scope

## Honest accounting

**Round-1 is training, not held-out.** iter-3 patterns were designed
specifically from Round-1's 6 FN classes. Catch number on Round-1 is a
verification of the patterns' implementation, NOT a generalization claim.

**Round-2 was attempted as held-out validation. Result: 0 positives
surfaced in non-paywalled fetchable open-web sources.** Sources tried:
greenwald.substack archive, racket.news, mtracey.net, caitlinjohnst.one,
aaronmate.substack, counterpunch dated archives, foreignaffairs,
economist. Most blocked by paywall, CSP, or 404 on guessed-URL.

This produces 8 NEW Round-2 negatives (Brookings supreme court analysis,
Federalist 10, Federalist 78, CounterPunch Pity Billionaire — all
substantive critique without FE-leveling) for FP-stress, but no
positive examples for held-out catch validation.

**Implication:** the iter-3 catch number cannot be cited as "validated".
What CAN be cited:

- iter-3 catch on Round-1 = pattern-implementation verification (training)
- iter-3 FP on combined Round-1+Round-2 negatives (n=20) = FP-stress test
  with held-out new negatives (Round-2 8 of 20 are NEW post-iter-3)

## Hypothesis

Two sub-claims, separately tracked:

H₁-implementation: iter-3 patterns catch the 5 in-scope Round-1 FN classes
(catch 5/6 = 83% on Round-1 positives, with P-EN-LIVE-06 expected miss).

H₁-FP: iter-3 broad patterns + inhibitor maintain FP ≤ 5% on combined
negatives (Round-1 12 + Round-2 8 = 20).

H₀-implementation: catch < 4/6 on Round-1 → iter-3 patterns mis-implemented.

H₀-FP: FP > 5% on combined negatives → patterns over-broaden, inhibitor
insufficient.

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| Round-1 catch ≥ 4/6 AND combined FP ≤ 5% | iter-3 patterns SHIPPED to v0.3.0-pre.2; **Tier remains 2** until held-out positive corpus available |
| Round-1 catch ≥ 4/6 BUT combined FP > 5% | iter-3 patterns SHIPPED with inhibitor tightening; iter-3.1 follow-up |
| Round-1 catch < 4/6 | iter-3 patterns mis-implemented; revert |

**No PROMOTE to Tier 1** under any outcome of this probe — held-out
positives unavailable. Tier 1 promotion requires manual-curated held-out
positives (next phase, owner involvement).

## Honest scope (acknowledged BEFORE running)

1. **Round-1 catch ≠ generalization.** Patterns designed from these FNs.
2. **No held-out positives.** Round-2 attempted; 0 new positives found.
3. **FP-stress is partial held-out.** 8/20 negatives are Round-2 NEW
   sources (Brookings, Federalist 10, 78, CP-Pity-Billionaire).
4. **Selection-by-availability bias on positives.** Open-web fetchable
   FE-rhetoric is sparser than I assumed. This is itself a finding —
   FE-rhetoric in commercial-grade detector deployment may be rarer
   than the genre-narrative suggests.

## Reproducibility

```
cd test-corpus/false-equivalence-LIVE-iter3-2026-05-10 && node runner.js
```
