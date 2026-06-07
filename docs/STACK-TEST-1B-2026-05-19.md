# Trigger #1b — stack-integration test (2026-05-19)

Tests the **stacked** integration of the manipulation model (archived:
`00-Quarantine/archived-with-triggers/2026-05-19-manipulation-model-4layer.md`),
after trigger #1 falsified only the *merge* integration.

## Pre-registration (fixed before tagging)

**Claim under test:** technique (Function) and vulnerability are *orthogonal*
axes; tagging real manipulative content by BOTH is coherent, the vulnerability
is determinable, and knowing it narrows the technique-space (works as an
analysis entry-point).

**Axes:** Vulnerability = ṣaḍ-ripu (kāma/krodha/lobha/moha/mada/mātsarya) +
kleshas (avidyā/abhiniveśa/asmitā). Technique = the rhetorical/functional move.

**Corpus:** the 36 user-adjudicated manipulative items from
`fresh-probe-2026-05-19-corpus.js` — real, DOM-pulled, non-cherry-picked.
**Limitation:** news headlines only → narrow vulnerability range. Disclosed.

**PASS criteria:** vulnerability determinable for most items · varies across
≥4 classes · one-V-to-many-T holds (genuine orthogonality) · V narrows the
T-space. **FAIL:** V chronically undeterminable / collapses to one class /
V trivially fixed by T / no narrowing.

**Tier:** sanity-check (Claude assembled the axis + Claude tagged).
Validation-tier requires user-adjudicated tags + a broader (non-news) corpus.

## Two-axis tagging (36 items)

| id | Vulnerability | Technique | dual-V? |
|---|---|---|---|
| ru-lenta-02 | mada (нац. гордость) | loaded-quote-as-fact | |
| ru-lenta-08 | mada (мартиальная гордость) | heroizing-frame | |
| ru-lenta-09 | curiosity | curiosity-gap (vague reveal) | |
| ru-kp-01 | krodha | atrocity-emotional-frame | +fear |
| ru-kp-03 | krodha | loaded-epithet + curiosity-gap | +curiosity |
| ru-kp-04 | curiosity | curiosity-gap teaser | |
| ru-kp-06 | curiosity | mystery-sensational-frame | |
| ru-kp-07 | krodha | loaded-epithet | |
| ru-kp-08 | curiosity | shock-quote-selection | |
| ru-kp-12 | fear (abhiniveśa) | catastrophize-label | |
| ru-ria-04 | krodha | loaded-verb + shock-quote | |
| ru-ria-07 | krodha | loaded-framing | |
| ru-ria-12 | fear | fear-escalation + loaded-epithet | +krodha |
| en-buzzfeed-01 | kāma (тяга к комфорту) | listicle + benefit-promise | |
| en-buzzfeed-03 | kāma (тяга к развлечению) | listicle + hyperbole | |
| en-buzzfeed-04 | curiosity | listicle + emotion-words | |
| en-buzzfeed-05 | fear | listicle + catastrophize | |
| en-buzzfeed-06 | curiosity | curiosity-gap ("Here's How") | |
| en-buzzfeed-07 | shame/insecurity | shame-hook + product-push | |
| en-buzzfeed-08 | shame/insecurity | shame-hook + product-push | |
| en-boredpanda-01 | mātsarya (schadenfreude) | listicle + emotional-superlative | |
| en-boredpanda-04 | krodha | loaded-epithet + curiosity-gap | +curiosity |
| en-boredpanda-06 | mātsarya | shock-quote + dramatize | +curiosity |
| en-boredpanda-07 | mātsarya | insinuation | |
| en-boredpanda-08 | curiosity | curiosity-gap + dramatize | +mātsarya |
| en-boredpanda-09 | fear | catastrophize + curiosity-gap | +curiosity |
| en-boredpanda-10 | mātsarya | listicle + moralize | +krodha |
| en-boredpanda-12 | curiosity | conflict-dramatize | +mātsarya |
| de-tonline-02 | curiosity | curiosity-gap (withheld number) | |
| de-tonline-03 | krodha | provocative-emotional-frame | |
| de-tonline-04 | mātsarya | insinuation | |
| de-tonline-05 | mada (вызов эго) | challenge-bait | |
| de-tonline-09 | krodha | loaded-epithet ("Schmach") | |
| de-webde-05 | krodha | loaded-verb ("zerpflückt") | |
| de-webde-07 | fear | loaded-verb ("durchlöchert") | +krodha |
| de-webde-10 | krodha | inflammatory-quote-as-headline | |

## Findings

**F1 — Vulnerability discriminates real content.** The 36 spread across 7
classes: curiosity ~10, krodha ~11, mātsarya ~5, fear ~5, mada ~3, kāma ~2,
shame ~2. Unlike trigger #1 (40% of catalogue collapsed to avidyā), on
*content* the axis varies. The earlier "collapse" was an artifact of
mis-applying the axis to technique-entries — confirmed.

**F2 — Genuine orthogonality.** One vulnerability ↔ many techniques: curiosity
runs via gap-teaser / listicle / shock-quote / withheld-number; krodha via
loaded-epithet / loaded-verb / atrocity-frame / inflammatory-quote. The two
axes vary independently — they are NOT a 1:1 relabeling. Some coupling exists
(shame→product-push; insinuation→mātsarya) but it is partial, not total.

**F3 — Axis GAP: curiosity.** The single most common vulnerability here (~10/36)
is *curiosity*, which is NOT cleanly a ṣaḍ-ripu or a klesha. It had to be
forced (curiosity ≈ kāma-as-desire-to-know). The pure Vedic 6+5 list misses
the dominant lever of clickbait. The axis must be **extended** (add curiosity;
likely shame/insecurity too — 2 more items).

**F4 — ~⅓ are genuinely dual-vulnerability.** 9/36 hook two vulnerabilities at
once (e.g. curiosity+mātsarya, fear+krodha). Single-label forces a choice that
isn't there. The model needs **primary + secondary** vulnerability tagging.

**F5 — Entry-point function works.** Knowing the vulnerability genuinely
narrows the technique-space (curiosity → look for gap/teaser/listicle, not
loaded-epithet). The "analysis entry-point" use holds.

## Verdict — PARTIAL PASS

The **stacked** two-axis model is validated at sanity-check tier: technique and
vulnerability are genuinely orthogonal, both determinable on real content, and
the vulnerability axis works as an entry-point. Trigger #1's apparent failure
is now fully explained — it mis-tested by merging two orthogonal layers.

**Three conditions before integration:**
1. **Extend the axis** — add `curiosity` and `shame/insecurity`; the pure
   ṣaḍ-ripu/kleshas list has a coverage gap.
2. **Multi-tag** — allow primary + secondary vulnerability; ~⅓ of content is
   genuinely dual.
3. **Validation tier** — current result is Claude-assembled + Claude-tagged on
   a news-narrow corpus. Real validation needs user-adjudicated tags + a
   broader corpus spanning content-types (marketing, scam, UX dark patterns).
