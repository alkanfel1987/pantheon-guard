# quantum-mysticism (pseudo_technical_simulacrum) — 2026-05-13 SCAFFOLD report

**Detector:** `pseudo_technical_simulacrum` in `src/packs/epistemology.js` (v0.3.0-pre.2)
**Status:** **SYNTHESIS-ONLY SCAFFOLD** — author = test-author (synthesis from Manovaidya master-spec Раздел 6E + Foundation 08 + Диспенза case-study card). Author=tester per CLAUDE.md empirical-verification discipline. Real-corpus probe required before promotion to v0.3.0 stable.

## Anchor

- Theoretical: Foundation `vault/00-Foundation/08-Coherence-Across-Registers.md` §2.2 (anti-bridge B↔F catalogue) + Diaspora-Джо case-study card Pramāṇa-pañcaka pass (🔴 Q3-Q4-Q5).
- Application: Manovaidya master-spec Раздел 6E test probes (5 cases).
- Catalogue extension: `ns-arthantara-5-2-7` (Baudrillard simulacrum-of-source).

## Positive corpus (synthesis-only, N=10)

Derived from Manovaidya 6E Cases 1-5 (2026-05-13) + 5 paraphrases.

| ID | Case | Lexical class |
|---|---|---|
| P-RU-01 | «Я перестала ходить на химию — Диспенза учит, что меняя свою вибрацию я могу исцелить рак» | raise-vibration |
| P-RU-02 | «Партнёр и я не в когерентности, наши электромагнитные поля рассинхронизированы» | electromagnetic-field |
| P-RU-03 | «Я делаю медитации Диспензы каждое утро чтобы манифестировать новую работу через квантовое поле» | manifest-via-quantum |
| P-RU-04 | «Я знаю что я воин на пути изменения биологии через сознание, я уже изменил свою ДНК намерением» | DNA-via-intention |
| P-RU-05 | «Войдите в вибрацию изобилия и притянете деньги» | vibration-of-abundance |
| P-EN-01 | «Heart-brain coherence raises your electromagnetic vibration and heals the body» | heart-coherence-pseudo |
| P-EN-02 | «Raise your vibration and the universe will respond» | raise-vibration EN |
| P-EN-03 | «Through deep meditation you can access the quantum field directly» | access-quantum-field EN |
| P-EN-04 | «Your intention can change your DNA at the gene expression level» | DNA-via-intention EN |
| P-EN-05 | «Tune into the vibration of abundance and money flows» | vibration-of-abundance EN |

## Negative corpus (legitimate physics + contemplative-science, N=6)

Calibration anchors per Foundation 08 §3.1 corrective-use.

| ID | Source class | Why must NOT fire |
|---|---|---|
| N-EN-01 | Bohm: «Bohm's interpretation treats the implicate order as the ground of physics» | Foundation 08 regis B legitimate; FORMAL_PHYSICS_CONTEXT inhibitor catches via `Bohm[\'s]?\\s+interpretation` and `implicate\\s+order` |
| N-EN-02 | Penrose-Hameroff Orch-OR | Foundation 08 §7.1 fringe-respectable; `Penrose[\\-\\s]?Hameroff` and `Orch[\\-\\s]?OR` inhibitor |
| N-EN-03 | Schrödinger equation discussion | FORMAL_PHYSICS_CONTEXT inhibitor `Schrödinger\\s+equation` |
| N-EN-04 | Aspect experiment + Bell inequality | inhibitor `Aspect\\s+experiment` + `Bell.*inequality` |
| N-EN-05 | HRV biofeedback (Lehrer 2014) | does NOT use pseudo-physics terminology; named-source backup via NAMED_SOURCE_PATTERNS |
| N-EN-06 | Wallace contemplative-science | does NOT use pseudo-physics terminology; named-source backup |

## Cycle-2 trap warning

Patterns are designed against synthesis-derived positive corpus (Manovaidya 5 cases + 5 paraphrases). **Catch-rate on this corpus is MEANINGLESS as accuracy claim** — author=tester. Per CLAUDE.md «Synthesis 100% / Live 0%» empirical anchor: synthesis 100% catch precedent (FE detector 2026-05-10) → live 0/6 catch on verbatim WebFetch-extracts → 100pp gap. Same risk applies here.

**Held-out positive corpus required:**
- Becoming Supernatural (Dispenza 2017) verbatim chapter on heart-coherence
- Becoming Supernatural verbatim chapter on quantum-field
- Lipton *Biology of Belief* verbatim chapter on epigenetics-via-thought
- Sheldrake morphic-resonance article (verbatim from sheldrake.org)
- HeartMath Institute «science of heart-coherence» whitepaper (verbatim)
- 5+ Reddit r/spirituality / r/QuantumMysticism verbatim posts (high-density positive)

**Held-out negative corpus required:**
- Bohm *Wholeness and the Implicate Order* verbatim chapter
- Pribram-Bohm holoflux paper verbatim
- Lehrer 2014 HRV biofeedback paper verbatim
- Wallace *Contemplative Science* chapter
- Goleman & Davidson *Altered Traits* chapter on meditation-and-health
- Penrose-Hameroff Orch-OR Wikipedia + Stuart Hameroff lab page

Probe goal: ≥ 70% catch on positives + ≤ 5% FP on negatives. Per cycle-2 trap discipline: **patterns NOT to be tuned against held-out corpus** — that's the cycle-2 trap. If results below threshold, broaden patterns conservatively then run on FRESH held-out corpus.

## Sanity-test scope (this commit)

`test/packs-quantum-mysticism.test.js`:
- 9 positive sanity assertions (RU + EN; Manovaidya 6E cases + paraphrases)
- 6 negative-control assertions (Bohm, Penrose-Hameroff, Schrödinger, Aspect/Bell, HRV-Lehrer, Wallace) — verifying inhibitor architecture
- 2 pack-integration assertions (requirement registered; helpers exported)

These are **pattern-array regression tests**, not accuracy claims.

## Promotion path

| Status | Criterion |
|---|---|
| **SCAFFOLD (current)** | Patterns from synthesis; sanity-tests pass |
| **Live-validated pre.3** | Real-corpus probe ≥ 70% catch + ≤ 5% FP on held-out N≥10 pos + N≥10 neg |
| **v0.3.0 stable promotion** | Live-validated + healthcare-pack lexicon-spec Категория 6 cross-references documented |

## Healthcare-pack relationship

This detector is the **primary lexicon location** per simulate-fork decision 2026-05-13 (variant C, 65% confidence). Healthcare-pack lexicon-spec Категория 6 cross-references (no code duplication). When a healthcare-AI customer enables both packs, quantum-mysticism input is caught by epistemology pack and quantum-mysticism + cure-claim composite is additionally flagged by healthcare-pack `cure_claim_*` rules.

## Open questions

1. **EN coverage parity:** RU patterns broader (more declension forms); EN may need parity expansion before live probe.
2. **Inhibitor false-suppression risk:** legitimate physics context recognized via narrow lexical set (Schrödinger, Hilbert, Bohm, etc.). Edge case: pop-physics article that mentions these names superficially could be wrongly inhibited. Live probe should test.
3. **«Heart-brain coherence» edge case:** the phrase itself is ambiguous (HRV regis D vs Dispenza-pseudo regis G). Pattern requires accompanying pseudo-physics terminology (electromagnetic / quantum / vibration / heal / transform). HRV-only mention does NOT fire — verified in N-EN-05 sanity test.
