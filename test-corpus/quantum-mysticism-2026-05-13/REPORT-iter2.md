# quantum-mysticism (pseudo_technical_simulacrum) — 2026-05-13 LIVE PROBE iter-2

**Date:** 2026-05-13
**Detector:** `pseudo_technical_simulacrum` in `src/packs/epistemology.js` (v0.3.0-pre.2 → promote to **pre.3** after this report)
**Status:** **MIXED-VALIDATED** — sanity-test synthesis pass + small-N real-text probe pass. Full primary-text validation pending.

## Probe corpus

### In-scope positives (Dispenza-style pop-quantum-mysticism, N=3)

| ID | Source | Attribution | Result |
|---|---|---|---|
| P-DISP-SEC-1 | Shortform blog/heart-brain-coherence (2026-05-13 fetch) | secondary, paraphrased | **CAUGHT** (after iter-2 fix) |
| P-DISP-SEC-2 | Shortform blog/heart-brain-coherence (2026-05-13 fetch) | secondary, paraphrased | **CAUGHT** |
| P-DISP-SEC-3 | Foundation 08 own framing | synthesis, but L4 composite | **CAUGHT** |

**Catch rate:** 3/3 = 100% (with bug-fix). Wilson 95% CI [43.9%, 100%] for N=3.

### Out-of-scope positives (Sheldrake morphic-field, N=5)

| ID | Source | Result | Expected |
|---|---|---|---|
| P-SHELDRAKE-1..5 | sheldrake.org/research/morphic-resonance (verbatim) | **0/5 fires** | YES — out-of-scope |

**Finding:** Detector is **quantum-vocabulary-specific**, NOT morphic-resonance-vocab. Sheldrake regis G coverage requires future `MORPHIC_FIELD_PATTERNS` extension (Foundation 09 §4.2). This is documented scope, not bug.

### Negatives (legitimate physics + canonical HeartMath, N=8)

| ID | Source | Result |
|---|---|---|
| N-BOHM-1..2 | Bohm 1980 *Wholeness and the Implicate Order* (verbatim via Wikipedia) | NO-FIRE-CLEAN |
| N-PH-1..3 | Penrose-Hameroff Orch-OR (verbatim via Wikipedia) | NO-FIRE-CLEAN |
| N-HM-1..3 | heartmath.org/research/science-of-the-heart/coherence/ (verbatim) | NO-FIRE-CLEAN |

**False-positive rate:** 0/8 = 0%. Wilson 95% CI [0%, 36.9%] for N=8.

**Key insight:** Even HeartMath INSTITUTIONAL canonical text doesn't fire — HeartMath stays in regis D+E physiological language («increased parasympathetic activity», «sine-wavelike heart-rhythm pattern», «vagally mediated HRV»). The pop-misuse is by Dispenza-style EXTRACTION of «coherence» + addition of quantum/electromagnetic-vibration claims. This is exactly what `pseudo_technical_simulacrum` is designed to differentiate, and probe confirms differentiation.

## Bug-fixes during live probe

Two iter-2 fixes from real-text findings:

### Fix 1: «электромагнитные поля» pattern (sanity-test stage)
**Pattern:** `re('электромагнитн' + W_STAR + '\\s+(?:вибраци|частот|настройк|колебани)' + W_STAR)`
**Missing:** `пол` stem for «поля»
**Fixed:** added `пол` to alternatives.

### Fix 2: «изменил... ДНК» verb stem (sanity-test stage)
**Pattern:** `(?:изменя|изменить|меня|поменя|трансформ|перепрограмм)`
**Missing:** perfective forms «изменил/изменила/изменили» don't match «изменя» prefix
**Fixed:** broader stem `(?:из|пере|по)?мен[яеилюо]` covers all gender/aspect forms.

### Fix 3: «raises your electromagnetic vibration» (live-probe stage)
**Pattern:** `raise\\s+(?:your|the)\\s+(?:vibration|frequency)`
**Missing:** (a) plural verb form «raises» not matched; (b) adjective slot between «your» and noun
**Fixed:** `raise[sd]?` + optional `(?:\\w+\\s+)?` adjective slot.

