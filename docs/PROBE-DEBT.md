# Probe-debt inventory — epistemology pack v0.3.0-pre.1

Status as of 2026-05-10 (post FE probe).

This document tracks which jāti detectors in `src/packs/epistemology.js` have
been validated on a real-corpus probe (per `CLAUDE.md` "empirical verification
before claiming") versus those still on synthetic / author=tester sanity.

A scaffold detector is **NOT** safe to cite as production-ready in commercial
material (КП, README, npm description) — it must be footnoted as scaffold.

## Detectors and their state

| Pack ID | Catalogue anchor | Status | Probe report |
|---|---|---|---|
| `naturalization_fallacy` | ns-nityasama-5-1-35 | EN release-candidate (catch 63.6% [35.4, 84.8], FP 0% [0, 35.4]) | `test-corpus/naturalization-2026-05-09/REPORT.md` |
| `false_equivalence_levelling` | ns-avisesa-sama-5-1-23, ns-anityasama-5-1-32 | **iter-3 SHIP 2026-05-10 (Option B)** — synthesis 100% + 6 broad patterns + inhibitor; live training catch 66.7% / 0% FP on N=20; Tier 1 BLOCKED (no held-out positives) | synthesis: `test-corpus/false-equivalence-2026-05-10/`<br>live R1: `test-corpus/false-equivalence-LIVE-2026-05-10/`<br>**iter-3: `test-corpus/false-equivalence-LIVE-iter3-2026-05-10/REPORT.md`** |
| `absence_argument` | ns-anupalabdhi-sama-5-1-29 | synthesis-validated release-candidate (iter-1 catch 83.3%, iter-2 post-fix 100% same-corpus, FP 0%, inhibitor 100% specific, N=12/14 synthesis); LIVE-CORPUS PROBE PENDING | `test-corpus/absence-argument-2026-05-10/REPORT.md` |
| `anecdotal_override` | ns-upalabdhi-sama-5-1-27 | synthesis-validated release-candidate (iter-1 catch 75.0%, iter-2 post-fix 100% same-corpus, FP 0%, N=12/12 synthesis); LIVE-CORPUS PROBE PENDING | `test-corpus/anecdotal-override-2026-05-10/REPORT.md` |
| `silence_as_concession` | ns-apratibha-5-2-18 | synthesis-validated release-candidate (iter-1 catch 58.3% RU-broken / iter-2 post-fix 100% same-corpus, FP 0%, N=12/12 synthesis); LIVE-CORPUS PROBE PENDING | `test-corpus/silence-as-concession-2026-05-10/REPORT.md` |

Plus prior detectors (validated on Shemshuk + Kotsnews corpora):

| Pack ID | Status |
|---|---|
| `indifference_to_truth` | validated on N=119 fresh-pull corpus (cycle 1+2) |
| `simulacrum_of_source` | validated alongside indifference_to_truth |
| `source_trace_break` | validated alongside indifference_to_truth |
| `epistemic_closure` (M-7) | validated learning-cycle 2026-05-08 |
| `ad_hominem` | validated learning-cycle 2026-05-08 (FN-Group 6) |

## Catalogue → pack gap

The catalogue has two new jāti entries from batch 16 (2026-05-08) that are
NOT yet wired into the epistemology pack:

| Catalogue ID | jāti | Why not yet wired |
|---|---|---|
| `ns-arthapattisama-5-1-21` | spurious implication / undirected inference | pattern requires inference-context modelling beyond regex (ranges over the speaker's preceding claim); needs design phase |
| `ns-upapattisama-5-1-25` | alternative-explanation false-balance | overlaps materially with `false_equivalence_levelling` — risk of double-fire on same text. Decide: extend FE patterns to cover the `upapatti` pivot, or add as separate detector with mutual-exclusion check |

Adding either as plain pattern-array scaffold without design + probe = cycle-2
trap (more probe-debt, no validation gain). Holding the line: design-then-probe.

## Probe-debt rules

A detector graduates from `scaffold` → `release-candidate` only after:

1. **Pre-registered** label set on a held-out corpus (≥ N=10 positive / N=5
   negative for first probe; subsequent iterations expand).
2. **Manual-curated** corpus from confirmed-adversarial sources — not auto-pull
   (memory `feedback_lexicon_for_opacity_detection.md` + iter-4 lesson:
   auto-pull `DEV.to /tags/...` returns tutorials, not adversarial prose).
3. **Wilson 95% CI** on catch and FP, point estimate alone insufficient.
4. **Author ≠ tester** for label assignment OR explicit "synthesis-only" label
   in the report (cannot be cited as external validation).
5. Threshold sweep, if any, is on **independent** corpus, not on the training
   set (cycle-2 trap).

## Next-action queue (probe-side, not detector-side)

**Discipline reset after FE LIVE probe (2026-05-10):** synthesis-pass is
now known to be a poor predictor of live performance (FE detector showed
100pp gap). Synthesis-pass remains useful as a **structural sanity
check** — it surfaces regex bugs and confirms patterns parse as intended
— but it does NOT graduate a detector toward production.

In priority order:

1. ~~**`false_equivalence_levelling` live-corpus probe**~~ — DONE 2026-05-10
   in 2 stages. Stage A: DEMOTE on baseline iter-2 patterns (0/6 catch).
   Stage B: iter-3 broadening (Option B) brought catch to 4/6 = 66.7% on
   training-set, 0% FP on combined N=20 negatives. Tier 1 BLOCKED — Round-2
   surfaced 0 held-out positives. **NEW HIGH-priority item:** manual-
   curated held-out positive corpus collection for FE — owner-involvement
   work (10-15 verbatim FE samples beyond Round-1 sources, e.g. via Reddit
   archive download, manual paste from paywalled articles, Telegram
   channel exports).
2. **`absence_argument` LIVE probe** — HIGH priority. Synthesis 100% is
   not evidence of live capability. Source: alt-med forums, anti-vaccine
   commentary, climate-skepticism substacks. Same probe shape as FE LIVE.
3. **`anecdotal_override` LIVE probe** — HIGH priority. Source: alt-med
   forums, workplace forums, parenting forums.
4. **`silence_as_concession` LIVE probe** — HIGH priority. Source:
   substack op-eds + political commentary. Note: FP-stress-test should
   include neutral wire-service "declined to comment" reportage to
   confirm pattern doesn't fire on legitimate non-response.

5. **Detector design review (after the three LIVE probes above):**
   if all three show similar 100pp gaps, the architecture decision is:
   accept narrow scope + reposition packs commercially as
   "canonical-form detectors", OR redesign as semantic/embedding
   classifiers (v0.4.x scope discussion).

**Stop running synthesis probes by themselves.** They surface regex
bugs (real value) but their catch numbers are now known to be
self-fulfilling. Each new detector should ship with a paired
synthesis (for bug discovery) + live (for capability claim) probe.

Each probe = pre-registered N≥15 / N≥10 corpus, output report under
`test-corpus/<detector>-<date>/REPORT.md`, then patch metadata block in
`epistemology.js` with the `*ProbeResult` field analogous to
`naturalizationProbeResult`.

## Honest scope (per `CLAUDE.md` discipline)

- v0.3.0-pre.1 ships **5 jāti detectors**: 1 release-candidate + 4 scaffold.
- README / npm description must NOT claim "5 jāti detectors validated".
  Acceptable claim: "1 j­āti detector (naturalization, EN) at release-candidate;
  4 j­āti detectors at scaffold pending real-corpus probe."
- Two further jāti from catalogue (arthāpatti, upapatti) are tracked as
  design-debt, not scaffold-debt — explicit decision before pattern-array.
