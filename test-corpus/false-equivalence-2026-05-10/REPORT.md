# Probe report — false_equivalence_levelling, 2026-05-10

Pack: `epistemology` v0.3.0-pre.1 → patched in-place after iter-1 discovery.
Detector: `false_equivalence_levelling` (no inhibitor).
Catalogue anchors: `ns-avisesa-sama-5-1-23`, `ns-anityasama-5-1-32`.

## tl;dr

| Run | Catch (Wilson 95% CI) | FP (Wilson 95% CI) | Decision |
|---|---|---|---|
| iter-1 (pre-fix) | 85.7% [60.1%, 96.0%] (12/14) | 0.0% [0.0%, 24.3%] (0/12) | PROMOTE_PARTIAL — passes pre-reg |
| iter-2 (post-fix, same corpus) | 100.0% [78.5%, 100%] (14/14) | 0.0% [0.0%, 24.3%] (0/12) | PROMOTE_PARTIAL — verifies fix; **NOT** generalization |

Pre-registered acceptance: catch ≥60% AND FP ≤5%. **Hit on iter-1 already**.

Per-language (iter-2): EN 100% / RU 100% / FP 0% on both.

## Honest scope (carry-over from PRE-REGISTRATION)

This is a **synthesis-leaning** probe. Positive class is paraphrase-of-canonical-
op-ed framings I (test author = corpus curator) have encountered, written into
1-2 sentence samples. Negatives mix public-domain (Federalist, Plutarch) with
paraphrased analytical text. Per `CLAUDE.md` selection-bias discipline this
result is structured sanity, **not** external validation.

The decision label `PROMOTE_PARTIAL` is exactly the same partial-promotion
pattern as `naturalizationProbeResult` carries: synthesis pass + explicit
"live-corpus probe required" gate.

**Do NOT cite "100% catch" in commercial material**. Acceptable claim:
"false_equivalence_levelling passes synthesis sanity (iter-1 N=14 catch
85.7%); held-out live-corpus probe pending."

## iter-1 results (pre-fix)

```
Total positives: 14  Total negatives: 12
Catch:    85.7% [60.1%, 96.0%]
FP:       0.0% [0.0%, 24.3%]
EN catch: 85.7% [48.7%, 97.4%]   RU catch: 85.7% [48.7%, 97.4%]
EN FP:    0.0%                     RU FP: 0.0%
```

### iter-1 FN audit (2 misses)

**P-EN-07** — `Both parties are equally bad for working families.`
- Marker: «both parties are equally bad»
- Why miss: pattern only matched `both\s+sides`, not `both\s+(parties|teams|camps)`.
- Category: lexical-coverage gap.

**P-RU-04** — `Обе стороны одинаково виноваты в этом конфликте.`
- Marker: «обе стороны одинаково виноваты»
- Why miss: pattern matched bare stems `плох|хорош|виноват|правы` with POST
  word-boundary `(?![\p{L}\p{N}_])`, so the Cyrillic suffix `ы` failed POST.
  Pattern needs `плох` + W_STAR (etc.) to capture declined forms.
- Category: structural regex bug — same fix already applied in `все политик` +
  `в конечном счёте все` patterns; this row was missed during initial scaffold.

### iter-1 FP audit

None. All 12 negatives correctly identified as comparative-not-levelling.

## iter-2 fix applied

Single-commit fix in `src/packs/epistemology.js` — `FALSE_EQUIVALENCE_PATTERNS`:

1. `(?:плох|хорош|виноват|правы)` → `(?:плох + W_STAR | хорош + W_STAR | виноват + W_STAR | прав + W_STAR)` in two patterns.
2. EN `both\s+sides` → `both\s+(?:sides|parties|teams|camps)`.

Inline comment cites `false-equivalence-2026-05-10` probe as the discovery
context. **No threshold tuning** — this is structural-pattern repair surfaced
by the FN audit, NOT corpus-fit retuning. The fix would have been required
regardless of whether iter-1 passed pre-reg threshold.

## iter-2 results (post-fix, same corpus)

```
Total positives: 14  Total negatives: 12
Catch:    100.0% [78.5%, 100.0%]
FP:       0.0% [0.0%, 24.3%]
EN catch: 100.0% [64.6%, 100.0%]   RU catch: 100.0% [64.6%, 100.0%]
EN FP:    0.0%                       RU FP: 0.0%
```

The 100% on iter-2 is a **same-corpus regression check**, not a generalization
claim. Live-corpus probe (analogous to naturalization's live EN n=11) is
required before any stable-release claim.

## Cycle-2 trap protection

The discipline question: did iter-2 tune to the corpus?

- **No threshold change** — `densityHigh / densityMed / windowSize` (which
  belong to opacity, not this detector) untouched.
- **No new pattern fitting specific FN strings** — both fixes generalize
  beyond the FN samples (W_STAR catches all Russian declensions, not just
  «виноваты»; «teams|camps|parties» follows the existing «sides» template).
- **No FP appeared** — FP-rate held at 0% on iter-2, suggesting the
  generalization is conservative.

This conforms to CLAUDE.md "cycle-2 trap" warning's distinction between
*tuning on training corpus* (forbidden) and *fixing structural bugs surfaced
by training corpus* (legitimate, with explicit documentation).

## Iter-3 plan (if commissioned)

Live-corpus probe — manual-curated EN+RU op-eds from confirmed adversarial
sources. Per `feedback_lexicon_for_opacity_detection.md` discipline: NOT
auto-pull; each doc human-tagged before run. Target N=20 positive / N=15
negative, 50/50 EN-RU split. Source candidates:

- EN: substack op-eds (palmer, taibbi, greenwald — NOT a politics endorsement,
  these are documented sources of "both sides equally" framing for whatever
  reason).
- RU: oppositional Telegram channels archived to text + AIF/KP op-eds.

Expected outcome: catch likely 60-80% on live (some live samples will phrase
levelling without exact lexical markers, e.g. via ellipsis or implicature).
That gap = legitimate iter-3 lexical expansion work.

## Reproducibility

Corpus SHA-256 (post-fix run): see `results.json` `date` field for ISO-timestamp
of generation; corpus content lives in `corpus.json` and is content-addressable.

```
cd test-corpus/false-equivalence-2026-05-10 && node runner.js
```

Output is deterministic given fixed corpus + fixed detector code.
