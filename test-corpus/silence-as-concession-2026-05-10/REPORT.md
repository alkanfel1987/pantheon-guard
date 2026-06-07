# Probe report — silence_as_concession, 2026-05-10

Pack: `epistemology` v0.3.0-pre.1.
Detector: `silence_as_concession` (no inhibitor).
Catalogue anchor: `ns-apratibha-5-2-18`.

## tl;dr

| Run | Catch (Wilson 95%) | FP | Decision |
|---|---|---|---|
| iter-1 (pre-fix) | 58.3% [32.0%, 80.7%] (7/12) | 0.0% [0.0%, 24.3%] (0/12) | HOLD scaffold (1.7pp below 60% target) |
| iter-2 (post-fix) | 100.0% [75.7%, 100%] (12/12) | 0.0% [0.0%, 24.3%] (0/12) | PROMOTE_PARTIAL — verifies fix |

Pre-reg acceptance: catch ≥60% AND FP ≤5%. Iter-1 was below threshold —
**this is the first probe in the series that did NOT pass pre-reg on
iter-1**. Iter-2 fix was non-optional, not just clean-up.

Per-language (iter-1 → iter-2):
- EN: 100% → 100% (no EN changes were needed)
- RU: 16.7% → 100% (5/6 RU positives missed on iter-1, all fixed)

## Honest scope

Synthesis-leaning probe. Positive class paraphrases canonical political-
commentary / gossip / discreditation framings. Negative class includes
neutral journalism reportage, legal-restraint passages (counsel advised
silence, pending litigation), procedural-silence (neither-confirm-nor-
deny), and update-promised process journalism. Per `CLAUDE.md` selection-
bias discipline: structured sanity, **not** external validation.

`PROMOTE_PARTIAL` — same partial-promotion pattern as previous probes:
synthesis pass + explicit "live-corpus probe required" gate.

## iter-1 results (pre-fix)

```
Positives: 12  Negatives: 12
Catch: 58.3% [32.0%, 80.7%]
FP:    0.0% [0.0%, 24.3%]
EN catch: 100.0%   RU catch: 16.7%
```

### iter-1 FN audit (5 RU misses)

**P-RU-01** — `Министерство отказалось комментировать ситуацию, что само за себя говорит о масштабе проблемы.`
- Marker: «отказалось комментировать» + «само за себя говорит»
- Why miss: pattern 1 required forward word order «что говорит само за
  себя» but text uses reverse «что само за себя говорит». Both orders
  are common Russian usage.
- Category: word-order coverage gap.

**P-RU-02** — `Молчание депутата в этом вопросе говорит само за себя…`
- Marker: «молчание... говорит само за себя»
- Why miss: pattern 2 had a fixed `(?:в\s+этом\s+вопросе\s+)?` slot
  expecting that exact phrase OR nothing — text inserts «депутата» before
  «в этом вопросе», so the rigid slot does not match.
- Category: modifier-coverage gap (same shape as anecdotal-override iter-2
  «работы хирургом я не видел»).

**P-RU-03** — `Молчание звезды на эту тему не случайно — слишком многое выходит наружу.`
- Marker: «молчание... не случайно»
- Why miss: pattern 2 has no slot for «звезды на эту тему» between
  «молчание» and «не случайно».
- Category: modifier-coverage gap.

**P-RU-04** — `Компания не нашла что ответить на запрос журналистов — значит, обвинения попали в цель.`
- Marker: «не нашла что ответить — значит»
- Why miss: TWO bugs.
  (a) Pattern uses bare verb form «нашёл + W_STAR» — only matches
      «нашёл/нашёлся/etc.». «не нашла» (feminine) starts with stem «наш-»
      not «нашёл-», so the pattern does not match.
  (b) Pattern requires rigid adjacency «ответить\s*[—,]\s*значит». Text
      has «ответить **на запрос журналистов** — значит» — modifier «на
      запрос журналистов» between verb and signal-word breaks adjacency.
- Category: gender/number coverage + adjacency requirement.

