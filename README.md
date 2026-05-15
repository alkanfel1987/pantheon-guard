# pantheon-guard

> **The conscience layer for AI-generated marketing.**
> Catches what guardrails miss: fear-based copywriting, false urgency, dark patterns in AI-generated sales funnels.

[![npm](https://img.shields.io/badge/npm-v0.4.2-blue)](https://www.npmjs.com/package/pantheon-guard)
[![provenance](https://img.shields.io/badge/npm-signed%20%E2%9C%93-success)](./SECURITY.md)
[![license](https://img.shields.io/badge/license-MIT%20%2F%20Commercial-green)](./LICENSE.md)
[![Built on](https://img.shields.io/badge/foundation-Yoga--s%C5%ABtra%20II.30--31-purple)]()
[![Calibrated](https://img.shields.io/badge/v0.2-honest%20uncertainty-orange)]()
[![Conformal](https://img.shields.io/badge/v0.2.1-conformal%20coverage-red)]()
[![Theorems](https://img.shields.io/badge/v0.2.2-7%20formal%20guarantees-darkgreen)]()
[![Hardened](https://img.shields.io/badge/v0.3-adversarial%20%2B%20signed-black)]()
[![Packs](https://img.shields.io/badge/v0.4-domain%20rule%20packs-blueviolet)]()

> 🔐 **Releases are cryptographically attested via npm provenance.** Verify any installed version with `npm audit signatures`. See [SECURITY.md](./SECURITY.md) for the full supply-chain integrity story.

---

## Why this exists

Your AI bot generates content for sales funnels. It is already protected against prompt injection and PII leakage by NeMo Guardrails, Guardrails AI, or Lakera. All good?

No.

Ask GPT-4 or Claude to "write a sales email for an online course," and you get:

- "Hurry, only 3 spots left until midnight!" — false urgency, there are 300 spots, not 3
- "If you don't start now, in a year you'll regret it" — fear-based with induced guilt
- "The secret big companies don't want you to know..." — clickbait without sources
- "Only for the chosen few" — manufactured exclusivity

None of the existing guardrails catch this. They were built to defend against legal risk (data leaks, toxic language, hallucinations), not against **manipulative marketing**.

This is the customer — a small-business owner — who later calls and asks why their AI bot "sounds like a scammer."

`pantheon-guard` solves exactly that problem.

## What it does

Runs **on top of** your existing guardrails, not replacing them. Two-line integration:

```javascript
import { checkAction } from 'pantheon-guard';

const result = checkAction(agent, {
  text: "Hurry, only 3 spots left!",
  urgency: 0.95,
  paused: false,
  contains: { falseUrgency: true, fearBased: true },
});

// { passes: false, failedStep: 'mahavrata',
//   violations: [
//     { rule: 'ahimsa', reason: 'fear-based content, false urgency' },
//     { rule: 'indriya_nigraha', reason: 'action driven by urgency without pause' }
//   ],
//   recommendation: 'Mahā-vrata violated. Action not permitted.' }
```

If `passes: true` — you ship the text to the user. If `false` — you ask the model to regenerate with a different prompt or return a "something is off here" signal to your client.

### v0.2 — `inspect()` with calibrated honest uncertainty

The shorter API used in real codebases. Takes raw text, returns the verdict plus per-flag confidence and an abstain decision when the input is too thin to support any honest claim:

```javascript
import { inspect } from 'pantheon-guard';

const r = inspect("Hurry, only 3 spots left! Don't miss out, you'll regret it forever.", {
  urgency: 0.95,
  paused: false,
});

// {
//   passes: false,
//   abstain: false,
//   confidence: { falseUrgency: 0.81, fearBased: 0.63, clickbait: 0, manipulation: 0.79 },
//   evidence:   { falseUrgency: ['urgency_en:Hurry', 'scarcity_en:3 spots left'], fearBased: [...], clickbait: [] },
//   violations: [{ rule: 'ahimsa', ... }, { rule: 'indriya_nigraha', ... }],
//   policy: 'calibrated'
// }
```

**Why this matters and why no competitor offers it:** every other guardrail layer (NeMo, Llama Guard, Lakera, Guardrails AI) emits a single boolean or always-confident scalar. They are silently overconfident on short, ambiguous, or out-of-distribution inputs — a failure mode we measured directly in a controlled experiment (see `docs/PHILOSOPHY.md` and the linked phase-2 report). v0.2 surfaces that uncertainty to the caller and lets them choose:

- `policy: 'calibrated'` (default) — a flag fires only when its confidence ≥ 0.7. Short or borderline input returns `abstain: true` instead of a fake verdict.
- `policy: 'strict'` — reproduces v0.1 behavior; any pattern hit fires the flag.

The whole calibration layer is deterministic, ~150 lines, zero runtime dependencies — same audit story as v0.1.

### v0.2.1 — `inspectConformal()` with distribution-free coverage guarantee

For production deployment that needs a formal per-request certificate, a thin layer adds split conformal prediction (Vovk 1999, 2005). Given any labelled calibration set (the upcoming v0.3 benchmark, or your own internal labelled data) and a target miscoverage rate `α`, every request produces a prediction set whose marginal coverage of the true label is ≥ 1−α — *regardless of distribution, model, or sample size*:

```javascript
import { fitConformal, inspectConformal } from 'pantheon-guard';

const calibrator = fitConformal(calibrationSet, { alpha: 0.1 });
// → 90% coverage guarantee, finite-sample quantile fitted

const r = inspectConformal(text, { calibrator, urgency: 0.5, paused: true });
// →
// {
//   verdict_set: ['manipulation'] | ['safe'] | ['manipulation', 'safe'],
//   coverage: 0.9,
//   passes: ...,
//   confidence: { ... },
//   ...
// }
```

The three verdict-set shapes map onto three guarded actions:

| `verdict_set` | Meaning |
|---|---|
| `['manipulation']` | confident block + regenerate |
| `['safe']` | confident pass |
| `['manipulation', 'safe']` | conformal abstain — escalate to human reviewer |

The abstain shape is what no other guardrail vendor produces. It is a *certified* uncertainty signal: the math guarantees that across a sufficiently large run of inputs, the true label is in the set ≥ 1−α of the time. Full derivation in `docs/CONFORMAL.md`. PAC-Bayes (`docs/PAC-BAYES-BOUND.md`) and conformal form a defense-in-depth pair: PAC-Bayes for average-risk benchmark numbers, conformal for per-request decisions.

## How it works — the foundation

`pantheon-guard` is built on Yoga-sūtra II.30–31 (Patañjali, ~400 CE). It defines the **Mahā-vrata** — five constraints explicitly described as **not corrected by class, place, time, or circumstance** (Skt. *jāti-deśa-kāla-samayānavacchinna*).

This is not moral rhetoric — it is an **architectural choice**. Rules without exceptions are easy to formalize as a deterministic validator. No fuzzy classifier, no LLM calls inside the check, no hallucinations in the safety layer itself.

### The five Mahā-vrata rules

| Sanskrit | What it catches | Example AI copy that gets blocked |
|---|---|---|
| **ahiṃsā** (no harm) | fear-based, manipulation, dark patterns, false urgency | "Hurry, or your business will die" |
| **satya** (truth) | exaggeration, speculation framed as fact, clickbait | "The secret of millionaires they hide from you" |
| **asteya** (no appropriation) | missing attribution when citing data | "Studies show..." (which? whose?) |
| **śauca** (clarity) | multiple unrelated topics in one message, noise, confusion | one email pushing 5 different offers |
| **indriya-nigraha** (impulse restraint) | high urgency without pause, emotional reaction | automatic 3am alert: "REPLY RIGHT NOW!" |

## Install

```bash
npm install pantheon-guard
# or pin to a specific version:
npm install pantheon-guard@0.4.2
# or install directly from GitHub:
npm install github:alkanfel1987/pantheon-guard#v0.4.2
```

Zero runtime dependencies. ~64 KB minified (ESM + CJS bundled together).
Latest stable: `0.4.2` · Releases are cryptographically attested via npm provenance — verify with `npm audit signatures`. See [SECURITY.md](./SECURITY.md).

## Quick start — 3 before/after examples

### Example 1: Sales email

**Without Pantheon:**
```javascript
const email = await llm.generate({
  prompt: "Write an email for the launch of a Python course"
});
// "🔥 HURRY UNTIL MIDNIGHT! Last chance to get into Python!
//  Those who don't sign up now — in a year you'll regret it..."

await sendEmail(email); // client horrified
```

**With Pantheon:**
```javascript
import { checkAction, detectPatterns } from 'pantheon-guard';

let email = await llm.generate({ prompt: "..." });
let attempts = 0;

while (attempts < 3) {
  const flags = detectPatterns(email); // auto-detect dark patterns
  const result = checkAction(brandAgent, {
    text: email,
    urgency: 0.3,
    paused: true,
    contains: flags,
  });

  if (result.passes) break;

  // Regenerate with the violation as constraint
  email = await llm.generate({
    prompt: `Rewrite without ${result.violations.map(v => v.rule).join(', ')}: ${email}`
  });
  attempts++;
}

await sendEmail(email); // client happy
```

### Example 2: Headlines for a Telegram channel

**Before:**
- "What experts are silent about"
- "9 out of 10 make this mistake"
- "The secret that will change everything"

**After (filtered by Pantheon):**
- "Three common mistakes when configuring X"
- "What I learned reviewing 50 cases this quarter"
- "A method that gave my clients +30% conversion"

Code:
```javascript
const titles = await llm.generate({ prompt: "10 headlines..." });
const clean = titles.filter(t => checkAction(agent, {
  text: t,
  intent: 'inform',
  contains: { clickbait: detectClickbait(t) },
}).passes);
```

### Example 3: Push notifications

The most common failure mode of AI bots is sending pushes at night with text like "REPLY NOW." `indriya-nigraha` catches this automatically:

```javascript
checkAction(agent, {
  text: "Reply now!",
  urgency: 0.95,
  paused: false,
});
// { passes: false, failedStep: 'mahavrata',
//   violations: [{ rule: 'indriya_nigraha', ... }] }
```

## Comparison with existing solutions

| What it protects against | Pantheon Guard | NeMo Guardrails | Guardrails AI | Lakera Guard |
|---|---|---|---|---|
| Prompt injection | — | ✓ | ✓ | ✓ |
| PII leakage | — | ✓ | ✓ | ✓ |
| Hallucinations | — | ✓ | ✓ | partial |
| Toxic language | — | ✓ | ✓ | ✓ |
| **Fear-based copywriting** | **✓** | — | — | — |
| **False urgency** | **✓** | — | — | — |
| **Dark patterns in funnels** | **✓** | — | — | — |
| **Manipulative CTAs** | **✓** | — | — | — |
| **Clickbait without sources** | **✓** | — | — | — |
| **Attribution when citing data** | **✓** | — | — | — |

**Conclusion:** use Pantheon Guard **alongside** NeMo / Guardrails AI, not instead of them. They protect against legal and technical risk. Pantheon protects your client's reputation.

## Benchmarks

Pre-registered cross-language benchmark with Wilson 95% CI and SHA-256 corpus hashes. Reproducible in ~60 seconds on commodity hardware (no GPU, no network calls).

| Region | N | Accuracy (95% Wilson CI) | FP-rate | Catch-rate (in-corpus) |
|---|---|---|---|---|
| Russian | 280 | **95.7%** [92.7%, 97.5%] | 0.8% (2/256) | 58% (14/24) |
| English (UK + US + INTL) | 240 | 90.4% [86.0%, 93.6%] | 1.1% (2/176) | 67% (43/64) |
| German | 100 | **96.0%** [89.5%, 98.5%] | 0.0% (0/87) | 69% (9/13) |
| **Cross-language total** | **620** | **93.7%** [91.5%, 95.4%] | **0.8%** (4/519) | **65%** (66/101) |

Stack: core + news + news-de + epistemology + healthcare + **clickbait** (v0.0.3). SHA-256 corpus hashes printed by each runner as pre-registration of test snapshot.

> ⚠ **The catch-rate column is in-corpus and overstates real-world recall.** Held-out testing (see "Generalization gap" below) measures clickbait catch at **20%** on sources the pack was never tuned against. Read that section before trusting any catch number here.

### Accuracy is not catch-rate — read both columns

These are different measurements and must not be conflated:

- **Accuracy 93.7%** — of all 620 items, the share where the verdict (pass *or* catch) was correct. Dominated by the pass-expected majority, which the FP-strict design handles well. A trivial "always pass" classifier already scores 84% here — accuracy is a weak headline metric under this class imbalance.
- **Catch-rate 65% (in-corpus)** — of the 101 manipulative items *in the tuning corpus*, the share caught. The honest, generalizing figure is **lower** — see "Generalization gap".
- **FP-rate 0.8%** — of the 519 benign items, the share wrongly flagged. This one *does* generalize (0% on every held-out set tested).

### False positives — full disclosure

4 FP across 519 benign items. All 4 are pre-existing pack behavior, none from the `clickbait` pack:
- 2 RU FPs — `news` pack on borderline RU headlines.
- 2 EN FPs — `healthcare` pack `provider_escalation` requirement firing on healthcare-*news* (ProPublica "Look Up Where Your Generic Prescription Drugs Were Made"; Smithsonian "...AI Tool to Diagnose Autism..."). These are journalism *about* medicine, not medical advice. Tracked as a separate healthcare-pack calibration fix.

The `clickbait` pack itself: **0 FP across all 263 EN+DE+INTL pass-expected items**, including a 54-entry adversarial cohort (see below).

### `clickbait` pack — v0.0.1 → v0.0.3 (2026-05-15)

A calibration run surfaced a gap: existing packs target sales/marketing manipulation but missed **attention-fixation engineering** — the rhetorical regime of social-aggregator clickbait. Corpus was expanded with 57 EN entries (Wikipedia events, Al Jazeera, BuzzFeed, Bored Panda); existing-pack catch-rate on the clickbait subset was 12% (3/25).

The `clickbait` pack adds 10 mechanism-class detectors (forward-reference, vague-revealer-adjective, numeric-listicle, caps-emotional-disruption, extreme-intensifier-adverb, universal-quantifier-claim, nominalization-of-emotion, presupposition-loaded, judgment-adjective-prefix, drama-verb-cluster) routed across all five mahā-vrata rules.

Foundation: Loewenstein 1994 (curiosity gap), Cialdini 1984 (persuasion), Tversky & Kahneman 1981 (framing), Berlyne 1960 (collative variables), Munger 2020 (clickbait economics), and the clinical hypnosis literature of Milton H. Erickson (American Society for Clinical Hypnosis founder, *American Journal of Clinical Hypnosis* founding editor, APA Fellow) — Erickson's documented techniques (indirect suggestion, confusion technique, pacing-and-leading, double bind, utilization, interspersal) map structurally onto the surface patterns of consumer clickbait.

**v0.0.2 — adversarial FP validation.** The earlier "mainstream FP 0/30" figure had a wide Wilson CI [0%, 11.6%]. v0.0.2 expands the mainstream test ~8x with a 54-entry adversarial cohort deliberately picked for high-FP-risk register: ProPublica investigative journalism (legitimate curiosity-gap headlines), The Conversation academic explainer ("Why X" framing), Smithsonian popular science, Axios political news. The `clickbait` pack held **0 FP across the full N=263 EN+DE+INTL pass-expected subset** (Wilson 95% CI [0%, 1.4%]) — no detector logic changed; the patterns proved precise enough. In-corpus clickbait-subset catch-rate: 12% → **84% (21/25)**.

**v0.0.3 — curiosity-gap detector family + generalization measurement.** Adds 6 curiosity-gap detectors (demonstrative-withheld, quantified-withheld, outcome-teaser ×2, gap-pointer, relation-question, hidden-knowledge) derived from Loewenstein's information-gap theory, and broadens the numeric-listicle lexicon. This is a strict improvement (FP unchanged at 0%, catch ≥ v0.0.2 everywhere). But the headline outcome of v0.0.3 is the **generalization measurement** below — which is the honest, and humbling, status of the pack. See "Generalization gap".

### Generalization gap — the honest catch number

Every catch-rate above is **in-corpus**: the `clickbait` pack was authored against BuzzFeed + Bored Panda entries, then scored on them. In-corpus catch numbers measure memorization, not capability. Two held-out tests were run, each **once**, against clickbait sources the pack was never authored or tuned against.

| Measurement | catch-rate | FP-rate |
|---|---|---|
| In-corpus (BuzzFeed + Bored Panda) | 84% (21/25) | 0% |
| Held-out #1 — Upworthy + Bright Side + Distractify | 74% (23/31) | 0% (0/14) |
| **Held-out #2 (fresh) — LittleThings + Scary Mommy + TheThings** | **20% (4/20)** | **0% (0/25)** |
| **True generalization gap (in-corpus − fresh held-out)** | **64 pp** | — |

Why two held-out numbers, and why #2 is the real one: held-out #1 was used to *diagnose* the v0.0.2 gap. The v0.0.3 curiosity-gap detector family was then built — from Loewenstein's information-gap theory, not by fitting the failure list — but the author had still *seen* held-out #1's failures, so its 74% is semi-contaminated. Held-out #2 is pulled from three further sources touched nowhere in development; its **20%** is the uncontaminated measurement.

**What this establishes (the honest, uncomfortable finding):**

- **FP-strictness held on the registers tested first — but does not generalize universally.** 0% FP across held-out #1/#2 and 263 adversarial mainstream items (clean-mainstream + clickbait register). But a cross-language control corpus (2026-05-16, N=150: 50 EN / 50 RU / 50 DE, tabloid + wire + accident-report register, never tuned against) measured **4.9% FP** (5/103 pass-expected). The clickbait pack itself stayed 0 FP; the 5 FP came from three pre-existing pack over-triggers — 3× healthcare pack on medical mentions in news headlines, 1× news pack flagging standard "sources say" wire attribution, 1× news-de flagging a routine accident verb ("kracht"). FP-strictness is real on clean-mainstream/clickbait register and breaks on tabloid/wire register until those packs are calibrated.
- **Deterministic clickbait *catch* does not generalize — and is EN-only.** A regex/lexicon pack collapses to ~20% on unseen EN sources. On the 2026-05-16 cross-language control corpus it caught **0/47** — there is no RU or DE clickbait detector at all (the clickbait pack is EN-only), and even on EN it caught 0/10 because the control corpus's EN catch items are sensational-tabloid register, not the listicle/caps/curiosity-gap register the pack was built for. Every clickbait outlet — and every language — uses different surface vocabulary; chasing each is an infinite overfitting treadmill.
- **A learned L2 layer is the only remaining path for catch — but the obvious shortcut does not work.** The deterministic pack's correct role is L1: a $0, microsecond first pass. A zero-shot NLI encoder L2 (mDeBERTa-v3-base-mnli-xnli) was empirically probed against held-out clickbait #2 — it failed: 5% catch at ≤2% FP, *worse* than the regex pack's 20%. "This is a clickbait headline" scored clickbait and mainstream headlines almost identically (75% catch / 76% FP at a low threshold — zero discrimination). Reason: clickbait-ness is a pragmatic/genre property, not the semantic-entailment relation NLI evaluates. An L2 that works would have to be a classifier **trained on clickbait labels** (e.g. Webis-Clickbait-17) — a supervised research project, not a drop-in zero-shot model.

**Honest headline:** the `clickbait` pack catches ~20% of EN clickbait from sources it has not seen and 0% cross-language; the stacked filter holds 0% FP on clean-mainstream/clickbait register but ~5% on tabloid/wire register. It is an EN-only, register-specific FP-strict L1 component, not a standalone or cross-language clickbait solution — and the zero-shot-model shortcut to close the gap has been tested and ruled out.

The Generalization Gap is a release gate: no pack version ships a catch-rate claim without a fresh held-out figure beside it.

### FP-strict by design

The architecture sacrifices catch-rate for predictable production behavior. A 0.8% FP-rate means roughly 1 false positive in every ~130 benign messages, and FP-strictness is the one property that holds up on held-out data (0% everywhere). A 5% FP-rate (typical for generic LLM moderators on this corpus shape) is unusable for any customer-facing channel. The honest in-the-wild clickbait catch-rate is the fresh-held-out **20%** — for real recall, layer the deterministic pack (L1) under a learned encoder model (L2) that picks up what regex/lexicon patterns structurally cannot.

**Reproduce:**

```bash
git clone https://github.com/alkanfel1987/pantheon-guard && cd pantheon-guard
npm install
node examples/benchmark-phase1-runner.js       # RU N=280, prints corpus SHA-256
node examples/benchmark-multiregion-runner.js  # EN+DE+INTL N=340, prints corpus SHA-256
```

Both runners print the SHA-256 of their corpus file as pre-registration of the test snapshot. The corpus is committed to the repo (`examples/benchmark-phase1-corpus.js`, `examples/benchmark-multiregion-corpus.js`), so any subsequent edit changes the hash — making post-hoc tuning impossible without an audit trail.

**What we don't claim:**
- That 93.7% accuracy means 93% of manipulation is caught — it does not; in-corpus catch-rate is 65% and fresh-held-out clickbait catch-rate is 20%.
- That the in-corpus catch numbers transfer — they do not; the measured generalization gap is 64pp. Deterministic clickbait catch has a hard ceiling on unseen data.
- That lexicon expansion fixes this — it does not; chasing each new source's vocabulary is overfitting, and a learned L2 layer is the only real fix.
- Higher recall than learned models on novel attacks (we lose this race by design)
- Coverage of prompt-injection (out of scope — that's NeMo/Lakera territory)
- Out-of-the-box adaptation to new domains (each pack is authored, not learned)
- That hypnosis itself is empirically settled — clinical effectiveness remains contested in some medical-context reviews; we use Erickson's *linguistic patterns* as descriptive ontology, not his effectiveness claims as warrant
- Production-grade mainstream FP certainty — 0/263 is strong but not infinite; broader live-distribution sampling continues

## API

### `checkMahavrata(action)` — the 5 absolute rules only

Fast check. ~0.1 ms latency, no LLM calls.

```javascript
import { checkMahavrata } from 'pantheon-guard';

const { passes, violations, details } = checkMahavrata({
  text: "...",
  urgency: 0.5,
  paused: true,
  sources: ['study X'],
  contains: {
    fearBased: false,
    falseUrgency: false,
    clickbait: false,
    // ...
  },
});
```

### `checkAction(agent, action)` — full 5-step algorithm

Adds 4 more checks on top of Mahā-vrata: Dharma (benefit), Svadharma (alignment with the agent's role), Guna (correct operating mode), Yajna (intrinsic value), Dana (mode of contribution).

```javascript
import { checkAction } from 'pantheon-guard';

const agent = {
  name: "BrandVoice",
  svadharma: {
    jati: "Kriyā",
    guna: "Sattva",
    karma: "content for the corporate blog",
    svabhava: "calm, expert, no pressure CTAs"
  }
};

const result = checkAction(agent, action);
```

### `wrapAgent(name).act(action, executor)` — runtime wrapper

If the check passes — runs the executor. If it fails — blocks and returns the reason.

```javascript
import { wrapAgent } from 'pantheon-guard';

const brandBot = wrapAgent("BrandVoice");

const result = await brandBot.act(
  { text: generatedText, contains: patterns },
  async (action) => await sendEmail(action.text)
);

if (!result.allowed) {
  console.log("Blocked:", result.reason);
}
```

### `detectPatterns(text)` — automatic detector

Analyzes text and returns a flag object to pass into `checkAction`. Uses deterministic heuristics, not an LLM.

```javascript
import { detectPatterns } from 'pantheon-guard';

const flags = detectPatterns("Hurry, only 3 spots left until midnight!");
// { falseUrgency: true, fearBased: true, manipulation: true }
```

### `LearningCycle` — optional

If you want the system to **learn** from rejections and improve prompts over time — wire in the learning loop:

```javascript
import { LearningCycle } from 'pantheon-guard';

const cycle = new LearningCycle({
  storage: new FileStorage('./pantheon-data.json')
});
await cycle.init();

// Each action is logged
// Every N cycles — pattern distillation and knowledge base update
```

Documentation: [LEARNING.md](./docs/LEARNING.md)

## Performance

- `checkMahavrata`: ~0.1 ms
- `checkAction` (full algorithm): ~0.3 ms
- Zero LLM calls in the validator itself
- ~43 KB minified (most of which is the rule data tables; the algorithm itself is small), 0 runtime dependencies
- Runs in Node.js 16+, browser, Chrome extensions (via `ChromeStorage` adapter)

For comparison: NeMo Guardrails adds 100–300ms of latency, Guardrails AI 50–150ms.

## Integrations

Minimal examples in `/examples`:

- **OpenAI SDK** — `examples/openai-chat.js`
- **Anthropic SDK** — `examples/anthropic-chat.js`
- **LangChain** — `examples/langchain-chain.js`
- **Vercel AI SDK** — `examples/vercel-ai.js`
- **Chrome Extension** — `examples/chrome-extension/`

## License

Dual-licensed:

- **MIT** — for open-source, personal, educational projects. Use freely.
- **Commercial** — for commercial SaaS products, internal corporate AI systems, client integrations. Pricing:
  - Startup (up to $1M ARR): $29/mo or $290/yr
  - Growth ($1M–$10M ARR): $199/mo or $1,990/yr
  - Enterprise: contact us

Why dual: the core should be available to anyone building honest AI products. The ones who pay are the ones earning on AI and who want support, prioritized fixes, and guarantees.

Commercial license contact: alkanfel1987@gmail.com

## FAQ

**Q: Isn't this just another guardrails library?**
A: No. Guardrails defend against legal and technical risk (PII, prompt injection, toxicity). Pantheon defends against **ethical and marketing** risk (manipulation, dark patterns, fear-based content). These are different layers. Use both.

**Q: Why Sanskrit?**
A: It is not esoterica, it is precision. Sanskrit terms here are technical vocabulary. *Ahiṃsā* — "no harm" — has a precise, non-metaphorical definition refined over 2,000+ years. "Do no harm" in English is a vague maxim. *Ahiṃsā* is a checkable rule.

**Q: Are you imposing your values?**
A: No. The Mahā-vrata rules are universal restraints that align with most corporate brand guidelines and advertising codes (FTC, EASA, AMA). Pantheon just formalizes them in code.

**Q: What if my client WANTS aggressive marketing?**
A: Then you do not need this package. Pantheon is for brands that care about long-term reputation.

**Q: Can the system learn custom rules?**
A: Yes. `LearningCycle` lets you add domain rules and observe which triggers were false positives. See [LEARNING.md](./docs/LEARNING.md).

## Foundations

Built on the philosophical frame of **Vishishta-advaita** (Rāmānuja) and **Kashmir Shaivism** (Abhinavagupta), with practical roots in the Ṛgveda, Bṛhadāraṇyaka Upaniṣad, Bhagavad-Gītā, Yoga-sūtra, Manusmṛti, and Spanda-kārikā.

Not because it sounds impressive, but because these traditions have been working on the problem of **distinguishing manipulation from honest influence** for 2,500+ years. We just packaged it in JavaScript.

## Roadmap

- [x] v0.1 — core, 5 Mahā-vrata rules, LearningCycle
- [ ] v0.2 — `detectPatterns` as a standalone classifier (current version: flags only)
- [ ] v0.3 — first-class TypeScript types
- [ ] v0.4 — Python port (via pyo3)
- [ ] v0.5 — CLI for auditing pre-written content

## Get started

```bash
npm install pantheon-guard
```

Examples: [`/examples`](./examples)
Philosophy: [`/docs/PHILOSOPHY.md`](./docs/PHILOSOPHY.md)
Issues: GitHub
Commercial: alkanfel1987@gmail.com
