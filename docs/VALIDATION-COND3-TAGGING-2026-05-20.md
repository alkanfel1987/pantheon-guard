# Condition-3 validation — first-pass two-axis tagging (2026-05-20)

Pre-registration: `docs/VALIDATION-COND3-PREREG-2026-05-20.md`
Corpus (frozen, N=29): `examples/cond3-validation-corpus-2026-05-20.js`

**Tier of THIS document: first-pass / sanity-check.** Claude assembled the
corpus and did the tagging below. It becomes **validation-tier only after the
user adjudication pass** — that pass is the binding step of Condition 3.

Vulnerability axis = model Layer 2, 10 classes: `fear` `lobha` `mada`
`belonging` `curiosity` `shame` `authority` `tribal` `love` `kāma`
(+`hope/despair`). Technique = open-ended Layer-3 functional move.

## Two-axis tagging — 29 items

| id | type | verbatim (short) | primary V | secondary V | technique (Layer 3) | flag |
|---|---|---|---|---|---|---|
| mkt-01 | marketing | Be your own boss! | lobha | mada | aspiration-promise (desired identity) | |
| mkt-02 | marketing | I need 30 people … self-starter and motivated! | mada | belonging | flattery-qualification + manufactured-scarcity | |
| mkt-03 | marketing | It's going to happen with or without you! | fear | lobha | FOMO / inevitability-frame | |
| mkt-04 | marketing | Ground-floor opportunity | lobha | — | early-window-scarcity | |
| mkt-05 | marketing | Residual income! | lobha | kāma | effortless-gain-promise | |
| mkt-06 | marketing | enjoy more time and financial freedom | **kāma** | lobha | lifestyle-aspiration-promise | |
| scam-01 | scam | [USPS] package could not be delivered … | authority | fear | authority-impersonation + fabricated-task | |
| scam-02 | scam | Sir, you will doubtlessly be astonished … | lobha | — | windfall-promise + flatter | |
| scam-03 | scam | De Lotto … your e-mail emerged as a winner | lobha | authority | unsolicited-windfall + fabricated-legitimacy | |
| scam-04 | scam | Hi Grandma, it's me! | love | — | loved-one-impersonation (elicit-identification) | |
| scam-05 | scam | Please don't tell Mom or Dad … | love | fear | isolation / secrecy-demand | |
| scam-06 | scam | your account has been suspended | fear | authority | fabricated-threat + urgency | |
| dark-01 | dark-pattern | No, I want to type in all my passwords again | shame | — | confirmshaming | |
| dark-02 | dark-pattern | I choose to decline coverage and continue | fear | shame | confirmshaming / loaded-decline | |
| dark-03 | dark-pattern | … This is your final notice to fix the issue | fear | authority | fabricated-threat + urgency | |
| dark-04 | dark-pattern | No, I prefer to bleed to death | shame | fear | confirmshaming + catastrophize-decline | ? |
| dark-05 | dark-pattern | I would like to receive updates … (pre-checked) | **— OFF-AXIS** | — | preselection | ⚠ AXIS GAP |
| dark-06 | dark-pattern | So much self-serve … but not that. | shame | — | confirmshaming (cancellation) | ⚠ PROVENANCE |
| hlth-01 | health | … the weight can just fall right off … belly fat | shame | kāma | effortless-transformation-promise | ? |
| hlth-02 | health | the ONLY product … clinically proven … | authority | — | fabricated-authority + false-uniqueness | |
| hlth-03 | health | … proven for 40 years and used clinically … | authority | — | fabricated-authority (pseudo-credential) | |
| hlth-04 | health | anti-viral wellness booster | fear | authority | fabricated-threat-remedy | |
| hlth-05 | health | Cold MD and Germ MD treat or prevent colds … | fear | authority | fabricated-authority (MD-naming) + false-efficacy | |
| hlth-06 | health | expert endorsements from Dr. Monita Poudyal | authority | — | fabricated-authority (expert-endorsement) | |
| pol-01 | politics | I'm begging. Will you GRADE … CNN Debate? | shame | curiosity | guilt-appeal + fake-engagement-bait | ? |
| pol-02 | politics | You have blood on your hands. | shame | fear | guilt-accusation / moral-blame | |
| pol-03 | politics | coffee today? | curiosity | belonging | false-intimacy-disguise | |
| pol-04 | politics | Update from Dad. | love | curiosity | loved-one-impersonation-framing | |
| pol-05 | politics | Our records show you're voting for Trump | tribal | authority | fabricated-data-claim + tribal-provocation | |

`?` = my call is genuinely uncertain — scrutinise first. `⚠` = a structural finding, see below.

