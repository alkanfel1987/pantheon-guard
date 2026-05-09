---
type: real-corpus-probe-report
date: 2026-05-09
target_pack: epistemology v0.3.0-pre.1
detector_under_test: naturalization_fallacy + hasTemporalQualifier inhibitor
catalogue_anchor: ns-nityasama-5-1-35
pre_registration: PRE-REGISTRATION.md
verdict: PROMOTE_PARTIAL — EN-validated (N=11 live corpus, catch 63.6%); RU evidence is synthesis-only, deferred to iter-2 with live RU corpus
corpus_size: 27 docs (15 positive + 12 negative)
---

# Real-corpus probe report — naturalization_fallacy detector v0.3.0-pre.1

## TL;DR

| Metric | Result | Pre-reg target | Verdict |
|---|---|---|---|
| Catch (effective, all positives) | **73.3% [48.0%, 89.1%]** | ≥60% | **HIT** |
| FP-rate (effective, all negatives) | **0.0% [0.0%, 24.3%]** | ≤5% | **HIT** |
| Catch (in-scope only, n=13) | 84.6% [57.8%, 95.7%] | n/a | strong |
| Catch (out-of-scope, n=2) | 0.0% [0.0%, 65.8%] | n/a | by design |
| EN catch (live corpus only, n=11) | **63.6% [35.4%, 84.8%]** | ≥60% | hit but wide CI |
| RU catch (synthesis-canonical only, n=4) | 100% [51.0%, 100%] | n/a | **artificial** — see caveat |

**Verdict per pre-reg decision rule:** catch ≥60% AND FP ≤5% → promote.

**BUT honest caveat:** 4/15 positives are synthesis-canonical (test-author-written), all RU. Real-corpus EN evidence is the only genuine validation. Per pre-reg «honest scope» section, this constrains the promotion claim:

**Refined verdict: PROMOTE PARTIAL** — `naturalization_fallacy` detector validated for EN on live corpus (N=11, catch 63.6%, FP 0%). RU evidence is synthesis-only and does not constitute external validation. Iter-2 should add RU live-corpus probe before claiming bilingual stability.

## Corpus details

- **15 positive** samples: 11 EN live (Townhall op-ed, Current Affairs paraphrases, tutor2u/alevelpolitics conservative-philosophy summaries) + 4 RU synthesis-canonical (test-author-written, clearly tagged)
- **12 negative** samples: 7 EN (Wikipedia Post-WWII economic + Britannica Russia post-Soviet) + 5 RU (historyrussia.org reform analyses) — all with explicit temporal qualifiers
- **Deviation from pre-reg:** RU live-corpus positive sourcing failed (vc.ru article deleted; mainstream RU outlets either paywalled or did not surface clean naturalization framing in queries). Documented in corpus.json `_meta.deviation_from_prereg`. Synthesis samples included only to test detector mechanics on RU, NOT as evidence for RU generalization claim.

## In-scope vs out-of-scope analysis

13 of 15 positives were tagged in-scope (lexical marker matches detector pattern list). Of those 13:
- **11 caught** (catch on in-scope = 84.6%)
- **2 missed** (P-EN-03 «inherently selfish… laws of nature that cannot be changed»; P-EN-08 «inherent in humans»)

The 2 in-scope misses point to gaps in the regex pattern list:
- «inherently» (adverb form) is NOT in detector — only «inherent in/to» pattern
- «laws of nature that cannot be changed» — a longer naturalization formula not in detector

2 out-of-scope positives (P-EN-02 «eternally usurped», P-EN-06 «genetically inborn») correctly did NOT fire — they use naturalization framing with lexical markers outside the detector pattern list. These are **out of scope**, not detector failures.

## Per-language

| Lang | Positive n | Catch | Negative n | FP | Notes |
|---|---|---|---|---|---|
| EN | 11 (all live) | 63.6% [35.4%, 84.8%] | 7 | 0.0% | **genuine validation** |
| RU | 4 (all synthesis) | 100% [51.0%, 100%] | 5 | 0.0% | **synthetic — does not generalize** |

