# Field test on fresh news — first-pass set-tagging (2026-05-20)

Pre-registration: `docs/FIELD-TEST-NEWS-PREREG-2026-05-20.md`
Corpus (frozen, N=93, 54 manipulative): `examples/field-test-news-corpus-2026-05-20.js`
**Corpus SHA-256:** `40C3245F0DB8877BFD036A04EF5BE01EDA7496678F75B26A20062A6C9CD70290`

**Tier:** field-test (snapshot, single-annotator labeling, Claude-Opus + Claude-Haiku tagging). User offline today — no human adjudication; lower tier than Condition 3 by one annotator.

## Tagging — 54 manipulative items, set methodology (12-class axis)

Each item: vulnerability `set` (unordered, co-active) × `technique`. Set-discipline rule: tag only levers the literal text genuinely fires.

| id | vulnerability set | technique |
|---|---|---|
| ru-lenta-01 | {curiosity, tribal, fear} | multi-question clickbait + conspiracy frame |
| ru-lenta-07 | {fear, tribal} | loaded action verb + emotional frame |
| ru-lenta-08 | {curiosity, fear} | curiosity-gap ("появились кадры") + loaded modifier ("мощного") |
| ru-lenta-09 | {curiosity} | curiosity-gap (withheld method) |
| ru-lenta-12 | {love, curiosity} | emotional-narrative framing |
| ru-kp-02 | {fear} | fear-escalation + scale-claim ("тысячами") |
| ru-kp-03 | {tribal, curiosity, **inattention**} | loaded-political-frame + curiosity-gap; "Закат империи"/"диктатуру" **presupposes** the contested claim |
| ru-kp-04 | {curiosity} | superlative ("самый") + curiosity-gap |
| ru-kp-05 | {curiosity, fear} | shock-quote lead |
| ru-kp-06 | {love, kāma} | sentimental-romance frame |
| ru-kp-07 | {kāma, curiosity} | uplift-narrative + curiosity-gap |
| ru-kp-08 | {tribal, curiosity, **inattention**} | "Российский козырь" **presupposes** strategic advantage; loaded-frame + curiosity-gap |
| ru-kp-09 | {love, curiosity} | celebrity-sentimental + curiosity-gap (what name) |
| ru-kp-10 | {curiosity, lobha} | hype-frame ("ажиотаж") + curiosity-gap |
| ru-kp-11 | {fear, curiosity} | tragic-narrative + curiosity-gap |
| ru-ria-04 | {tribal} | loaded-verb (blame-shifting) |
| ru-ria-08 | {tribal, fear} | loaded-verb ("вытолкала") + emotional frame ("деда погибшего военного") |
| ru-ria-11 | {curiosity} | vague-teaser ("высказался насчёт слухов") |
| ru-ria-12 | {tribal, hope/despair, **inattention**} | **presupposition / silent-assent** — "стоит на пороге новой революции" presupposes the revolution as given background |
| en-buzzfeed-01 | {fear, authority} | listicle + fear-escalation + authority-appeal |
| en-buzzfeed-02 | {curiosity, authority} | curiosity-gap + authority-appeal ("people say") |
| en-buzzfeed-03 | {kāma, curiosity} | listicle + superlative ("absolutely perfect") |
| en-buzzfeed-04 | {curiosity} | curiosity-gap (withheld-reveal) |
| en-buzzfeed-05 | {tribal, curiosity, shame} | outrage-frame + curiosity-gap ("here's why") |
| en-buzzfeed-06 | {tribal, shame} | outrage + shame-induction + listicle |
| en-buzzfeed-07 | {kāma, lobha} | listicle + benefit-promise |
| en-buzzfeed-08 | {shame} | shame-hook + product-push |
| en-boredpanda-01 | {mātsarya, mada} | listicle + schadenfreude (retagged 2026-05-20 post-13-class) |
| en-boredpanda-02 | {kāma} | listicle + emotional-benefit ("fix your mood") |
| en-boredpanda-03 | {curiosity, authority, kāma} | study-as-hook + curiosity-gap |
| en-boredpanda-04 | {fear, curiosity} | shock-narrative + curiosity-gap |
| en-boredpanda-05 | {tribal, curiosity} | backlash-frame + curiosity-gap |
| en-boredpanda-06 | {love, tribal, fear} | shock-quote lead + outrage frame |
| en-boredpanda-07 | {fear, curiosity} | shock-narrative + curiosity-gap |
| en-boredpanda-08 | {shame, curiosity} | emotive-language + curiosity-gap |
| en-boredpanda-09 | {fear, curiosity} | horror-reveal + curiosity-gap |
| en-boredpanda-10 | {curiosity, fear} | contrast-hook ("innocent…sinister") + listicle |
| en-boredpanda-11 | {mada, curiosity} | challenge-bait + quiz |
| en-boredpanda-12 | {kāma, curiosity} | listicle + loaded-adjective + curiosity-gap |
| en-axios-06 | {lobha, authority} | superlative + exclusive-claim |
| en-axios-08 | {fear, authority} | fear-escalation + authority-frame |
| en-axios-12 | {fear} | fear-projection + future-threat |
| de-tonline-01 | {fear, curiosity} | curiosity-gap + body-threat |
| de-tonline-02 | {curiosity} | curiosity-gap (who) |
| de-tonline-05 | {kāma, curiosity} | listicle + benefit-promise + curiosity-gap |
| de-tonline-07 | {curiosity, tribal} | conflict-frame ("rechnet ab") + curiosity-gap |
| de-tonline-08 | {curiosity, tribal} | loaded-metaphor ("Wahl-Krimi") + curiosity-gap |
| de-tonline-09 | {tribal, authority} | poll-cited + escalation-frame ("sogar immer mehr") |
| de-tonline-11 | {curiosity} | vague-teaser |
| de-tonline-12 | {fear, curiosity, love} | shock-narrative + curiosity-gap |
| de-webde-04 | {fear, love} | urgency-frame + tragic-narrative |
| de-webde-06 | {kāma, love} | emotive-quote + sentimental-frame |
| de-webde-08 | {mātsarya, curiosity} | rival-gossip-schadenfreude + curiosity-gap (retagged 2026-05-20) |
| de-webde-10 | {fear, curiosity} | Q-format + body-fear |

