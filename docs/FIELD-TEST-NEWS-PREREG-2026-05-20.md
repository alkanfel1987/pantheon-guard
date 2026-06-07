# Field test on fresh news — pre-registration (2026-05-20)

**Status:** registered before any fresh content pulled — frozen.

**Object under test:** the **validated, evolved** 4-layer manipulation model,
as it stands AFTER:
- Condition 3 validation (NEAR-FULL PASS, set-tagging adopted)
- Trigger #3 (attribution + bridges, F5/F6 → 🟢)
- Catalogue integration (schema v2 pilot in `pantheon-vedic-catalogue`)

**Object NOT under test:** the detector arc (closed — fresh-probe 8.3%,
66/70 detectors mortal). This is a **taxonomy field test** — does the
evolved model still tag well when thrown back into its original
training-adjacent domain (news headlines) with fresh data, set-tagging,
12-class axis, new techniques available.

## Why news now

1b validated the stacked model at sanity-check tier on news headlines.
Condition 3 validated set-tagging at validation tier on cross-type content
(marketing/scam/dark-pattern/health/politics). The model evolved during
Condition 3 (set-tagging, `inattention` class added, `presupposition`
technique named). The question this test answers:

**Does the evolved model still work on the original domain?** And — does
the new `inattention/cognitive-default` class fire at all on news (or is
it a marketing/dark-pattern artifact)? Does `presupposition/silent-assent`
fire in news framing?

This is the empirical equivalent of regression-testing a feature change:
the model passed validation on cross-type data; now re-run it on the
domain where it was originally developed.

## Sources (FIXED before pull)

Same publisher set as 1b, intersected with what proved reachable that day:

- **RU:** lenta.ru, kp.ru, ria.ru
- **EN:** buzzfeed.com, boredpanda.com, axios.com
- **DE:** t-online.de, web.de

Substitution if blocked → log per 1b precedent. Wide-block scenario
(>50% of sources fail) → halt and document a blocker; don't fake a pull
with degraded sourcing.

## Pull procedure (FIXED)

1. Fetch each publisher's front page on **2026-05-20**.
2. Take headlines in **DOM order**, no cherry-pick — first ~8-12 per
   publisher until N ≈ 30 per language (~90 total).
3. Record verbatim headline + URL + pull date.
4. Freeze into `examples/field-test-news-corpus-2026-05-20.js`.
5. SHA-256 captured after labeling, before any downstream tagging.

## Labeling (FIXED)

Each item labeled manipulative / neutral against the 1b rubric.
Manipulative if matches ≥ 1:

- false urgency / manufactured scarcity
- fear-based escalation
- clickbait curiosity-gap (withheld payoff, "you won't believe")
- dark-pattern / pressure copy
- emotional-manipulation framing

Borderline → **neutral** (conservative). Same rubric as 1b for
comparability. Without a user adjudication pass (user is offline today),
labeling is Claude single-annotator first-pass — disclosed as a limit;
Haiku second-annotator pass adds redundancy at the tagging step
(Phase 5 below), not at the labeling step.

## Vulnerability axis (FIXED — model post-Condition-3, post-Trigger-3)

12 classes, **co-active set** (multi-hot, order-independent):

`fear` · `lobha` · `mada` · `belonging` · `curiosity` · `shame` ·
`authority` · `tribal` · `love` · `kāma` · `hope/despair` ·
`inattention/cognitive-default`

Technique = open-ended Layer-3 functional move (includes new family
`presupposition / silent-assent`).

## Hypotheses (pre-registered, falsifiable)

- **H1 — News distribution shape preserved.** Curiosity, fear (krodha-
  flavoured), shame, mada remain dominant (per 1b: curiosity ~10/36,
  krodha ~11/36, mātsarya ~5, fear ~5, mada ~3, kāma ~2, shame ~2).
- **H2 — `inattention/cognitive-default` predicted RARE in headlines.**
  Preselection / structural-default exploits live in UI, not in text. If
  it fires on ≥2 items on news, that would be a surprise — would mean
  presupposition-like patterns hit it (consistent with the user's
  silent-assent family observation). If 0 items: expected.
- **H3 — `presupposition/silent-assent` MAY fire on news.** News framing
  routinely smuggles claims as background ("as is well known…", "any
  reasonable observer sees that…"). Falsifiable prediction: ≥2 items
  tagged with this technique would confirm generalization from the
  Condition-3 supplement to live news.
- **H4 — Compound (dual-V or more) tagging ≥ 30% of items.** 1b's stack
  test found ~⅓ dual; set-tagging makes this representable. Expect at
  least similar share or higher.
- **H5 — Inter-annotator (Opus × Haiku, blind, set-framed):**
  - lever-set overlap ≥ 90% (Condition-3 baseline 97%)
  - exact set-equality ≥ 60%
- **H6 — vs 1b precedent:** same V-distribution shape (no big new lever
  emerges); compound tagging picks up MORE dual-V than 1b's ranked pair
  (set-tagging removes the artificial ranking).

## PASS / FAIL (pre-registered)

**PASS:** H1, H4, H5 hold; H2 result either way (rare-or-zero IS the
prediction); H3 either confirmed (≥2 firing) OR explained by absence.

**FAIL:** V axis collapses (one class > 80%); inter-annotator overlap
< 70%; a new lever or technique class needed that the model can't host.

**PARTIAL:** mixed — recorded honestly, no rounding toward PASS.

## Honest limits

- **Single-day pull (snapshot).** News cycles bias the day's content;
  N modest per-language.
- **Same publishers as 1b** — not independent in publisher sense. This
  is by design (regression-test on familiar domain), but disclosed.
- **User offline today** — no human adjudication pass; H5 measures
  Claude×Haiku, not Claude×user. Tier: between sanity-check and validation;
  honestly labelled "field-test tier."
- **WebFetch reliability per 1b** — some publishers may block; logged
  and substituted in the amendments log.
- **Labeling is single-annotator (Claude).** Conservative rubric
  ("borderline → neutral") mitigates false-positive labeling but biases
  toward UNDER-counting manipulative.

## Amendments log (append-only)

*(pull results / WebFetch failures / substitutions recorded here)*
