# Changelog

All notable changes to `pantheon-guard` will be documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2-pre.1] — 2026-05-04

### Added — three more theorems closing the formal-guarantees suite

- `src/conformal-weighted.js` — weighted conformal prediction under
  covariate shift (Tibshirani, Foygel-Barber, Candès, Ramdas, NeurIPS
  2019). Caller supplies importance weights `w(x_i) = dP_test/dP_cal`
  per calibration point and an optional `weightTest`. The threshold
  becomes the weighted (1-α-p_test) empirical quantile, restoring
  marginal coverage under any `P_test ≪ P_cal`.
- New API: `fitWeightedConformal()`, `inspectWeightedConformal()`,
  `weightedQuantile()` (low-level, exposed for advanced callers).
- 10 new tests including coverage check under simulated shift.
  Suite now 103/103 passing.
- `docs/DISTRIBUTION-SHIFT-PAC-BAYES.md` + `distshift_pac_bayes_compute.py`
  — Germain–Habrard–Laviolette–Morvant 2016/2020 extension of the
  McAllester bound to the case `P_bench ≠ P_prod`. Adds
  `√(D₂(Q‖P) / 2) + λ` shift-correction term. Headline numerical
  instantiation: at base bound = 0.093, total widens to 0.32 under
  mild shift (`D₂=0.1`) and saturates near `D₂=2`.
- `docs/MINIMAX-BENCHMARK.md` — Sion's minimax theorem (1958)
  applied to v0.3 benchmark design. Pre-commits category × language
  budget in git, publishes worst-case stress-test gap alongside
  every metric. Certifies that the test distribution lies near a
  saddle point — publisher cannot retroactively cherry-pick.
- PITCH.md sections 2.1.3, 2.1.4, 2.1.5 — three new sub-sections
  on distribution-shift PAC-Bayes, Sion-minimax benchmark, and the
  full seven-guarantee defense-in-depth table.

### The seven-guarantee suite (complete after v0.2.2)

| Layer | Theorem |
|---|---|
| Maha-vrata | (axiomatic) Yoga-sūtra II.30-31 |
| Calibration | Cox 1946 + de Finetti 1937 |
| PAC-Bayes (aggregate) | McAllester 1999 / Catoni 2007 |
| Distribution-shift PAC-Bayes | Germain et al. 2016/2020 |
| Conformal (per-instance) | Vovk 1999 / 2005 |
| Weighted conformal | Tibshirani et al. 2019 |
| Benchmark design (Sion-minimax) | Sion 1958 |

### Build delta

- ESM 47.01 KB → 48.5 KB (+1.5 KB for weighted conformal)
- Tests: 93 → 103
- New docs: 3 (DISTRIBUTION-SHIFT-PAC-BAYES, MINIMAX-BENCHMARK,
  weighted-conformal section in CONFORMAL.md)

### Backward compatibility

All v0.1, v0.2.0-pre.1, v0.2.1-pre.1 exports unchanged. Weighted
conformal is strictly additive; standard `inspectConformal()` continues
to work.

## [0.2.1-pre.1] — 2026-05-04

### Added — conformal prediction layer

- `src/conformal.js` — split conformal prediction wrapper over the v0.2
  calibrator. Distribution-free finite-sample marginal coverage
  guarantee per Vovk, Gammerman, Shafer (2005). For exchangeable
  calibration data, the prediction set covers the true label with
  probability ≥ 1-α regardless of underlying model accuracy.
- `fitConformal(calibrationSet, options)` — offline fit; computes the
  finite-sample quantile threshold and returns a calibrator object
  with explicit coverage guarantee.
- `inspectConformal(text, options)` — request-time wrapper around
  `inspect()`. Returns `verdict_set ⊆ {manipulation, safe}` plus the
  full inspect() output. Three set shapes map cleanly onto
  block/pass/abstain actions; abstain is the certified-uncertainty
  signal no other guardrail vendor offers.
- `nonconformityScore(text, label, options)` — exposed for advanced
  callers building custom score functions or weighted variants.
- `examples/conformal-data.json` — 32 hand-labelled calibration
  examples (RU+EN, balanced manipulation/safe). Production swaps for
  the v0.3 hand-labelled benchmark (~1000 examples) at which point
  the marginal coverage guarantee becomes meaningfully tight.
- `examples/conformal-demo.js` — live demonstration of the three
  verdict shapes plus held-out empirical coverage check (8/8 covered
  at α=0.2 in the bundled split).
- `docs/CONFORMAL.md` — formal theorem statement, mapping onto guard,
  comparison with PAC-Bayes (defense-in-depth pair), references
  to Tibshirani 2019 (covariate shift) and Gibbs 2021 (online
  adaptive) for v0.4 extensions.
- 14 new tests including empirical-coverage check on held-out split.
  Suite now 93/93 passing.

### Why conformal in addition to PAC-Bayes (not instead of)

The two bounds form a defense-in-depth pair, not redundancy:

| Layer | Type of guarantee | Right context |
|---|---|---|
| PAC-Bayes (v0.2.0-pre.1) | average risk gap | aggregate claim on benchmark page |
| Conformal (v0.2.1-pre.1) | per-instance coverage | production request-time decision |

Neither subsumes the other. PAC-Bayes asks "how good is the calibrator
on average?" — the right tool for PITCH/benchmark numbers. Conformal
asks "what does the calibrator honestly know about *this* input?" —
the right tool for production routing decisions. Section 2.1 of PITCH
now references both as a complementary pair.

### Build delta

- ESM 45.59 KB → 47.01 KB (+1.42 KB)
- CJS 45.74 KB → 47.18 KB (+1.44 KB)
- DTS 46.08 KB → 53.30 KB

