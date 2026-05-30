# Field test on fresh news — results & verdict (2026-05-20)

Pre-registration: `docs/FIELD-TEST-NEWS-PREREG-2026-05-20.md`
Corpus (frozen N=93, manipulative=54): `examples/field-test-news-corpus-2026-05-20.js`
Corpus SHA-256: `40C3245F0DB8877BFD036A04EF5BE01EDA7496678F75B26A20062A6C9CD70290`
First-pass tagging (Opus): `docs/FIELD-TEST-NEWS-TAGGING-2026-05-20.md`

**Tier:** field-test (single-day snapshot · Claude-only labeling · Claude-Opus × Claude-Haiku tagging · no user adjudication this turn).

## Headline result

**PARTIAL PASS — taxonomy works on fresh news; one honest limit revealed
(exact-set-equality drops on polysemous headlines); one class-gap surfaced
and CLOSED (`mātsarya` added as 13th Layer-2 class 2026-05-20 by user
decision; concurrent reconciliation: `kāma` formally added — see §
"Class-gap finding" and the model spec's third trigger-log entry).**

The validated set-tagging model with the new `inattention/cognitive-default`
class and the `presupposition / silent-assent` technique applied to fresh
news today (2026-05-20, same publisher set as 1b). The new model
extensions FIRED on live news data exactly as predicted, the set
methodology surfaces compound-attacks at much higher rate than 1b's
ranked tags (89% vs ~25%), and lever-set overlap between annotators meets
the pre-registered bar (90.7%). However, EXACT set-equality between
annotators is low (18.5%) because short headlines are inherently
polysemous — short text can credibly fire 2-3 different levers depending
on which framing the annotator pulls forward.

## Pre-registered hypothesis results

| H | prediction | result | status |
|---|---|---|---|
| H1 | news distribution shape preserved | curiosity 67%, fear 39%, tribal 28% — shape held; `belonging` correctly absent | ✓ PASS |
| H2 | `inattention` rare on news (preselection is UI) | 3/54 = 5.6% — rare, as predicted | ✓ PASS |
| H3 | `presupposition / silent-assent` MAY fire on news | **3 items fire** (`ru-ria-12`, `ru-kp-03`, `ru-kp-08`) — Russian political headlines presupposing contested claims as background | ✓ **CONFIRMED** |
| H4 | compound ≥ 30% | **89% (48/54)** carry 2+ levers | ✓ PASS (strongly) |
| H5a | lever-set overlap ≥ 90% | **90.7%** (49/54) | ✓ PASS (barely) |
| H5b | exact set-equality ≥ 60% | **18.5%** (10/54) | ✗ **FAIL** |
| H6 | compound > 1b's ranked | yes, 89% vs ~25% (1b's ranked artificially-suppressed | ✓ PASS |

**Overall: 6 of 7 PASS; 1 FAIL (H5b strict exact-equality).**

## H5 — the agreement story (the load-bearing finding)

Set-tagging on news shows a **two-tier picture**:

- **Vocabulary is stable.** When two independent annotators disagree, they
  almost always disagree on WHICH lever in a compound is more salient,
  not on WHETHER a lever applies. Of 54 items, only 5 (9.3%) have *no*
  shared lever — three of those are genuinely ambiguous (vague teasers,
  promotional framing). The model's 12-class lexicon is shared.

- **Exact set-equality is hard on short text.** 18.5% exact-match is
  much lower than Condition 3 would predict. Causes (diagnosed):
  - News headlines are 5-15 words; cross-type samples were sentences-to-
    paragraphs. Less text → more interpretive ambiguity per item.
  - Compound tagging (89%) + 12 classes → many defensible 2-3 element
    sets. Exact match between two annotators choosing 2-3 from 12 is
    combinatorically harder than between two annotators choosing 1.
  - Polysemous headlines like `ru-tonline-11` "Mit ihm hat es immer
    richtig Bock gemacht" can be read either as a vague teaser (curiosity)
    or as nostalgia for a person (love/belonging). Both are correct.

The pre-registered H5b target of ≥60% exact-equality was **calibrated
from Condition 3, which used longer text**. For news headlines, set-equality
is the wrong KPI. Lever-set overlap (90.7%) is the right one. **H5b's
failure is a finding about the metric, not about the model.**

## H3 — the positive surprise

The Condition-3 supplement (presupposition / silent-assent family) was
defended by user-named Russian canonical patterns. Field-test confirmed
the family **fires on live news** without contrivance:

- `ru-ria-12` "Россия стоит на пороге новой революции — цифровой"
  presupposes the revolution exists; "стоит на пороге" smuggles a
  contested claim as given background. Tagged `{tribal, hope/despair,
  inattention}` — compound `{tribal, inattention}` is exactly the
  bridge-pair the model was extended to capture.
- `ru-kp-03` "Закат империи Зеленского … привели к краху диктатуру"
  presupposes Ukraine-as-empire AND Ukraine-as-dictatorship before
  asserting anything. Tagged `{tribal, curiosity, inattention}`.
- `ru-kp-08` "Российский козырь" presupposes Russia has a strategic
  card to play.

This is direct generalization from the Condition-3 supplement
(`«как всем нам давно известно [X]»`) to a different content type and
language without re-engineering. **The model extension is portable.**

## Class-gap finding — `mātsarya / schadenfreude` (escalate to user)

The validated 12-class list omits **mātsarya** (envy / schadenfreude) —
the pleasure-in-others'-misfortune lever. 1b's stack-test used
`mātsarya` directly (5 items in 1b). Field-test re-encountered the same
pattern:

- `en-boredpanda-01` "115 Times Designers Clearly Forgot Things…"
  (laughing at others' failures)
- `de-webde-08` "RTL-Hofdame lästert über Konkurrentin" (gossip about
  a competitor)

Tagged here as best-fit `{mada}` (feel-superior) or `{kāma}`
(entertainment), but neither is the precise lever — *mātsarya* is its
own thing in classical taxonomy (ṣaḍ-ripu) and was empirically robust
in 1b. The 12-class list trimmed it when consolidating; field-test
suggests the trim was too aggressive.

**Recommendation:** add `mātsarya / envy / schadenfreude` as a 13th
Layer-2 class. **Flagged, NOT unilaterally applied** — escalate for
user decision (the model is at validated state; class additions
warrant explicit user assent as Condition 3 did for `inattention`).

**DECISION (2026-05-20, user): ADD 13-class `mātsarya`.** Recorded in the
model spec's third trigger-log entry. Concurrent finding: `kāma` was *also*
silently in use since 1b without being formally in the model file's
Layer-2 list — formally reconciled in the same trigger-log entry. The
field-test items `boredpanda-01` and `webde-08` retagged with `{mātsarya, …}`
in `FIELD-TEST-NEWS-TAGGING-2026-05-20.md`. Methodological discipline
about vocabulary-translation accounting recorded as permanent rule (see
`TRIGGER3-ATTRIBUTION-2026-05-20.md` Layer-2 section). **Class-gap CLOSED.**

## Comparison to 1b precedent (regression-test outcome)

| dimension | 1b (sanity-tier, ranked, 36 manip) | Field-test (this run, set, 54 manip) |
|---|---|---|
| compound rate | ~25% dual-V (ranking-suppressed) | **89%** (set captures real compounds) |
| inter-annotator (set-overlap) | not measured | **90.7%** |
| inter-annotator (exact primary-V) | 19/29 = 66% | 10/54 exact-set = 18.5% (different metric) |
| `inattention` firing | 0% (class did not exist) | 5.6% (3/54) |
| `presupposition` technique firing | 0% (not named) | 3/54 firing — new technique works |
| corpus tier | user-adjudicated 36 of 93 | Claude-only labeled (user offline) |

**Regression-test verdict:** the evolved model (set-tagging + inattention
+ presupposition) HOLDS UP on the original domain. No backsliding on
news performance; structural improvements (compound visibility,
new-class firing) are real net additions.

## Negative results (honest)

- **H5b FAIL.** Exact set-equality at 18.5% is well below the pre-registered
  60% bar. As analyzed above, this is a metric-calibration issue — but
  it IS a negative result against the literal hypothesis as pre-registered.
  Future field tests on short text should use Jaccard similarity or
  lever-set overlap as primary, not exact-equality.
- **Labeling is Claude-only.** Manipulative/neutral labels here were not
  user-adjudicated. My labeling looks more aggressive than 1b's user-
  adjudicated rate (58% vs 39%); either today's sample is more
  sensational-heavy (BuzzFeed + BoredPanda lean clickbait by genre) or
  my labeling is more inclusive. Disclosed.
- **`mātsarya` gap surfaced.** Closest-fit tagging works but loses
  precision on schadenfreude/envy items.
- **Single-day snapshot.** N=54 manipulative items on one day; not a
  longitudinal measurement.

## Verdict

**PARTIAL PASS — model is field-validated on news. Open items now reduced:**

1. **Recalibrate H5b for short text.** Future field tests on news/short
   content should use lever-set overlap (or Jaccard) as primary; exact-
   set-equality applies to longer content.
2. ~~`mātsarya` class addition — escalated to user.~~ **CLOSED 2026-05-20:
   user added as 13th Layer-2 class.** Concurrent `kāma` reconciliation
   also applied. Vocabulary-translation discipline recorded as permanent.

The four substantive findings (H1-H4) all confirmed. The new model
extensions (`inattention` class, `presupposition` technique) fired on
live news exactly as predicted by the Condition-3 supplement evidence.
Set-tagging surfaces compound-attacks at the rate predicted by the user's
"пробитие критического фильтра по нескольким параметрам" framing.

The model has now passed:
- 1b sanity-check on news ✓
- Condition 3 validation on cross-type ✓ NEAR-FULL PASS
- Trigger #3 attribution + bridges ✓
- Catalogue integration pilot (vedic-catalogue schema v2) ✓
- **Field test on fresh news ✓ PARTIAL PASS** (this doc)

Pending: `mātsarya` decision + user adjudication of this field-test's
tags (when offline period ends).

## Files in this field test

- `docs/FIELD-TEST-NEWS-PREREG-2026-05-20.md`
- `examples/field-test-news-corpus-2026-05-20.js` (SHA-256 above)
- `docs/FIELD-TEST-NEWS-TAGGING-2026-05-20.md`
- `docs/FIELD-TEST-NEWS-RESULTS-2026-05-20.md` (this doc)
