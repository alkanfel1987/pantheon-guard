# jāti coverage — stop-plan

Decision document. The catalogue currently extracts ~15 of the 24 canonical
Nyāya-sūtra jāti types (NS 5.1.x). This file fixes whether the remaining
gap is closed, deferred, or treated as out-of-scope by design.

Status: 2026-05-10.

## Background

Nyāya-sūtra 5.1 enumerates 24 jāti (futile rejoinders). The catalogue
extraction prioritized loci with operational value for AI-output filtering.
After 16 Phase-2 batches the routine reports 17/24 jāti coverage (counting
indirect anchors); direct-ID coverage is 15/24.

Missing or undersampled (from canonical list):

| Canonical name | Status |
|---|---|
| vaidharmya-sama (by dissimilarity) | not extracted — symmetric inverse of `sādharmya-sama` (5.1.2) |
| apakarṣa-sama (by inferiority) | not extracted — symmetric inverse of `utkarṣa-sama` (5.1.4) |
| varṇya-sama / avarṇya-sama | not extracted — definitional pair, low operational density |
| vikalpa-sama (by alternative) | not extracted — partial overlap with `upapatti-sama` |
| aprāpti-sama (by non-attainment) | not extracted — symmetric inverse of `prāpti-sama` (5.1.7) |
| ahetu-sama (by hetu-failure) | not extracted — overlaps with hetvābhāsa-corpus 1.2.x |

## Decision

**STOP** at current coverage. Do not pursue the remaining ~7-9 jāti as a
backlog item.

**Rationale.**

1. **Symmetric-inverse redundancy.** vaidharmya-sama is the dissimilarity-
   axis of sādharmya-sama; apakarṣa-sama is the inferiority-axis of
   utkarṣa-sama; aprāpti-sama is the non-attainment-axis of prāpti-sama.
   These are the same manipulation pattern reversed. A pack detector
   anchored to one will, with mild generalization, fire on the other.
   Adding both halves to the catalogue is theoretical completeness
   without operational gain.

2. **Definitional / low-frequency residue.** varṇya / avarṇya / vikalpa
   are taxonomic positions in the formal vāda treatise that rarely
   surface in contemporary discourse outside Sanskritic scholarship.
   Per `pantheon-guard` discipline (memory `feedback_customer_pain_anchor`),
   each detector must be motivated by a target-customer pain. None
   articulated for these.

3. **Customer-pain match already covered.** The 15-extracted jāti span
   the operational manipulation classes:
   - false analogy (sādharmya, utkarṣa, prāpti)
   - counter-example fishing (pratidṛṣṭānta)
   - infinite regress (anutpatti)
   - doubt-injection (saṃśaya)
   - implication-reversal (arthāpatti)
   - false equivalence (aviśeṣa, anitya)
   - alternative-explanation false-balance (upapatti)
   - anecdotal override (upalabdhi)
   - argument from absence (anupalabdhi)
   - naturalization (nitya)
   - reductio (kārya)

   Any contemporary adversarial pattern should be expressible as a
   variant of these or as a non-jāti category (asuric epistemology,
   nigrahasthāna 5.2, hetvābhāsa 1.2). If it is not, the catalogue
   architecture itself needs revisiting — not jāti completion.

4. **Theoretical completeness creates probe-debt.** Each new detector
   requires manual-curated real-corpus probe (per `PROBE-DEBT.md`).
   We already have a 4-detector probe queue (PROBE-DEBT.md §"Next-action
   queue"). Adding ~7 more pre-emptively before clearing existing debt
   is exactly the cycle-2 pattern flagged in `CLAUDE.md`.

## Re-open conditions

This decision is reversible. Re-open the gap if any of the following:

- A real-world adversarial sample appears in the wild that is unambiguously
  one of the missing jāti AND cannot be matched by any existing detector
  (test: regex-extend on closest detector returns FN). Sample → catalogue
  entry → detector. One-by-one, demand-driven.
- A scholarly outreach target (Indic AI Alignment track per
  memory `project_indic_ai_alignment_track.md`) explicitly asks for the
  full 24-jāti set as a coverage claim. In that case the additions are
  driven by deliverable expectation, not internal completeness.
- An academic publication route opens that requires 24/24 enumeration as
  a peer-reviewable artifact. Catalogue then completes to 24, but pack
  detectors remain customer-pain-driven (do not auto-promote into pack).

## Effect on commercial claims

Until re-opened:

- README / npm / КП material describes coverage as "core jāti operational
  classes" or "15 catalogue entries spanning the 11 operational
  manipulation classes", NOT "24/24" or "complete jāti coverage".
- `docs/CATALOGUE-PACK-MAPPING.md` is the source of truth for which jāti
  loci ground which pack detectors.
- `docs/PROBE-DEBT.md` is the source of truth for which detectors are
  validated vs scaffold.

## Authority and revision

This is a small-decision file. Any contributor may propose re-opening
by submitting a PR that (a) names the re-open trigger above, (b) adds
the corresponding catalogue entry, (c) updates this file's "Re-open
conditions" section with the date and trigger.
