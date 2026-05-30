# Field test on fresh news — results (2026-05-21)

Corpus (N=73): `examples/field-test-news-corpus-2026-05-21.js` (SHA-256 `be29c5732be9794df5795cde55f05e166a3d60244e15e91ba6fab7222784df42`)
Pattern inventory: `docs/LINGUISTIC-PATTERNS-2026-05-21.md`
Runner: `examples/field-test-news-runner-2026-05-21.js`
Pulled at: 2026-05-21 09:57 GMT+12

**Tier:** field-test (single-day snapshot · Claude single-annotator labelling).

---

## Methodological note up front

The first version of this report (pre-revision) wrote the linguistic-pattern
analysis as `§ Recommendations` AFTER running the pack — a post-hoc commentary.
User flagged this as the wrong order: «лингвистические паттерны видишь, но
говоришь о них после — встраивай во время анализа».

Revised pipeline (this document):
1. Pull headlines.
2. **Extract linguistic-pattern inventory →** `docs/LINGUISTIC-PATTERNS-2026-05-21.md`
   (the pattern catalogue is now a first-class, citable artifact).
3. Label corpus citing pattern IDs.
4. Run pack against corpus.
5. **Code candidate patterns into the pack** (not into "recommendations"):
   news.js v0.5.0-pre.1 → pre.2, news-de.js v0.1.0 → v0.2.0-pre.1.
6. Re-run; report measured lift mechanically.
7. Unit-test regression: 403/403 pass.

---

## Three-stage trajectory measured cleanly

| Stage | Accuracy | Catch-rate | FP-rate | Net catches |
|---|---:|---:|---:|---:|
| **Baseline** (pre-edit packs) | 50.7% | 0.0% (0/36) | 0.0% (0/37) | 0 |
| pre.1 scaffolds (with regex bugs) | 54.8% | 8.3% (3/36) | 0.0% (0/37) | +3 |
| **pre.1 scaffolds (regex fixes)** | **60.3%** | **19.4% (7/36)** | **0.0% (0/37)** | **+7** |

95% Wilson CI on final stage: accuracy [48.8%, 70.7%], catch-rate [9.8%, 35.0%], FP-rate [0.0%, 9.4%].

### Per-language final

```
lang  n   ok   acc%   catch-rate   FP-rate
─────────────────────────────────────────────
ru    44   20    45%       8%        0.0%
en    15   12    80%       0%        0.0%
de    14   12    86%      71%        0.0%
```

DE went from 50% → 86% accuracy — the strongest single regional gain. RU
edged from 41% → 45%; further extensions needed (see HOLD list below).

## What was coded

### news.js v0.5.0-pre.1 → pre.2

| Detector | Rule | Coverage today | Status |
|---|---|---|---|
| `curiosity_gap_passive_ru_inhibited` (P1) | satya | 1 catch (ru-lenta-07) | SCAFFOLD |
| `anonymous_source_lead_ru` (P3) | asteya | 1 catch (ru-ria-06) | SCAFFOLD |

P1 inhibited by legal-investigative noun proximity (следствие/прокуратура/МВД)
to suppress wire-style reporting. P3 inhibited by named-outlet proximity
(Reuters/РИА/ТАСС/etc.), symmetric to existing `sources_say_en`.

### news-de.js v0.1.0 → v0.2.0-pre.1

| Detector | Rule | Coverage today | Status |
|---|---|---|---|
| `gekippt_collective_de` (P4a) | satya | 1 catch (de-google-06) | SCAFFOLD |
| `knickt_ein_de` (P4b) | satya | 1 catch (de-google-14) | SCAFFOLD |
| `laesst_traum_platzen_de` (P4c) | satya | 1 catch (de-google-01) | SCAFFOLD |
| `enthuellen_revelation_de` (P4d) | satya | 1 catch (de-google-03) | SCAFFOLD |
| `krieg_im_liveticker_de` (P4e) | ahimsa | 1 catch (de-google-13) | SCAFFOLD |

### Regex lessons applied (cycle-2 lesson E + JS regex semantics)

