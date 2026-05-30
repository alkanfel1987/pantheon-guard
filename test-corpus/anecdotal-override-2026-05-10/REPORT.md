# Probe report — anecdotal_override, 2026-05-10

Pack: `epistemology` v0.3.0-pre.1.
Detector: `anecdotal_override` (no inhibitor).
Catalogue anchor: `ns-upalabdhi-sama-5-1-27`.

## tl;dr

| Run | Catch (Wilson 95%) | FP | Decision |
|---|---|---|---|
| iter-1 (pre-fix) | 75.0% [46.8%, 91.1%] (9/12) | 0.0% [0.0%, 24.3%] (0/12) | PROMOTE_PARTIAL — passes pre-reg |
| iter-2 (post-fix) | 100.0% [75.7%, 100%] (12/12) | 0.0% [0.0%, 24.3%] (0/12) | PROMOTE_PARTIAL — verifies fix |

Pre-reg acceptance: catch ≥60% AND FP ≤5%. **Hit on iter-1 already**.

Per-language (iter-2): EN 100% / RU 100% / FP 0% on both.

## Honest scope

Synthesis-leaning probe. Positive class paraphrases canonical alt-med /
experience-trumps-data forum framings (healthcare-skepticism, workplace,
diet/wellness, parenting, climate). Negative class includes paraphrased
honest-experience-sharing, bounded-personal-experience, metacommentary
on anecdote-vs-systematic, and one public-domain fragment from Plutarch.
Per `CLAUDE.md` selection-bias discipline: structured sanity, **not**
external validation.

## iter-1 results (pre-fix)

```
Positives: 12  Negatives: 12
Catch: 75.0% [46.8%, 91.1%]
FP:    0.0% [0.0%, 24.3%]
EN catch: 83.3% [43.6%, 97.0%]   RU catch: 66.7% [30.0%, 90.3%]
```

### iter-1 FN audit (3 misses)

**P-EN-02** — `In my 25 years of clinical practice I have never seen…`
- Marker: «in my 25 years of practice»
- Why miss: pattern `in\s+my\s+(?:\d+\s+years?\s+of\s+)?(?:experience|practice|career)`
  did not allow a modifier adjective between `of` and `practice`. The text
  has «of *clinical* practice» — extra word `clinical` breaks the optional
  group.
- Category: lexical-coverage gap.

**P-RU-02** — `За 30 лет работы хирургом я не видел…`
- Marker: «за 30 лет работы» + «не видел»
- Why miss: pattern `за\s+\d+\s+(?:лет|года?)\s+(?:работы|практики)\s+(?:я\s+)?…`
  did not allow a modifier noun between `работы/практики` and the verb.
  Text has «работы *хирургом* я не видел» — extra noun `хирургом` breaks
  the structure.
- Category: lexical-coverage gap.

**P-RU-03** — `У меня есть знакомый, который работал в этой компании…`
- Marker: «у меня есть знакомый, который»
- Why miss: pattern `знаком(?:ый|ая|ые)\s+котор(?:ый|ая|ые)` required
  whitespace between the two tokens, but the natural Russian construction
  uses comma-then-space («знакомый, который»). `\s+` does not match a
  comma.
- Category: punctuation-coverage gap.

### iter-1 FP audit

None. All 12 negatives correctly identified.

## iter-2 fix applied

Single-commit fix in `src/packs/epistemology.js` —
`ANECDOTAL_OVERRIDE_PATTERNS`:

1. RU «за N лет работы»: appended `(?:\s+\p{L}+)?` between
   `работы/практики` and the verb-clause to allow optional modifier-noun.
2. RU «у меня есть знакомый который»: changed `\s+` between
   `знакомый/ая/ые` and `который/ая/ые` to `,?\s+` — comma-relative-clause
   is the natural Russian punctuation.
3. EN «in my N years of \<modifier\> practice»: changed inner group from
   `(?:\d+\s+years?\s+of\s+)?` to `(?:\d+\s+years?\s+of\s+(?:\p{L}+\s+)?)?`
   — optional adjective between `of` and the noun.

Inline comment cites `anecdotal-override-2026-05-10` probe as the
discovery context. **No threshold tuning** — structural-pattern repair
surfaced by the FN audit, not corpus-fit retuning.

## iter-2 results (post-fix, same corpus)

```
Catch: 100.0% [75.7%, 100.0%]
FP:    0.0% [0.0%, 24.3%]
EN catch: 100.0%   RU catch: 100.0%
```

The 100% on iter-2 is a **same-corpus regression check**, not a
generalization claim. Live-corpus probe is required before any stable
release claim.

## Cycle-2 trap protection

- **No new pattern fitting specific FN strings** — all three fixes are
  template generalizations: optional modifier slot for cases where text
  inserts an adjective/noun in a known position; optional comma for
  cases where Russian relative-clause punctuation differs from `\s+`.
- **No FP appeared** — iter-2 holds 0% FP, suggesting the
  generalizations are conservative.

Conforms to CLAUDE.md "cycle-2 trap" distinction: structural bug repair
is NOT corpus-fit tuning.

## Iter-3 plan (if commissioned)

Live-corpus probe — manual-curated EN+RU forum / op-ed text. Source
candidates:

- EN: workplace-review forums (Glassdoor commentary), parenting forums
  (Mumsnet etc.), alt-med forum archives — confirmed-genre sources of
  «I've seen X with my own eyes» framing.
- RU: alt-medicine TG channels, parenting / conservative-view forums,
  workplace gripe sites.
- Negative class — clinical case-report excerpts from PubMed (real),
  thoughtful commentary essays, bounded-personal-experience pieces.

Target N=20 positive / N=15 negative.

Expected outcome: catch likely 70-85% on live (some live samples will
phrase override without exact lexical markers, e.g. «я работаю в этой
сфере 15 лет, и…» without «не видел» but with implicit override).
That gap = legitimate iter-3 lexical expansion work.

## Reproducibility

```
cd test-corpus/anecdotal-override-2026-05-10 && node runner.js
```

Output deterministic given fixed corpus + fixed detector code.