## Primary-V distribution (first pass)

fear 6 · shame 6 · lobha 5 · authority 4 · love 3 · mada 1 · curiosity 1 ·
tribal 1 · kāma 1 · belonging 0 · hope/despair 0 · off-axis 1.

## First-pass findings (provisional — pending adjudication)

**H1 — mandatory-class gap closure: 3 of 4 PASS, kāma PARTIAL.**
- `lobha` (5), `shame` (6), `authority` (4) are now solidly populated. In 1b
  shame was 2/36 and authority ~0 — the cross-type pull **closed both gaps**.
  This is the clearest positive: news headlines genuinely don't hook shame or
  authority-deference; sales/health/dark-pattern/political copy does.
- `kāma` — only **1 clean primary** (mkt-06), +2 as secondary (mkt-05,
  hlth-01). It does not cleanly meet the pre-registered "≥2 primary" bar.
  Honest reading: either kāma (sense-desire as a lever) is genuinely rarer
  than assumed, OR the 5 types pulled under-sample it — kāma would surface
  in dating/lust, food/comfort, luxury, travel copy, none of which was
  pulled. **Not a tagging failure; a corpus-coverage finding.**

**H2 — orthogonality holds cross-type: PASS.** One vulnerability runs via many
techniques across different types: `authority` via impersonation (scam-01),
fabricated-claim (hlth-02/03), expert-endorsement (hlth-06), fabricated-data
(pol-05). `fear` via FOMO (mkt-03), fabricated-threat (dark-03, scam-06),
threat-remedy (hlth-04). `shame` via confirmshaming (dark-01/04) and
guilt-appeal (pol-01/02). The two axes vary independently across the type
boundary — not a 1:1 relabeling.

**H3 — technique axis extends without a new axis: PASS, with one caveat.**
Cross-type content needed many new Layer-3 values (confirmshaming,
authority-impersonation, effortless-transformation-promise, guilt-appeal,
isolation/secrecy-demand, false-intimacy-disguise, preselection). All sit as
*functional moves* — the technique axis absorbed them; no third structural
axis was needed for technique. **Caveat → the gap is on the Vulnerability
axis, not Technique:** see ⚠ below.

**⚠ NEW FINDING — Vulnerability axis has no slot for inattention / default-bias
(dark-05).** Preselection (a pre-checked newsletter box) bites **no emotional
lever / klesha at all** — it exploits inattention and the default-bias, a
*cognitive* weakness, not a *desire/fear*. The model's Layer 2 is built from
emotional levers (ṣaḍ-ripu / kleshas + curiosity/shame). Purely structural
dark patterns — preselection, sneaking, obstruction, hidden-costs — fall
outside it. This is a real coverage hole the news corpus could never have
revealed. Two honest options for the model, for the user to decide:
  (a) add a Layer-2 class `inattention / cognitive-default` (the axis becomes
      emotional-levers + cognitive-exploits); or
  (b) declare scope: the V-axis covers *persuasive* manipulation only;
      purely structural dark patterns are a separate object the 2-axis model
      deliberately does not tag.

**H4 — adjudication agreement: PENDING (user).**

## Rows flagged for the adjudicator

- **dark-05** ⚠ — off-axis. The decision above (a vs b) is the real call.
- **dark-06** ⚠ — provenance uncertain. The hall-of-shame pull noted most
  entries are *described, not quoted*; "So much self-serve … but not that."
  may be a critic's caption, not RAC's live UI copy. Recommend: confirm or
  **drop** (corpus would become N=28).
- **dark-04** `?` — primary `shame` vs `fear`. Tagged shame (the move is
  confirmshaming); the lever it weaponises is fear-of-death. Defensible both ways.
- **hlth-01** `?` — primary `shame` (body-inadequacy, "stubborn belly fat")
  vs `kāma` (desire for an attractive body). Consequential: a `kāma` primary
  here would lift H1's kāma count.
- **pol-01** `?` — primary `shame` (guilt, "I'm begging") vs `curiosity`
  (the "GRADE the debate" engagement hook).

## Adjudication request (the binding Condition-3 step)

Per the pre-registration, **the user adjudicates the tags** — without this the
result stays sanity-check. Please pass over the 29-row table and, for each row:
confirm or correct **primary V**, **secondary V**, and **technique**. Give the
5 flagged rows extra scrutiny; dark-05 also needs the (a)/(b) model decision.

When the adjudicated tags are returned: agreement rate (H4) is computed,
corpus SHA-256 captured, and the **final Condition-3 verdict** written —
PASS / PARTIAL / FAIL — into the model's quarantine file trigger log.

