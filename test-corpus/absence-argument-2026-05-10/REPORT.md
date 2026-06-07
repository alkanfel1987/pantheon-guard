# Probe report — absence_argument, 2026-05-10

Pack: `epistemology` v0.3.0-pre.1.
Detector: `absence_argument` + `hasScopeQualifier` inhibitor.
Catalogue anchor: `ns-anupalabdhi-sama-5-1-29`.

## tl;dr

| Run | Catch (eff, Wilson 95%) | FP (eff) | Inhibitor false-supp | Decision |
|---|---|---|---|---|
| iter-1 (pre-fix) | 83.3% [55.2%, 95.3%] (10/12) | 0.0% [0.0%, 21.5%] (0/14) | 0.0% (0/12) | PROMOTE_PARTIAL — passes pre-reg |
| iter-2 (post-fix) | 100.0% [75.7%, 100%] (12/12) | 0.0% [0.0%, 21.5%] (0/14) | 0.0% (0/12) | PROMOTE_PARTIAL — verifies fix |

Pre-registered acceptance: catch ≥60% AND FP ≤5% AND inhibitor-false-supp ≤10%.
**All three hit on iter-1 already**.

Per-language (iter-2): EN 100% / RU 100% / FP 0% / inhibitor 100% specific.

## Honest scope

Synthesis-leaning probe. Positive class paraphrases canonical conspiracy /
anti-vaccine / alt-med commentary. Negative class A is comparative analytical
text. Negative class B is research-abstract style with explicit scope
qualifiers (the inhibitor stress-test). Per `CLAUDE.md` selection-bias
discipline this is structured sanity, **not** external validation.

`PROMOTE_PARTIAL` — same partial-promotion pattern as
`naturalizationProbeResult` and `falseEquivalenceProbeResult`: synthesis
pass + explicit "live-corpus probe required" gate.

## iter-1 results (pre-fix)

```
Positives: 12  Neg-comparative: 6  Neg-bounded: 8

Catch RAW       : 83.3% [55.2%, 95.3%]
Catch EFFECTIVE : 83.3% [55.2%, 95.3%]
FP all (eff)    : 0.0% [0.0%, 21.5%]

Bounded class (n=8):
  raw fires       : 2/8 (25.0%)
  inhibitor active: 8/8
  effective FP    : 0/8 (0.0%)
False suppression on positives: 0/12 (0.0%)
Comparative-class raw FP      : 0/6 (0.0%)
```

### iter-1 FN audit (2 misses)

**P-EN-03** — `Nobody has ever seen a real moon-rock outside the official narrative…`
- Marker: «nobody has ever seen»
- Why miss: pattern `no\s+(?:one|body)\s+has\s+ever\s+(?:seen|shown|proven)`
  requires whitespace between «no» and «one|body»; «nobody» as a single
  token does not match.
- Category: lexical-coverage gap.

**P-RU-03** — `Нет ни одного доказательства того, что…`
- Marker: «нет ни одного доказательства»
- Why miss: pattern matched bare stems `доказательств|случа|фактическ + W_STAR`
  — only `фактическ` had W_STAR; the other two stems were bare and POST
  word-boundary blocked declined Russian forms.
- Category: structural regex bug — same fix-class as FE iter-2.

### iter-1 inhibitor effectiveness

Bounded class (NB): 2/8 raw-fires, 8/8 inhibitor-active, 0/8 effective FP.
Inhibitor is functioning correctly on the cases where the detector reaches
the bounded text.

The other 6/8 NB cases didn't even raw-fire — same structural bug as
P-RU-03 (e.g. NB-RU-04: «нет ни одного доказательства превосходства» — bare
stem fails on declined «доказательства»). This means inhibitor effectiveness
was **under-measured** on iter-1: the corpus could not stress-test the
inhibitor on samples the bug silenced before they reached it.

## iter-2 fix applied

Single-commit fix in `src/packs/epistemology.js` —
`ABSENCE_ARGUMENT_PATTERNS`:

