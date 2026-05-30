# Bad-results revisited 2026-05-13

**Pack:** epistemology v0.3.0-pre.4
**Trigger:** User request «проверим этический фильтр на тех моментах где он показывал плохие результаты»
**Methodology:** Re-run historical probes против current detector; honest comparison with memory baseline.

## Three historical bad-result cases

### Case 1 — `false_equivalence_levelling` LIVE 0/6 collapse (2026-05-10)

**Historical baseline:** v0.3.0-pre.1, corpus from `test-corpus/false-equivalence-LIVE-2026-05-10/`.

| Metric | Historical (2026-05-10) | Current (2026-05-13) | Δ |
|---|---|---|---|
| Catch rate | **0.0%** (0/6) — DEMOTE | **66.7%** (4/6) — PROMOTE Tier 1 | **+66.7pp** |
| FP rate | 0.0% (0/12) | 0.0% (0/12) | unchanged |
| Generalization gap (synthesis − live) | 100pp | 33.3pp | -66.7pp |
| Pre-reg decision | DEMOTE (synthesis misleading) | PROMOTE → Tier 1 (live-validated EN) | inverted |

**What fixed it:** iter-3 lexical broadening (2026-05-10 already in pack pre.1+):
- Class 1 — «Both [Named X] and [Named Y] vested/funded/dominated» (caught P-EN-LIVE-01)
- Class 3 — «both parties dominated by» non-canonical leveling (caught P-EN-LIVE-03)
- Class 4 — «purport to oppose ... change their minds» with 120-char window (caught P-EN-LIVE-04 after off-by-one fix)
- Class 5 — «opposition magically transforms into support» (caught P-EN-LIVE-05)
- `hasComparativeDivergence` inhibitor — 0 FP preserved

**Remaining FNs (out-of-scope by design):**
- P-EN-LIVE-02 «political establishment will initiate» — requires Class 2 perpetual-claim verb («will never/always»); single «will initiate» insufficient. Acceptable narrow scope.
- P-EN-LIVE-06 «Trump demanded FISA renewed... joining Obama+Biden» — single-actor sentence, FE meaning from article-level context. Documented as out-of-scope sentence-level detection limit.

**Status:** the case that triggered the most painful CLAUDE.md `feedback_synthesis_zero_live_anchor` lesson is now **PROMOTE Tier 1 EN candidate**.

### Case 2 — A.1 learning-cycle replication collapse (2026-05-08)

**Memory baseline** (`project_guard_real_oos_collapse`):
- cycle-1 N=119 recall = 5.3% (collapse)
- cycle-2 overfit attempt = 0% replication (cycle-2 trap)
- A.1 family-pattern fix: replication 0% → **57.1%** + frozen 84.2% maintained + FP 0.8%

**Current run (pre.4, 2026-05-13):** `examples/learning-cycle-3domains-replication-runner.js`:
- N=40 replication corpus
- recall = **57.1%** (8/14) — exactly matching memory baseline
- accuracy = 85.0%
- **FP-rate = 0% (0/26)** — clean

Per-domain:
- LAW: 100% accuracy / 0% FP (no catches expected; no false-fire)
- JOURNALISM: 60% recall / 0% FP
- INFLUENCER: 55.6% recall / 0% FP

**Status:** A.1 family-pattern fix HELD through pre.2 + pre.3 + pre.4. Zero regression from adding `pseudo_technical_simulacrum` (pre.2) and `morphic_field_simulacrum` (pre.4). Memory baseline preserved.

### Case 3 — Cross-domain FP risk (new detectors on legacy corpus)

**Concern:** new detectors `pseudo_technical_simulacrum` (pre.2) and `morphic_field_simulacrum` (pre.4) might false-fire on political content (different scope, but lexical overlap risk possible).

**Run:** `test-corpus/cross-domain-fp-check-2026-05-13.mjs` against false-equivalence LIVE corpus (N=18, political FE content).

| Detector | Raw fires | After inhibitor (true FP) |
|---|---|---|
| `pseudo_technical_simulacrum` (quantum) | 0/18 | 0/18 |
| `morphic_field_simulacrum` (Sheldrake) | 0/18 | 0/18 |

**Status:** ✓ Clean. Zero cross-domain false-positives. Detector scope discipline confirmed — quantum/morphic vocabulary class genuinely distinct from political FE class.

## What this means

