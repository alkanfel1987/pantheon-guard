# Evidence-tier classification — pack detectors

Honest scope per `CLAUDE.md` "Empirical verification before claiming"
discipline. This file defines **what claims are acceptable for each
detector** and is the source of truth when writing README, КП, npm
description, or any other commercial-facing material.

Status: 2026-05-10.

## Tier definitions

### Tier 1 — Live-validated

Detector has been probed against an **external** corpus (text not authored
or paraphrased by the test author), with:

- pre-registered hypothesis + decision rule
- N ≥ 10 positive samples from at least one confirmed-adversarial source
- Wilson 95% CI on catch and FP
- catch ≥ 60% AND FP ≤ 5%

**Acceptable commercial claims**: «validated», «catches X% on live corpus
N=Y», «production-ready (with monitoring)».

### Tier 2 — Synthesis-validated (structural)

Detector has been probed against a **synthesis-leaning** corpus where the
test author is also corpus curator. Positive samples are paraphrase-of-
canonical framings; negative class draws on public-domain or paraphrased
analytical text. Pre-registration + Wilson CI applied; iter-2 fixes
addressed structural pattern bugs surfaced by FN audit.

**Acceptable commercial claims**: «catalogue-anchored detector»,
«passes structured-sanity probe», «iter-2 pattern repairs applied»,
«live-corpus probe pending». Acceptable to cite catch/FP numbers IF
synthesis flag is in the same sentence.

**Unacceptable claims**: «validated», «production-ready», «X%
accuracy on real text», numbers in isolation without synthesis flag.

### Tier 3 — Scaffold (no probe)

Pattern array exists in code, no probe of any kind has been run. Often
scaffolded from `contemporary_examples` in catalogue entries plus the
test author's intuition.

**Acceptable claims**: none for commercial material. Internal-only:
«scaffold pending probe», «design-debt tracked in PROBE-DEBT.md».

## Current state — `epistemology` v0.3.0-pre.1

| Detector | Tier | Probe report | Acceptable claim |
|---|---|---|---|
| `naturalization_fallacy` | **Tier 1 (EN only)** | `test-corpus/naturalization-2026-05-09/REPORT.md` | "EN release-candidate, catch 63.6% [35.4–84.8] / FP 0% on N=11 EN live op-ed corpus" |
| `false_equivalence_levelling` (regex) | **Tier 2 — iter-3 broadened (Option B)** | synthesis: `test-corpus/false-equivalence-2026-05-10/`<br>LIVE-R1: `test-corpus/false-equivalence-LIVE-2026-05-10/`<br>iter-3: `test-corpus/false-equivalence-LIVE-iter3-2026-05-10/REPORT.md` | "synthesis 100% canonical + iter-3 broadening catch 66.7% on Round-1 training + 0% FP on N=20 negatives" |
| `fe-semantic/false_equivalence_semantic` (NLI) | **Tier 2 — semantic-validated, opt-in (Option C C2)** | **`test-corpus/false-equivalence-SEMANTIC-2026-05-10/REPORT.md`** | "semantic NLI catch 33% alone, but **regex ∪ semantic = 100% catch** on LIVE-R1 + 5% combined-FP on N=20" — perfect complementarity (regex covers Classes 1/3/4/5, semantic covers 2/6) |
| **regex ∪ semantic UNION** (recommended commercial path) | **Tier 2 — union-validated** | combination of two reports above | catch 100% [54.1%, 100%] / FP 5% [0.9%, 23.6%] on combined LIVE-R1+R2. Tier 1 BLOCKED — N=6 positives too small; held-out positive corpus N ≥ 15 required for promotion |
| `absence_argument` | **Tier 2 — synthesis only, live untested** | `test-corpus/absence-argument-2026-05-10/REPORT.md` | "catalogue-anchored detector, synthesis-validated; **live-corpus probe MANDATORY before any production claim** — sister detector showed 100pp gap" |
| `anecdotal_override` | **Tier 2 — synthesis only, live untested** | `test-corpus/anecdotal-override-2026-05-10/REPORT.md` | "catalogue-anchored detector, synthesis-validated; **live-corpus probe MANDATORY before any production claim** — sister detector showed 100pp gap" |
| `silence_as_concession` | **Tier 2 — synthesis only, live untested** | `test-corpus/silence-as-concession-2026-05-10/REPORT.md` | "catalogue-anchored detector, synthesis-validated; **live-corpus probe MANDATORY before any production claim** — sister detector showed 100pp gap" |
| `indifference_to_truth` | Tier 1 (RU) | learning-cycle 2026-05-08 (N=119 fresh-pull) | "validated on N=119 fresh-pull RU corpus" |
| `simulacrum_of_source` | Tier 1 (RU) | same as above | same as above |
| `source_trace_break` | Tier 1 (RU) | same as above | same as above |
| `epistemic_closure` | Tier 1 (RU) | same as above | same as above |
| `ad_hominem` | Tier 1 (RU) | same as above | same as above |

