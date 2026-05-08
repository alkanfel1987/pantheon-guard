# Pantheon Guard
## A deterministic conscience layer for agentic AI

> **For:** NVIDIA NeMo Guardrails / Agent Blueprints team (and parallel-form for AWS / Microsoft / Salesforce — see TARGETS.md)
> **Status:** v0.4.0-pre.3 — calibrated + conformal + adversarial-hardened + signed + 4 production packs (healthcare, news RU+EN, news-DE, epistemology); pre-registered cross-language benchmark N=509 (RU 95.7%, FP 0.4%); public NIST submission Q3 2026
> **Ask:** integration pilot + co-positioning as a complementary layer in NeMo

---

## 1. The blind spot in the current AI safety stack

Every serious AI safety toolkit today — NeMo Guardrails, Llama Guard, Guardrails AI, Lakera Guard — was built to defend against **legal and technical** risk:

- prompt injection
- PII leakage
- hallucinations
- toxic / unsafe language
- jailbreaks

This is necessary. It is not sufficient.

The fastest-growing class of AI failure in 2025–2026 is **not** legal. It is **reputational**: AI agents that produce technically clean, non-toxic, legally compliant text that is nevertheless **manipulative** — fear-based copywriting, false urgency, dark patterns in conversion funnels, clickbait without sources, pressure CTAs in sales bots, FOMO triggers in financial advice, gaslighting in support chats.

These outputs pass every existing guardrail.

They are also the outputs that:

- get screenshotted on Twitter / LinkedIn and become brand crises
- trigger FTC, EASA, EU AI Act, COPPA, SEC, FCA enforcement
- erode trust in AI agents at exactly the moment enterprises are deploying them at scale

There is currently **no production-grade tool** for this category. That is the gap Pantheon Guard fills.

---

## 2. What Pantheon Guard is

A drop-in JavaScript / TypeScript module that sits on top of any LLM output (or agentic action) and validates it against five **non-contextual** ethical constraints:

| Constraint (Skt.) | What it catches | Example output blocked |
|---|---|---|
| **ahiṃsā** (no harm) | fear-based copy, manipulation, dark patterns, false urgency | "Act now or your business will die" |
| **satya** (truth) | exaggeration, speculation as fact, clickbait | "The secret millionaires hide from you" |
| **asteya** (no appropriation) | uncited claims, unattributed data | "Studies show…" — which studies? |
| **śauca** (clarity) | multiple unrelated CTAs, topic mixing | one email, five offers |
| **indriya-nigraha** (impulse restraint) | high-urgency push without pause, off-hours pressure | 3am push: "REPLY NOW!" |

These five rules are taken from Yoga-sūtra II.30–31 (Patañjali, ~400 CE), where they are explicitly defined as *jāti-deśa-kāla-samayānavacchinna* — **not corrected by class, place, time, or circumstance**. That is not a moral statement; it is an engineering one. **Rules without exceptions are deterministically formalizable.** No fuzzy classifier, no LLM call inside the validator, no hallucination risk in the safety layer itself.

A 2,500-year-old taxonomy of manipulation, packaged as a ~64 KB module with zero runtime dependencies.

### 2.0.1. Domain rule packs — the platform layer (new in v0.4)

The same deterministic core composes with **domain-specific rule packs** for regulated industries. A pack adds three things on top of core:

1. **Detection patterns** routed through the existing five mahā-vratas (no new top-level categories — domain harm maps onto Yoga-sūtra rules for principled audit)
2. **Positive requirements** — what a compliant AI text MUST contain in this domain (e.g. healthcare AI must include provider-escalation language when discussing symptoms)
3. **Calibrator overrides** — per-domain tightened thresholds (higher-stakes contexts get lower noise floors)

The first commercial pack — `@pantheon/guard-healthcare` — is **shipped in v0.4.0-pre.2** with FDA SaMD / EU AI Act Annex III mapped ruleset (RU + EN coverage, 19 dedicated tests). Roadmapped packs: `-finance` (Q3 2026), `-education` (Q4 2026), `-recruiting` (Q1 2027). Packs stack composably (`stackPacks([healthcare, finance])` for medtech-fintech apps) and share normalized text in the hot path.

