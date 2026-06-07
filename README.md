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

Stack: core + news + news-de + epistemology + healthcare + **clickbait**. SHA-256 corpus hashes printed by each runner as pre-registration of test snapshot.

> ⚠ **The catch-rate column is in-corpus and overstates real-world recall.** Held-out testing (see the `clickbait` pack section below) measures clickbait catch at **50%** on a fresh source set the pack was never tuned against. Read that section before trusting any catch number here.
>
> ⚠ **This table was measured with `clickbait` v0.0.3.** The v0.0.4 closed-loop rebuild (below) deletes 20 detectors that were overfit to the BuzzFeed in-corpus, so the table's catch column is inflated for the clickbait subset. The reproducible EN+DE re-baseline with v0.0.4 is **accuracy 88.2%, catch 50.6%, FP 0.8%** (`node examples/benchmark-multiregion-runner.js`) — FP *improved* (two clickbait FPs removed); the catch drop is the deflation of in-corpus memorization, not a regression. RU Phase-2 re-baseline pending.

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

### `clickbait` pack — v0.0.4 (2026-05-16, closed-loop rebuild)

A 2026-05-15 calibration surfaced a gap: existing packs target sales/marketing manipulation but missed **attention-fixation engineering** — the rhetorical regime of social-aggregator clickbait. v0.0.1–v0.0.3 grew the pack to 25 detectors and reported an in-corpus catch of **84%**.

**That 84% was a process artifact, not capability.** A per-detector probe against 240 held-out headlines (`examples/clickbait-detector-probe.js`) showed only **one** of the 25 detectors (`numeric-listicle`) fired on ≥2 independent sources. The other 24 were dead or traced around one source's example headlines — then "validated" by unit tests the author wrote by paraphrasing those same headlines. The closed loop (pattern → test-string-written-for-it → "pass") certified "the regex matches my strings", never "the detector catches the phenomenon". Full diagnosis: `PROCESS-FINDING-2026-05-16-closed-loop-validation.md`.

**v0.0.4 rebuilds the pack from structural invariants — 25 detectors → 5.** Each survivor targets a form that recurs *because of how the manipulation works* (a listicle *is* "a leading count + an enumerable plural noun"), not because one outlet phrased it that way. Each shipped only after firing on held-out headlines from ≥2 independent sources at 0 FP — measured before shipping, against strings the author never wrote (`node examples/clickbait-detector-probe.js`):

| detector | held-out TP | sources | FP |
|---|---|---|---|
| `numeric-listicle` (EN) | 25 | 4 | 0 |
| `here-is-gap-pointer` | 4 | 3 | 0 |
| `shock-adjective-nominalization` | 3 | 2 | 0 |
| `numeric-listicle-plus` | 5 | 1 ¹ | 0 |
| `numeric-listicle-ru` | 7 | 1 ² | 0 |

¹ purely typographic (headline-initial `N+`) — no vocabulary, so untraceable by construction. ² RU has only one clickbait source (AdMe) in the corpus; built from a generic RU enumeration-noun category, cross-source RU confirmation pending a 2nd corpus.

**Honest held-out numbers (v0.0.4 — 0 FP on every corpus tested):**

| Corpus | catch-rate | FP-rate |
|---|---|---|
| Held-out #1 — Upworthy + Bright Side + Distractify | 61% (19/31) | 0% (0/14) |
| Held-out #2 — LittleThings + Scary Mommy + TheThings | 50% (10/20) | 0% (0/25) |
| Control 2026-05-16 — 150 EN/RU/DE | 28% (13/47) | 0% (0/103) |
| benchmark-phase1 + multiregion (pass set) | — | 0% (0/519) |

The v0.0.3 cascade across the first three corpora was **77% → 20% → 0%** — the textbook signature of overfitting. v0.0.4 is **61% → 50% → 28%**: the in-corpus memorization is gone and the pack behaves consistently on independent data. Held-out #1's old 77% was inflated by detectors traced around it; **61% is the honest figure**, and held-out catch on the genuinely-unseen #2 went 20% → 50%.

**Still true, and still the honest scope:**

- **Deterministic CATCH does not generalize past these 5 structural forms.** Every outlet uses different surface vocabulary; chasing it is an overfitting treadmill. The pack's correct role is L1 — a $0, microsecond, FP-clean first pass.
- **FP-strictness DOES generalize.** 0% FP across 9 corpora and 804 pass-expected items. This is the property that holds.
- **DE clickbait catch is 0%** — there is no DE detector. That is net-new scope, not a rewrite, and is deferred to a future cycle.
- **A learned L2 encoder is the path to broader recall — but the zero-shot shortcut was ruled out.** mDeBERTa-v3 NLI probed against held-out #2 scored 5% catch at ≤2% FP (worse than regex); "This is a clickbait headline" gave clickbait and mainstream near-identical scores. Clickbait-ness is a genre property, not the entailment relation NLI evaluates — a working L2 must be a *classifier trained on clickbait labels*.

The Generalization Gap is a release gate: no pack version ships a catch-rate claim without a fresh held-out figure beside it. Foundation: Loewenstein 1994 (curiosity gap), Munger 2020 (clickbait economics), and the clinical hypnosis literature of Milton H. Erickson (artful vagueness, attention-fixation).

### FP-strict by design

The architecture sacrifices catch-rate for predictable production behavior. A 0.8% FP-rate means roughly 1 false positive in every ~130 benign messages, and FP-strictness is the one property that holds up on held-out data (0% everywhere). A 5% FP-rate (typical for generic LLM moderators on this corpus shape) is unusable for any customer-facing channel. The honest in-the-wild clickbait catch-rate is the fresh-held-out **50%** (held-out #2, v0.0.4) — for real recall, layer the deterministic pack (L1) under a learned encoder model (L2) that picks up what regex/lexicon patterns structurally cannot.

**Reproduce:**

```bash
git clone https://github.com/alkanfel1987/pantheon-guard && cd pantheon-guard
npm install
node examples/benchmark-phase1-runner.js       # RU N=280, prints corpus SHA-256
node examples/benchmark-multiregion-runner.js  # EN+DE+INTL N=340, prints corpus SHA-256
```

Both runners print the SHA-256 of their corpus file as pre-registration of the test snapshot. The corpus is committed to the repo (`examples/benchmark-phase1-corpus.js`, `examples/benchmark-multiregion-corpus.js`), so any subsequent edit changes the hash — making post-hoc tuning impossible without an audit trail.

**What we don't claim:**
- That 93.7% accuracy means 93% of manipulation is caught — it does not; in-corpus catch-rate is 65% and fresh-held-out clickbait catch-rate is 50% (v0.0.4 held-out #2).
- That in-corpus catch numbers transfer — they do not. The v0.0.3 clickbait pack collapsed 84% → 20% on fresh sources; v0.0.4 was rebuilt from structural invariants and validated held-out-first to close that gap.
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