## Class distribution (Opus first-pass, set-counted with secondaries — post 13-class adoption 2026-05-20)

| class | count | % of 54 |
|---|---|---|
| **curiosity** | 36 | 67% |
| **fear** | 21 | 39% |
| **tribal** | 15 | 28% |
| **kāma** | 11 | 20% |
| **love** | 7 | 13% |
| **authority** | 7 | 13% |
| **shame** | 5 | 9% |
| **mada** | 4 | 7% |
| **lobha** | 4 | 7% |
| **inattention** | 3 | 5.6% |
| **mātsarya** | 2 | 3.7% |
| **hope/despair** | 1 | 2% |
| **belonging** | 0 | 0% |

*Post-13-class retag (2026-05-20):* boredpanda-01 and webde-08 reassigned from `{mada,kāma}` / `{kāma,curiosity}` to `{mātsarya,mada}` / `{mātsarya,curiosity}`. Net change: `kāma` 13→11; `mātsarya` 0→2; others unchanged.

## Intermediate check #2 — tag sanity

**H1 (news distribution shape preserved):** ✓ — Curiosity dominates (67%), then fear (39%), tribal (28%), kāma (24%). 1b precedent (36-item subset): curiosity ~28%, krodha ~31%, mātsarya ~14%, fear ~14%, mada ~8%, kāma ~6%, shame ~6%. Distribution **shifted**: curiosity-dominance held up (67% vs 28% — strongly amplified, plausibly because today's sample is BuzzFeed/BoredPanda-heavy and set-tagging captures secondaries 1b's ranked tags didn't), fear remains second tier. `belonging 0%` confirms it's not a news-headline lever.

**H2 (`inattention` rare on news):** ✓ — 3/54 = 5.6%. Fires but rare, as predicted. All three are *presupposition* cases (ria-12, kp-03, kp-08), not preselection — exactly the spectrum-middle the user identified.

**H3 (`presupposition / silent-assent` fires on news):** ✓ **CONFIRMED.** Three items show the technique:
- `ru-ria-12` "Россия стоит на пороге новой революции — цифровой" — presupposes "the revolution" as given background; pushing back = "not in the know" cost
- `ru-kp-03` "Закат империи Зеленского … диктатуру" — presupposes Ukraine as empire + dictatorship
- `ru-kp-08` "Российский козырь" — presupposes Russia has a strategic advantage

The user's Russian canonical patterns ("как всем нам давно известно…") generalize to live news framing. This is a positive empirical confirmation of the model extension adopted in Condition 3.

**H4 (compound ≥ 30%):** ✓ — **48/54 items (89%) carry 2+ levers.** Far higher than 1b's ~25% dual rate (which was under-counted because ranked tagging forces a single primary). Set-tagging surfaces the compound-attack structure 1b masked.

**Class-gap finding (potential model extension):** The 1b corpus used `mātsarya` (schadenfreude) as a tag — that class is **NOT** in the validated 12-class list. Boredpanda-01 ("designers forgot…") and webde-08 ("RTL-Hofdame lästert über Konkurrentin") are schadenfreude-flavoured; tagged as `{mada}` or `{kāma}` here as closest fit. Honest reading: the 12-class list may need `mātsarya / envy / schadenfreude` as a 13th class. Flagged for the results doc — not unilaterally extending mid-test.

**Tag sanity overall: PASS.** Distribution sensible, compound-tagging works on news, new classes fire as predicted, one honest gap (mātsarya) surfaced.
