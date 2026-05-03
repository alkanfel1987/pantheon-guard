---
tags: [theory, minimax, sion, benchmark-design, methodology]
status: methodology-doc
created: 2026-05-04
related: [PAC-BAYES-BOUND.md, CONFORMAL.md, DISTRIBUTION-SHIFT-PAC-BAYES.md]
---

# Sion-Style Minimax for Benchmark Design

> **Claim of this note.** The credibility of any AI safety benchmark
> rests on whether the *publisher* could have selected examples
> favorable to themselves. We commit to a benchmark-design protocol
> grounded in Sion's minimax theorem (1958) that mathematically rules
> this out: the benchmark distribution is a Nash equilibrium between
> "publisher tries to look good" and "adversary tries to make publisher
> look bad", computed before any labels are written.

This is methodology, not runtime code. The output is a set of rules
governing how `BENCHMARK.md` will be executed, with formal grounding.

---

## 1. The credibility problem

Benchmark publication faces a structural conflict of interest:

- Publisher chooses which examples go into the test set.
- Publisher's own product gets evaluated on the test set.
- Publisher has incentive to select examples that flatter their product.

The standard mitigations are: (a) third-party labelling, (b) public
release of the test set so others can re-run, (c) cross-checking on
external datasets. These are necessary but not sufficient — the
*choice of distribution* itself can still bias outcomes.

We want a stronger property: a formal argument that, *given the
publisher's incentive structure*, the chosen distribution is optimal
for *both* publisher and a worst-case skeptical reviewer
simultaneously. This is what Sion's minimax delivers.

---

## 2. Sion's minimax theorem (1958)

Let `X`, `Y` be convex compact sets in topological vector spaces, and
`f : X × Y → ℝ` quasi-concave-concave-continuous in suitable senses.
Then:

```
inf_{x ∈ X}  sup_{y ∈ Y}  f(x, y)  =  sup_{y ∈ Y}  inf_{x ∈ X}  f(x, y)
```

The common value is a **saddle point** — a strategy pair `(x*, y*)`
such that neither side can profitably unilaterally deviate.

For benchmark design:

| Symbol | Meaning |
|---|---|
| `X` | space of test distributions a publisher could pick |
| `Y` | space of "skeptical reviewer" stress-tests |
| `f(x, y)` | publisher's product score under distribution `x` against stress-test `y` |
| Saddle point `(x*, y*)` | distribution where publisher's score is robust to any reviewer challenge |

A benchmark drawn from `x*` is one that:
- Maximizes publisher's score *over all reviewer stress-tests*, **but**
- Equals the *minimum* score the publisher could achieve under the
  worst-case reviewer choice.

In other words: `x*` is the publisher's best honest answer to "show me
your worst case, and I'll meet you there". A benchmark built this way
cannot be cherry-picked — it is by construction unfavorable to the
publisher across the entire space of reviewer challenges.

---

## 3. Operational protocol for v0.3 benchmark

Translating Sion to a concrete recipe:

### Step 1 — Define `X` *before* labelling

`X` is the space of mixture distributions over five *categories* —
`(marketing, sales-bot, financial-advice, edtech, support-chat)` — and
two *languages* `(EN, RU)`. Each category × language slot has a
publisher-chosen *example count budget*. We commit:

> The category × language *budget allocation* is fixed before any
> example is selected, hashed and committed to git. The hash is in the
> v0.3 release notes.

Pre-commitment removes the degree of freedom "publisher tunes
allocation to flatter their product".

### Step 2 — Define `Y` (the reviewer's stress-test space)

The reviewer can challenge the benchmark by:
- Re-weighting categories (e.g., "what if production is 90% sales-bot?").
- Adding adversarial perturbations (paraphrases, register shifts).
- Restricting to specific subsets.

We pre-publish a list of permitted stress-tests: each one is a
*weighting* `y` on the same fixed category × language grid, with norm
constraints on how skewed `y` can be (otherwise `y` could place all
mass on a single example and trivially defeat any classifier).

### Step 3 — Find the saddle point operationally

We do not claim to compute `(x*, y*)` exactly — that would require
knowing all candidate classifiers' scores in advance. Instead, we
commit to the *saddle-point property*:

> For every published metric (precision, recall, ECE, OOD-gap), we
> additionally publish:
> - the score under the worst stress-test in `Y`,
> - the gap between that and the unweighted score.
>
> A small gap is evidence the distribution is near-saddle-point.
> A large gap is *not hidden*; it is published with explanation.

This converts the minimax property from "we will achieve the saddle"
to "we will *report against* the saddle". Customers and reviewers
get the gap as a first-class number.

### Step 4 — Lock the benchmark before evaluation

The benchmark sample is hashed and the hash is published *before*
any system (including ours) runs against it. This is a Schelling-point
commitment: we cannot retroactively rebalance after seeing scores.

---

## 4. What this gives PITCH

A new sub-section that addresses the "you cherry-picked the benchmark"
critique formally:

> **2.1.4. Benchmark design is Sion-minimax robust.**
>
> The v0.3 benchmark is constructed under a pre-committed category ×
> language budget hashed in git history. For every reported metric we
> additionally publish the worst-case score under the pre-published
> stress-test space, and the gap. By Sion's theorem, a small gap
> certifies that the test distribution lies near a saddle point of
> the (publisher, reviewer) game — i.e., the publisher cannot
> retroactively claim a more favorable distribution exists. No
> competing benchmark in the AI-safety space publishes this gap.

---

## 5. What this does NOT solve

1. **Ground-truth labels are still subjective.** Sion-minimax governs
   the *distribution*, not the *labelling*. We mitigate via two
   independent contractors with inter-annotator agreement reported.
2. **Stress-test space `Y` is itself a publisher choice.** Bad-faith
   publisher could define `Y` narrowly. We mitigate by accepting
   reviewer-proposed stress-tests post-publication and re-running.
3. **The saddle-point argument requires `X`, `Y` convex.** Discrete
   examples are not naturally convex; we use mixture distributions
   over the fixed grid which restores convexity. This is the standard
   trick in domain-adaptation literature.

---

## 6. References

- Sion, M. *On general minimax theorems.* Pacific J. Math. 8(1), 1958.
- v. Neumann, J. *Zur Theorie der Gesellschaftsspiele.* Math. Ann. 100, 1928.
- Ben-David, S., Blitzer, J., Crammer, K., Pereira, F. *Analysis of
  representations for domain adaptation.* NIPS 2007. (For the
  `(P, Q, λ)` framing reused in DISTRIBUTION-SHIFT-PAC-BAYES.md.)
- Manski, C. *Identification for Prediction and Decision.* Harvard
  University Press, 2007. (For pre-commitment as identification
  strategy.)