## Current state — `opacity` v0.3.1-experimental

| Detector | Tier | Probe report | Acceptable claim |
|---|---|---|---|
| `jargon_density_opacity` | **Tier 1 (EN/DE)** | `pantheon-vedic-catalogue/tests/lexicon-fixtures/REPORT-2026-05-09-iter3-final.md` (catalogue repo) | "catch 73% / FP 4% on N=57 EN+DE manual-curated independent corpus; experimental-flag, monitor FP-rate first 1000 samples" |

## Current state — other packs

`healthcare`, `news`, `news-de`, `news-hi`, `ai-security` — see their
respective acceptance metrics in CHANGELOG. Not enumerated here unless
their evidence-tier is unclear.

## Empirical anchor — selection-bias trap demonstrated 2026-05-10

The `false_equivalence_levelling` LIVE probe (`test-corpus/false-equivalence-LIVE-2026-05-10/REPORT.md`)
demonstrates the gap empirically: same detector,
synthesis-leaning corpus reported catch 100% / FP 0%, live verbatim
corpus reported catch 0% / FP 0% — **100 percentage point gap**.

This is the operational definition of why Tier 2 is not a permitted
commercial claim by itself: synthesis catch tells you the detector
matches its own pattern set against text written to match those
patterns. It says nothing about whether real-world adversarial text
contains those patterns.

**Implication for the other three Tier 2 detectors** (`absence_argument`,
`anecdotal_override`, `silence_as_concession`): their synthesis 100%
post-fix numbers are equally compatible with 0-30% live catch. Until
each runs its own live probe, treat their "synthesis-validated" status
as evidence of pattern-syntactic consistency, not detector capability.

## Why this file exists

Without explicit tier classification, two failure modes appear:

1. **Drift in commercial claims.** Internal "synthesis-validated" gradually
   becomes "validated" in marketing copy. The classification here is the
   gate.
2. **Loss of probe-debt visibility.** If everything is labeled the same
   way, the queue of detectors that need real-corpus probes becomes
   invisible. `PROBE-DEBT.md` tracks the queue; this file tracks tier.

## Maintenance rule

When a probe report is added under `test-corpus/<name>-<date>/`:

1. Classify the result by Tier 1/2/3 criteria above.
2. Update the table in this file.
3. Update `PROBE-DEBT.md` queue.
4. Update pack metadata `*ProbeResult` block.

When promoting Tier 2 → Tier 1 (live-corpus probe):

1. Live corpus must be **manual-curated** from confirmed-adversarial
   sources (per `feedback_lexicon_for_opacity_detection.md`: NOT
   auto-pull from arbitrary URL patterns).
2. Each live document must be human-tagged before run.
3. Wilson CI lower bound on catch must be ≥ 50% (not just point estimate
   ≥ 60% — synthesis-tier already proved point estimate; live-tier
   demands lower-bound generalization confidence).

## Honest framing reference

For external-facing pack description text, prefer:

- "Catalogue-anchored detector for X (NS Y.Z)" — plain factual
- "Validated on N=W live corpus" — only if Tier 1
- "Catalogue-anchored detector; live-corpus probe pending" — if Tier 2
- "Scaffold — pre-release, see PROBE-DEBT.md" — if Tier 3

Avoid:

- "X% accuracy" without N and corpus type
- "Validated" or "production-ready" for Tier 2 detectors
- Bundling a Tier 1 number into a sentence that also covers Tier 2
  detectors without delineation