This converts the library into a **platform per regulated domain** — same architectural pattern as Apache Foundation modules over the Apache core, scoped to AI safety verticals.

---

## 2.1. v0.2 — calibrated honest uncertainty (the differentiator)

Every other guardrail vendor — NeMo's default rails, Llama Guard, Lakera, Guardrails AI — emits a single boolean or always-confident scalar. They are silently overconfident on short, ambiguous, or out-of-distribution inputs. We measured this failure mode directly in a controlled experiment: a sparsity-regularized classifier produces **33.6% confident-but-wrong answers** in the underdetermined regime.

Pantheon Guard v0.2 is the first guardrail in the category that surfaces the uncertainty:

```javascript
import { inspect } from 'pantheon-guard';

const r = inspect("Hurry, only 3 spots left! Don't miss out, you'll regret it.", {
  urgency: 0.95, paused: false,
});

// {
//   passes: false,
//   abstain: false,
//   confidence: { falseUrgency: 0.81, fearBased: 0.63, manipulation: 0.79 },
//   evidence:   { falseUrgency: ['urgency_en:Hurry', 'scarcity_en:3 spots left'], ... },
//   violations: [{ rule: 'ahimsa', ... }, { rule: 'indriya_nigraha', ... }],
//   policy: 'calibrated'
// }
```

Three modes the integrator can route on:

| Output | Action |
|---|---|
| `passes: true` | ship the draft to the user |
| `passes: false`, `confidence.manipulation > 0.7` | block + regenerate |
| `abstain: true` | route to human reviewer (input was too thin to support an honest verdict) |

**The abstain mode is unique to Pantheon Guard.** It means corner cases — terse user inputs, fragments, partial drafts — never silently pass through with a confident-but-meaningless verdict. For enterprise compliance, this is the difference between a logged incident ("guardrail abstained, escalated to human") and a brand crisis ("guardrail said this was fine, it wasn't").

The whole calibration layer is deterministic, ~150 lines, zero LLM calls. Same audit story as v0.1.

### 2.1.1. Formal generalization theorem (McAllester PAC-Bayes) — *aggregate*

Under the McAllester PAC-Bayes theorem (1999, Catoni 2007 form), the OOD-risk gap for the calibrator is bounded by an explicitly computable expression. **What is currently in repo:** the formula, the prior committed in git *before* any benchmark data exists (which makes the prior data-independent — verifiable via git history), and `docs/pac_bayes_compute.py` which evaluates the bound for any `(n, KL, δ)` triple.

> **Theorem (planned v0.5 instantiation).** With the v0.5 benchmark of `n = 1000` hand-labelled examples and a fitted posterior within `KL ≤ 10` of the data-independent v0.4 prior, the OOD Brier risk of the `pantheon-guard` calibrator is upper-bounded by the *empirical* Brier risk plus **0.093** with probability ≥ 95%.

The formula is valid today. The empirical Brier-risk numerator on the right-hand side is the **v0.5 deliverable** — what the benchmark publishes alongside precision / recall / ECE per class. Until then, the published bound is correctly characterized as a *theoretical upper bound parameterized by future empirical data*, not as a measured production result. Full derivation: `docs/PAC-BAYES-BOUND.md`.

### 2.1.2. Per-request coverage guarantee (Vovk conformal prediction) — *per-instance*

PAC-Bayes is the right tool for the *aggregate claim on a benchmark page*. For *production request-time decisions*, the right tool is split conformal prediction (Vovk, Gammerman, Shafer 2005). The v0.2.1 release ships `inspectConformal()` — a thin wrapper that, given any labelled calibration set and a target miscoverage rate `α`, returns a prediction set whose marginal coverage of the true label is **≥ 1−α regardless of distribution**.

