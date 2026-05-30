---
type: pre-registration
date: 2026-05-10
target_pack: epistemology v0.3.0-pre.1
detector_under_test: false_equivalence_levelling (no inhibitor)
catalogue_anchors:
  - ns-avisesa-sama-5-1-23
  - ns-anityasama-5-1-32
purpose: Real-corpus probe for FE-levelling detector — graduate from scaffold to release-candidate (or iter-2) per epistemology pack discipline.
---

# Pre-registration — false_equivalence_levelling probe

**Locked BEFORE running detector.**

## Hypothesis

H₁: The `false_equivalence_levelling` detector catches ≥60% of "both
sides equally bad" / "all X are the same" framings in op-ed-style real
text (RU + EN), with FP ≤5% on analytical text that discusses similarities
between two parties without leveling them.

H₀: catch <60% OR FP >5% — promotion blocked, iter-2 needed.

## What this detector targets (catalogue grounding)

`aviśeṣa-sama` (NS 5.1.23) — futile rejoinder by claiming both sides
share a trivial property, hence cannot be distinguished. The contemporary
form is journalistic / op-ed false balance: "all politicians are the
same", "both sides are equally bad", "по сути одно и то же".

This is **not** the same as legitimate similarity comparison
(comparative analysis, taxonomy). The defining feature is that the
trivially-shared property is used to **dissolve** the distinction
the speaker wants to avoid engaging.

## Honest scope (acknowledged BEFORE running)

1. **Selection bias** — same constraint as naturalization probe: I am
   test author + corpus curator. Mitigation: explicit inclusion criteria;
   default-EXCLUDE on ambiguous; positive samples are paraphrases of
   *real* op-ed framings (citing the paraphrase source, not claiming
   verbatim corpus).
2. **Synthesis-first**: This probe is **synthesis-leaning** — the
   positive class is drawn from canonical op-ed framings I have
   encountered, written/paraphrased into 2-sentence samples. Negative
   class draws on public-domain analytical text. This is "structured
   sanity check", not external validation. Per CLAUDE.md "selection
   bias warning" the result is reported with explicit synthesis flag
   in `results.json` and `REPORT.md`.
3. **No inhibitor under test**: the detector has `check: () => false`
   — no positive inhibitor like temporal qualifier (naturalization)
   or scope qualifier (absence_argument). So per-language FP is the
   primary failure mode to watch.
4. **Domain bias**: op-ed corpus is political-commentary-heavy.
   FE-levelling appears in tech criticism ("all VCs the same"),
   wellness ("all medicine the same"), etc. — generalization beyond
   political-class commentary NOT claimed.

## Corpus criteria (LOCKED)

### Positive class — false-equivalence levelling

Inclusion (ALL must hold):
1. Claim asserts that two or more named-categories are not meaningfully
   distinguishable.
2. The trivially-shared property is used to suppress / dismiss the
   distinction (rhetorical levelling), not to compare-and-contrast.
3. Lexical marker: «все политики одинаковы», «обе стороны одинаково
   плох», «нет принципиальной разницы», «по сути одно и то же», «в
   конечном счёте все равны», «и те и другие плохи»; EN «both sides
   equally bad», «all politicians are the same», «no real difference
   between».
4. Source: opinion / commentary text — NOT a research paper, court
   ruling, or balanced analysis.

Exclusion:
- Sentences in which two parties ARE compared on substantive merits
  (e.g. policy-comparison op-eds without dismissal framing).
- Direct quotes from named figures presented neutrally (reportage).
- Aphoristic summary ("plus ça change") without rhetorical leveling
  function in context.

### Negative class — analytical similarity discussion

Inclusion (ALL must hold):
1. Discusses similarities between two or more parties.
2. Does NOT use any of the FE-levelling lexical markers.
3. Provides substantive comparison or contrast.
4. Source: analytical journalism, policy commentary, scientific text,
   or public-domain literature.

## Source material

### EN positive (synthesis-canonical, paraphrasing op-ed framings)
- Common political commentary phrasings (left + right + center)
- Anti-establishment / accelerationist / horseshoe-theory variants

### EN negative (real public-domain / analytical)
- Public-domain comparative texts (Plutarch, Federalist Papers excerpts)
- Analytical political-science framings ("X and Y differ on policy A")

### RU positive (synthesis-canonical, paraphrasing op-ed framings)
- Common Russian-language political-commentary phrasings (left + liberal + conservative variants)

### RU negative (analytical journalism / scientific)
- Russian-language analytical text (Carnegie-style + scientific abstracts)

## Sample size targets

- Positive: 14 (RU 7, EN 7)
- Negative: 12 (RU 6, EN 6)
- **Total: 26**

Same small-N constraint as naturalization probe — directional, not
statistical-power-grade.

## Pre-registered metrics

- catch-rate with Wilson 95% CI
- FP-rate with Wilson 95% CI
- per-language breakdown
- explicit "synthesis-vs-public-domain" tagging on each entry

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| catch ≥ 60% AND FP ≤ 5% | Promote epistemology v0.3.0-pre.1 → release-candidate for FE detector (with synthesis caveat documented) |
| catch ≥ 40% AND FP ≤ 5% | Hold pre.1 status, document iter-2 plan (live-corpus probe required) |
| catch < 40% OR FP > 5% | Iter-2 mandatory; corpus-design vs detector-design analysis |

Even at catch ≥ 60%, the synthesis flag means **NOT** promotable to
"production-validated" status without a follow-up live-corpus probe
(per epistemology pack discipline; see `naturalizationProbeResult` for
the pattern of separating synthesis from live measurement).

## Reproducibility

`cd test-corpus/false-equivalence-2026-05-10 && node runner.js`
