# iter-3 LIVE probe report — false_equivalence_levelling, 2026-05-10

Pack: `epistemology` v0.3.0-pre.1 → ships as v0.3.0-pre.2 with this iter-3.
Detector: `false_equivalence_levelling` + `hasComparativeDivergence` inhibitor.
Catalogue anchors: `ns-avisesa-sama-5-1-23`, `ns-anityasama-5-1-32`.
Path: Option B (lexical broadening) per architectural decision 2026-05-10.

## tl;dr

| Probe | Catch | FP | Decision |
|---|---|---|---|
| Synthesis (synthesis probe corpus) | 100% [78.5, 100] (12/12) | 0% | preserved (regression) |
| LIVE Round-1 baseline (iter-2 patterns) | 0/6 | 0/12 | DEMOTE (recorded) |
| **LIVE iter-3 Round-1 (training)** | **4/6 = 66.7% [30.0, 90.3]** | **0/12 = 0% [0, 24.3]** | within target |
| **LIVE iter-3 Round-2 held-out FP-stress** | n/a (0 positives surfaced) | **0/8 = 0% [0, 32.4]** | within target |
| **LIVE iter-3 combined** | 4/6 (66.7% on training-only) | **0/20 = 0% [0, 16.1]** | **SHIP to v0.3.0-pre.2** |

**Tier status: 2 (held).** Tier 1 promotion BLOCKED — no held-out positives
surfaced in Round-2. Required for Tier 1: manual-curated held-out positive
corpus, ~10-15 verbatim FE-rhetoric samples from sources beyond Round-1.

## What iter-3 added (Option B execution)

Six new broad patterns + one inhibitor in `src/packs/epistemology.js`:

**Broad patterns** (FALSE_EQUIVALENCE_BROAD):
1. `Class 3` — `both (sides|parties|teams|camps) (are|have been) (dominated by|funded by|owned by|captured by|complicit in|beholden to|bought by|in the pocket of)` — extending canonical with non-canonical predicates.
2. `Class 1` — `both (the )?[A-Z]\p{L}+(s)? and (the )?[A-Z]\p{L}+(s)? (are|have been) (vested|funded|controlled|owned|dominated|captured|complicit|beholden|bought|in the pocket)` — Both [Named X] and [Named Y] form.
3. `Class 2` — `(political|governing|ruling) (establishment|class|elite)|uniparty|the swamp|deep state` + `(will (never|always)|has always|won't|cannot|never (will|has|have)|always (has|have))` — collective-leveling subject + perpetual-claim verb.
4. `Class 4` — `(purport|claim|pretend) to oppose [^.]{0,120} (change (their|its) (mind|minds|tune)|reverse (themselves|course|position)|abandon (their )?principles|do the opposite)` — pretend-to-oppose flip.
5. `Class 5` — `(opposition|stance|position|principles?) (magically|conveniently|suddenly|always)? (transforms? into|reverses? to|flips? to|becomes?) (vehement|enthusiastic|fervent)? (support|backing|approval|advocacy|cheerleading)` — opposition transforms into support.
6. RU collective-leveling parallel — «политическая элита|правящ\* (класс|элита)|номенклатура|обе (сторон|сил)\*» + «всегда|никогда не|по сути».

**Inhibitor** (`hasComparativeDivergence`): suppresses broad patterns when text
contains substantive divergence markers («differ», «while X..., Y», «however»,
«in contrast», «однако», «отличаются», «расходятся», etc.). Canonical patterns
(narrow, specific FE leveling) are NOT suppressed.

## Cycle-2 trap protection

Round-1 was the FN-audit corpus that surfaced the 6 FN classes. iter-3 patterns
were designed from these FNs. Therefore Round-1 catch is **implementation
verification, not generalization claim**.

Round-2 was the attempted held-out validation:

- 7 fetches against new sources (caitlinjohnst.one redirected, racket.news/p
  404, mtracey.net empty, aaronmate.substack 404, foreignaffairs paywalled,
  economist CSP-blocked, counterpunch dated archives mostly preview-only).
- 0 NEW positives surfaced in fetchable open-web FE-rhetoric.
- 8 NEW negatives surfaced (Brookings supreme court analysis, Federalist 10,
  Federalist 78, CounterPunch Pity Billionaire) for FP-stress.

The 0-positive Round-2 outcome itself is an empirical finding:

> Open-web FE-rhetoric in non-paywalled fetchable sources is sparser than
> the genre-narrative ("substack op-eds full of uniparty framing")
> suggests. Either (a) it is genuinely rarer than claimed, or (b) the
> highest-density sources (Reddit r/Centrism, Telegram political channels,
> paywalled substacks) are inaccessible to this fetch infrastructure.