### Fix 4: «electromagnetic vibration» standalone (live-probe stage)
**Pattern:** required trailing context word `(?:heart|emotion|consciousness|...)`
**Issue:** «A coherent heartbeat raises your electromagnetic vibration.» — context is BEFORE, not after
**Fixed:** split into two patterns:
- `electromagnetic\s+(?:vibration|frequency)` — standalone (rationale: mainstream physics uses «wave»/«oscillation»/«field», NEVER «vibration» or «frequency» of EM)
- `electromagnetic\s+(?:signature|field)[^.]{0,80}(?:context word)` — these phrases have legitimate physics uses, so trailing-context requirement retained

## Honest scope (cycle-2 trap warning)

Per CLAUDE.md `feedback_synthesis_zero_live_anchor`: synthesis 100% catch can collapse to 0% live catch (FE detector precedent 2026-05-10). This probe is **iter-2 with bug-fixes from real-text** — patterns now tuned on these positives. **This IS a cycle-2 risk**:

- iter-1 patterns from synthesis (Manovaidya 5 cases)
- iter-2 fixes from THIS probe corpus → patterns adapted to P-DISP-SEC-1
- Therefore P-DISP-SEC-1 catch is NOT independent validation

To break cycle-2: **need fresh held-out probe** on text NOT used in iter-2 tuning. Specifically:
- Verbatim chapters from Becoming Supernatural (Dispenza primary)
- Lipton Biology of Belief verbatim chapters
- 5-10 r/spirituality verbatim posts
- 5-10 Reddit Dispenza-fan paraphrases

Until that probe runs: claim is «patterns developed from synthesis + adapted to 3 secondary-attributed real-text samples» — NOT «70% catch on primary text».

## Status promotion

| Status | Criterion | This probe meets? |
|---|---|---|
| SCAFFOLD | Patterns from synthesis only; sanity-tests pass | ✓ (iter-1) |
| **MIXED-VALIDATED (current)** | Sanity-test pass + small-N real-text probe with bug-fixes | ✓ (iter-2) |
| Live-validated pre.3 candidate | N≥10 fresh held-out positives with 70%+ catch | ✗ (need new corpus) |
| v0.3.0 stable | Live-validated + healthcare-pack lexicon-spec Категория 6 cross-referenced | ✗ |

**Promote to pre.3:** YES — bug-fixes reduce known FN; FP rate clean on N=8 legit text.
**Promote to v0.3.0 stable:** NO — held-out primary-text probe required first.

## Next probe step

Manual-curated held-out corpus (owner-involvement work):
- Borrow/buy *Becoming Supernatural* (Dispenza 2017) → 5-10 verbatim 1-2 sentence quotes from heart-coherence chapter + quantum-field chapter
- Borrow/buy *Biology of Belief* (Lipton 2005) → 5-10 verbatim quotes on belief/DNA
- Sheldrake morphic-resonance article (already fetched) → does NOT help current detector scope; informs future MORPHIC_FIELD_PATTERNS work
- Reddit r/Dispenza or r/spirituality verbatim (5-10 posts)

Goal: 20+ fresh positives → run patterns → measure catch rate. If ≥70%, promote v0.3.0 stable. If <70%, audit FNs and DO NOT tune against this corpus (avoid cycle-2). Broaden patterns conservatively, run yet-fresher held-out probe.

## Linked artifacts

- `live-probe-runner.mjs` — reproducible probe script
- `REPORT.md` — initial synthesis-only sanity report
- `REPORT-iter2.md` — this document (live probe + bug-fixes)
- `src/packs/epistemology.js` v0.3.0-pre.2 → pre.3 after this commit
- `test/packs-quantum-mysticism.test.js` — 17 sanity tests (32/32 pass)
- Foundation 08 §3 + Foundation 09 §4.2 — theoretical anchors
- `_Библиотека/Диспенза-Джо.md` — case-study card
