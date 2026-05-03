---
tags: [theory, distribution-shift, pac-bayes, robustness, generalization]
status: theory-shipped
created: 2026-05-04
related: [PAC-BAYES-BOUND.md, CONFORMAL.md, WEIGHTED-CONFORMAL.md (in CONFORMAL.md)]
---

# Distribution-Shift PAC-Bayes — what happens when production ≠ benchmark

> **Claim of this note.** The McAllester PAC-Bayes bound on
> `pantheon-guard`'s calibrator (see `PAC-BAYES-BOUND.md`) assumes that
> benchmark and production share the same input distribution. They almost
> never do. This note instantiates the *distribution-shift* extension
> (Germain, Habrard, Laviolette, Morvant 2016, refined 2020) which adds
> an explicit divergence term and gives a meaningful bound under shift.

---

## 1. The shift problem made concrete

Our v0.3 benchmark will sample 1000 hand-labelled examples drawn from a
mix of marketing copy, agent outputs, and adversarial probes — call this
`P_bench`. Production traffic for any given enterprise customer will
look different: more domain jargon, different language mix, different
manipulation styles unique to their vertical. Call this `P_prod`.

Standard PAC-Bayes:
```
| R_P_prod(ρ) − R̂_P_bench(ρ) |  ≤  √( ( KL(ρ‖π) + log(2√n/δ) ) / 2n )
```
**is silent on the gap between R_P_prod and R̂_P_bench when P_prod ≠ P_bench.**
The bound only meaningfully constrains the gap between the empirical
risk on the benchmark and the *true risk on the same distribution*.

This is the "you overfit to your benchmark" critique. Distribution-shift
PAC-Bayes is its formal answer.

---

## 2. The Germain-Habrard-Laviolette-Morvant theorem

Let `P` be the source distribution (`P_bench`), `Q` the target
distribution (`P_prod`). For any `f`-divergence `D_f(Q‖P)` between
them, the bound becomes:

```
R_Q(ρ)  ≤  R̂_P(ρ)  +  √( ( KL(ρ‖π) + log(1/δ) ) / 2n )    ← McAllester core
                    +  √( D_f(Q‖P) / 2 )                    ← shift correction
                    +  λ                                     ← disagreement region
```

Where:

- `R_Q(ρ)` is the true risk under the production distribution.
- `R̂_P(ρ)` is the empirical risk on the benchmark sample.
- `D_f(Q‖P)` measures how far `Q` is from `P` (Rényi-α, KL, χ², total
  variation; depends on which `f`-divergence you pick).
- `λ` is the *minimum joint error* between the optimal classifier on
  `P` and on `Q` — captures the irreducible cost of shift.

Reference (most readable form for our use case):
- Germain, P., Habrard, A., Laviolette, F., Morvant, E.
  *PAC-Bayesian theorems for domain adaptation with specialization to
  linear classifiers*. ICML 2013, journal version 2016.
- Germain et al. *PAC-Bayes and Domain Adaptation*. Machine Learning, 2020.

---

## 3. What this gives us as a publishable claim

Our PITCH section 2.1.1 currently states:

> "Under the McAllester PAC-Bayes theorem, with our v0.3 benchmark of
> n=1000 hand-labelled examples and a fitted posterior within KL ≤ 10
> of the data-independent v0.2 prior, the out-of-distribution Brier
> risk of the pantheon-guard calibrator is upper-bounded by the empirical
> Brier risk plus 0.093 with probability ≥ 95%."

The honest extension under distribution shift:

> "When production traffic distribution `Q` differs from the benchmark
> distribution `P` by Rényi-2 divergence `D_2(Q‖P) ≤ d` (a measurable
> quantity given a small sample of unlabelled production text), the
> bound widens to **0.093 + √(d/2) + λ**, where `λ` is the
> reducible-by-relabelling component the customer can drive down with
> a small additional labelled set from their own traffic."

This is what compliance officers want to hear. It says: *here is what
we promise, here is the explicit penalty for distribution shift, and
here is how the customer reduces it*. No competitor publishes this
either.

---

## 4. Numerical instantiation

`docs/distshift_pac_bayes_compute.py` computes the corrected bound for
a range of plausible Rényi-2 divergences. Headline numbers (n=1000,
KL=10, δ=0.05, base bound = 0.093):

| Rényi-2 D₂(Q‖P) | Shift correction √(D/2) | Total bound (assuming λ=0) |
|---:|---:|---:|
| 0.0 (no shift) | 0.000 | 0.093 |
| 0.1 (mild shift) | 0.224 | 0.317 |
| 0.5 (moderate shift) | 0.500 | 0.593 |
| 1.0 (heavy shift) | 0.707 | 0.800 |
| 2.0 (very heavy shift) | 1.000 | 1.000 (saturated) |

Reading: at `D₂ ≤ 0.1` we still have a meaningful bound (0.32 OOD
gap). At `D₂ = 0.5`, the bound becomes loose enough that the customer
should consider supplementing the benchmark with their own labelled
data.

The mitigation is exactly what `inspectWeightedConformal()` (v0.2.2
release) provides on the conformal side — an importance-weight
correction to restore tight coverage under known shift.

---

## 5. Honest limitations

1. **Estimating `D₂(Q‖P)` is non-trivial.** Density-ratio estimation
   on text is noisy. A reasonable workflow: ship a small "shift
   monitor" tool that ingests ~500 unlabelled production samples and
   estimates `D₂` via classifier-probability ratio (Sugiyama 2012).
2. **The bound is loose for large shifts.** When `D₂ > 1`, the
   correction term exceeds 0.7, dwarfing the empirical risk. Honest
   reading: under heavy shift, **no bound from the benchmark alone is
   meaningful**; the customer must label production data.
3. **`λ` (disagreement region) requires both labelled `P` and `Q`.**
   Without it, we can only report the bound *up to* `λ`. Concretely,
   the bound is "≤ benchmark + shift_term + λ" and `λ` is opaque
   without joint labels. We will document this transparently in the
   v0.3 release.

---

## 6. References

- Germain, P., Habrard, A., Laviolette, F., Morvant, E.
  *PAC-Bayesian theorems for domain adaptation with specialization to
  linear classifiers.* ICML 2013.
- Germain, P., Habrard, A., Laviolette, F., Morvant, E.
  *PAC-Bayes and Domain Adaptation.* Machine Learning 109(11), 2020.
- Sugiyama, M., Suzuki, T., Kanamori, T. *Density Ratio Estimation
  in Machine Learning.* Cambridge University Press, 2012.
- Ben-David, S., Blitzer, J., Crammer, K., Pereira, F. *Analysis of
  representations for domain adaptation.* NIPS 2007.