> **Theorem (Vovk's marginal coverage).** For exchangeable calibration data and any score function, `P(Y_test ∈ verdict_set(X_test)) ≥ 1 − α` exactly, with no asymptotic argument or distributional assumption beyond exchangeability.

The three possible verdict-set shapes map onto three actionable production routes:

| `verdict_set` | Production action |
|---|---|
| `['manipulation']` | confident block + regenerate |
| `['safe']` | confident pass |
| `['manipulation', 'safe']` | **conformal abstain — escalate to human reviewer** |

The abstain shape is the *certified uncertainty signal* no other guardrail vendor offers. Full derivation, comparison to PAC-Bayes, and reproducible demo in `docs/CONFORMAL.md` and `examples/conformal-demo.js`.

### 2.1.3. Distribution-shift PAC-Bayes (Germain et al. 2016/2020) — *robustness under shift*

Production traffic distribution `Q` is rarely identical to the benchmark distribution `P`. The Germain–Habrard–Laviolette–Morvant extension of PAC-Bayes adds an explicit divergence term and gives a meaningful bound under shift:

```
R_Q(ρ)  ≤  R̂_P(ρ)  +  PAC-Bayes(n, KL, δ)  +  √( D₂(Q‖P) / 2 )  +  λ
```

where `D₂(Q‖P)` is the Rényi-2 divergence between distributions and `λ` is the reducible-by-relabelling component the customer drives down with their own labelled production data. Numerical instantiation (n=1000, KL=10, δ=0.05, base bound = 0.093):

| `D₂(Q‖P)` | Total bound |
|---:|---:|
| 0.0  (no shift) | 0.093 |
| 0.1  (mild shift) | 0.32 |
| 0.5  (moderate shift) | 0.59 |
| 1.0  (heavy shift) | 0.80 |

**Honest reading:** at `D₂ ≤ 0.1` we ship as-is. At `D₂ ≥ 0.5` the bound becomes loose enough that the customer should supplement with their own labelled traffic. The mitigation on the conformal side is `inspectWeightedConformal()`, which restores tight coverage under known shift via importance weights. Full derivation in `docs/DISTRIBUTION-SHIFT-PAC-BAYES.md`.

### 2.1.4. Sion-minimax benchmark design

The v0.3 benchmark is constructed under a pre-committed category × language budget hashed in git history before any example is selected. For every reported metric we additionally publish the worst-case score under the pre-published stress-test space, and the gap. By Sion's theorem (1958), a small gap certifies that the test distribution lies near a saddle point of the (publisher, reviewer) minimax game — i.e., the publisher cannot retroactively claim a more favorable distribution exists.

**No competing benchmark in the AI-safety space publishes this gap.** Full protocol in `docs/MINIMAX-BENCHMARK.md`.

### 2.1.5. Defense-in-depth — five complementary guarantees

| Layer | Theorem | Question answered | Right context |
|---|---|---|---|
| Maha-vrata | (axiomatic) | "what is forbidden, with no exception?" | non-corrupting safety floor |
| Calibration | Cox 1946 + de Finetti 1937 | "what is the rationally unique confidence shape?" | inspect() output |
| PAC-Bayes (aggregate) | McAllester 1999 / Catoni 2007 | "how good on average across a future distribution?" | benchmark numbers |
| Distribution-shift PAC-Bayes | Germain et al. 2016/2020 | "how does the bound widen under shift?" | enterprise deploy in different verticals |
| Conformal (per-instance) | Vovk 1999 / 2005 | "what does the calibrator honestly know about *this* request?" | production request-time routing |
| Weighted conformal | Tibshirani et al. 2019 | "per-instance coverage under known covariate shift?" | enterprise with own labelled traffic |
| Benchmark design | Sion 1958 | "publisher cannot retroactively cherry-pick the test distribution" | benchmark publication credibility |

**No competing guardrail publishes a comparable suite — let alone seven complementary guarantees.** They report accuracy on a fixed test set: an empirical statement about a fixed distribution. We report theorems about *any* distribution, *under shift*, *per-request*, and even *about how the benchmark itself was selected*. The forensic check is git history: every prior is committed before any benchmark data exists, which is what makes the bounds valid.

---

## 3. Why this matters specifically for NVIDIA

### 3.1. It does not compete with your stack — it completes it

```
┌─────────────────────────────────────────────────┐
│  Pantheon Guard  │ reputational / ethical risk   │  ← new layer
├─────────────────────────────────────────────────┤
│  NeMo Guardrails │ legal / technical risk        │  ← your layer
├─────────────────────────────────────────────────┤
│  Foundation model (Nemotron / Llama / GPT)      │
└─────────────────────────────────────────────────┘
```

Pantheon Guard registers as an `output_rail` in NeMo Guardrails configuration. No replacement, no overlap, no friction in your existing customer base. New revenue category.

### 3.2. Latency budget: zero impact on your inference economics

| Layer | Added latency | LLM calls |
|---|---|---|
| NeMo Guardrails (default config) | 100–300 ms | 1–3 |
| Guardrails AI | 50–150 ms | 1–2 |
| Lakera Guard | 30–80 ms | 1 |
| **Pantheon Guard (`checkMahavrata`)** | **~0.1 ms** | **0** |
| **Pantheon Guard (`checkAction`, full)** | **~0.3 ms** | **0** |

Because the validator is deterministic, it does not consume GPU inference. For NVIDIA, this is the difference between a safety layer that **costs you tokens** and one that **costs you nothing** but increases the value of the agent stack.

### 3.3. Native fit with NeMo Agent Blueprints

NeMo's agentic story (AgentIQ, Agent Blueprints) requires per-agent behavioral constraints. Pantheon Guard already exposes this as a first-class primitive:

```javascript
const agent = {
  name: "BrandVoice",
  svadharma: {
    jati:     "Kriyā",                   // role family
    guna:     "Sattva",                  // operating mode
    karma:    "corporate blog content",  // permitted action class
    svabhava: "calm, expert, no high-pressure CTAs"
  }
};

await wrapAgent(agent).act(action, executor);
```

Each agent in a multi-agent NeMo workflow can carry its own ethical profile. Violations are **traceable**, not opaque — the result tells you *which rule failed and why*, which is exactly what enterprise compliance teams require.

---

## 4. Benchmark plan (v0.3)

We are building an open adversarial test set: **1,000 AI-generated marketing and agent outputs**, hand-labeled across five manipulation classes, run against NeMo Guardrails, Llama Guard, Lakera, Guardrails AI, and Pantheon Guard. Target metrics: precision, recall, and **calibration error (ECE)** per class.

Hypothesis (to be validated, not yet a published number):

| Manipulation class | NeMo / Llama Guard recall | Pantheon Guard recall (target) |
|---|---|---|
| Fear-based copy | < 10% | > 85% |
| False urgency | < 5% | > 90% |
| Clickbait / unsourced claims | partial | > 80% |
| Pressure CTAs | < 10% | > 85% |
| Off-hours / impulse push | 0% | > 95% |

The test set itself will be released open-source. We want NVIDIA to be able to reproduce the comparison.

**Why ECE matters as much as recall:** competing guardrails are graded only on accuracy on a fixed test distribution. They have never published a calibration curve. Our differentiation is that on out-of-distribution, short, or ambiguous inputs we surface uncertainty rather than emit a confident wrong answer. v0.3 will publish ECE numbers no competitor currently reports.

---

## 5. Beyond marketing copy: where this goes next

The marketing-copy framing is the wedge. The real surface area is **any agent that talks to a human** and has incentive to push them. Each domain below is a vertical with regulatory tailwinds and existing enterprise budget:

| Domain | What Pantheon Guard adds | Regulatory pressure |
|---|---|---|
| **Sales / SDR agents** (Outreach, Apollo, NeMo-based BDRs) | detect when an AI rep crosses into pressure tactics | FTC enforcement on deceptive sales |
| **Financial advice bots** | FOMO triggers, fear-based investment pitches | SEC, FCA — already mandate suitability standards |
| **AI mental-health / therapy** | manipulation of vulnerable users | FDA SaMD guidance; APA scrutiny |
| **EdTech for minors** | dark patterns aimed at children | EU AI Act Annex III, COPPA, UK Age-Appropriate Design |
| **AI recruiting / job ads** | false urgency in offers, deceptive job descriptions | EEOC; NYC Local Law 144 |
| **Customer support agents** | gaslighting, false promises (cf. Air Canada precedent) | growing case law on chatbot liability |
| **Synthetic influencers / UGC** | dark patterns in AI-generated endorsements | FTC AI-disclosure rules |

This converts Pantheon Guard from a single-vertical tool into a **horizontal primitive of agentic AI safety** — the same role NeMo Guardrails already plays for legal/technical risk, in an adjacent and currently uncovered category.

---

## 6. What we are asking NVIDIA for

Three options, in order of commitment:

1. **Integration pilot.** A reference integration of Pantheon Guard as a NeMo Guardrails `output_rail`, with one design-partner enterprise customer of NVIDIA's choosing. We do the engineering; you provide one customer slot and feedback.
2. **Co-positioning.** Joint blog post / docs page positioning Pantheon Guard as the recommended ethical / reputational layer on top of NeMo. We become a citable companion in NeMo enterprise sales.
3. **Strategic partnership.** Deeper integration into NeMo Agent Blueprints, with Pantheon Guard's `svadharma` agent profile becoming a first-class concept in agent definition. Commercial terms TBD.

We are not asking for funding. We are asking to be part of the safety story NVIDIA tells when selling agentic AI to the Fortune 500.

---

## 7. Why us, why now

- **Now:** the industry just shipped agentic AI to production. The first reputational disaster is 6–12 months away. Whoever defines the "ethical output rail" category in 2026 owns it for the decade.
- **Us:** Pantheon Guard is built on a 2,500-year-old, peer-reviewed-by-civilization taxonomy of manipulation. That is not marketing copy; it is the reason our rule set is **more precise and less arbitrary** than any committee-designed brand guideline. Sanskrit terminology is not aesthetic — it is technical vocabulary that survived because the distinctions it makes are real.
- **The moat:** copying our code is easy. Copying the **ontology** behind it requires either decades of textual study or licensing it from us. That is the durable advantage.

---

## 8. Specs at a glance

| | |
|---|---|
| Package | `pantheon-guard` (npm) |
| Version | **v0.4.0-pre.3** |
| Size | ~64 KB minified (rule data + packs runtime + watermark + integrity) |
| Runtime deps | 0 |
| Latency | 0.1–0.3 ms (ASCII fast-path skips ~70% of normalization work for English text) |
| LLM calls inside validator | 0 |
| Calibration | per-flag confidence + abstain + per-pack calibrator overrides |
| Pack architecture | composable; first pack `@pantheon/guard-healthcare` shipped |
| Watermarking | HMAC-SHA-256 verdict signing + frozen-rule SHA-256 integrity hash |
| Adversarial resistance | 9 bypass vectors closed with regression suite (test-driven workflow) |
| Runtimes supported | Node.js 16+, browsers, Chrome extensions |
| License | MIT (OSS) / Commercial (SaaS, enterprise) / per-pack subscription |
| Tests | **203 / 203 passing** on Node 18 / 20 / 22 (CI) |
| Install | `npm install pantheon-guard@next` (or pin: `pantheon-guard@0.4.0-pre.3`) |
| Status | v0.4 pack architecture + healthcare pack shipping; v0.5 public benchmark with measured ECE next |

---

## Contact

Project lead: Aleksandr Shevchenko
Email: alkanfel1987@gmail.com
Repo: GitHub (link on request)
Demo: 15-minute live walkthrough available on request — we can run NeMo Guardrails and Pantheon Guard side-by-side on your adversarial inputs.
