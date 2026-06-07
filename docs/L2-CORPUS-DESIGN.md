# L2 register-balanced corpus — design spec

**Date:** 2026-05-16
**Parent:** `L2-PREREGISTRATION-2026-05-16.md` (cycle 1 = REJECT)
**Status:** design — frozen before collection begins

## Why cycle 1 failed (one sentence)

The `christinacdl` dataset labelled clickbait = aggregator outlets,
non-clickbait = wire press — so the classifier learned **outlet register**,
not the manipulation **mechanism**, and flagged 92% of non-manipulative
lifestyle headlines on held-out #2.

## Design principle — the register × manipulation 2×2

Register must NOT predict the label. Every cell below must be populated;
cycle 1 filled only the diagonal.

|                          | manipulative · label 1            | non-manipulative · label 0          |
|--------------------------|-----------------------------------|-------------------------------------|
| **casual / aggregator**  | easy positive — abundant          | **HARD NEGATIVE — the missing cell**|
| **formal / wire**        | hard positive — rarer             | easy negative — abundant            |

The model can only beat this corpus by learning the mechanism, because
within each register row both labels occur.

## Approach — augment, don't rebuild

`christinacdl` (30,296) already carries a real manipulation signal — the
cycle-1 model separated clickbait from hard news on `control` (74% catch,
6.8% FP). The defect is one missing cell. So:

- **Keep** christinacdl as the positive source + easy negatives.
- **Add ~4,000–6,000 HARD NEGATIVES**: non-manipulative headlines in
  casual / lifestyle / entertainment register.
- **Add ~1,000–2,000 HARD POSITIVES** if findable: manipulative headlines
  in formal register (curiosity-gap / shock-nominalization phrased
  straight). Optional — the hard negative is the load-bearing fix.

Target corpus ≈ 35–38k, register no longer predictive.

## Hard-negative sourcing

Casual-register non-manipulative headlines exist in volume in **factual
entertainment / lifestyle coverage** — "X announces tour dates", "Y show
renewed for season 3", "Z brand launches a product". Plan:

1. Collect headlines from entertainment / lifestyle news feeds — outlets
   DISTINCT from the held-out sources (held-out #2 used LittleThings /
   ScaryMommy / TheThings — those are off-limits as a source).
2. Weak-label as negative, then **filter out** anything carrying an L1
   manipulation marker (numeric-listicle / here-is-gap-pointer /
   shock-adjective / curiosity-gap lexicon) — those are not clean
   negatives. The L1 pack v0.0.4 is the filter.
3. Human spot-check a random sample (≥100) of the survivors to estimate
   negative-label noise; record the rate.

The asymmetry helps: positives are already given (christinacdl); only the
negative class needs sourcing, and factual entertainment coverage is
overwhelmingly non-manipulative — weak supervision is acceptable for it
with the marker-filter + spot-check.

## Open decision — labelling fidelity

Two ways to get the hard-negative labels, in order of cost:

- **(A) Weak supervision (recommended, $0):** as above — collect factual
  entertainment/lifestyle headlines, filter by L1 markers, spot-check.
  Good enough because the negative class is naturally low-manipulation.
- **(B) LLM-as-annotator:** label each headline by a mechanism rubric via
  the Claude API (Haiku, ~$1–5 for the batch). Higher fidelity, needs an
  API key + spend. Use only if the spot-check in (A) shows label noise
  above ~10%.

## Validation discipline (unchanged from pre-registration)

- Held-out #1 / #2 / control STAY held-out — never enter training.
- Threshold selected on a dev split of the NEW corpus only.
- Held-out scored once; pre-registered decision rule from
  `L2-PREREGISTRATION-2026-05-16.md` applies (BLOCKING ≥70%/≤2%,
  ADVISORY ≥60%/≤8%, else REJECT).
- New corpus files get SHA-256 hashes recorded before training.

## Falsification

If, after register-balancing, held-out #2 FP is still > 8% — then the
hard-negative augmentation did not break the shortcut, and the conclusion
becomes: a deterministic-feature corpus cannot teach this distinction at
headline length, and L2 needs article-body context or a different model
class. That negative result, too, gets recorded.

## Phases

1. Collect hard-negative headline pool (entertainment/lifestyle feeds).
2. L1-marker filter + dedup + spot-check; measure negative-label noise.
3. Assemble corpus: christinacdl + hard negatives (+ hard positives if
   found); re-split train/dev; SHA-256.
4. Retrain mDeBERTa-v3-base (same recipe, seed 20260516).
5. Threshold on dev; score held-out once; apply decision rule.

## Build record — 2026-05-16

- **Hard-negative source:** `heegyu/news-category-dataset` (HuffPost News
  Category Dataset), 20 casual/lifestyle/entertainment categories →
  102,892 candidate headlines, deduped against christinacdl.
- **Filter:** the L1 pack (FP-strict, high-precision) dropped only 6.8%,
  and a 100-headline spot-check found ~12% residual clickbait — numeric
  listicles whose nouns ("celebrations", "beliefs", "picks") sit outside
  L1's noun list. Cleaning a negative pool needs high RECALL, not
  precision, so `clean_negatives.py` applies a deliberately AGGRESSIVE
  clickbait filter (broad numeric-listicle + bait-keyword regex; never
  ships, only purifies the pool). It dropped 15.2% → pool 87,214; a
  re-spot-check of 60 found ~0–2% clear mislabels. Weak supervision
  (design option A) validated; LLM labelling (option B) not needed.
- **Corpus:** christinacdl (30,296 train / 3,787 dev) + 8,000 hard
  negatives (7,200 train / 800 dev, label 0):
  - `data/train_rb.jsonl` — 37,496 rows, 42.7% clickbait, 7,200 hard-neg
    SHA-256 `9818cebd92497b1dd9c3301665378605ef685571159941c203401e30eb9310dc`
  - `data/dev_rb.jsonl` — 4,587 rows, 43.6% clickbait, 800 hard-neg
    SHA-256 `d4cf304f0cbda9fdc6ac0470d2cb3349abf330c8693d09677d9420ec1b71fd65`
- **Cycle-2 training** launched (mDeBERTa-v3-base, same recipe, seed
  20260516). Held-out validation + the pre-registered decision rule
  follow on completion.