| Case | Honest interpretation |
|---|---|
| FE LIVE | The most painful 2026-05-10 failure ("synthesis 100% / live 0% / 100pp gap") is now ALSO the most successful recovery example. iter-3 broadening worked. Detector is live-validated on EN. RU still pending (corpus didn't include RU positives originally). |
| A.1 replication | Holds across 3 major detector additions (pre.2, pre.3, pre.4). No regression. Memory baseline reproducible. |
| Cross-domain FP | New detector additions don't break legacy detector scope. Inhibitor architecture (named-source + formal-physics-context + mainstream-embryology-context) is robust. |

## What did NOT improve (honest scope)

These detectors were ONLY validated on synthesis (same-corpus iter-2 fit) — no fresh live probe was run on them. Per CLAUDE.md cycle-2 trap discipline:

| Detector | Status | What's needed for promotion |
|---|---|---|
| `naturalization_fallacy` | EN release-candidate (live probe 63.6% N=11 done 2026-05-09); **RU live probe pending** | 8-10 RU live-corpus op-ed positives + fresh held-out probe |
| `absence_argument` | Synthesis 100% post-fix (same-corpus); **NO live probe yet** | Held-out positive + negative corpus, fresh probe |
| `anecdotal_override` | Synthesis 100% post-fix (same-corpus); **NO live probe yet** | Held-out corpus, fresh probe |
| `silence_as_concession` | Synthesis 100% post-fix (same-corpus); **NO live probe yet** | Held-out corpus, fresh probe |
| `pseudo_technical_simulacrum` (pre.2/pre.3) | MIXED — synthesis + small-N (N=3) real-text catch | N≥10 verbatim Dispenza primary (owner-time) |
| `morphic_field_simulacrum` (pre.4) | SCAFFOLD+CYCLE-2-RISK — patterns derived from same Sheldrake corpus used for 5/5 catch | Held-out Sheldrake works (A New Science of Life, Presence of the Past) |

## What I did NOT re-check (out-of-scope this session)

- `news` pack v0.5.0-pre.1 detectors (parikīrtana, etc.) — separate pack, different scope
- `healthcare` pack v0.1.4 — production stable, no known regressions
- `spiritual-inflation` pack v0.0.1-scaffold — was synthesis-only originally per its own metadata, status documented in pack file
- `opacity`, `ai-security`, `semantic` packs — outside this session's scope

## Full regression check

`node --test "test/*.test.js"` → **375/375 pass** as of pre.4. Zero broken tests from 3 rounds of additions:
- Round 1 (pre.2): pseudo_technical_simulacrum + 17 sanity tests
- Round 2 (pre.3): bug-fixes only, no new tests
- Round 3 (pre.4): morphic_field_simulacrum + 15 sanity tests

Original test count before sessions: 345 → current 375 (+30 new sanity tests, 0 regressed)

## Conclusions

1. **The detector showed bad results in May 2026 — that's documented, and the fixes worked.** Specifically FE 0/6 → 66.7% is reproducible 3 days after iter-3 broadening was committed.

2. **No regression from recent additions.** A.1 baseline (57.1%) holds, full regression 375/375 clean, cross-domain FP 0/18.

3. **Honest scope still applies.** 4 detectors remain in synthesis-only status (naturalization RU + absence + anecdotal + silence). New quantum/morphic detectors are MIXED/SCAFFOLD respectively. None of these are promoted to Tier 1 stable beyond what's documented per detector.

4. **The methodology (synthesis-as-validation = cycle-2 trap) lesson is INTERNALIZED in the codebase.** Every new detector since pre.1 carries explicit SCAFFOLD/SYNTHESIS-ONLY flags in pack metadata until held-out probe runs. Foundation level discipline preserved.

## Next steps (owner-time)

1. **Manual-curated held-out corpus for 4 synthesis-only detectors** — bring each through fresh probe. Highest-priority candidates per detector are documented in respective `test-corpus/<detector>-2026-05-10/REPORT.md` files.

2. **RU live corpus** for naturalization (the one detector with EN live + RU pending) — would unlock bilingual stable claim.

3. **Sheldrake held-out** для morphic_field_simulacrum pre.5 promotion.

4. **Dispenza primary-text** для pseudo_technical_simulacrum v0.3.0 stable.

All four are owner-involvement tasks (corpus acquisition is non-autonomous). Implementation infrastructure (runners, decision rules, evidence tier framework) is already in place.

---

*Reproducibility:*
- FE LIVE: `cd test-corpus/false-equivalence-LIVE-2026-05-10 && node runner.js`
- A.1 replication: `node examples/learning-cycle-3domains-replication-runner.js`
- Cross-domain FP: `node test-corpus/cross-domain-fp-check-2026-05-13.mjs`
- Full regression: `node --test "test/*.test.js"`

*Дата:* 2026-05-13
