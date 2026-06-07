# Linguistic-manipulation pattern inventory — 2026-05-21

**Status:** retro-fit artifact. The 2026-05-21 field-test probe was run with
linguistic-pattern recognition happening implicitly during single-annotator
labelling. This artifact extracts those implicit patterns into an explicit,
citable inventory. Going forward this **MUST** be produced *before* labelling,
so that each `label: 'manipulative'` carries `pattern_ids: [...]` traceability.

**Methodological rule (from this date):**
- Pull headlines
- **Extract pattern inventory → save as artifact**
- Label headlines, each item citing matched pattern IDs
- Run pack against headlines (regex engine)
- Diff becomes mechanical: per pattern → covered / not covered / FP-prone
- Recommendations are derived from the diff, not invented post-hoc

**Selection-bias note** (`~/CLAUDE.md` §2): I act as both labeller and pack-
extension designer. This inventory mitigates by making the pattern catalogue
public-on-disk *before* any pack edits, so promotion-vs-revert decisions are
testable against the frozen list, not against my updated intuition.

Corpus reference: `examples/field-test-news-corpus-2026-05-21.js` (SHA-256 `be29c5732be9794df5795cde55f05e166a3d60244e15e91ba6fab7222784df42`)
Pack stack tested: news v0.2.0 + news-de v0.1.0 + epistemology v0.0.1 + healthcare v0.1.1 + clickbait v0.0.2

---

## Patterns observed in the 2026-05-21 corpus

Status legend: `[NEW]` = no existing pack rule; `[PARTIAL]` = pack has near-rule
that does not fire on this surface; `[COVERED]` = existing pack rule fires.

### P1 · RU curiosity-gap passive `[NEW]`

**Surface:** Russian headline opens with passive participle that withholds
the noun: `Названа N`, `Раскрыли N`, `Раскрыл смысл`, `Обнаружили N`,
`Стало известно N`. Reader cannot evaluate the claim without clicking
through; the noun is the bait.

**Corpus hits today (5):**
- `ru-lenta-05` — «На Украине **раскрыли** приказ Зеленского в отношении Белоруссии»
- `ru-lenta-07` — «**Названа** роль нового Су-57Д»
- `ru-ria-01` — «Исследование **показало**, где предлагают зарплату от 100 тысяч рублей»
- `ru-ria-13` — «Священник **раскрыл** смысл Вознесения Господня»
- *(also kp-12 «Трамп объявил, что строит» — adjacent variant, withholds substance)*

**Existing pack coverage:** none. `news.js` has `exposed_bang_en` (`exposed!` with
explicit bang) — RU equivalent does not exist.

**Proposed pre.1 regex (sketch):**
```
re('^(?:Названа|Названы|Раскрыл[аи]?|Обнаружен[ао]?|Стало известно)\\b')
```
**Inhibitor candidates:**
- Suppress if `\\b(?:следстви|прокуратур|суд|МВД|ФСБ)\\b` in same sentence
  (legit investigative reporting often uses these verbs).
- Suppress if a named outlet follows.

**FP risk:** moderate. Russian wire-style legitimately uses these passive
constructions. Need real-corpus probe ≥80% precision before stable.

---

### P2 · RU loaded-accusative verbs in lead `[NEW]`

**Surface:** RU headline lead-verb is emotionally loaded and attributes
hostile action to state / institution: `обвинил`, `глумлен`, `прессует`,
`умоляет`, `пугать`, `грозит вторжением`.

**Corpus hits today (5):**
- `ru-lenta-02` — «Зеленского **обвинили** в провокациях с целью отвлечь население»
- `ru-lenta-06` — «Шойгу **обвинил** Ереван в **глумлении** над памятью армян»
- `ru-lenta-11` — «Генсек НАТО выступил с **угрозой** в адрес России»
- `ru-kp-02` — «СБУ **прессует** полицию, Рютте **возмущен**, Таллин **умоляет** Киев не **пугать** эстонцев»
- `ru-ria-07` — «В Киеве **забили тревогу** из-за плана Зеленского»

