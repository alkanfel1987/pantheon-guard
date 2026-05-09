---
type: pre-registration
date: 2026-05-09
target_pack: news v0.5.0-pre.1
detector_subset: parikirtana_first_person_quantified_giving (RU+EN), parikirtana_responsible_self_label (RU)
catalogue_anchor: manu-apavada-parikirtana-4-236
purpose: Real-corpus probe to determine whether news v0.5.0-pre.1 parikīrtana detectors generalize beyond hand-written sanity fixtures. Required before promotion to v0.5.0 stable per ~/CLAUDE.md «empirical verification» rule.
---

# Pre-registration — parikīrtana real-corpus probe

**Locked BEFORE running detector. Any deviation must be explicitly documented in the post-run report.**

## Hypothesis

H₁: The 3 parikīrtana detectors in news v0.5.0-pre.1 catch ≥60% of first-person quantified self-praise in real corporate CSR / PR text on a held-out corpus, with FP-rate ≤5% on third-party news reportage of equivalent corporate activities.

H₀ (null): catch <60% OR FP >5% — promotion blocked, iter-2 needed.

## Corpus criteria (LOCKED before sourcing)

### Positive class — target = first-person quantified self-praise

Inclusion criteria (ALL must hold):
1. Author voice = first-person plural ("мы / наша / our / we / its")
2. Quantified beneficiary action with explicit number (rubles/$/families/people/projects)
3. Source domain = corporate CSR / "About / Impact" / "Sustainability" page OR official company press release

Exclusion criteria:
- Third-party article quoting company (even if quote contains "we donated…")
- Generic mission statements without quantified action
- Personal blog posts or individual claims

### Negative class — clean third-party reportage

Inclusion criteria (ALL must hold):
1. Author voice = third-person ("компания пожертвовала / Microsoft donated")
2. Subject matter = corporate giving / CSR action (matching positive-class topic)
3. Source domain = independent news outlet (Reuters / Bloomberg / Kommersant / RIA / TASS / FT)
4. Attribution markers present ("сообщает / according to / said in a statement")

## Source domains (LOCKED — diversification per CLAUDE.md replication rule)

### RU positive (corporate CSR pages, first-person)
- sber.ru / sberbank.ru — about / sustainability
- gazprom.ru — sustainability / social
- lukoil.ru — social / charity
- vtb.ru — about / responsibility
- yandex.ru — services / about (CSR)
- ozon.ru — about (CSR)

### RU negative (third-party reportage)
- ria.ru
- tass.ru
- kommersant.ru
- vedomosti.ru

### EN positive (corporate CSR pages, first-person)
- salesforce.com — about / impact
- microsoft.com — giving
- google.com / about.google — sustainability / impact
- patagonia.com — activism / responsibility
- ibm.com — responsibility
- hubspot.com — impact / careers (CSR section)

### EN negative (third-party reportage)
- reuters.com
- bloomberg.com
- ft.com
- bbc.com / bbc.co.uk
- cnbc.com

## Sample size targets

- Positive RU: 8–10
- Positive EN: 8–10
- Negative RU: 6–8
- Negative EN: 6–8
- **Total target: 28–36 documents**

This is a small probe by design — Wilson CI is wide at small N. The point is to check **direction of evidence** and unblock decision (promote / iterate / abandon).

## Pre-registered metrics

For each detector subset:
- catch-rate = TP / (TP + FN), reported with **Wilson 95% CI**
- FP-rate = FP / (FP + TN), reported with **Wilson 95% CI**
- per-language breakdown (RU / EN)

Aggregate (all 3 detectors combined OR-style):
- catch-rate aggregate
- FP-rate aggregate

## Pre-registered decision rule

| Outcome | Decision |
|---|---|
| catch ≥ 60% AND FP ≤ 5% (point estimates) | Promote news v0.5.0-pre.1 → v0.5.0 stable |
| catch ≥ 40% AND FP ≤ 5% | Hold pre.1 status, document iter-2 plan with specific gaps |
| catch < 40% OR FP > 5% | Document corpus-design vs detector-design root cause; iter-2 mandatory |

## Honest scope (acknowledged BEFORE running)

1. **Selection bias risk**: I am the test author AND the corpus curator. Mitigation:
   - Inclusion / exclusion criteria locked above
   - For ambiguous docs, default to EXCLUDE rather than tag-by-judgment
   - Each doc gets ≤2 sentences extracted; full paragraph context preserved separately
2. **Small N**: 28–36 docs gives Wilson CI ±~15-20pp at point estimate 0.5. Decision will be directional, not statistical-power-grade.
3. **Domain bias**: Locked-in corp domains may not reflect SMB / startup / non-profit voice. Generalization beyond these domains NOT claimed.
4. **Russian morphology**: News pack RU regex uses W_STAR suffix wildcards (per cycle-2 lesson «explicit suffix lists, not W_STAR» — but in this case, parikīrtana detectors USE W_STAR for verb stems like `помогл`, `инвестировал`). FP risk to audit.
5. **Inhibitor not yet wired**: pre.1 lacks third-party-attribution inhibitor. If FP > 5%, iter-2 will add it.

## Reproducibility

After probe completes:
- `corpus.json` — full corpus with id / url / lang / class / text / source_domain
- `runner.js` — single-command runner
- `REPORT-*.md` — full results with Wilson CI + per-source breakdown + audit trail

Expected reproducibility: `cd test-corpus/parikirtana-2026-05-09 && node runner.js`.
