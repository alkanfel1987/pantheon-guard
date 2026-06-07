# Fresh held-out probe — pre-registration (2026-05-19)

**Status:** registered before any fresh content is pulled or labelled — frozen.
**Purpose:** an honest catch / FP measurement of pantheon-guard against content
pulled fresh today, never seen by the packs. This is the number intended for
the NVIDIA dialogue.

## Why this is separate from the 2026-05-19 control test

`docs/CONTROL-TEST-2026-05-19.md` ran `benchmark-phase1-runner.js` and
`benchmark-multiregion-runner.js` — the frozen, pre-registered corpora
assembled ~2026-05-05. That is a **regression measurement against the set the
packs were developed on.** It is honest within its scope, but it is not a
generalization number: the packs may fit those exact items.

A fresh held-out probe pulls content the packs have never seen. Precedent from
guard's own history: the 3-domain replication probe dropped from 84.2% (frozen
corpus) to 57.1% (fresh OOS). Expect a similar drop here. The fresh number —
not the frozen 52.5% — is what may be quoted to NVIDIA.

## Sources (FIXED before pull)

Current news / aggregator section pages, pulled 2026-05-19. In-domain
(news / marketing copy) — NOT generic web, which avoids the wrong-domain
auto-pull trap (CLAUDE.md §2).

- **RU:** lenta.ru, kp.ru, ria.ru, rbc.ru, tass.ru
- **EN:** bbc.com, buzzfeed.com, boredpanda.com, axios.com
- **DE:** tagesschau.de, bild.de, t-online.de

A mix of wire/quality (expected mostly neutral) and tabloid/aggregator
(expected to carry manipulative items) per language.

## Pull procedure (FIXED)

1. Fetch each publisher's front / section page on 2026-05-19.
2. Take headlines in DOM order, **no cherry-pick** — first 8–12 per publisher
   until N ≈ 30 per language (≈ 90 total).
3. Record verbatim headline + URL + pull timestamp.
4. Freeze into a corpus file; SHA-256 captured before the detector runs.

## Labelling (FIXED)

Each item labelled manipulative / neutral against this rubric — manipulative
if it matches ≥ 1:

- false urgency / manufactured scarcity
- fear-based escalation
- clickbait curiosity-gap (withheld payoff, "you won't believe")
- dark-pattern / pressure copy
- emotional-manipulation framing

Borderline → labelled **neutral** (conservative — protects against inflating catch).

Three passes:
1. Claude first-pass label.
2. Second annotator — `bench/annotator2.js` (Claude Haiku); Cohen's kappa reported.
3. **User human-tag adjudication pass before the detector runs** — these are the
   binding labels. Repo discipline: a human-tag pass precedes detector execution.

## Hypothesis (pre-registered)

- Fresh catch-rate **below** the frozen 52.5% — predicted range 30–50%,
  consistent with the 84% → 57% replication precedent.
- FP-rate holds low (≤ ~2%) — FP is less overfit-prone than catch.
- Fresh catch ≥ frozen would be a surprise → investigate corpus / labelling
  before banking it, do not just accept it.

## Run

guard stack (core + news + epistemology) `inspect` over the user-adjudicated
corpus. Report catch / FP / N / Wilson 95% CI per language + combined.

## Honest limits (disclosed with every number)

- Modest N → wide confidence intervals.
- Single primary annotator (Claude) → mitigated by Haiku second pass + kappa
  + user adjudication.
- Source set is pre-registered to remove post-hoc publisher cherry-picking;
  DOM-order pull removes within-publisher cherry-picking.

## Amendments log (append-only)

**2026-05-19 — pull executed.** WebFetch could not reach rbc.ru (HTTP 401),
tass.ru (HTTP 403), bbc.com, tagesschau.de, bild.de, n-tv.de, focus.de
(blocked). Reachable and pulled, headlines in DOM order, no cherry-pick:
RU — lenta.ru, kp.ru, ria.ru (36); EN — buzzfeed.com (9), boredpanda.com,
axios.com (33); DE — t-online.de, web.de (24). Substitution: web.de added for
DE after tagesschau.de / bild.de failed. **Total N=93.** DE is from 2
publishers vs the planned 3, N=24 vs ~30 — DE confidence interval will be
correspondingly wider; disclosed with the result. Corpus frozen at
`examples/fresh-probe-2026-05-19-corpus.js`; SHA-256 to be captured after the
user adjudication pass, before the detector runs.
