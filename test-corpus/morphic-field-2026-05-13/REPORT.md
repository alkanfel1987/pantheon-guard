# morphic-field (morphic_field_simulacrum) — 2026-05-13 SCAFFOLD report

**Detector:** `morphic_field_simulacrum` in `src/packs/epistemology.js` (v0.3.0-pre.4)
**Status:** **SYNTHESIS+CYCLE-2-RISK** — patterns derived directly from Sheldrake verbatim quotes (fetched from sheldrake.org). 5/5 catch on those quotes is **NOT independent validation** — cycle-2 trap. Held-out probe required for promotion to v0.3.0 stable.

## Anchor

- Theoretical: Foundation `vault/00-Foundation/09-Field-Across-Registers.md` §4.2 (regis G Sheldrake morphic-field, mainstream-rejected as pseudoscience).
- Library: `vault/_Библиотека/Шелдрейк-Руперт.md` — case-study card with pañcaka pass 🟠.
- Sibling detector: `pseudo_technical_simulacrum` (v0.3.0-pre.2+) covers regis H pop-quantum-mysticism.

## Probe corpus

### Positives — Sheldrake verbatim (N=5, REAL-TEXT from sheldrake.org)

| ID | Source | Verbatim quote | Detector result |
|---|---|---|---|
| P-SHELDRAKE-1 | sheldrake.org/research/morphic-resonance | «Morphic resonance means that the so-called laws of nature are more like habits.» | **CAUGHT** |
| P-SHELDRAKE-2 | sheldrake.org/research/morphic-resonance | «Memory need not be stored in material traces inside brains, which are more like TV receivers than video recorders.» | **CAUGHT** |
| P-SHELDRAKE-3 | sheldrake.org/research/morphic-resonance | «Each individual inherits a collective memory from past members of the species, and also contributes to the collective memory.» | **CAUGHT** |
| P-SHELDRAKE-4 | sheldrake.org/research/morphic-resonance | «Morphic fields contain attractors (goals) and chreodes (habitual pathways towards those goals) that guide a system toward its end state.» | **CAUGHT** |
| P-SHELDRAKE-5 | sheldrake.org/research/morphic-resonance | «Self-organising systems inherit a memory from previous similar systems through morphic resonance.» | **CAUGHT** |

**Catch rate (verbatim sheldrake.org):** 5/5 = 100%. Wilson 95% CI [56.6%, 100%] for N=5.

**Cycle-2 caveat (CRITICAL):** patterns were designed from THESE exact quotes during pattern-engineering step. 100% catch on training corpus is **not independent validation** — this is the classical cycle-2 trap (training-on-test). Per CLAUDE.md `feedback_synthesis_zero_live_anchor`:
- iter-1 patterns from Шелдрейк-Руперт.md card formulations (synthesis)
- iter-2 patterns tuned to verbatim Sheldrake quotes (training-on-test)
- **Held-out probe pending** before promotion v0.3.0 stable.

### Negatives — Bohm + Penrose-Hameroff + HeartMath (N=8, REAL-TEXT)

Run via `live-probe-runner.mjs` 2026-05-13:

| ID | Source | Type | Detector result |
|---|---|---|---|
| N-BOHM-1..2 | Bohm 1980 *Wholeness and the Implicate Order* (verbatim via Wikipedia) | legitimate philosophy of physics | NO-FIRE-CLEAN |
| N-PH-1..3 | Penrose-Hameroff Orch-OR (verbatim via Wikipedia) | fringe-respectable physics speculation | NO-FIRE-CLEAN |
| N-HM-1..3 | heartmath.org coherence page (verbatim) | legitimate physiological discourse | NO-FIRE-CLEAN |

**False-positive rate:** 0/8 = 0%. Wilson 95% CI [0%, 36.9%] for N=8.

**Note:** these negatives don't contain morphic-field vocabulary at all, so they're a **weak FP stress-test** for morphic-field detector specifically. They confirm the detector doesn't false-fire on non-Sheldrake legitimate science, but the stronger test would be:
- Mainstream embryology text mentioning «morphogenetic field» (Spemann-Mangold, Wolpert) — inhibitor `hasMainstreamEmbryologyContext` is tested in sanity test
- Third-party reportage about Sheldrake with proper attribution — inhibitor `hasNamedSource` is tested in sanity test

## Bug-fixes during sanity-test stage

Four iter-2 fixes from real-text failures (see test/packs-morphic-field.test.js):

### Fix 1: «morphic fields contain attractors»
**Pattern:** `morphic\s+field[s]?[^.]{0,80}(?:memory|habit|attractor|chreode|...)`
**Issue:** POST word-boundary lookahead `(?![\p{L}\p{N}_])` rejected trailing 's' in «attractors»/«chreodes»/«habits»
**Fixed:** wrapped each plural-tolerant token with `W_STAR`: `attractor` + W_STAR, etc.

### Fix 2: «brains, which are more like TV receivers»
**Pattern:** `brain[s]?\s+(?:are|is)\s+(?:more\s+like\s+)?(?:TV|...)\s+receivers?`
**Issue:** required direct adjacency «brains are»; text had comma+relative clause «brains, which are»
**Fixed:** allow [^.]{0,30} between «brain[s]?» and «are/is»; W_STAR on «receiver» for plural.

