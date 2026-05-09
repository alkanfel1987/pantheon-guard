---
type: real-corpus-probe-report
date: 2026-05-09
target_pack: news v0.5.0-pre.1
detectors_under_test: parikirtana_first_person_quantified_giving (RU+EN), parikirtana_responsible_self_label (RU)
catalogue_anchor: manu-apavada-parikirtana-4-236
pre_registration: PRE-REGISTRATION.md (locked before probe)
verdict: ITER-2 MANDATORY (catch 22.2% < 60% target) — but root cause is well-defined (narrow verb list + «более чем» regex bug), not detector-design failure
corpus_size: 35 docs (18 positive + 17 negative)
---

# Real-corpus probe report — parikīrtana detectors v0.5.0-pre.1

## TL;DR

| Metric | Result | Pre-reg target | Verdict |
|---|---|---|---|
| Catch (all positives) | **22.2% [9.0%, 45.2%]** | ≥60% | **MISS** |
| FP-rate (all negatives) | **0.0% [0.0%, 18.4%]** | ≤5% | **HIT** |
| Catch (in-scope only, n=5) | 80.0% [37.6%, 96.4%] | n/a | strong |
| Catch (out-of-scope, n=13) | 0.0% [0.0%, 22.8%] | n/a | by design |

**Verdict per pre-registered decision rule:** catch < 40% → **ITER-2 MANDATORY**.

**Root cause is clean:** detector verb list (`donated|invested|contributed|pledged|provided`) + RU stems (`помогл|поддержал|инвестировал|пожертвовал|вложил|выделил`) covers ≈40% of real-world parikīrtana voice. The other 60% uses verbs the detector doesn't target (signed/harvested/added/created/funded/собрали/создали/сохранили/etc.). FP-rate is excellent — when detector fires, it's correct.

**Honest framing:** v0.5.0-pre.1 stays pre.1. Iter-2 plan below has well-defined gap fixes + need for fresh held-out corpus (no tuning on this one).

## Corpus details

- **18 positive** samples — first-person quantified self-praise from 6 RU charity foundations + sustainability.google + gatesfoundation.org + 4 synthesis-canonical anchors (clearly tagged as test-author-written)
- **17 negative** samples — third-party journalistic reportage from fortune.com / theconversation.com / meduza.io / trends.rbc.ru
- **Deviation from pre-reg:** included nonprofit / charitable foundations after multiple corporate CSR pages 403'd (Salesforce, Microsoft Philanthropies, Patagonia). Nonprofit first-person quantified-charity voice is structurally identical to corporate parikīrtana — same Manu pattern. Documented and locked.

## Per-language

| Lang | Positive n | Catch | Negative n | FP |
|---|---|---|---|---|
| RU | 11 | 18.2% [5.1%, 47.7%] | 8 | 0% |
| EN | 7 | 28.6% [8.2%, 64.1%] | 9 | 0% |

EN has slightly higher catch because 2/7 EN positives are synthesis-canonical (controlled). Live-corpus EN catch is effectively 0% (Google Sustainability + Gates samples all out-of-scope by verb).

## In-scope vs out-of-scope analysis

The 18 positives split:

- **5 in-scope** (verb + structure match detector design): 4 hit, 1 miss → 80% catch
  - The 1 miss is P-RU-01: «За последние 20 лет мы помогли более чем 28 000 детей» — the regex accepts «более X» but NOT «более чем X». **One-line bug.**
- **13 out-of-scope** (parikīrtana voice but with verb outside detector list): 0 hit
  - sustainability.google: signed/harvested/added/created (5 samples)
  - gatesfoundation.org: funded (1 sample)
  - RU foundations: создали/запустили/сохранили/собрали/получили (7 samples)

The detector is **highly specific but narrowly scoped**. It catches what it targets, but its target is a small slice of the parikīrtana phenomenon.

## Iter-2 plan — well-defined gaps

