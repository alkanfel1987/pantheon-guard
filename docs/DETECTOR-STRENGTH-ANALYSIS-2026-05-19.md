# Detector strength analysis — what works, what's blind (2026-05-19)

## Context

Fresh held-out probe: 8.3% catch, 66/70 news detectors silent. Structural
verification (`fresh-probe-2026-05-19-verify.js`) ruled out a machinery bug —
detectors fire on positive controls (13/13), the runner catches canonical text
(3/3), the frozen corpus still scores 58% on the same runner. Decision: stop
guard-outreach, salvage the methodology + FP-discipline. This doc extracts the
transferable lesson — what *kind* of detection held up on fresh data, and
where the regex approach is structurally blind.

## The principled difference — a generality gradient, not a binary

It is NOT "working detectors vs broken detectors." Every detector works (fires
on its target form). The difference is **how much of the manipulation a
detector's regex generalises over.** Three tiers:

**Tier 1 — Fixed idiom.** Encodes a specific viral phrase: `shocking_secret`
("shocking secret"), `you_wont_believe`, `experts_hate` ("doctors hate this"),
`they_dont_want`, `before_deleted`, `panic_frame`. Catches that phrase and
nothing else. Dead on fresh data — clickbait idioms are *fashion*; real 2026
editors avoid the worn-out ones, and the vocabulary churns.

**Tier 2 — Closed-slot construction.** Right structural frame, but the
slot-fillers are a finite word-list copied from the training corpus:
`listicle_en` = `[number] + [noun∈{celebrities,things,times,...}]`,
`sensational_editorial_adj_en` = `[adj∈{terrifying,stunning,...}] + [noun]`.
These **look** structural but inherit the overfit through their lists.
`listicle_en` fired on "71 **Times**" (in list) and missed "24 **Posts**",
"33 **Confessions**", "56 **Photos**" (not in list). This is the bulk of the
pack — and the trap: they pass for real detectors.

**Tier 3 — Open-slot construction.** Frame + open gaps + broad classes +
inhibitor logic: `vague_discovery_passive_broad_ru` = `[passive-verb] +
[≤5-word gap] + [vague-noun-class] + NOT[named source within 150 chars]`.
Detects a *grammatical manipulation move* regardless of the specific words.
The only tier with real generalisation potential.

**The 3 that fired on fresh data:**
- `vague_discovery_passive_broad_ru` — tier 3 (open gap + noun-class + source-inhibitor).
- `sensational_call_to_action_ru` — tier 2/3 (`[adverb-class]×[verb-class]`, modest lists that happened to cover «жёстко отреагировала»).
- `listicle_en` — tier 2 (fired on the one in-list noun, missed the rest, +1 FP).

The signal, even at N=3: generalisation tracks **openness of the slots**, not
the presence of a frame.

## Niche map — what the pack covers, by tier

| Manipulation niche | Covered by | Tier |
|---|---|---|
| Fabricated epistemic exclusivity (shocking-secret, hidden-truth) | idioms | 1 — fragile |
| Conspiracy framing (media-silence, they-don't-want-you) | idioms | 1 — fragile |
| Fake authority opposition (experts-hate) | idiom | 1 — fragile |
| Panic / urgency framing | idioms | 1 — fragile |
| Listicle / quiz / challenge clickbait | closed-slot frames | 2 — partial |
| Sensational editorial adj+noun | closed-slot frame | 2 — partial |
| Anonymous sourcing (sources-say + source-inhibitor) | open construction | 3 — durable |
| Vague passive discovery (Найдено/Раскрыто + noun-class + inhibitor) | open construction | 3 — durable |
| Sensational adverb×verb collocation | class×class | 2/3 |
| Tabloid framing (reaction-as-news, personal-drama, superlative-no-source) | constructions w/ gaps | 2/3 |

Rough split of the 70 (by reading each regex): ~tier-1 idioms 20-25 · tier-2
closed-slot ~35-40 · tier-3 open-slot ~10-12. The pack's *named* coverage
looks broad; its *durable* coverage is the ~10-12 tier-3 detectors.

## Blind zones — and the principled reason

Two kinds, and the distinction is the honest scope line:

**(a) Lexical-but-unbounded.** A single charged epithet doing the manipulation
— «русофобка», «Debakel», «freefall», «Трагедия». Technically regexable, but
only as a giant fragile word-list (tier-2 at best) with high false-positive
cost. The pack has almost nothing here. This was the entire Q1/Q4 class of the
fresh corpus.

**(b) Genuinely semantic — regex cannot, ever.** Metaphorical framing («Белые
ангелы с чёрными крыльями»), insinuation («Faces Scrutiny», «mutmaßliche
Geliebte»), shocking-quote-as-headline (the manipulation is editorial
*selection*, not in the words). No regex reaches these — the manipulative
force is in meaning/implication, not surface form.

**The boundary:** regex can own **structural / grammatical manipulation
moves**. Everything **semantic** — connotation, metaphor, implication,
selection — is permanently outside it. This is the honest scope line for any
narrowed guard.

## The strength to amplify

The transferable asset is not "guard the product" — it is a **portable
principle**: detect the *grammar of a manipulation move* via an open
structural frame (broad classes, gaps, inhibitor look-aheads), not a catalogue
of surface phrases. Plus the genuine FP-discipline (of 70 detectors, only 2
ever touch a neutral item). This principle carries whether or not guard
remains the vehicle.

## Honest caveat

Only 3 detectors fired — the tier framework is sound *linguistic* reasoning
over all 70 regexes, but the claim "tier-3 detectors generalise" is not
*proven* at N=3. Confirming it needs a probe built specifically to test a
tier-3-only detector set against a fresh corpus. Until then: a strong,
well-grounded hypothesis, not a validated result.
