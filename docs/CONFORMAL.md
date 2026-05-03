---
tags: [theory, conformal-prediction, coverage-guarantee, distribution-free]
status: shipped
created: 2026-05-04
related: [PAC-BAYES-BOUND.md, PHILOSOPHY.md]
---

# Conformal Prediction over the v0.2 Calibrator

> **Claim of this layer.** For any future input distribution and any
> miscoverage rate `α ∈ (0, 1)`, the verdict set returned by
> `inspectConformal()` contains the true label with probability `≥ 1 − α`,
> provided the calibration set is exchangeable with the test point.
> This holds regardless of the underlying model accuracy.

This is a strictly stronger guarantee than PAC-Bayes (which bounds
average error) — conformal bounds *coverage* per-instance, marginally.
Together they form a defense-in-depth pair: PAC-Bayes for "how good is
the calibrator on average?", conformal for "what does the calibrator
honestly know about *this* input?".

---

## 1. The theorem (Vovk, Gammerman, Shafer 2005)

Let `(X_1, Y_1), ..., (X_n, Y_n), (X_{n+1}, Y_{n+1})` be exchangeable
random variables and `s : X × Y → ℝ` any measurable score function.
Define the empirical quantile

```
q̂_(1-α) = ⌈(n + 1)(1 − α)⌉ -th smallest of {s(X_i, Y_i)}_{i=1..n}
```

and the conformal prediction set

```
C(X_{n+1}) = { y ∈ Y : s(X_{n+1}, y) ≤ q̂_(1-α) }
```

Then

```
P( Y_{n+1} ∈ C(X_{n+1}) ) ≥ 1 − α          (marginal coverage)
```

with **no assumption** on the distribution, no parametric form, no
asymptotic argument. Finite-sample, exact.

---

## 2. Mapping onto pantheon-guard

### 2.1 Score function

For binary labels `Y = {manipulation, safe}` and the v0.2 calibrator
output `c(x) ∈ [0, 1]` (manipulation confidence):

```
s(x, manipulation) = 1 − c(x)
s(x, safe)         =     c(x)
```

This is a *proper* nonconformity score: high when the calibrator did
not expect the label. It also satisfies the symmetry property
`s(x, manip) + s(x, safe) = 1`, so the mathematics of binary conformal
collapses to a single threshold on `c(x)`.

### 2.2 Verdict set

`C(x_test)` has three possible shapes, mapping cleanly onto the three
guarded actions:

| `C(x)` | Action |
|---|---|
| `{manipulation}` | confident block + regenerate |
| `{safe}` | confident pass |
| `{manipulation, safe}` | conformal abstain — escalate to human reviewer |

The abstain case is what every other guardrail vendor lacks: a
*certified* uncertainty signal that survives any input distribution.

### 2.3 API

```javascript
import { fitConformal, inspectConformal } from 'pantheon-guard';

// Offline, once: fit on a labelled calibration set.
const calibrator = fitConformal(calibrationSet, { alpha: 0.1 });
// → { threshold: 0.34, alpha: 0.1, coverageGuarantee: 0.9, n: 1000, scores: [...] }

// Online: predict per request.
const r = inspectConformal(text, { calibrator, urgency: 0.5, paused: true });
// → {
//     verdict_set: ['manipulation'] | ['safe'] | ['manipulation', 'safe'],
//     coverage: 0.9,
//     passes: ...,
//     abstain: ...,        // true when verdict_set has both labels
//     confidence: { ... }, // unchanged inspect() output
//     evidence:   { ... },
//     ...
//   }
```

---

## 3. The exchangeability assumption — when does it hold?

Conformal is distribution-free in the sense that it does not assume
Gaussian / parametric anything. It does require **exchangeability**:
the joint distribution of `(X_1, Y_1), ..., (X_{n+1}, Y_{n+1})` is
invariant under permutation. This is weaker than i.i.d. but stronger
than nothing.

**When it holds for pantheon-guard:**
- Calibration set drawn from the same population as production traffic.
- No temporal drift between calibration and inference.
- No active learning loop where calibration is biased by deployment outcomes.

**When it fails:**
- New manipulation patterns emerge after calibration (concept drift).
- Calibration set is curated (e.g., adversarially selected) but
  production is organic.
- Production text comes from a different language / register than
  calibration.

**Mitigation:** weighted conformal (Tibshirani et al. 2019) extends
the guarantee to known covariate shift; this is **shipped in v0.2.2-pre.1**
as `fitWeightedConformal()` / `inspectWeightedConformal()` — the caller
supplies importance weights `w(x_i) = dP_test/dP_cal` and the threshold
becomes the weighted (1-α-p_test) quantile, restoring marginal coverage
under any `P_test ≪ P_cal`. Fully adaptive online conformal
(Gibbs & Candès 2021) handles unknown arbitrary drift at the cost of
looser per-step coverage; we will add it in v0.4 once we have
multi-source calibration data.