| Gap | Fix | Difficulty |
|---|---|---|
| 1. «более чем X» phrasing | Regex: `(?:более\s+(?:чем\s+)?)?\d+` instead of `(?:более\s+)?\d+`. Add «свыше», «порядка», «over», «more than», «approximately» variants | trivial — 1-line regex change per detector |
| 2. RU verb stem narrow | Add: помога\w*, поддержива\w*, спонсиру\w*, финансиру\w*, оплатил\w*, направил\w*, перевели\|перечислил\w* | small — 5min, expand verb list |
| 3. EN verb list narrow | Add: gave/granted/gifted/funded/sponsored/financed/supported (with care for FP), backed | small |
| 4. Aggregated/non-canonical word order | «Более 30 000 детей, для которых мы X» — needs different detector type (clause-level, not strict pattern) | medium — separate detector class |
| 5. Implicit-subject RU | «Собрали 2 000 000 рублей» — verb form is 1pl but no «мы». Strict «мы» requirement misses these | medium — needs morphological tagging or relaxed pattern with FP risk |
| 6. Sustainability-class verbs | signed/harvested/added/created — may NOT be parikīrtana proper (no charity/giving framing). Decide whether to extend detector OR define separately as «virtue-signalling pack» | architectural — open question for v0.6 design |

**Recommended iter-2 scope:** fixes 1+2+3 (trivial+small). Re-build held-out corpus (≥30 fresh samples NOT seen by detector). Re-run probe. Promote to stable if catch ≥60%.

**Out of iter-2 scope (defer to v0.6+):** fixes 4+5+6 — these change detector architecture, not just patterns.

## Pre-reg compliance audit

| Pre-reg item | Status |
|---|---|
| Hypothesis (catch ≥60%, FP ≤5%) | catch MISS, FP HIT |
| Corpus size 28-36 | DELIVERED 35 |
| Source domains locked | partially deviated — corp pages 403'd, nonprofit added (documented) |
| Wilson 95% CI reported | DONE for all aggregates + per-language + per-scope |
| Selection bias acknowledged | YES — synthesis-canonical samples explicitly tagged |
| Decision rule pre-registered | YES — applied: catch <40% → iter-2 mandatory |
| Reproducibility | `node runner.js` from this dir produces identical results |

## What this probe demonstrates (independent of decision)

1. **Real-corpus probe genuinely surfaced detector narrowness.** Synthetic sanity (5/5 + 0/3 yesterday) suggested everything works. Real corpus revealed detector covers ~40% of pattern space. **Generalizable lesson: synthetic sanity is not predictive of real-corpus performance.** This is exactly why CLAUDE.md «empirical verification» rule exists.

2. **FP-rate is robust at 0%.** Across 17 third-party reportage samples (Bloomberg/Fortune/Meduza/RBC), the first-person verb-stem requirement effectively distinguishes PR voice from journalism voice. **Inhibitor for third-party attribution may be unnecessary** (was planned for stable promotion).

3. **«Более чем X» bug** would have been impossible to spot in author-written sanity fixtures (test-author would never write that variant when patterns are written for «более X»). Real corpus surfaced it on first run. Author=tester selection bias, demonstrated.

4. **Strategic insight:** parikīrtana is a SPECTRUM in real corpus:
   - Tier 1 (narrow, what we catch): «we donated $X / мы помогли N детям» — quantified-charity-voice
   - Tier 2 (verb-broader): «we funded thousands / we supported families»
   - Tier 3 (sustainability self-praise): «we signed N agreements / we created N projects» — virtue-signalling without charity-frame
   - Tier 4 (passive virtue display): «N families received our support» — third-person about own activity
   
   The Manu 4.237 strict reading covers only Tier 1+2 (dāna-parikīrtana). Tiers 3+4 require either expanded detector OR separate pack (sustainability self-display, virtue-signalling).

## Decision

- **HOLD news v0.5.0-pre.1** (no promotion to stable)
- **Update pack metadata** to reflect probe outcome (status: scaffold; verb-list narrow; iter-2 plan documented)
- **Iter-2 prerequisites**:
  - Build fresh held-out positive corpus (target N≥25, **no overlap with this one**, sourced from different foundations + corp PR pages)
  - Apply iter-2 fixes 1+2+3 above
  - Re-run probe; promote if catch ≥60% AND FP ≤5%
- **Do NOT tune on this corpus.** «Cycle-2 trap» protection per `~/CLAUDE.md` section 2.

## Reproducibility

```
cd C:/ProjectS/pantheon-guard/test-corpus/parikirtana-2026-05-09
node runner.js
```

Outputs:
- stdout: full probe report (this file's «individual verdicts» section + aggregate metrics)
- `results.json`: machine-readable summary
- corpus.json: locked corpus

## Files in this probe

| File | Purpose |
|---|---|
| `PRE-REGISTRATION.md` | Locked pre-probe — hypothesis, criteria, decision rule |
| `corpus.json` | 35 entries with id/lang/class/source/text/notes |
| `runner.js` | Probe runner with Wilson CI computation |
| `results.json` | Machine-readable summary |
| `REPORT.md` | This document — analysis + iter-2 plan |