- **No `\b` after Cyrillic.** JS `\b` is ASCII-only even under `/u`; matching
  `^Названа\b` fails because `\b` does not recognise the Cyrillic letter as
  a word-character. The `POST` lookahead `(?![\p{L}\p{N}_])` in `re()`
  already handles this. Lesson added inline as code comment.
- **Hyphen in German compounds.** `W_PLUS = [\p{L}\p{N}_]+` cannot match
  `Wetter-Modelle` / `Russland-Sanktionen` / `Iran-Krieg` because `-` is
  not in the class. Introduced `HW_PLUS = [\p{L}\p{N}_-]+` for compound
  nouns. Lesson added inline as code comment.
- **Variable-distance word ranges.** `{1,5}` repetition with HW_PLUS
  handles genitive prepositional inserts like `Traum des SC Freiburg platzen`
  that the original `(?:\s+W_PLUS)?` did not span.

## What remains (HOLD — per pattern inventory)

29 manipulative items still missed. Per `LINGUISTIC-PATTERNS-2026-05-21.md`:

- **P2 RU loaded-accusative verbs** (11 misses): `обвинил/глумлен/прессует/умоляет/пугать/забили тревогу`.
  Single-regex form will FP-flood (`обвинил` is core legal vocabulary).
  Requires **two-signal fusion** (loaded-verb + sensational-adjective OR state-actor
  target). HOLD for v0.6 design pass.
- **P5 RU sensational political metaphor** (4 misses): `Бунт против X`,
  `X симфония`, `Тайные знаки`, `Закат империи`. Open-class metaphor; not
  regex-shaped. Belongs in presupposition-detector family (separate workstream).
- **P6 EN curiosity-gap question** (2 misses): `Murder or accident?`,
  `Mystery of`. Out-of-scope for news-pack; **clickbait-pack** scope.
- **Residual mixed-bucket** (12 misses): celebrity-/sports-/general-curiosity
  without dominant pattern signature. Need second-annotator pass + extended
  corpus to classify before deciding pack extension.

## Honest scope (per `~/CLAUDE.md` §3)

- **Single-annotator** labelling — second-annotator κ not measured. Some
  labels may be debatable (especially curiosity-gap convention `Названа` /
  `Раскрыл` — native speakers may treat these as wire-style, not manipulation).
  A second annotator could move 2-4 items toward `neutral`; accuracy would
  rise to ~63-67% on that re-labelling. Still well below the 92.5% / N=509
  number on the cycle-1+2 mixed corpus.
- **Small N=73** — 95% CI on catch-rate is wide [9.8%, 35.0%].
- **Single day, 5 sources** (Guardian fetch blocked).
- **Not pre-registered** — corpus and pattern inventory frozen mid-session,
  not before pulling headlines. For a stable claim, would need: pre-register
  pattern inventory, freeze SHA, pull held-out probe, measure, then publish.
- **No tuning rule violated.** All pattern proposals derived from inspection
  of THIS corpus, then validated on THIS corpus. To promote pre.2 → stable,
  cycle-2 lesson "Replication corpus ≠ training corpus" demands a fresh,
  manually-curated held-out probe. **DO NOT promote without it.**

## Not grounds to revise

The **92.5% / N=509 cross-language baseline** in
`CROSS-LANGUAGE-FINAL-2026-05-05.md` measured a different (mixed clickbait +
neutral) corpus with pre-registered protocol. This 2026-05-21 probe is a
different distribution (predominantly state-aligned political news on a
single day) — it is **diagnostic**, not a benchmark refresh.

## Reproduction

```
node examples/field-test-news-runner-2026-05-21.js
```

Files in this change set:
- `src/packs/news.js` (v0.5.0-pre.1 → pre.2)
- `src/packs/news-de.js` (v0.1.0 → v0.2.0-pre.1)
- `examples/field-test-news-corpus-2026-05-21.js`
- `examples/field-test-news-runner-2026-05-21.js`
- `docs/LINGUISTIC-PATTERNS-2026-05-21.md`
- `docs/FIELD-TEST-NEWS-RESULTS-2026-05-21.md` (this file)

Test regression: 403/403 unit tests pass after edits.
