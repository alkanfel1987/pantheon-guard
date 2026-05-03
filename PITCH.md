# Pantheon Guard
## A deterministic conscience layer for agentic AI

> **For:** NVIDIA NeMo Guardrails / Agent Blueprints team
> **Status:** v0.1 shipping; v0.2 (classifier) in development
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

A 2,500-year-old taxonomy of manipulation, packaged as a 18 KB module with zero runtime dependencies.

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

## 4. Benchmark plan (v0.2)

We are building an open adversarial test set: **1,000 AI-generated marketing and agent outputs**, hand-labeled across five manipulation classes, run against NeMo Guardrails, Llama Guard, Lakera, Guardrails AI, and Pantheon Guard. Target metrics: precision and recall per class.

Hypothesis (to be validated, not yet a published number):

| Manipulation class | NeMo / Llama Guard recall | Pantheon Guard recall (target) |
|---|---|---|
| Fear-based copy | < 10% | > 85% |
| False urgency | < 5% | > 90% |
| Clickbait / unsourced claims | partial | > 80% |
| Pressure CTAs | < 10% | > 85% |
| Off-hours / impulse push | 0% | > 95% |

The test set itself will be released open-source. We want NVIDIA to be able to reproduce the comparison.

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
| Size | 18 KB minified |
| Runtime deps | 0 |
| Latency | 0.1–0.3 ms |
| LLM calls inside validator | 0 |
| Runtimes supported | Node.js 16+, browsers, Chrome extensions |
| License | MIT (OSS) / Commercial (SaaS, enterprise) |
| Status | v0.1 shipping; v0.2 with built-in classifier in development |

---

## Contact

Project lead: Aleksandr Kanfel
Email: alkanfel1987@gmail.com
Repo: GitHub (link on request)
Demo: 15-minute live walkthrough available on request — we can run NeMo Guardrails and Pantheon Guard side-by-side on your adversarial inputs.
