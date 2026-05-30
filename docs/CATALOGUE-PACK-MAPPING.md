# Catalogue → pack mapping

Cross-reference between `pantheon-vedic-catalogue` entries and the rule
packs in `pantheon-guard/src/packs/*.js` that consume them.

Source of truth for the catalogue entries: `C:\ProjectS\pantheon-vedic-catalogue\catalogue.yaml`.
Updated 2026-05-10.

## Why this file exists

A catalogue entry is theoretical (sūtra + bhāṣya + counter + test_question).
A pack detector is operational (regex / lexicon + threshold). Without an
explicit map, the catalogue grows independently of the pack and the pack
grows independently of the catalogue. Both the routine and the detector
work need to point back to the same ID.

When you add a new entry to the catalogue, the next iteration on a pack
should consult this file to decide whether the entry needs to be wired in
or whether it is already covered by an existing detector.

When you add a new detector to a pack, the inline comment must reference
the catalogue ID via `// catalogue: <id>` so the relationship is visible
both ways.

## Mapping (NS 5.1.x — jāti / futile rejoinders)

| Locus | Catalogue ID | Pack detector | State |
|---|---|---|---|
| 5.1.2 | `ns-sadharmyasama-5-1-2` | — | unwired (subsumed by `simulacrum_of_source` indirectly) |
| 5.1.4 | `ns-utkarsa-sama-5-1-4` | — | unwired |
| 5.1.7 | `ns-praptisama-5-1-7` | — | unwired |
| 5.1.10 | `ns-prasangasama-5-1-10` | — | unwired |
| 5.1.11 | `ns-pratidrstantasama-5-1-11` | — | unwired |
| 5.1.12 | `ns-anutpattisama-5-1-12` | — | unwired |
| 5.1.14 | `ns-samshayasama-5-1-14` | — | unwired |
| 5.1.21 | `ns-arthapattisama-5-1-21` | — | **design-debt** (see PROBE-DEBT.md) |
| 5.1.23 | `ns-avisesa-sama-5-1-23` | `epistemology/false_equivalence_levelling` | scaffold |
| 5.1.25 | `ns-upapattisama-5-1-25` | — | **design-debt** — overlap with FE detector |
| 5.1.27 | `ns-upalabdhisama-5-1-27` | `epistemology/anecdotal_override` | scaffold |
| 5.1.29 | `ns-anupalabdhisama-5-1-29` | `epistemology/absence_argument` | scaffold |
| 5.1.32 | `ns-anityasama-5-1-32` | `epistemology/false_equivalence_levelling` (shared anchor) | scaffold |
| 5.1.35 | `ns-nityasama-5-1-35` | `epistemology/naturalization_fallacy` | EN release-candidate |
| 5.1.37 | `ns-karyasama-5-1-37` | — | unwired |

## Mapping (NS 5.2.x — nigrahasthāna / debate-defeat rules)

| Locus | Catalogue ID | Pack detector | State |
|---|---|---|---|
| 5.2.7 | `ns-arthantara-5-2-7` | `epistemology/simulacrum_of_source` | validated |
| 5.2.8 | `ns-nirarthaka-5-2-8` | `opacity/jargon_density_opacity` | release (experimental flag) |
| 5.2.9 | `ns-avijnatartha-5-2-9` | `opacity/jargon_density_opacity` | release (experimental flag) |
| 5.2.10 | `ns-aparthaka-5-2-10` | — | unwired |
| 5.2.11 | `ns-apraptakala-5-2-11` | — | unwired |
| 5.2.12 | `ns-nyuna-5-2-12` | — | unwired |
| 5.2.14 | `ns-punarukta-5-2-14` | — | unwired |
| 5.2.18 | `ns-apratibha-5-2-18` | `epistemology/silence_as_concession` | scaffold |
| 5.2.19 | `ns-viksepa-5-2-19` | — | unwired |
| 5.2.21 | `ns-paryanuyojyopeksana-5-2-21` | — | unwired |
| 5.2.22 | `ns-niranuyojyanuyoga-5-2-22` | — | unwired |
| 5.2.23 | `ns-apasiddhanta-5-2-23` | — | unwired |
| 5.2.6 | `ns-hetvantara-5-2-6` | — | unwired |
| 5.2.2 | `ns-pratijna-hani-5-2-2` | — | unwired |
| 5.2.3 | `ns-pratijnantara-5-2-3` | — | unwired |
| 5.2.4 | `ns-pratijna-virodha-5-2-4` | — | unwired |
| 5.2.5 | `ns-pratijna-sannyasa-5-2-5` | — | unwired |

## Mapping (NS 1.2.x — taxonomic / definitional)

| Locus | Catalogue ID | Pack detector |
|---|---|---|
| 1.2.2 | `ns-jalpa-definition-1-2-2` | `epistemology/source_trace_break` (anchor) |
| 1.2.3 | `ns-vitanda-definition-1-2-3` | — |
| 1.2.5 | `ns-savyabhicara-1-2-5` | — |
| 1.2.6 | `ns-viruddha-1-2-6` | — |
| 1.2.7 | `ns-prakaranasama-1-2-7` | — |
| 1.2.8 | `ns-sadhyasama-1-2-8` | — |
| 1.2.9 | `ns-kalatita-1-2-9` | — |
| 1.2.10–14 | `ns-chala-three-types-1-2-10-14` | — |
| 1.2.18 | `ns-jati-definition-1-2-18` | — (definitional, not operational) |

## Non-NS anchors

| Catalogue cluster | Pack detector |
|---|---|
| `bg-asuri-epistemology-16-8` | `epistemology/indifference_to_truth` |
| `manu-satya-priya-4-138` | `epistemology` `NAMED_SOURCE_PATTERNS` (inhibitor) |
| `ys-satya-pratistha-2-36` | `epistemology` `UNCERTAINTY_PATTERNS` (inhibitor) |
| `ys-pratipaksha-bhavana-2-33` | — (general orientation, not detector-anchored) |
| Reestr M-7 | `epistemology/epistemic_closure` |
| Reestr (ad-hominem class) | `epistemology/ad_hominem` |

## Maintenance rule

When opening a PR that adds a pack detector or a catalogue entry:

1. If pack detector — add `// catalogue: <id>` comment immediately above
   the pattern array or requirement object.
2. If catalogue entry — extend this table; mark `unwired` if no detector
   exists yet.
3. State changes (`scaffold` → `release-candidate` → `release`) require an
   update to `docs/PROBE-DEBT.md` AND this file in the same PR.