**Existing pack coverage:** none. The pack has English `panic spreads` →
ahimsa, but no Russian symmetric form, and no general loaded-verb class.

**Proposed pre.1 regex (sketch):**
- Trigger lexicon: `обвинил|обвинили|глумлен|прессует|прессуют|умоляет|умоляют|грозит\\s+вторжением|забили\\s+тревогу|пугать\\s+(?:дронами|войной)`
- Requirement: appears in first 80 chars of headline
- Inhibitor: suppress if subject is a verified-court/legal-proceeding context (`суд|следствие|приговор`)

**FP risk:** high. `обвинил` is core legal-news vocabulary. Pack needs
two-signal requirement: loaded-verb + (sensational adjective OR state-actor
target). This is more design work than a single regex.

**Honest recommendation:** **HOLD** for v0.6. Single-regex form will FP-flood.
Two-signal fusion required; see cycle-2 lesson E.

---

### P3 · RU anonymous `Источник:` lead `[NEW]`

**Surface:** Russian-style anonymous attribution in headline opening,
parallel to English `sources say` family which IS in the pack.

**Corpus hits today (1):**
- `ru-ria-06` — «**Источник:** Иран готов применить новое оружие в случае атаки США»

**Existing pack coverage:** `sources_say_en` (regex: `(?:sources?|insiders?|whistleblowers?)\\s+(?:say|claim|report|...)`) with
named-outlet inhibitor. **Russian equivalent absent.**

**Proposed pre.1 regex (sketch):**
```
re('^(?:Источник|Источники|Инсайдер[аы]?|Осведомлённ[ыо][йх])\\s*[:—]\\s*')
```
**Inhibitor:** suppress if followed within 200 chars by `Reuters|РИА|ТАСС|Bloomberg|РБК|Интерфакс|Коммерсант|по\\s+словам\\s+\\p{Lu}` (named outlet / named individual).

**FP risk:** low. Named outlets do not lead with bare `Источник:`. Symmetric
to existing EN rule; well-understood failure mode.

**Honest recommendation:** **PROMOTE-AS-PRE.1** in next pack edit. Lowest-risk
of the four candidates.

---

### P4 · DE sensational-collapse verbs `[NEW]`

**Surface:** German verbs framing institutional failure / capitulation /
revelation: `gekippt`, `knickt ein`, `lässt platzen`, `enthüllen`, `Liveticker`
as crisis-genre marker.

**Corpus hits today (5):**
- `de-google-01` — «Aston Villas **lässt** den großen Traum des SC Freiburg **platzen**»
- `de-google-03` — «Forscher **enthüllen** Irrtum»
- `de-google-06` — «Alle Wetter-Modelle **gekippt**»
- `de-google-13` — «Iran-Krieg im **Liveticker**»
- `de-google-14` — «London **knickt** bei Russland-Sanktionen **ein**»

**Existing pack coverage:** `news-de` v0.1.0 has 8 patterns (sensational verbs,
advice-clickbait, Q-curiosity, body-metaphor per `CROSS-LANGUAGE-FINAL-2026-05-05.md` §D). Today's surface set does not overlap — `news-de` is tuned for Bild/T-Online
celebrity-tabloid pattern, not Spiegel-style political-news headlines.

**Proposed pre.1 regex (sketch):**
- `\\bgekippt\\b` (with co-occurrence requirement: state / system / model subject)
- `\\bknickt\\s+(?:ein|nach)\\b`
- `\\blässt\\s+\\w+\\s+platzen\\b`
- `\\benthüll(?:t|en)\\s+(?:Irrtum|Skandal|Wahrheit|Geheimnis)\\b`
- `\\b(?:Krieg|Krise|Skandal)\\s+im\\s+Liveticker\\b`

**FP risk:** moderate. Sports `Traum platzen` is widely-used; need
sport-vs-politics context check.

**Honest recommendation:** **PROMOTE-AS-PRE.1**. Symmetric to existing EN
`exposed_bang_en`, similar discipline applies.

---

### P5 · RU sensational political metaphor `[NEW]`

