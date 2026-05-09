---
type: pre-registration
date: 2026-05-09
target_pack: epistemology v0.3.0-pre.1
detector_under_test: naturalization_fallacy + hasTemporalQualifier inhibitor
catalogue_anchor: ns-nityasama-5-1-35
purpose: Real-corpus probe to determine whether epistemology v0.3.0-pre.1 naturalization detector generalizes beyond hand-written sanity fixtures.
---

# Pre-registration — naturalization_fallacy real-corpus probe

**Locked BEFORE running detector.**

## Hypothesis

H₁: The `naturalization_fallacy` detector catches ≥60% of naturalization claims in opinion-style real text (RU + EN), with FP ≤5% on temporally-bounded analytical text. The `hasTemporalQualifier` inhibitor reduces FP on bounded historical/policy claims.

H₀: catch <60% OR FP >5% — promotion blocked, iter-2 needed.

## Corpus criteria (LOCKED)

### Positive class — naturalization framing

Inclusion (ALL must hold):
1. Claim of immutability / inherent nature of a behavior, institution, or social phenomenon
2. Lexical marker: «человеческая природа», «всегда так было», «во все времена», «нельзя изменить», «human nature», «always been this way», «inherent to», «throughout history»
3. Function: claim is used to suppress critique, argue against reform, or naturalize a contingent fact
4. Source: opinion / commentary / forum text — NOT scientific paper or balanced analysis

Exclusion:
- Sentences about literal biological human nature in scientific context (psychology, evolutionary biology) — unless used rhetorically to suppress critique
- Direct quotes from named historical figures who held naturalist views (these are reportage)

### Negative class — temporally-bounded analytical text

Inclusion (ALL must hold):
1. Discusses a similar topic-class (institutions, social phenomena, behaviors) BUT uses temporal qualifiers
2. Lexical markers of bounding: «в XX веке», «после реформы», «в период X-Y», «in the 1980s», «since the war», «before X»
3. Source: analytical journalism, policy paper, history article — NOT commentary

## Source domains (LOCKED)

### RU positive (opinion / forum / op-ed)
- echo.msk.ru / vc.ru / habr.ru opinion pieces
- aif.ru / kp.ru op-ed
- Reddit r/Russia / vk.com discussions (cautious)

### RU negative (analytical journalism / policy)
- carnegie.ru
- meduza.io analyses (not headlines)
- vedomosti.ru policy section

### EN positive (op-ed / opinion)
- nytimes.com opinion
- theguardian.com comment
- spectator.co.uk
- substack op-eds

### EN negative (analytical / historical)
- foreignaffairs.com
- economist.com analysis
- jstor / academic abstracts

## Sample size targets

- Positive: 12–15 (RU 6–8, EN 6–8)
- Negative: 12–15 (RU 6–8, EN 6–8)
- **Total: 24–30**

Same small-N constraint as parikīrtana probe — directional, not statistical-power-grade.

## Pre-registered metrics

- catch-rate with Wilson 95% CI
- FP-rate with Wilson 95% CI
- inhibitor effectiveness: FP-rate WITHOUT inhibitor vs WITH (compare detection-only and detection-AND-NOT-inhibited)
- per-language breakdown

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| catch ≥ 60% AND FP ≤ 5% | Promote epistemology v0.3.0-pre.1 → v0.3.0 stable for naturalization detector |
| catch ≥ 40% AND FP ≤ 5% | Hold pre.1 status, document iter-2 plan |
| catch < 40% OR FP > 5% | Iter-2 mandatory; corpus-design vs detector-design analysis |

## Honest scope (acknowledged BEFORE running)

1. **Selection bias** — same as parikīrtana probe: I am test author + corpus curator. Mitigation: explicit inclusion criteria, default-EXCLUDE on ambiguous.
2. **Naturalization is harder to label than parikīrtana**. The pattern can appear in:
   - Hostile rhetoric («women are naturally X — accept it»)
   - Naive conservatism («people have always behaved this way»)
   - Casual dismissal («c'est la vie / такая жизнь»)
   - Genuine empirical claims about durable phenomena (where naturalization is partially justified)
   For ambiguous cases, default to NEGATIVE class (don't claim positive without clear suppression-of-critique function).
3. **Inhibitor evaluation is a sub-hypothesis**. Even if catch hits target, inhibitor effectiveness must be inspected — does temporal-qualifier presence actually correlate with non-naturalization claims, or is my regex catching unrelated dates?
4. **Domain bias**: opinion/op-ed corpus is ENGLISH-internet-heavy. Russian corp/political discourse may follow different lexical patterns than my detector targets. Generalization beyond these domains NOT claimed.

## Reproducibility

`cd test-corpus/naturalization-2026-05-09 && node runner.js`