For Tier 1 promotion, manual-curated held-out positives are required.
This is owner-involvement work (selecting 10-15 verbatim samples), not
something a fetch loop can do alone.

## Per-FN class outcome on Round-1

| Live FN | Class | iter-3 result |
|---|---|---|
| P-EN-R1-01 «Both Democrats and Republicans are vested in» | Class 1 | ✅ caught |
| P-EN-R1-02 «political establishment will initiate» | Class 2 边缘 | ❌ miss (acceptable — verb-list narrow on purpose; broadening would FP on neutral analytical mention) |
| P-EN-R1-03 «both parties are dominated by war pigs» | Class 3 | ✅ caught |
| P-EN-R1-04 «purport to oppose ... change their minds» | Class 4 | ✅ caught (after window 80→120 fix) |
| P-EN-R1-05 «opposition magically transforms into vehement support» | Class 5 | ✅ caught |
| P-EN-R1-06 «Trump joined Obama in demanding...» | out-of-scope | ❌ miss (sentence-level extraction loses article-level FE — design limit, not pattern bug) |

## FP audit (combined 20 negatives, 0 fires)

Held-out FP-stress passed cleanly. Particularly noteworthy negatives that
might have FP'd without inhibitor or careful narrow patterns:

- **N-EN-R1-05 Brookings**: «Both leaders will likely announce Chinese
  purchases of American products» — has «both leaders» but pattern requires
  abstract container `(sides|parties|teams|camps)`, so silent. ✓
- **N-EN-R1-04 Brookings**: «defined more by an absence of friction than
  any affirmative agenda» — «absence» but Vietnam-era no-resemblance to FE.  ✓
- **N-EN-R1-06 CounterPunch**: «A weak Democratic Party opened the gates for
  the Republican Party» — names parties + critique but no leveling-predicate
  on EITHER, so pattern silent. ✓
- **N-EN-R1-03 Reason**: «Wall Street firms see X. Progressives see Y. Some
  conservatives see Z.» — three-stakeholder enumeration, NOT leveling. ✓
- **N-EN-R2-08 CounterPunch**: «Under capitalism, the underclass has
  always been permanent, but under AI Capitalism, the permanent underclass...»
  — mentions «always been», could trigger naturalization (different
  detector); does NOT trigger FE because no «both/all» container. ✓
- **N-RU-R1-04 Vedomosti**: «продемонстрировало глубину раскола между
  различными частями некогда единого западного мира» — has «различными»
  which is exactly the divergence-marker the inhibitor recognizes. ✓

## Decision (per pre-reg rule)

`Round-1 catch ≥ 4/6 AND combined FP ≤ 5% → iter-3 patterns SHIP to
v0.3.0-pre.2; Tier remains 2`.

**Concrete actions:**

1. iter-3 patterns are committed in `src/packs/epistemology.js` (already done).
2. Pack version semantically advances pre.1 → pre.2 (not yet bumped in code —
   awaiting owner sign-off on whether to bump or stay pre.1).
3. EVIDENCE-TIER updated: `false_equivalence_levelling` `Tier 2 — DEMOTE` →
   `Tier 2 — iter-3 broadened (canonical 100% synthesis + iter-3 broad 4/6 LIVE training-set + 0% FP combined N=20)`.
4. PROBE-DEBT updated: live-positive corpus collection becomes new HIGH-priority
   item, owner-involvement.
5. CHANGELOG entry: iter-3 broadening + inhibitor under [Unreleased].

## Iter-3 NOT a complete answer

Honest acknowledgment:

- 4/6 is implementation verification, not validated catch number.
- 0 held-out positives means no generalization claim.
- The 2 acceptable misses (Class-2 边缘 + Class-6 context-loss) reveal
  semantic boundaries regex cannot cross without ML.
- The "0 positives in 7 Round-2 fetches" finding suggests FE-rhetoric
  may be genuinely rarer in open-web than synthesis-corpus framing
  implied — which could mean Option A (accept narrow scope + reposition)
  is more honest than Option B's "broaden patterns to catch more".

Nevertheless: iter-3 lifted catch 0% → 66.7% on training while holding
FP 0% on combined held-out 20 negatives. That is a real, documented
improvement. Whether it justifies pursuing Option C (semantic classifier)
or settles into Option A (narrow + reposition) is a product-strategy
decision, not a pattern-engineering one.

## Reproducibility

```
cd test-corpus/false-equivalence-LIVE-iter3-2026-05-10 && node runner.js
```

Corpus is frozen verbatim. WebFetch may not retrieve same content later —
`corpus.json` is the audit artifact.