**Surface:** Headline encodes contested political claim as established
metaphor: `Бунт против X`, `X симфония`, `Тайные знаки`, `Закат империи`,
`Дух Пекина`.

**Corpus hits today (4):**
- `ru-kp-11` — «**Пекинская симфония**: о чём договорились…»
- `ru-kp-13` — «**Бунт против НАТО**: соратники Мелони…»
- `ru-kp-14` — «**Тайные знаки**, скрытые жесты и главные итоги визита…: «Дух Анкориджа» сменил «Дух Пекина»»
- `ru-kp-03` — «**Закат империи** Зеленского…» *(from prior corpus, here adjacent)*

**Existing pack coverage:** none. Pack has `media_silence_ru` (о чём
молчат СМИ), but not metaphor-as-fact constructions.

**Proposed pre.1 regex:** harder. Surface is open-class. Requires either:
- (a) lexicon-detector approach (like `pantheon-vedic-catalogue` Phase 4-P2),
  or
- (b) presupposition-detector (per Condition-3 supplement work — see `cond3-supplement-presupposition-2026-05-20.js`).

**Honest recommendation:** **HOLD**. Not regex-shaped. Belongs in
presupposition-family extension, which is a separate workstream.

---

### P6 · EN curiosity-gap question lead `[PARTIAL]`

**Surface:** EN headline opens with mystery-question: `Murder or accident?`,
`Why X did Y?`, `Mystery of N`.

**Corpus hits today (2):**
- `en-bbc-14` — «**Murder or accident?** **Mystery of** Mango tycoon's hiking death after son's arrest»
- `en-bbc-13` — «The **deadly** plane attack at the centre of Castro's indictment»

**Existing pack coverage:** `clickbait` pack covers some Q-curiosity. **Partial**
overlap; pack misses BBC-style headline-question with named subject.

**Honest recommendation:** investigate. Open a `clickbait-pack` extension probe;
out-of-scope for news-pack v0.5.

---

## Diff summary — what the pack catches vs misses on 2026-05-21

| Pattern | RU/EN/DE | Corpus N | Pack catches | Status |
|---|---|---:|---:|---|
| P1 curiosity-gap passive | RU | 5 | 0 | NEW pre.1 candidate |
| P2 loaded-accusative verbs | RU | 5 | 0 | HOLD — needs two-signal fusion |
| P3 anonymous `Источник:` lead | RU | 1 | 0 | PROMOTE pre.1 (low FP risk) |
| P4 DE sensational-collapse verbs | DE | 5 | 0 | PROMOTE pre.1 (moderate FP) |
| P5 sensational political metaphor | RU | 4 | 0 | HOLD — not regex-shaped |
| P6 EN curiosity-gap question | EN | 2 | 0 | clickbait-pack scope, not news |

**Total covered by next-edit (P1 + P3 + P4):** 11/36 missed items = 30.6% lift potential, **IF regex sketches survive real-corpus probe without FP-flood.**

**Total HOLD (P2 + P5 + P6):** 11/36 missed items = require deeper work
(two-signal fusion, presupposition-family, clickbait-pack respectively).

**Residual unexplained:** 36 − 22 = 14/36 misses fell into mixed
celebrity-/sports-/curiosity buckets not surfaced as a single dominant
pattern. Need second-annotator pass to classify.

---

## Pipeline change committed from this date

For all future field-test probes:

1. Pull headlines.
2. Run **linguistic-pattern extraction** as a first analytical step → save to
   `docs/LINGUISTIC-PATTERNS-YYYY-MM-DD.md` (this template).
3. Build corpus file with `pattern_ids: [P1, P3, ...]` per `manipulative` item.
4. Run pack against corpus.
5. Diff is **mechanical**: per pattern → covered count, missed count.
6. Recommendations / pack-edit candidates flow from the diff, not from
   freeform post-hoc commentary.

This artifact + protocol is documented as the methodological response to
2026-05-21 user feedback: «лингвистические паттерны видишь, но говоришь о
них после — встраивай во время анализа».
