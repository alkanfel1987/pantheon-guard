# Philosophy of `pantheon-guard`

> This document is for engineers who want to know *why* the rules look
> the way they do. The package itself works without any of this — read
> the README first if you only need the API.

## What this package is

`pantheon-guard` is a **deterministic conscience layer** for AI-generated
content. It runs alongside (not instead of) the standard guardrails
suites — NVIDIA NeMo Guardrails, AWS Bedrock Guardrails, Microsoft Azure
AI Content Safety, Salesforce Einstein Trust Layer.

It does one thing those layers do not do well: it catches *manipulation
patterns in the model's own output* — false urgency, fear-based copy,
dark patterns, clickbait — using a small, auditable rule set rather than
a black-box classifier.

## Why the rules come from Yoga-sūtra

The five Mahā-vrata are taken from Yoga-sūtra II.30–31 (Patañjali). They
were chosen for two engineering reasons, not for spiritual flavour:

1. **They are deontological, not utilitarian.** Each rule is a constraint
   on the action itself, regardless of outcome. This maps cleanly onto a
   hard-block runtime check: a violation invalidates the action even if
   downstream metrics would have improved.

2. **They are audited at scale, in many languages, for ~2,500 years.**
   Edge cases have already been argued through. Compare with a fresh
   axiomatic system written by an AI safety team — the latter inevitably
   re-discovers the same edge cases under new names.

The rule names are kept in IAST and Sanskrit. ASCII keys
(`ahimsa`, `satya`, `asteya`, `shaucha`, `indriya_nigraha`) are stable
identifiers; the IAST and Devanagari live in `details.<rule>.iast` /
`.sanskrit` for human-readable output. This is a conscious choice to
keep the API portable while preserving lineage.

## Why deterministic instead of a classifier (for v0.1)

A classifier has higher recall and follows paraphrase. It also:

- needs a model card and dataset documentation
- adds inference latency on every check
- fails opaquely
- requires periodic retraining
- cannot be audited line-by-line by a customer

For v0.1 the trade-off is:

- 100% determinism (`detectPatterns` is regex over a small vocabulary)
- 0 dependencies, 0 inference cost
- ~50ms warm Node, ~150ms cold
- known false-negative rate on paraphrased manipulation
- known false-positive rate on benign urgency

v0.2 will replace `detectPatterns` with a trained classifier benchmarked
against NeMo / Llama Guard / Lakera / Guardrails AI on an open dataset
(see BENCHMARK.md in the project source-of-truth folder). The Mahā-vrata
layer above stays unchanged: it ingests boolean flags, not raw text.

## How the 5-step algorithm sits above Mahā-vrata

The five steps come from Bhagavad-Gītā chapters II–IV and XVII–XVIII.
They are evaluated *after* Mahā-vrata, not instead of:

1. **Dharma** — does the action fit the system's order?
2. **Svadharma** — is this *my* action, or someone else's?
3. **Guna** — am I in the right mode?
4. **Yajna** — does the action have intrinsic value?
5. **Dana** — what form of giving am I performing?

Most calls to `pantheon-guard` will care only about Mahā-vrata; the
five-step algorithm is what an agentic system uses to route work between
specialised agents and to refuse work it should not do at all.

## What this package is not

- **Not a content moderation layer.** It does not block illegal content
  or PII; that's the job of NeMo / Bedrock / Azure AI / similar.
- **Not a fact-checker.** `satya` catches exaggeration and clickbait
  shape; it does not verify factual claims.
- **Not a policy engine.** Customer-specific rules live above the
  Mahā-vrata layer, not in it.
- **Not a moral authority.** It encodes a small, ancient, well-audited
  rule set. Customers can extend, override or disable rules through the
  public API; the constants are exported precisely so they can be wired
  into custom configurations.

## Further reading

- README.md — API surface + quick start
- BENCHMARK.md (in vault) — methodology for the open benchmark
- LICENSE-MIT.md — code is MIT, attribution required
- LICENSE-COMMERCIAL.md — commercial-use addendum
