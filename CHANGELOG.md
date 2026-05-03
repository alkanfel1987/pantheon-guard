# Changelog

All notable changes to `pantheon-guard` will be documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0-pre.2] — 2026-05-04

### Polish pass — fixed dead feature, hot-path perf, DRY, stale comments

A `simplify`-skill review across v0.3 + v0.4 surface flagged one real
correctness bug, three hot-path inefficiencies, and several stale
comments. All addressed in a single atomic commit; no API breakage.

#### Fixed — `calibratorOverrides` was documented but not wired

`healthcarePack.calibratorOverrides` declared `NOISE_FLOOR: 0.20` and
`STRONG_THRESHOLD: 0.55`, but `runPack` / `applyPack` / `stackPacks`
never read them — the override was silently ignored, and healthcare
detection ran with default core thresholds. **This was a bug**: the
killer feature for higher-stakes domains was non-functional.

Plumbed end-to-end:
- `calibrate(text, evidence, overrides?)` now accepts a partial override
  map and merges with `CALIBRATOR_PARAMS` per call.
- `isStrong(c, threshold?)` now accepts an explicit threshold instead
  of always reading the module-level constant.
- `detectPatternsCalibrated(text, {overrides})` plumbs through.
- `inspect(text, {calibratorOverrides})` plumbs through; the strong-
  threshold used for boolean conversion respects the override.
- `applyPack(pack)` and `stackPacks(packs)` pass the pack's
  `calibratorOverrides` (merged for stacks) into the inspect call.
- Two new tests in `test/packs-healthcare.test.js` verify end-to-end
  override plumbing — including a thresholds-only mini-pack proving
  packs with no patterns still take effect.

#### Fixed — double normalization in `applyPack` / `stackPacks` hot path

Previously `applyPack` called `coreInspect` (which normalized inside
`detectPatternsCalibrated`) and then `runPack` (which normalized again).
For `stackPacks` with N packs that was N+1 normalization passes per
inspect call. Normalization is the most expensive step in the
deterministic pipeline.

Fixed: `applyPack` and `stackPacks` compute `normalized` once, pass it
into both `coreInspect` (via new `options.normalized` hint) and
`runPack` (via new optional second argument). Single normalization
per inspect call regardless of pack stack depth.

#### Fixed — `normalize.js` ASCII fast-path

Three of the five normalization stages (homoglyph fold, leet, spaced
collapse) only matter for non-ASCII or special-character input. Each
now runs only when a cheap `RegExp.test()` confirms the relevant
characters are present. Pure-ASCII text (the majority of production
traffic) skips ~70% of normalization work. Same applies to the
zero-width strip — `.test()` first, `.replace()` only on hit.

#### DRY

- `VALID_RULES` in `packs/index.js` now derived from
  `Object.keys(MAHAVRATA.rules)` instead of hardcoded — adding/renaming
  a mahā-vrata rule auto-propagates to pack validation.
- `VALID_SEVERITIES` extracted as a frozen constant; pack validation
  + error messages reference it.
- `EMPTY_FLAGS` and `EMPTY_CALIBRATED` extracted as frozen module-level
  constants in `detect-patterns.js`; previously rebuilt on every empty
  call.

#### Cleanup

- Removed stale "lazy import to avoid circular dependency" comment in
  `detect-patterns.js` — the import was never lazy and there was never
  a cycle.
- Removed "v0.2 will replace this", "v0.3 will fit it", "Acceptable for
  v0.1" version-roadmap narration from comments — the calibrator
  exists, the comments were misleading.
- Removed the eslint-disable comment that referenced a non-existent
  `require()` pattern.
- Tightened `inspectWeightedConformal` test: now asserts
  `r10.threshold <= r1.threshold` with derivation comment, instead of
  only checking that `weightTest` is reflected in the output object.
  Previous test would have passed even if `weightTest` were silently
  ignored by the quantile.

#### Build delta

- ESM 62.89 → 63.61 KB (+0.7 KB for plumbing + EMPTY_* constants;
  partially offset by stale-comment removal)
- DTS 94.25 → 90.54 KB (-3.7 KB after JSDoc cleanup)
- Tests 165 → 167 (added 2 calibratorOverrides verification tests)

#### Backward compatibility

All public exports unchanged. The only behavior change is that
`applyPack(healthcarePack)` (and any future pack with
`calibratorOverrides`) now actually applies its overrides — which was
the documented behavior all along.