**P-RU-06** — `Глава ведомства отказался отвечать на ключевой вопрос, что многозначительно…`
- Marker: «отказался отвечать... многозначительно»
- Why miss: pattern 1 required verb «комментировать», but text uses
  «отвечать». Both verbs name the same speech-act type.
- Category: lexical-coverage gap.

### iter-1 FP audit

None. All 12 negatives correctly classified — including the structurally-
challenging N-RU-06 «Представители компании отказались комментировать
сделку до её юридического оформления», which has the «отказались
комментировать» trigger but no concession-signal-phrase, so the
two-component pattern correctly stays silent.

## iter-2 fix applied

Single-commit fix in `src/packs/epistemology.js` —
`SILENCE_AS_CONCESSION_PATTERNS`. Five distinct repairs in three patterns:

1. **Pattern 1** — refusal+signal:
   - extended verb to `(?:комментировать|отвечать)` (P-RU-06)
   - widened window 40→60 chars (allows longer modifier between verb and signal)
   - added reverse word order to signal-phrase: `(?:что\s+(?:говорит\s+SAМО|SAМО\s+говорит)|многозначительно)` (P-RU-01)
2. **Pattern 2** — silence-говорит:
   - replaced fixed `(?:в\s+этом\s+вопросе\s+)?` slot with general
     `[^.]{0,40}?` modifier (P-RU-02, P-RU-03)
   - added reverse word order to signal-phrase
3. **Pattern 3** — не-нашёл-ответить:
   - replaced `не\s+нашёл + W_STAR` with `не\s+наш + W_STAR` (catches all
     gender/number forms — нашёл/нашла/нашли/etc.) (P-RU-04 part a)
   - replaced rigid `ответить\s*[—,]\s*signal` with flexible
     `ответить[^.]{0,40}signal` (P-RU-04 part b)

Inline comment cites `silence-as-concession-2026-05-10` probe as discovery
context. **No EN changes** — EN was 100% on iter-1.

### Cycle-2 trap protection

This is the most extensive iter-2 of the four probes — five fixes versus
two or three previously. Discipline check:

- **No threshold change** — detector has no thresholds (boolean condition).
- **No FN-string-fitting** — every fix is a template generalization:
  reverse word order is a Russian-grammar feature, not corpus-fit;
  modifier-slot is a recurring shape (same as anecdotal); gender-stem
  matching covers the entire conjugation class.
- **No new FP appeared** — iter-2 holds 0% FP. Critical because broader
  patterns risk FP on neutral reportage; the negative class covered the
  most likely FP shapes (legal-restraint, neither-confirm-nor-deny,
  bare neutral) and stays clean.

The fact that 5 fixes were needed reflects scaffold-stage RU pattern
work being narrower than EN — likely because the original scaffold was
seeded from a small fixture set without testing against modifier variants.
This is a methodological note, not a discipline failure: the FN audit
correctly surfaced the gaps, and the fixes generalize beyond the FN
strings.

## iter-2 results (post-fix, same corpus)

```
Catch: 100.0% [75.7%, 100.0%]
FP:    0.0% [0.0%, 24.3%]
EN catch: 100.0%   RU catch: 100.0%
```

The 100% on iter-2 is a **same-corpus regression check**, not a
generalization claim. Live-corpus probe required before stable claim.

## Iter-3 plan (if commissioned)

Live-corpus probe — manual-curated EN+RU op-eds / commentary. Source
candidates:

- EN: substack op-eds, opinion columns from major outlets, Twitter/X
  accusatory threads.
- RU: Telegram political channels, op-ed sections of news sites.
- Negative class: real reportage with «declined to comment / отказался
  комментировать» framings from neutral wire-service journalism (Reuters,
  AP, Interfax) — these will stress-test the FP-rate properly.

Target N=20 positive / N=15 negative.

Expected outcome: catch likely 70-85% on live; some live samples will
phrase concession-inference without exact lexical markers (e.g. «у
него явно нет ответа на этот вопрос» — implicit rather than explicit
silence-marker). That gap = legitimate iter-3 lexical expansion work.

## Reproducibility

```
cd test-corpus/silence-as-concession-2026-05-10 && node runner.js
```

Output deterministic given fixed corpus + fixed detector code.
