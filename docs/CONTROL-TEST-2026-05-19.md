# Control test — 2026-05-19

Honest current-state measurement of pantheon-guard. Run on frozen,
pre-registered corpora — no tuning, no pattern change, no corpus mutation
between freeze and this run.

> **Scope note (2026-05-19):** this measures guard against its *frozen
> development corpora* (assembled ~2026-05-05) — a **regression baseline**, not
> a generalization number. The number for the NVIDIA dialogue comes from the
> fresh held-out probe — see `docs/FRESH-PROBE-PREREG-2026-05-19.md`. Expect
> the fresh number to be lower (replication precedent: 84% → 57%).

## Provenance (pre-registration)

The corpora are dated, frozen files; each runner computes the SHA-256 of its
corpus at runtime as proof the labelled set was not altered.

| Harness | Corpus file | SHA-256 |
|---|---|---|
| `examples/benchmark-phase1-runner.js` (RU) | `examples/benchmark-phase1-corpus.js` | `11961c5cb5a839ac3d0ba0dc327313d226e58e364f44dffff6ac5de2a3c0386c` |
| `examples/benchmark-multiregion-runner.js` (EN+DE) | `examples/benchmark-multiregion-corpus.js` | `b675a11f08e4226e54d9fa4fb83f474d5e56638fb6a979f085eb8ead4079f61c` |

Stack: core + news + epistemology. Node built-in runner.

## Results

### RU — N=280
- Accuracy: **95.7%** — 95% CI [92.7%, 97.5%] (268/280)
- Catch-rate: **58.3%** — 95% CI [38.8%, 75.5%] (14/24)
- FP-rate: **0.8%** — 95% CI [0.2%, 2.8%] (2/256)
- Pre-registered H1 (accuracy ≥85%), H2 (mainstream FP ≤5%), H3 (tabloid catch ≥60%) — all passed.

### EN+DE — N=340
- Accuracy: **88.2%** — 95% CI [84.4%, 91.2%]
- Catch-rate: **50.6%** — 95% CI [39.7%, 61.5%] (39/77)
- FP-rate: **0.8%** — 95% CI [0.2%, 2.7%] (2/263)

### Combined
- N=620 — catch **52.5%** (53/101), FP **0.8%** (4/519), accuracy ~91.6%.

## Latency

Measured 2026-05-19 — `examples/latency-bench-2026-05-19.js`, 93 short texts,
20 warmed rounds, N=1860 calls per config:

- **Deterministic path — the product.** Full 5-pack stack
  (healthcare+news+news-de+news-hi+epistemology): **mean 0.11 ms, median
  0.06 ms, p95 0.25 ms** on CPU. Core `inspect()` alone: mean 0.02 ms. The
  deterministic detection is **sub-millisecond** — verified.
- **Optional semantic ML layer** (mDeBERTa pack, opt-in, async): ~64 ms per
  call + ~300–500 MB RAM (`CHANGELOG.md` line 143) — a separate opt-in path,
  NOT the default and NOT the latency of the deterministic packs.
- Correction: an earlier draft of this sheet quoted "~64 ms" as the per-call
  number — that conflated the optional ML layer with the deterministic core.
  The deterministic core is sub-ms; the benchmark above is the verified figure.

## Honest caveats — binding for the NVIDIA dialogue

1. **Catch-rate is ~50–58%, and the CIs are wide** — RU catch is 14/24, CI
   [39%, 76%]. Always quote with the CI, never a bare point estimate.
2. **Catch-rate is NOT a superiority claim vs NeMo Guardrails.** The pitch is:
   deterministic + low-FP + native multilingual + an *orthogonal* detection
   class (manipulation in model output) — not "catches more".
3. **Weak spot: US aggregator / celebrity clickbait** (BuzzFeed, BoredPanda) —
   many false-negatives. EN catch is weakest there.
4. **FP-rate 0.8% is the strong, defensible number** — consistent across both
   corpora, tight CI.
5. **accuracy ≠ catch-rate.** The legacy "92.5%" figure is *accuracy*.
   Catch-rate (share of manipulative items caught) is the operative metric.

## What may be said to NVIDIA

- "deterministic, sub-millisecond per call (~0.1 ms, 5-pack stack), no LLM in the runtime path"
- "native RU + DE coverage, false-positive rate 0.8%"
- "detects a class their input-attack rails do not — manipulation in model
  *output* — currently ~half of manipulative items (CI-honest), improving"

## What may NOT be said

- ❌ "~64 ms" presented as the deterministic per-call latency (that is the opt-in ML layer)
- ❌ "92.5%" presented as catch / detection rate
- ❌ any "catches more than NeMo" framing
