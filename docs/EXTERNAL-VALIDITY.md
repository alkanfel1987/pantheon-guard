---
status: protocol
created: 2026-05-08
related: [CONFORMAL.md, MINIMAX-BENCHMARK.md, PAC-BAYES-BOUND.md]
---

# External-Validity Protocol

## Why this document exists

A benchmark in which the publisher is also the labeler is structurally weak:
the same person who chose what to detect also chose what counts as a hit.
Even with pre-registration and corpus hashing (we do both), an outside reader
has only the publisher's word that the labeling rubric is reproducible.

This document describes how `pantheon-guard` answers the question:

> *"Could a different annotator, applying your stated rubric in good faith,
> have arrived at substantially different labels — and therefore a
> substantially different headline accuracy number?"*

The answer is delivered as a Cohen's kappa between annotator-1 (the human
author) and annotator-2 (Claude Haiku 4.5 reading the same rubric, with no
sight of the detection system), measured on a deterministically-sampled
10 % holdout that pack development NEVER touched.

## The split

`bench/holdout.js` carves N=51 cases out of N=509 using a seeded Mulberry32
shuffle. The chosen ids are persisted in `bench/holdout-ids.json`; the seed
string is embedded in the module. Re-deriving the split on any other machine
produces the identical id set. The dev split (N=458) is what pack iteration
is allowed to inspect.

Discipline rule (enforced in code review, not at runtime):

> Never read holdout case texts, labels, or per-case verdicts while
> iterating on packs. Holdout accuracy is a one-shot honesty metric, not
> a tuning signal.

## The second annotator

`bench/annotator2.js` sends each holdout case to Claude Haiku 4.5 with a
system prompt that contains the exact same rubric the human author used
(reproduced verbatim from `examples/benchmark-phase1-corpus.js` header).
The model has no access to `pantheon-guard` code, no access to the human
labels, and no chain-of-thought scaffolding — just `text → {label,
rationale}`.

Verdicts are cached per `(case_id, model, rubric_version)` in
`bench/annotator2-cache.json` and the cache is committed to the repo.
Once frozen, the annotator-2 pass is reproducible offline by any reader.

### Honest framing — what an LLM second annotator is and is not

| | This is a... | This is NOT a... |
|---|---|---|
| **Strength** | rubric-ambiguity detector | substitute for paid human IAA |
| **Bias** | shares training-data overlap with the regex packs (both built on news distribution) | independent of the detection paradigm |
| **Cost** | trivial (~$0.05 / N=51) | publishable for FDA / NIST submission |
| **Verdict** | LOWER bound for publishable rigor | upper bound |

If kappa here is high, the rubric is at least applicable by another model
reading the same words. If it is low, the rubric is fuzzy and the headline
accuracy claim is partly author-taste.

Two human annotators on the same 51 cases (~$200 / 4 hours) would
strengthen this from "automated cross-validation" to "publishable IAA".
The infra is ready to receive those labels — drop them into
`bench/annotator2-cache.json` under a different `model:` key.

## The metric

`bench/kappa.js` computes:

1. **2×2 confusion table** (a1 × a2)
2. **Observed agreement** p_o = (concordant cells) / N
3. **Chance agreement** p_e = Σ (row_i × col_i) / N²
4. **Cohen's κ** = (p_o − p_e) / (1 − p_e)
5. **95 % CI** via Fleiss closed-form SE
6. **Landis-Koch band** (1977): poor / slight / fair / moderate /
   substantial / almost perfect
7. **Holdout-only pack accuracy** with Wilson 95 % CI — the blind external
   number for the headline claim

If κ < 0.6 with N ≥ 30, the script prints a warning. That warning means
*"the rubric admits ambiguity; downstream accuracy claims should be
qualified, not headlined."*

## Reproduction recipe

```pwsh
$env:ANTHROPIC_API_KEY = "sk-ant-…"
npm run bench:split        # one-shot — generates bench/holdout-ids.json
npm run bench:annotate2    # populates bench/annotator2-cache.json (~$0.05)
npm run bench:kappa        # prints confusion table, kappa, holdout accuracy
```

After the first successful run, commit `bench/annotator2-cache.json`. Every
subsequent reader can re-run `bench:kappa` offline against the committed
cache and reproduce identical numbers — no API call, no key needed.

## When to re-run

- New pack added → re-run `bench:check` (full corpus, gates CI). Holdout
  accuracy will shift; report the shift honestly in CHANGELOG.
- Rubric changed (rare) → bump `RUBRIC_VERSION` in `bench/annotator2.js`,
  delete cache entries with old version, re-annotate.
- New corpus split → bump seed, re-derive holdout, re-annotate. Treat as
  a major methodological event; document the *why* in CHANGELOG.