## Second annotator pass (Haiku, blind) — 2026-05-20

Procedure amendment (logged in prereg): a **second independent annotator**
was added — Claude Haiku, tagging all 29 items blind (no sight of the
first-pass tags or this doc). This mirrors guard's fresh-probe discipline
(`bench/annotator2.js`). It is a **sanity proxy for tag stability — NOT the
binding H4.** H4 is pre-registered as *user*-adjudication; this is Claude×2.

Corpus SHA-256 (frozen 2026-05-20, post-freeze / pre-adjudication):
`53C5C2430214AC11471515C401D5AC91E38B76FB21945ABC845171756C2E2599`

| id | A · Opus (primary) | B · Haiku (primary) | primary match | lever-set |
|---|---|---|---|---|
| mkt-01 | lobha | mada | ✗ | overlap (mada = A-secondary) |
| mkt-02 | mada | belonging | ✗ | swap |
| mkt-03 | fear | fear | ✓ | |
| mkt-04 | lobha | lobha | ✓ | |
| mkt-05 | lobha | lobha | ✓ | |
| mkt-06 | kāma | kāma | ✓ | |
| scam-01 | authority | fear | ✗ | swap |
| scam-02 | lobha | curiosity | ✗ | **TRUE DISAGREEMENT** (no overlap) |
| scam-03 | lobha | hope/despair | ✗ | overlap (lobha = B-secondary) |
| scam-04 | love | love | ✓ | |
| scam-05 | love | shame | ✗ | overlap (love = B-secondary) |
| scam-06 | fear | fear | ✓ | |
| dark-01 | shame | shame | ✓ | |
| dark-02 | fear | shame | ✗ | swap |
| dark-03 | fear | fear | ✓ | |
| dark-04 | shame | shame | ✓ | |
| dark-05 | off-axis | off-axis | ✓ | **both independently off-axis** |
| dark-06 | shame | shame | ✓ | |
| hlth-01 | shame | kāma | ✗ | overlap (kāma = A-secondary) |
| hlth-02 | authority | authority | ✓ | |
| hlth-03 | authority | authority | ✓ | |
| hlth-04 | fear | authority | ✗ | swap |
| hlth-05 | fear | authority | ✗ | overlap (authority = A-secondary) |
| hlth-06 | authority | authority | ✓ | |
| pol-01 | shame | shame | ✓ | |
| pol-02 | shame | shame | ✓ | |
| pol-03 | curiosity | curiosity | ✓ | |
| pol-04 | love | love | ✓ | |
| pol-05 | tribal | tribal | ✓ | |

**Agreement metrics:**
- Exact primary-V agreement: **19/29 = 66%** (Wilson 95% CI ≈ 47–80%).
- Cohen's κ ≈ **0.60** (moderate / moderate–substantial boundary).
- **Lever-set agreement: 28/29 = 97%** — ignoring primary/secondary order,
  the two annotators pick the *same vulnerability or pair* on all but one item.
- Sole true disagreement: **scam-02** (Vidocq advance-fee — lobha vs curiosity).

**What the second pass tells us:**
1. **The vulnerability vocabulary is stable.** 28/29 the annotators land on
   the same lever(s) — they almost never reach for a *different* class. The
   axis itself is not the unstable part.
