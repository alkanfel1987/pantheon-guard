# Fresh held-out probe — MEDICAL domain — pre-registration (2026-05-19)

**Status:** registered before any fresh content is pulled or labelled — frozen.
**Purpose:** a second-domain honest catch / FP measurement. Tests whether
pantheon-guard's `healthcare` pack generalizes to fresh medical content it has
never seen — the cross-domain evidence for the NVIDIA dialogue.

## Why a second domain

The news fresh probe (`FRESH-PROBE-PREREG-2026-05-19.md`) measures one domain.
A filter that holds on fresh news *and* fresh medical content is a
generalization story; one that collapses on the second domain is honest scope
to know before any pitch. guard already ships a `healthcare` pack (v0.1.4,
Tier 1, RU + EN) — this probe exercises it, no new build.

**Pack scope:** healthcare pack is RU + EN only — this probe is **RU + EN**
(no DE).

## Sources (FIXED before pull)

Current health / medical content, pulled 2026-05-19. A mix of straight medical
news (expected mostly neutral) and health-advice / wellness content (where
health-manipulation concentrates).

- **RU:** health.mail.ru, aif.ru (Здоровье section), ria.ru (health/medicine tag)
- **EN:** medicalnewstoday.com, healthline.com, sciencedaily.com (health section)

If a section page yields nothing fetchable, the substitution is logged in the
amendments section below — append-only.

## Pull procedure (FIXED)

Identical to the news probe: headlines / article titles in DOM order, no
cherry-pick, ~25–30 per language (≈ 55 total), verbatim + URL + timestamp,
SHA-256 captured before the detector runs.

## Labelling rubric (FIXED)

Item labelled manipulative if it matches ≥ 1:

- miracle / instant / guaranteed cure claim
- fear-based health marketing (disease dread used to drive action)
- fabricated health urgency
- unproven-remedy or supplement overpromise
- "doctors hide this" / anti-establishment health framing

Borderline → labelled **neutral** (conservative).
Three passes: Claude first-pass → `bench/annotator2.js` (Haiku) + Cohen's kappa
→ **user human-tag adjudication before the detector runs** (binding).

## Hypothesis (pre-registered)

- No strong prior on catch — this probe exists to find it. Registered range:
  catch 30–55%, FP ≤ ~2%.
- The healthcare pack is Tier 1, so it *may* hold better on fresh data than the
  news packs did — or it may not. Either result is recorded, not filtered.

## Run

`healthcare` pack `inspect` over the user-adjudicated corpus. Report
catch / FP / N / Wilson 95% CI per language + combined.

## Honest limits

Same as the news probe: modest N → wide CIs; single primary annotator mitigated
by Haiku second pass + kappa + user adjudication; pre-registered source set +
DOM-order pull remove cherry-picking.

## Amendments log (append-only)

(none yet)
