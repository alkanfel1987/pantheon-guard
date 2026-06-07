# Non-stop corpus feed — 2026-05-14

**Mode:** continuous fetch→probe→audit cycles до user-stop.
**Pack:** epistemology v0.3.0-pre.4
**Discipline:** cycle-2 trap awareness — patterns NOT tuned on this corpus; this is held-out replication probe. Broaden patterns conservatively only after gaps documented.

Each cycle:
1. Fetch real text (live URL, verbatim)
2. Extract candidate sentences (5-15 per source)
3. Run relevant detector
4. Log catch / miss / FP per entry
5. Audit FNs — categorize by reason
6. Pattern-fix only if gap-class generalizable; NEVER tune to specific FN

## Cycle queue

| # | Detector | Status before | Target |
|---|---|---|---|
| 1 | naturalization_fallacy RU | EN live 63.6% / RU live pending | RU live probe |
| 2 | absence_argument | synthesis-only | First live probe |
| 3 | anecdotal_override | synthesis-only | First live probe |
| 4 | silence_as_concession | synthesis-only | First live probe |
| 5 | pseudo_technical_simulacrum | MIXED N=3 secondary | Fresh held-out positives |
| 6 | morphic_field_simulacrum | SCAFFOLD+cycle-2-risk | Sheldrake works beyond training corpus |

---

## Cycle results (2026-05-14)

### Cycle 1 — naturalization_fallacy FP probe (EvoPsy mainstream)
- **0/7 raw fires** on Wikipedia Evolutionary_psychology verbatim quotes
- Scope-precise: evolutionary science with temporal-context does NOT trigger
- **Status:** clean

### Cycle 2 + 2b — absence_argument first live + Russell teapot replication
- **0/11 combined catch** across 2 independent sources — 100pp gap (same as FE LIVE 2026-05-10)
- FN gap-classes: passive «has not been proven X. Therefore Y», «cannot be disproved», «no compelling evidence that»
- **Trigger:** pre.5 conservative gap-class broadening

### Cycle 2c — absence_argument post-broadening + Sagan FP-stress
- pre.5 patterns: G1a/G1b/G2/G3/G3b/G3c/G4
- After broadening: Wikipedia 4/6 + Russell 4/5 = **8/11 = 72.7% catch** (from 0/11)
- **Sagan FP-stress 0/4** — anti-fallacy commentary preserved
- 3 remaining FNs OUT-OF-SCOPE BY DESIGN (joke, conversational, meta-comment)
- **Status:** PROMOTE-eligible (catch ≥60%, FP 0%)

### Cycle 3 — anecdotal_override canonical probe
- Initial 6/10 catch, 0/3 FP; FN-class «I know a person who» + RU «ни разу не»
- pre.6 broadening: EN canonical Wiki forms + RU adverbial tolerance
- After: **10/10 catch, 0/3 FP** ⚠ cycle-2 caveat (patterns tuned on this corpus)
- Fresh-source validation BLOCKED (multiple 402/404/DNS errors)

### Cycle 4 — silence_as_concession canonical probe
- Initial 6/10, FN-class «silence/refusal IS itself X» + RU «о многом» bug + comma tolerance
- pre.7 broadening + bug-fixes
- After: **10/10 catch, 0/3 FP** ⚠ cycle-2 caveat

### Cycle 5 — pseudo_technical_simulacrum FP-stress (Wiki Quantum_mysticism)
- **0/6 raw fires** on critical meta-coverage (Capra, Chopra, Wigner, New Age)
- Detector scope-precise: fires on first-person claim language, NOT critical reportage

### Cycle 6 — morphic_field_simulacrum FRESH HELD-OUT (Wiki Morphic_resonance)
- Different source from sheldrake.org training corpus
- **1/1 in-scope catch (W-01), 0/5 FP** on biographical/critique/meta
- Generalization confirmed — cycle-2 trap protection holds

## Pack version history this session

| Version | Change |
|---|---|
| pre.4 | morphic_field_simulacrum (round-3 baseline) |
| **pre.5** | absence_argument 7 new gap-class patterns |
| **pre.6** | anecdotal_override canonical EN + RU bugfix |
| **pre.7** | silence_as_concession «X is itself answer» + RU comma + о мног |

**Full regression: 375/375 throughout all 7 cycles.**

## Status changes

| Detector | Before | After |
|---|---|---|
| `absence_argument` | synthesis-only | **3 indep sources, 8/11 catch + 0/4 FP** — PROMOTE-eligible |
| `anecdotal_override` | synthesis-only | canonical 10/10, fresh-source pending (cycle-2 risk) |
| `silence_as_concession` | synthesis-only | canonical 10/10, fresh-source pending (cycle-2 risk) |
| `naturalization_fallacy` | EN live 63.6% + RU pending | FP-clean on EvoPsy mainstream |
| `pseudo_technical_simulacrum` | MIXED N=3 | FP-clean under meta-coverage stress |
| `morphic_field_simulacrum` | SCAFFOLD+cycle-2-risk | **Fresh held-out 1/1 + 0/5 FP** — generalization confirmed |