1. `(?:доказательств|случа|фактическ + W_STAR)` →
   `(?:доказательств + W_STAR | случа + W_STAR | фактическ + W_STAR)`.
2. EN `no\s+(?:one|body)` → `(?:no\s+(?:one|body)|nobody|noone)`.

Inline comment cites `absence-argument-2026-05-10` probe as the discovery
context. **No threshold tuning** — structural-pattern repair surfaced
by the FN audit, not corpus-fit retuning. Both fixes generalize beyond
the FN samples (W_STAR catches all Russian declensions; «nobody|noone»
follows the existing «no\s+(one|body)» template).

## iter-2 results (post-fix, same corpus)

```
Catch RAW       : 100.0% [75.7%, 100.0%]
Catch EFFECTIVE : 100.0% [75.7%, 100.0%]
FP all (eff)    : 0.0% [0.0%, 21.5%]

Bounded class (n=8):
  raw fires       : 3/8 (37.5%)   ← previously 2/8
  inhibitor active: 8/8
  effective FP    : 0/8 (0.0%)
False suppression on positives: 0/12 (0.0%)
```

The bounded class raw-fires went from 2/8 to 3/8 — additional bounded
sample (`NB-RU-04` «нет ни одного доказательства») now correctly fires
raw thanks to the W_STAR fix, and is correctly suppressed by inhibitor.
This is exactly what the inhibitor architecture should demonstrate:
detector becomes more sensitive (catches both adversarial AND legitimate
bounded forms), inhibitor protects bounded class.

## Test-suite consequence

The fix invalidated one prior assertion in `test/packs-jati-pre1.test.js`:

```
test('absence argument inhibited by scope qualifier', () => {
  ...
  assert.equal(hasAbsenceArgument(scoped), false);  // ← was passing only because of the bug
  ...
});
```

The assertion's intent was "scoped text passes the pack" (effective false),
but it tested raw condition. After the structural fix, bounded text DOES
raw-fire (correctly — that's the inhibitor's whole purpose). Test rewritten
to assert effective behavior:

```
assert.ok(hasAbsenceArgument(scoped));        // raw must fire
assert.ok(hasScopeQualifier(scoped));         // inhibitor must catch
// pack runner: condition && !check → effective false
```

Test count: 252 → 252 (one assertion replaced; same total).

## Cycle-2 trap protection

Same disciplinary analysis as FE probe iter-2:

- **No threshold change** — detector has no thresholds (boolean condition).
- **No FN-string-fitting** — both fixes are template generalizations
  (W_STAR template already in adjacent patterns; «nobody» template parallel
  to «no one»).
- **No FP appeared** — FP held at 0% on bounded and comparative classes;
  inhibitor-suppressed the new raw-fires correctly.

Conforms to CLAUDE.md "cycle-2 trap" distinction: structural bug repair is
NOT corpus-fit tuning.

## Iter-3 plan (if commissioned)

Live-corpus probe — manual-curated EN+RU op-eds / forum posts from
confirmed adversarial sources. Per `feedback_lexicon_for_opacity_detection.md`
discipline: NOT auto-pull; each doc human-tagged before run. Target N=20
positive (RU 10, EN 10) / N=15 negative (5 comparative + 10 bounded).
Source candidates:

- EN positive: alt-med forums (mercola, naturalnews comments archives),
  conspiracy commentary substacks (NOT a politics endorsement — these are
  confirmed-genre sources of «no one has ever proven» framing).
- RU positive: anti-vaccine Telegram channels archived to text;
  pseudoscience forums.
- EN/RU negative-bounded: real research abstracts from PubMed and
  CyberLeninka (open-access).

Expected outcome: catch likely 70-85% on live (some live samples will
phrase universal absence without exact lexical markers, e.g.
«никто из вменяемых не видел» — qualifier between «никто» and verb).
That gap = legitimate iter-3 lexical expansion work.

## Reproducibility

```
cd test-corpus/absence-argument-2026-05-10 && node runner.js
```

Output deterministic given fixed corpus + fixed detector code.