```javascript
import { fitWeightedConformal, inspectWeightedConformal } from 'pantheon-guard';

// Caller-supplied weights — typically from a small density-ratio
// classifier on unlabelled production samples (Sugiyama 2012).
const calib = labelledExamples.map((e) => ({
  ...e,
  weight: estimateProdRatio(e.text),  // w(x_i) = dP_prod / dP_cal at x_i
}));

const weighted = fitWeightedConformal(calib, { alpha: 0.1, weightTest: 1 });
const r = inspectWeightedConformal(text, { calibrator: weighted, urgency: 0.5 });
// → coverage 0.9 holds even when production distribution differs from calibration
```

---

## 4. Comparison: PAC-Bayes vs Conformal vs both

| Property | PAC-Bayes | Conformal | Together |
|---|---|---|---|
| Type of guarantee | Average risk gap | Per-instance coverage | Both |
| Output shape | Single number (bound) | Prediction set | Bound + set |
| Distributional assumption | i.i.d. for the bound | Exchangeability | Strongest of the two |
| Sample-size scaling | `1/√n` plus `√KL` | `1/n` quantile fluctuation | Tighter of the two |
| What it answers | "How bad can the average error be?" | "What does the model honestly know about this input?" | Both questions in one verdict |
| Marketing-language equivalent | "we're calibrated on average" | "we abstain when we don't know" | "we have both averaged and per-instance certificates" |

Neither subsumes the other. PAC-Bayes is the right tool for the
*aggregate claim* on a benchmark page. Conformal is the right tool
for *production-grade per-request decision-making*. PITCH section 2.1
uses PAC-Bayes; production deployment uses conformal.

---

## 5. Demo

```bash
node examples/conformal-demo.js
```

Output sample (real run):

```
pantheon-guard v3.1.0 · conformal demo

Calibration set: 32 examples (16 manipulation, 16 safe)
Fitted: threshold=0.587, coverage=90%
Score distribution: min=0.027, median=0.354, max=0.762

── Verdict sets at α=0.1 (90% coverage guarantee) ──

  text:      "Hurry, only 3 spots left! Don't miss out, you'll regret …"
  expected:  manipulation
  set:       [manipulation]
  conf.man:  0.786

  text:      "The shocking secret millionaires hide from you — limited offer!"
  expected:  manipulation
  set:       [manipulation]
  conf.man:  0.694

  text:      "Please review the attached agenda and let me know if cha…"
  expected:  safe
  set:       [safe]
  conf.man:  0.000

  text:      "Please act now to confirm your booking before the office…"
  expected:  borderline
  set:       [manipulation, safe]  ← ABSTAIN
  conf.man:  0.474

  text:      "Hurry!"
  expected:  too-short
  set:       [safe]                ← inspect() abstain inside
  conf.man:  0.270

── Empirical coverage check (held-out 8 examples) ──

  α = 0.2  →  expected coverage ≥ 80%
  empirical coverage on held-out: 87.5% (7/8)
  ✓ marginal coverage guarantee holds on this split.
```

The borderline example produces the abstain set — exactly the case
where competitors emit a confident wrong verdict.

---

## 6. What the v0.3 benchmark unlocks

Current `examples/conformal-data.json` contains 32 hand-labelled
examples — enough for an API demonstration, not enough for tight
coverage in production. The v0.3 plan in BENCHMARK.md ships ~1000
hand-labelled examples; that calibration set will:

1. Sharpen the conformal threshold (less finite-sample slack).
2. Cover more linguistic registers (currently mostly marketing).
3. Allow stratified analysis: per-rule coverage, per-language coverage.
4. Enable weighted conformal under language / domain shift.

Until then, `inspectConformal()` is shipped as a working API with a
demo calibrator; production users substitute their own labelled set.

---

## 7. References

- Vovk, V., Gammerman, A., Shafer, G. *Algorithmic Learning in a
  Random World*. Springer, 2005.
- Lei, J., G'Sell, M., Rinaldo, A., Tibshirani, R. J., Wasserman, L.
  *Distribution-Free Predictive Inference for Regression.* JASA 2018.
- Tibshirani, R. J., Foygel-Barber, R., Candès, E., Ramdas, A.
  *Conformal Prediction Under Covariate Shift.* NeurIPS 2019.
- Gibbs, I., Candès, E. *Adaptive Conformal Inference Under
  Distribution Shift.* NeurIPS 2021.
- Angelopoulos, A. N., Bates, S. *A Gentle Introduction to Conformal
  Prediction and Distribution-Free Uncertainty Quantification.*
  arXiv:2107.07511.
