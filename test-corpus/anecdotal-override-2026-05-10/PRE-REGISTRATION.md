---
type: pre-registration
date: 2026-05-10
target_pack: epistemology v0.3.0-pre.1
detector_under_test: anecdotal_override (no inhibitor)
catalogue_anchor: ns-upalabdhi-sama-5-1-27
purpose: Real-corpus probe for anecdotal-override detector — graduate from scaffold to release-candidate (or iter-2). Specific failure mode of interest: distinguishing anecdote-as-displacement (fallacy) from anecdote-as-illustration (legitimate).
---

# Pre-registration — anecdotal_override probe

**Locked BEFORE running detector.**

## Hypothesis

H₁: The `anecdotal_override` detector catches ≥60% of "I have seen X with my
own eyes / in my N years of practice" framings used to displace systematic
evidence (RU + EN), with FP ≤5% on text where personal experience is shared
as a data point alongside systematic evidence rather than as displacement.

H₀: catch <60% OR FP >5% — promotion blocked, iter-2 needed.

## What this detector targets (catalogue grounding)

`upalabdhi-sama` (NS 5.1.27) — futile rejoinder where direct personal
perception is invoked to override an established inference. The contemporary
form: "I'm a doctor with 20 years of practice and I've never seen anyone die
of X — those statistics must be wrong"; "I lost weight on diet Y so the meta-
analysis is biased"; "I worked at company Z and management was great — these
horror stories are exaggerated."

**Critical distinction**: detector targets the *displacement* pattern
(anecdote → conclusion that overrides systematic evidence), NOT the
sharing-personal-experience pattern. The latter is essential to honest
discourse and must NOT fire.

## Honest scope (acknowledged BEFORE running)

1. **Selection bias** — same constraint as previous probes: I am test author
   + corpus curator. Mitigation: explicit inclusion criteria; default-EXCLUDE
   on ambiguous; positive samples paraphrase patterns I have encountered in
   alt-med forums / workplace-skepticism / experience-vs-research framings.
2. **Synthesis-leaning**: positive class paraphrases canonical alt-med /
   experience-trumps-data commentary; negative class includes paraphrased
   honest-experience-sharing AND bounded-personal-experience framings.
   Per CLAUDE.md: structured sanity, NOT external validation.
3. **No inhibitor**: detector has `check: () => false`. So FP-rate is the
   primary failure mode to watch — false positives on legitimate
   experience-sharing would cripple usability.
4. **Domain bias**: probe-corpus is healthcare-experience-heavy on positive
   side. Generalization to other domains (workplace, parenting, etc.) NOT
   claimed.

## Corpus criteria (LOCKED)

### Positive class — anecdotal-override fallacy

Inclusion (ALL must hold):
1. Speaker invokes personal direct perception OR years-of-experience
   credential.
2. The personal observation is used to override / dismiss / contradict
   systematic evidence (research, statistics, expert consensus).
3. Lexical marker: «я (сам|лично) видел/убедился/испытал», «своими
   глазами», «мой (личный) опыт показывает/доказывает», «за N лет работы
   я (не) видел», «у меня есть знакомый который»; EN «I saw it
   myself / with my own eyes», «in my N years of experience», «I have a
   friend who».
4. Source: forum / commentary / op-ed text — NOT scientific case report.

Exclusion:
- Speaker shares personal experience as a data-point alongside / in addition
  to systematic evidence (no displacement function).
- Speaker explicitly bounds the claim ("in my limited experience, although
  the broader literature suggests otherwise").
- Direct quotes from named figures presented as reportage.

### Negative class — legitimate personal-experience sharing

Inclusion (ALL must hold):
1. Speaker shares personal experience or observation.
2. NO displacement-of-systematic-evidence function — experience is offered
   as illustration, additional data point, or honest-bounded claim.
3. Source: thoughtful op-ed, balanced commentary, or scientific case-report
   style.

This class is the FP stress-test: detector must NOT fire on legitimate
experience-sharing.

## Sample size targets

- Positive: 12 (RU 6, EN 6)
- Negative: 12 (RU 6, EN 6) — mix of comparative-experience-sharing and
  bounded-personal-experience
- **Total: 24**

## Pre-registered metrics

- catch-rate with Wilson 95% CI
- FP-rate with Wilson 95% CI
- per-language breakdown
- explicit synthesis-vs-public-domain tagging on each entry

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| catch ≥ 60% AND FP ≤ 5% | PROMOTE_PARTIAL — synthesis-validated release-candidate; live-corpus probe required |
| catch ≥ 40% AND FP ≤ 5% | HOLD scaffold; iter-2 plan |
| catch < 40% OR FP > 5% | ITER-2 MANDATORY |

Without an inhibitor, FP control is structurally tight — any FP rate
above 5% means the patterns are over-broad and need narrowing (NOT
adding inhibitor as cycle-2 trap fix; that requires its own design phase).

## Reproducibility

`cd test-corpus/anecdotal-override-2026-05-10 && node runner.js`