## [0.4.0-pre.1] — 2026-05-04

### Added — domain rule-pack architecture + first pack (`healthcare`)

Introduces a composable extension point for domain-specific manipulation
detection. Packs add specialized regex patterns and positive requirements
on top of the deterministic mahā-vrata core, without altering it.

#### `src/packs/index.js` — pack architecture

Three composable pieces:

1. **`detectionPatterns`** — regex matchers tagged with the existing
   mahā-vrata rule they route through (ahimsa / satya / asteya /
   shaucha / indriya_nigraha). Packs do NOT introduce new top-level
   ethical categories — every domain harm maps onto a Yoga-sūtra rule
   for principled audit consistency.
2. **`requirements`** — domain-specific *positive* requirements (e.g.
   "healthcare AI must include provider-escalation language when
   discussing symptoms"). Each requirement has a `condition`, a
   `check`, a severity, and an audit message.
3. **`calibratorOverrides`** — per-pack tightening of calibration
   thresholds. Higher-stakes domains use lower noise floors and lower
   strong thresholds.

API:

- `applyPack(pack)` — wraps `inspect()` with a pack, returning an
  enhanced inspect function. Backward compatible: core inspect()
  unchanged; only callers that opt in see pack output.
- `stackPacks([pack1, pack2, ...])` — composes multiple packs (e.g.
  healthcare + finance for medtech-fintech apps). Violations and
  evidence merge into a single result object.
- `runPack(pack, text)` — direct pack run for testing / instrumentation.
- `validatePack(pack)` — defensive registration check.

#### `src/packs/healthcare.js` — first commercial pack

Healthcare-specific manipulation detection covering RU + EN:

| Category | Routes through | Patterns |
|---|---|---|
| Self-diagnosis overclaim | satya | `self_dx_en`, `self_dx_ru`, `self_dx_listicle_en` |
| Cure / 100% guarantee claim | satya | `cure_claim_en`, `cure_claim_ru` |
| False reassurance | satya | `false_reassurance_en`, `false_reassurance_ru` |
| Medication-adjustment advice | ahimsa | `med_adjust_en`, `med_adjust_ru`, `med_recommend_en` |
| Red-flag symptom dismissal | ahimsa | `serious_dismissal_en` |
| Off-prescription urgency | indriya_nigraha | `urgent_self_med_en` |
| "Studies show" without source | satya | `studies_show_en` |

Plus one **positive requirement**:
- `provider_escalation` — when text discusses symptoms / treatment /
  medication / medical conditions, it MUST include language directing
  the user to a healthcare provider. Failing this is a high-severity
  violation. Implemented for both English and Russian.

Calibrator overrides for higher-stakes context:
- `NOISE_FLOOR`: 0.30 → 0.20
- `STRONG_THRESHOLD`: 0.70 → 0.55

19 new tests in `test/packs-healthcare.test.js` covering each pattern,
the requirement in both languages, the positive (clean) cases, the
override behavior, and stacking. Suite now **165/165 passing**.

#### `examples/healthcare-pack-demo.js`

Runnable demo showing 9 representative inputs through both core
(`inspect`) and `applyPack(healthcarePack)`. Demonstrates the
commercial value: clean medical text passes both; manipulative or
unsafe text passes core but is blocked by the healthcare pack with
named pack-violation source and unmet-requirement id.

#### Why a new minor version

This is the first new architectural surface since v0.2: packs are an
extension point, not just a code add. They open a commercial product
line (paid per-domain packs) that the OSS core monetizes through the
existing dual-license model.

### Commercial — first paid pack pricing tier

`@pantheon/guard-healthcare`:
- Free: evaluation / pilot
- Starter: $499 / month (small healthtech, < $5M ARR)
- Enterprise: $4 990 / month + (large healthtech / hospital)
- Custom regulatory geography rules: negotiated

Same pattern will apply to upcoming packs:
- `@pantheon/guard-finance` — FOMO, pressure CTA, mandatory risk disclosure
- `@pantheon/guard-education` — child-safety, anti-comparative-ranking
- `@pantheon/guard-recruiting` — false-urgency-in-offers, salary disclosure

### Backward compatibility

All v0.1, v0.2, v0.2.1, v0.2.2, v0.3.0 exports unchanged. Pack support
is purely additive. Existing `inspect()` / `inspectConformal()` /
`inspectSigned()` consumers see no behavior change.

### Build delta

- ESM 53.07 KB → 56.5 KB (+3.5 KB for pack runtime + healthcare pack)
- Tests: 146 → 165

## [0.3.0-pre.1] — 2026-05-04

### Added — security hardening + watermarking layer

The v0.2.2 calibrated detector had real bypass vectors. Audit found
that with neutral metadata (`urgency: 0.3, paused: true`), the
following attacks let manipulative content through:

- Cyrillic / Greek homoglyph swaps (`Huррy` with Cyrillic `р`).
- Mixed homoglyphs in fear words (`rеgrеt` with Cyrillic `е`).
- Zero-width / BOM insertions (`Hu​rry`).
- Fullwidth Latin (`Ｈｕｒｒｙ`).
- Leetspeak (`y0u'll r3gr3t`).
- Spaced-out tokens (`H u r r y`).

v0.3.0-pre.1 closes all of them and adds two watermarking layers
on top.

#### `src/normalize.js` — text normalization layer

- NFKC unicode normalization (collapses fullwidth, ligatures, compat).
- Zero-width / BOM / bidi-override stripping.
- **Mixed-script homoglyph fold.** Cyrillic/Greek lookalikes are
  folded to Latin only inside words containing both scripts; pure
  Russian text passes through untouched, preserving Russian regex
  matches.
- Leetspeak digit-to-letter fold (between letter neighbors only).
- Spaced-out single-letter collapse.
- Wired into `detectPatterns()` and `detectPatternsCalibrated()`.

#### `src/sign.js` — verdict signing (watermark layer)

- `inspectSigned(text, { secret, ...opts })` — runs `inspect()` and
  returns the verdict together with a HMAC-SHA-256 signature over a
  canonical-JSON serialization of the payload. Includes timestamp,
  library version, and signature version.
- `verifySignedVerdict(signed, secret)` — timing-safe verification.
  Returns `{ valid, reason }`. Catches: tampered fields, wrong secret,
  unknown library identifier, unsupported signature version.
- `canonicalize(value)` — deterministic JSON with keys sorted at every
  level (exposed for callers needing the same canonicalization).
- `signPayload()` / `verifyPayload()` — low-level primitives.

#### `src/integrity.js` — frozen-rule hash (rule-watermark)

- `getIntegrity()` — returns SHA-256 hashes of frozen rule structures
  (MAHAVRATA, LAWS, PRINCIPLES, FIVE_STEP_ALGORITHM, SVADHARMA_SCHEMA,
  LAYERS, GUNAS, PRIORITY) and a separately-versioned hash of
  CALIBRATOR_PARAMS.
- `assertRuleSetHash(expected)` — CI / startup integrity check; throws
  on drift.
- `getBuildFingerprint()` — 16-char fingerprint combining rule and
  calibrator hashes plus library version.

v0.3.0-pre.1 baseline:
```
rule_set_hash:          1da1b908e3577579fb01e43811f255c4f772b4de5e96d20deb5c265f72797848
calibrator_params_hash: 718349b8fd5dbdb150da61c5b9e91aca18cd297be16ba49c44002b6613ad5664
build_fingerprint:      1434724a34f04e30
```

#### Tests

- 22 `test/adversarial.test.js` — systematic bypass attempts per rule,
  including all v0.2.2 audit findings + ReDoS stress tests.
- 14 `test/sign.test.js` — round-trip, tampering rejection, timing-safe
  on length mismatch, signature-version + library-id rejection.
- 7 `test/integrity.test.js` — hash stability, mismatch detection,
  malformed hash rejection.
- Suite now **146/146 passing** (was 103).

#### Docs

- `docs/SECURITY.md` — threat model (4 adversary classes), defense
  layer mapping, audit transcript (v0.2.2 → v0.3.0), watermarking
  comparison to LLM output watermarks.

### Why this is a 0.3.x bump (not 0.2.3)

Three new public modules (`normalize`, `sign`, `integrity`), 11 new
exports, and a behavior change in `detectPatterns()` (now applies
normalization before regex). Backward-compatible at the level of
*intent* (clean text still produces clean verdicts; bypass attempts
now produce blocking verdicts) — but the *behavior* on adversarial
input changes by design.

### Build delta

- ESM 49.04 KB → ~52 KB (+3 KB for normalize + sign + integrity)
- CJS comparable
- Tests 103 → 146

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