2. **The instability is primary/secondary ORDERING.** 9 of the 10 primary
   mismatches are a swap or partial-overlap of the *same* pair. For the ~⅓
   dual-vulnerability items (1b's finding, reconfirmed here), forcing a
   primary/secondary rank is subjective. → Candidate model change: treat
   dual-V as an **unordered set**, rank only when one lever clearly dominates.
3. **dark-05 axis-gap is corroborated** — a second, independent annotator
   also hit "off-axis: inattention/default-bias." Not a one-annotator artifact.
4. **kāma hinges on hlth-01.** Haiku tagged kāma primary on *both* mkt-06 and
   hlth-01 → under its reading kāma clears H1's ≥2 bar. The user's hlth-01
   call (shame vs kāma) decides whether H1 is 3/4 or 4/4.
5. Strict H4-proxy: 66% point estimate sits **below** the pre-registered 70%
   bar; the CI [47–80%] straddles it → **inconclusive on the strict metric.**
   But this is Claude×Haiku — the binding H4 is the user's pass.

## Set-tagging adopted — model change (2026-05-20)

User accepted a model change: Layer-2 Vulnerability is now an **unordered
co-active set**, not a ranked primary/secondary pair. Rationale — the
second-annotator pass showed 97% agreement on the lever *set* vs 66% on
*ordering*; the rank was noise. The combination IS the unit of manipulation
("compound attack" — stacking levers so no single one is the tell).
Discipline retained (Я-3 anti-inflation): tag only levers the **literal
text** genuinely fires (typically 1–3), not every conceivable lever. A
"dominant lever" survives only as an optional note when one clearly leads.

Corpus is unchanged (tags-only change) — SHA-256 still valid.

### Re-tagged corpus — vulnerability SET × technique

| id | type | vulnerability set | technique |
|---|---|---|---|
| mkt-01 | marketing | {mada, lobha} | aspiration-promise (desired identity) |
| mkt-02 | marketing | {mada, belonging} | flattery-qualification + manufactured-scarcity |
| mkt-03 | marketing | {fear, lobha} | FOMO / inevitability-frame |
| mkt-04 | marketing | {lobha} | early-window-scarcity |
| mkt-05 | marketing | {lobha, kāma} | effortless-gain-promise |
| mkt-06 | marketing | {kāma, lobha} | lifestyle-aspiration-promise |
| scam-01 | scam | {authority, fear} | authority-impersonation + fabricated-task |
| scam-02 | scam | {curiosity, authority} | intrigue-hook + formal-trust-signal |
| scam-03 | scam | {lobha, authority} | unsolicited-windfall + fabricated-legitimacy |
| scam-04 | scam | {love} | loved-one-impersonation (elicit-identification) |
| scam-05 | scam | {love, fear} | isolation / secrecy-demand |
| scam-06 | scam | {fear, authority} | fabricated-threat + urgency |
| dark-01 | dark-pattern | {shame} | confirmshaming |
| dark-02 | dark-pattern | {fear, shame} | confirmshaming / loaded-decline |
| dark-03 | dark-pattern | {fear, authority} | fabricated-threat + urgency |
| dark-04 | dark-pattern | {shame, fear} | confirmshaming + catastrophize-decline |
| dark-05 | dark-pattern | {inattention} | preselection |
| dark-06 | dark-pattern | {shame} | confirmshaming (cancellation) — provenance flagged |
| hlth-01 | health | {kāma, shame} | effortless-transformation-promise |
| hlth-02 | health | {authority} | fabricated-authority + false-uniqueness |
| hlth-03 | health | {authority} | fabricated-authority (pseudo-credential) |
| hlth-04 | health | {fear, authority} | fabricated-threat-remedy |
| hlth-05 | health | {fear, authority} | fabricated-authority (MD-naming) + false-efficacy |
| hlth-06 | health | {authority} | fabricated-authority (expert-endorsement) |
| pol-01 | politics | {shame, curiosity} | guilt-appeal + fake-engagement-bait |
| pol-02 | politics | {shame} | guilt-accusation / moral-blame |
| pol-03 | politics | {curiosity, belonging} | false-intimacy-disguise |
| pol-04 | politics | {love, curiosity} | loved-one-impersonation-framing |
| pol-05 | politics | {tribal, authority} | fabricated-data-claim + tribal-provocation |

### Contested-row resolution under set-tagging

- **4 resolved by set-equality** (pure swaps — sets identical):
  mkt-02, scam-01, dark-02, hlth-04.
- **5 resolved by the set-discipline rule** (Claude's call, user may override):
  - mkt-01 → {mada, lobha} — "boss" = status (mada); income contextual (lobha, low-confidence).
  - scam-03 → {lobha, authority} — dropped Haiku's `hope/despair`: the text is a neutral official-style announcement, shows no desperation.
  - scam-05 → {love, fear} — "they would kill me" reads as fear-flavoured urgency; shame weaker.
  - hlth-01 → {kāma, shame} — dropped Haiku's `lobha`: weight-loss is not material greed; "stubborn belly fat" names a body-shame point.
  - hlth-05 → {fear, authority} — both are in the literal text (fear of illness + the "MD" pseudo-medical branding).
- **1 escalated** — scam-02 (no lever overlap between annotators).
- **1 model decision escalated** — dark-05 (a)/(b).

### H1 re-scored under set-tagging: 4/4 PASS

Mandatory classes, by sets they appear in: `lobha` ≥6 · `shame` 7 ·
`authority` 10 · **`kāma` 3** (mkt-05, mkt-06, hlth-01). Under ranked
tagging kāma was mostly *secondary* and looked thin (1 primary). Set-tagging
counts co-active levers — kāma clears the ≥2 bar. **The "kāma thin" problem
was an artifact of forced ranking; adopting set-tagging dissolved it.**

## User adjudication — final (2026-05-20)

User confirmed set-tagging as the methodology and made the two binding calls:

- **scam-02** → `{curiosity, authority}` (tag the literal opening; the
  scam-type tagging was a discipline-rule miss).
- **dark-05 / model** → **option (a): add Layer-2 class `inattention /
  cognitive-default`.** User brought load-bearing evidence — the broader
  *presupposition / silent-assent* family of canonical Russian patterns
  spans purely structural (preselection) to purely emotional (insult) via a
  structural-emotional compound («как всем нам давно известно [X]»). The
  middle requires the set `{inattention, shame}`, which only option (a) can
  express. Direct empirical justification for the model change.

The remaining 27 rows stand under silence-acceptance (no objections raised).

### Model extensions adopted

- **Layer-2:** new class `inattention / cognitive-default` — cognitive-
  structural lever, sitting alongside the 10 emotional ones.
- **Layer-3:** new named technique family `presupposition / silent-assent`
  (smuggle a claim as shared ground; raise the social cost of pushback).

### Supplement test cases — `presupposition / silent-assent` family

User-named canonical patterns, kept in a SEPARATE supplement file so the
N=29 validation-corpus SHA-256 stays valid.

File: `examples/cond3-supplement-presupposition-2026-05-20.js`
SHA-256: `096F278D3111D6225002AF68F47B5FD53734936B39565531CA865D34614FC3BB`

| id | text | vulnerability set | technique |
|---|---|---|---|
| sup-presup-01 | как всем нам давно известно [X] | {inattention, shame} | presupposition / shared-ground assertion |
| sup-presup-02 | вы наверняка уже знаете, что [X] | {inattention, shame} | presupposition / pre-emptive affirmation |
| sup-presup-03 | только дураку не понятно, что [X] | {shame} | insult-to-silence-challenge |

The compound `{inattention, shame}` is exactly what option (a) makes tag-able
and option (b) could not — empirical justification for the Layer-2 extension.

### H4 — final, set-framed

Claude's 29 first-pass propositions vs user-adjudicated final set:
**28/29 lever survival = 97%** (Wilson 95% CI well above the pre-registered
70% bar). Sole non-survivor — scam-02, where the first-pass tagged the scam
*type* (`lobha`) rather than the *literal opening* (`curiosity, authority`).
Discipline-rule miss, corrected by the user. The ranked-framing κ≈0.60
reported earlier is stale (wrong unit under set-tagging).

## Final verdict — Condition 3: NEAR-FULL PASS

- **H1 — 4/4 ✓** (set-tagging dissolved the kāma shortfall — kāma is
  co-active in 3 sets: mkt-05, mkt-06, hlth-01).
- **H2 — orthogonality ✓** across all five content types.
- **H3 — technique-axis extends ✓** (cross-type techniques absorbed without
  a new structural axis).
- **H4 — 97% set-survival ✓**, well above the 70% bar.
- **Axis coverage** — the validation surfaced AND resolved the inattention
  gap (option (a) adopted; presupposition supplement covers it).

**The test improved the model.** Three substantive evolutions emerged
*from the validation evidence*:
1. ranked-pair → co-active set (Layer-2 representation).
2. Layer-2 extended with `inattention / cognitive-default`.
3. Layer-3 named technique `presupposition / silent-assent` with three
   user-named test cases.

**Integration into the Vedic Manipulation Catalogue — still blocked.** F5
(asteya — component attribution to Cialdini, dark-patterns literature,
cross-traditional vice taxonomies) and F6 (bridge-labels as Pantheon-
internal structural convergences) remain open. The model is validated *as
a stacked taxonomy at validation tier*; catalogue integration unlocks when
F5 and F6 close.

Trigger-log entry written into the model's quarantine file:
`C:\Pantheon\vault\00-Quarantine\archived-with-triggers\2026-05-19-manipulation-model-4layer.md`.

---

**Addendum 2026-05-20 — Layer-2 axis extended to 13 classes post-validation.**
The cross-type validation in this doc was performed on the 12-class axis
(post-Condition-3, pre-mātsarya). The Layer-2 axis was subsequently
extended to 13 classes after a field test on fresh news re-surfaced
`mātsarya` as a silently-dropped class from the 1b vocabulary
consolidation (concurrent finding: `kāma` was also silently retained
since 1b without being formally in the model file's list — also
reconciled). The 29-item validation corpus tagged in this document
contained no schadenfreude-rich content (the cross-type selection didn't
sample BoredPanda/listicle/gossip genres), so no Condition-3 items
require retagging under the 13-class axis. See model spec's third
trigger-log entry (2026-05-20) for the full diagnosis and decision.