1.4 KB of code for one of the strongest formal guarantees in
machine-learning theory. The ratio is the point.

### Backward compatibility

All v0.1 and v0.2.0-pre.1 exports unchanged. `inspect()` continues
to work without conformal; `inspectConformal()` is strictly additive.

## [0.2.0-pre.1] — 2026-05-04

### Added — calibration layer

- `src/calibrator.js` — deterministic v0.2 calibration. Maps raw regex
  evidence to per-flag confidence in [0, 1] using a saturating combiner
  with short-text penalty and noise floor. Zero dependencies, ~150 lines.
- `detectPatternsCalibrated(text)` — v0.2 detector. Returns the same
  boolean shape as `detectPatterns` for backward compatibility, plus
  per-flag confidence, evidence markers naming which sub-patterns fired,
  and an `abstain` decision when the input is too thin.
- `inspect(text, options)` — top-level v0.2 API that runs the full
  pipeline (detect → calibrate → checkMahavrata) in one call, with
  selectable decision policy: `'strict'` reproduces v0.1 behavior;
  `'calibrated'` (default) requires confidence ≥ 0.7 for a flag to
  trigger, and abstains on too-short input.
- 19 new tests (`calibrator.test.js`, `inspect.test.js`) verifying
  monotonicity in hits, abstain on short input, calibrated-vs-strict
  divergence on weak signals, evidence-marker shape, and confidence
  range invariants. Total suite now 79 tests.

### Why this version exists

A controlled experiment in
`C:\ProjectS\glyph_reconstruction\REPORT_PHASE2.md` measured a
sparsity-regularized classifier producing 33.6% confident-but-wrong
answers in the underdetermined regime. That is the failure mode every
competing guardrail also exhibits but does not surface to callers.
v0.2 takes the lesson directly: confidence is a property of the input
regime, not the model. The calibrator surfaces it; `inspect()` lets
the caller choose whether to act on uncertain signals or abstain.

This positions calibrated honest-uncertainty as the differentiating
property of `pantheon-guard`, replacing the v0.1 placeholder roadmap
note about "trained classifier coming in v0.2" with a deterministic
calibration layer that ships now and stays auditable forever.

### Backward compatibility

- All v0.1 exports unchanged — `detectPatterns`, `checkMahavrata`,
  `runFiveSteps`, `checkAction`, `wrapAgent`, etc.
- `inspect()` is additive; no existing code paths altered.
- 60 prior tests still pass identically.

### Known limitations

- Calibration constants (`TAU`, `BASE_PER_HIT`, etc. in
  `CALIBRATOR_PARAMS`) are heuristic v0.2 baselines. v0.3 will fit
  them to BENCHMARK ground truth via logistic regression.
- The abstain decision uses token count; future revisions may add
  context features (caps ratio, punctuation density, sentence count).

## [0.1.0] — Initial extraction

### Added

- Initial extraction of the Pantheon deterministic conscience layer from
  the production Avito Chrome extension into a standalone npm package.
- Seven focused source modules: `constants`, `mahavrata`, `svadharma`,
  `algorithm`, `principles`, `laws`, `index`.
- Public functions:
  - `checkMahavrata(action)` — five-yama deterministic check
  - `validateSvadharma(svadharma)` — agent formula validation
  - `checkSvadharmaConsistency(svadharma, action)` — fit check
  - `runFiveSteps(agent, action)` / `checkAction(...)` — full algorithm
  - `detectPatterns(text)` — regex heuristics for RU + EN manipulation
  - `wrapAgent(agent).act(action, executor)` — runtime guard wrapper
  - `getMahavrata()`, `getAlgorithm()`, `getPrinciple()`, `getLaw()`
- Frozen exported structures: `MAHAVRATA`, `SVADHARMA_SCHEMA`,
  `FIVE_STEP_ALGORITHM`, `PRINCIPLES`, `LAWS`, plus `LAYERS`, `GUNAS`,
  `PRIORITY` enums.
- Dual ESM + CJS build via `tsup`, with `.d.ts` and `.d.cts` types.
- 60 unit tests (Node test runner, `node:test`).
- Examples:
  - `basic.js` — minimal hello-world
  - `openai-chat.js` — OpenAI guarded chat with regenerate-on-block
  - `anthropic-chat.js` — Anthropic equivalent
  - `nemo-output-rail/` — full NeMo Guardrails integration with
    side-by-side baseline + guarded demo
  - `chrome-extension/` — minimal MV3 demo
- Documentation:
  - `README.md` (English) and `README.ru.md` (Russian)
  - `PITCH.md` — strategic one-pager
  - `docs/PHILOSOPHY.md` — engineering rationale for the rule choice
  - `docs/LEARNING.md` — status of the deferred learning module
- Dual licensing: MIT for code, commercial addendum for production use.

### Known limitations

- `LearningCycle` (`src/learning/index.cjs`) is **not bundled** because
  it depends on `pantheon-agents.js`, which was not extracted. See
  `docs/LEARNING.md` for the unblock plan.
- `detectPatterns` uses regex heuristics for v0.1. v0.2 will replace it
  with a trained classifier benchmarked against NeMo / Llama Guard /
  Lakera / Guardrails AI. The Mahā-vrata layer above stays unchanged.
- Bundle size is ~42 KB minified (ESM) — larger than the 18 KB target
  hinted at in early README drafts. The rule data tables make up the
  bulk; the algorithm itself is small. README states the actual size.

## [0.1.0] — TBD

Initial public release. Pending:
- LICENSE-MIT.md and LICENSE-COMMERCIAL.md final wording review
- npm publish (one-way; held until the README and PITCH are
  cross-checked one more time)