**RU synthesis catches by construction** because samples were written to match detector patterns. Real-world RU catch is **unknown** until live RU corpus is sourced.

## Inhibitor analysis (`hasTemporalQualifier`)

| Sample class | Inhibitor fired | Effect |
|---|---|---|
| Positive (n=15) | 0/15 (0% false suppression) | inhibitor never falsely suppresses true positives |
| Negative (n=12) | 3/12 (25% true suppression) | inhibitor adds redundant safety on bounded historical text |

**Finding: inhibitor is redundant on this corpus.** The naturalization patterns themselves do not fire on temporally-qualified text because temporal markers replace the «always/eternal» framing. Inhibitor never had to suppress a raw-positive on negative samples — they were already cond=false.

**Implication:** inhibitor is defensive (cheap insurance against future detector pattern expansion) rather than load-bearing in v0.3.0. Keep it.

## Pre-reg compliance audit

| Pre-reg item | Status |
|---|---|
| Hypothesis (catch ≥60%, FP ≤5%) | **HIT both** |
| Corpus size 24-30 | DELIVERED 27 |
| Source domains locked | partially deviated — RU sources sparse, synthesis added with explicit tagging |
| Wilson 95% CI reported | DONE all aggregates + per-language + per-scope + inhibitor |
| Selection bias acknowledged | YES — synthesis samples explicitly tagged |
| Decision rule pre-registered | YES — applied with HONEST refinement (PROMOTE_PARTIAL not PROMOTE_FULL) |
| Reproducibility | `node runner.js` from this dir |

## Honest framing — what this probe DOES and DOES NOT establish

**Establishes:**
- `naturalization_fallacy` detector works on live EN op-ed / commentary text at 63.6% catch (N=11, CI [35.4%, 84.8%])
- FP-rate on temporally-bounded EN+RU historical analysis is 0% (N=12)
- `hasTemporalQualifier` inhibitor never falsely suppresses true positives
- The 5-marker EN pattern list catches the most common surface forms

**Does NOT establish:**
- RU live-corpus performance (corpus is synthesis-only)
- Performance on naturalization-adjacent patterns NOT in detector list (eternally / genetically inborn / inherently)
- Performance on long composite phrases («laws of nature that cannot be changed»)
- Cross-domain robustness (this corpus is op-ed-heavy, not forum / social-media / political-speech)

## Iter-2 plan for full v0.3.0 stable promotion

| Gap | Fix | Difficulty |
|---|---|---|
| 1. RU live-corpus validation absent | Source 8-10 RU op-ed positives from echo-style commentary, vc.ru opinions (when available), kp.ru/aif.ru columns. Iter-2 corpus must NOT overlap this one | small — corpus sourcing only, no detector change |
| 2. «inherently» adverb missing | Add `\binherently\s+(selfish|prone|disposed|aggressive|...)\b` pattern | trivial |
| 3. «genetically inborn» / «laws of nature» phrases | Add 2-3 long-phrase patterns | trivial |
| 4. Cross-domain robustness | Add forum / social-media samples to iter-2 corpus | corpus-only |

## Decision

- **PROMOTE PARTIAL: `naturalization_fallacy` detector individually graduates from pre.1 to release-candidate status for EN.** Pack remains v0.3.0-pre.1 overall (other 4 detectors not yet probed).
- **Pack metadata updated** to reflect per-detector probe status (naturalization passed EN; others pending).
- **Iter-2 prerequisites for full v0.3.0 stable**: RU live-corpus probe (separate fresh corpus, NOT this one — cycle-2 trap protection).
- **Other 4 detectors** (false_equivalence_levelling, absence_argument, anecdotal_override, silence_as_concession) remain pre.1, scaffold-status, awaiting their own probes.

## Reproducibility

```
cd C:/ProjectS/pantheon-guard/test-corpus/naturalization-2026-05-09
node runner.js
```

Outputs: stdout report + results.json (machine-readable summary).