### Fix 3: «collective memory from past members of the species»
**Pattern:** `collective\s+memory\s+(?:of|across|within)\s+(?:the\s+)?(?:species|family|kind)`
**Issue:** required «memory OF species» directly adjacent; text had «memory from past members of the species»
**Fixed:** `collective\s+memory[^.]{0,80}(?:species|family|kind)` — permissive content slot.

### Fix 4: «memory need not be stored in material traces inside brains»
**Pattern:** `(?:memory|consciousness)\s+(?:is\s+)?not\s+stored\s+in\s+(?:material\s+)?(?:traces|brain)`
**Issue:** required «is not» auxiliary; text had «need not be stored»
**Fixed:** broader `(?:is\s+|need\s+)?not\s+(?:be\s+)?stored` covering both forms.

### Fix 5: RU «законы природы — это скорее привычки»
**Pattern:** `закон[ыов]?\s+природы\s+(?:это|—)?\s+(?:скорее\s+)?привычк`
**Issue:** allowed only ONE of «это» or «—» between «природы» and «привычки»; text had both
**Fixed:** replaced explicit alternation with `[^.]{0,30}` permissive slot.

## Inhibitor architecture verification

| Inhibitor | Sanity-test case | Expected | Actual |
|---|---|---|---|
| `hasMainstreamEmbryologyContext` (Spemann-Mangold organizer) | «The Spemann-Mangold organizer experiment demonstrated...» | Inhibit | ✓ Inhibits |
| `hasMainstreamEmbryologyContext` (Wolpert positional info) | «According to Wolpert positional information theory...» | Inhibit | ✓ Inhibits |
| `hasMainstreamEmbryologyContext` (in situ hybridization + morphogen) | «In situ hybridization revealed gene expression pattern matching morphogen gradient...» | Inhibit | ✓ Inhibits |
| `hasMainstreamEmbryologyContext` (false-positive guard) | «The morphogenetic field is established by induction signals from the organizer region during gastrulation.» | NOT fire raw (no Sheldrake vocab) | ✓ Does not fire raw |
| `hasNamedSource` (proper Sheldrake attribution) | «Sheldrake (1981) proposed morphic resonance as a mechanism...» | Raw fires + named-source inhibits | ✓ Both fire and named-source recognized |

Inhibitor architecture is consistent with `pseudo_technical_simulacrum` pattern — composite (named-source OR domain-context).

## Status promotion

| Status | Criterion | This probe meets? |
|---|---|---|
| SCAFFOLD | Patterns from synthesis only; sanity-tests pass | ✓ (15/15 sanity tests pass) |
| **SCAFFOLD+CYCLE-2-RISK (current)** | Patterns tuned to verbatim training corpus; 5/5 catch on training-set | ✓ — but NOT independent |
| Live-validated pre.5 candidate | N≥10 fresh held-out Sheldrake-style positives with 70%+ catch | ✗ (need new corpus) |
| v0.3.0 stable | Live-validated + Foundation 09 §4.2 cross-referenced | ✗ |

**Promote to pre.5:** PENDING — need fresh corpus. **Do NOT promote on training-set catch alone.**

## Held-out probe requirements (next step)

Manual-curated held-out positive corpus:
- Sheldrake *A New Science of Life* (1981 + 2009 rev) — 10-15 verbatim 1-2 sentence quotes from chapters NOT in sheldrake.org overview page
- Sheldrake *The Presence of the Past* (1988) — 5-10 quotes
- Sheldrake-follower content (popularizers writing about morphic field) — 5-10 paragraphs from secondary sources
- TGI Friday's-style pop-press articles about morphic resonance — 5+ samples

Manual-curated held-out negative corpus:
- Wolpert *Principles of Development* — 5-10 chapters mentioning morphogenetic field in mainstream context
- Nüsslein-Volhard Nobel work — 5-10 sentences
- Modern Cell journal abstracts on morphogen signaling — 5-10
- Spemann-Mangold 1924 paper (English translation) — 3-5

Probe goal: ≥ 70% catch on held-out positives + ≤ 5% FP on held-out negatives. Per cycle-2 trap discipline: **DO NOT tune patterns against held-out corpus** — if results below threshold, broaden patterns conservatively then run yet-fresher held-out probe.

## Linked artifacts

- `test/packs-morphic-field.test.js` — 15 sanity tests (15/15 pass after iter-2 fixes)
- `live-probe-runner.mjs` — extended for dual-detector test (quantum + morphic)
- Foundation `00-Foundation/09-Field-Across-Registers.md` §4.2 (regis G theoretical anchor)
- Library `_Библиотека/Шелдрейк-Руперт.md` — case-study with detector cross-reference
- Sibling detector report: `test-corpus/quantum-mysticism-2026-05-13/REPORT-iter2.md`

## Architecture note

morphic-field detector is **sibling** to pseudo_technical_simulacrum (quantum-mysticism), NOT subset. Both extend Baudrillard's `simulacrum_of_source` for different regis-classes:
- `pseudo_technical_simulacrum` → regis H (pop-quantum-mysticism, Dispenza-style)
- `morphic_field_simulacrum` → regis G (fringe-biology, Sheldrake-style)

Text mixing both regs (e.g. Dispenza citing Sheldrake) would trigger BOTH detectors — composite severity escalation. This is correct behavior, not double-counting.
