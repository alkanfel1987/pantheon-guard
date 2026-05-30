---
type: pre-registration
date: 2026-05-10
target_pack: epistemology v0.3.0-pre.1
detector_under_test: silence_as_concession (no inhibitor)
catalogue_anchor: ns-apratibha-5-2-18
purpose: Real-corpus probe for silence-as-concession detector — graduate from scaffold to release-candidate (or iter-2). Specific failure mode of interest: distinguishing "silence-implies-guilt" framing from neutral reporting of non-response.
---

# Pre-registration — silence_as_concession probe

**Locked BEFORE running detector.**

## Hypothesis

H₁: The `silence_as_concession` detector catches ≥60% of "non-response
implies guilt / agreement" framings (RU + EN), with FP ≤5% on text that
neutrally reports declined comment / non-response without inferring
concession.

H₀: catch <60% OR FP >5% — promotion blocked, iter-2 needed.

## What this detector targets (catalogue grounding)

`apratibhā` (NS 5.2.18) — a procedural defeat-rule from formal vāda:
inability to respond ends the debate. The contemporary misapplication
casts non-response in informal discourse as proof of guilt or agreement,
without verifying whether the silence reflects:
- inability to refute (the original bounded vāda meaning)
- strategic refusal (legal, privacy, ongoing investigation, security)
- procedural restraint (neither confirming nor denying)
- simple unresponsiveness (the question was never received, or was
  considered unworthy of reply)

The fallacy is the unconditional inference, not the observation of
silence.

## Honest scope (acknowledged BEFORE running)

1. **Selection bias** — same constraint as previous probes: I am test
   author + corpus curator. Mitigation: explicit inclusion criteria;
   default-EXCLUDE on ambiguous; positive samples paraphrase patterns
   I have encountered in political commentary / gossip / discreditation
   pieces.
2. **Synthesis-leaning**: positive class paraphrases canonical political-
   commentary / gossip / discreditation framings; negative class includes
   neutral journalism reporting non-response, legal-restraint-acknowledged
   passages, and procedural-silence framings. Per `CLAUDE.md`: structured
   sanity, NOT external validation.
3. **No inhibitor**: detector has `check: () => false`. So FP-rate is the
   primary failure mode to watch — false positives on neutral non-response
   reporting would cripple usability in journalism contexts.
4. **Domain bias**: probe-corpus is political-commentary-heavy on positive
   side. Generalization to other domains (corporate-discreditation,
   relationship gossip) NOT claimed.

## Corpus criteria (LOCKED)

### Positive class — silence-as-concession fallacy

Inclusion (ALL must hold):
1. Speaker reports a non-response, refusal-to-comment, or silence.
2. The non-response is rhetorically converted into proof of guilt /
   agreement / concession.
3. Lexical marker: «отказался комментировать, что говорит само за
   себя / многозначительно», «молчание говорит само за себя / не
   случайно», «не нашёл что ответить — значит/следовательно»,
   «показательно промолчал», «their/his/her silence speaks volumes»,
   «declined to comment, which tells», «failure to respond proves».
4. Source: opinion / commentary / gossip / discreditation text — NOT
   neutral journalism.

Exclusion:
- Neutral reportage of non-response without guilt-inference.
- Cases where the non-response is contextually justified (legal,
  privacy, ongoing investigation, "neither confirming nor denying"
  protocol).
- Direct quotes from named figures presented as reportage.

### Negative class — neutral non-response reporting

Inclusion (ALL must hold):
1. Speaker reports a non-response, decline-to-comment, or silence.
2. NO guilt / concession inference made.
3. Source: neutral journalism, legal commentary, or analytical text.

This class is the FP stress-test: detector must NOT fire on neutral
non-response reporting.

## Sample size targets

- Positive: 12 (RU 6, EN 6)
- Negative: 12 (RU 6, EN 6) — neutral journalism + legal-restraint
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

Without an inhibitor, FP control depends entirely on pattern specificity.
The patterns require explicit "silence X tells/proves/says" combinations,
which should naturally exclude neutral reportage.

## Reproducibility

`cd test-corpus/silence-as-concession-2026-05-10 && node runner.js`
