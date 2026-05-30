# Semantic pack architecture (Option C, Phase C1)

Status: 2026-05-10 — **C1 scaffold landed, no real model integration yet**.

This document captures architectural decisions for the semantic-pack
subsystem that complements the regex packs. Real model integration
(`@pantheon-guard/model-mdeberta-xnli` peer-dep) is C2 work — next
session.

## Why this exists

Per `test-corpus/false-equivalence-LIVE-2026-05-10/REPORT.md` and
`test-corpus/false-equivalence-LIVE-iter3-2026-05-10/REPORT.md`:

- Synthesis 100% catch on author-curated paraphrases of canonical FE
  framings.
- Live 0% catch on verbatim text from real op-eds.
- After iter-3 broadening (Option B), live training-set catch 66.7%
  (4/6) with FP held at 0% on N=20 held-out negatives.
- Two FN classes inherent to regex-only paradigm:
  - Class 6 (P-EN-LIVE-06) — single-actor sentence whose FE meaning
    comes from article-level context, not lexical surface.
  - Class 2 (P-EN-LIVE-02) — `political establishment will [action]`
    where broadening verb-list would FP on neutral analytical mention.

Real-world FE rhetoric is **semantic**, not lexical. Regex catches
canonical surface forms cheaply and with low FP; semantic NLI catches
context-rich constructions regex cannot reach.

Both paradigms have a place. The architecture supports stacking.

## Design decisions

### 1. Standalone semantic pack, not extension of `epistemology`

Two options were considered:

- **Standalone** (`fe-semantic` pack, async-only): cleaner API split.
  Users who want regex-only sync stay sync. Users who add semantic opt
  into async pipeline.
- **Extension** (`epistemology` pack contains both regex + semantic):
  single source of FE truth. But forces async on every existing
  consumer of `epistemology`.

**Chose standalone.** Rationale:
- Backward compat — existing `applyPack(epistemologyPack)` consumers
  (sync, microsecond-latency) are unaffected.
- Distribution clarity — semantic is opt-in, regex stays default.
- Honest performance signaling — users see they are entering async
  territory by importing from `pantheon-guard/packs/semantic`.

### 2. Distribution rationale — peer-dep, NOT auto-download

`pantheon-guard` core ships with NO model dependency. Real models live
in separate npm packages declared as peer-dep:

```
@pantheon-guard/model-mdeberta-xnli   ← optional, ~140MB quantized ONNX
```

Why peer-dep and not on-demand HuggingFace download:

| | On-demand (HuggingFace fetch) | Peer-dep (this design) |
|---|---|---|
| Supply chain audit | Auto external network call — enterprise security red flag | Pinned npm version — standard audit |
| Failure mode | Network outage / firewall in production | Fails at install time, predictable |
| Air-gapped deploy | Doesn't work | Works (model in deployment artifact) |
| Sovereignty | HuggingFace = US resource, sanctions risk | Mirror to private/RU registry possible |
| CI/CD | 280MB re-download per fresh runner | Cached in node_modules |
| Privacy positioning | Library "phones home" first call | Full offline |
| Customer control locus | Library decides when/where to fetch | Customer decides |

For pantheon-guard's commercial positioning (NVIDIA / AWS / MS /
Salesforce + RU SaaS), peer-dep is mandatory. Industry parallel:
`spaCy` distributes language models as separate `pip install spacy[ru]`
packages.

### 3. Async-only for semantic, sync preserved for regex

`runPack` / `applyPack` / `stackPacks` (sync, regex-only) remain
unchanged. New `runPackAsync` / `applyPackAsync` / `stackPacksAsync`
in `src/packs/semantic/runner.js` accept Promise-returning embedder
operations. Mixed pipelines use `stackPacksAsync` with per-entry
embedder slots:

```js
const inspect = stackPacksAsync([
  { pack: epistemologyPack },                    // sync regex pack
  { pack: feSemanticPack, embedder: emb },       // async semantic pack
]);
```

A pack can declare both `requirements` (sync, regex/predicate) AND
`semanticDetectors` (async, embedder-backed). Sync parts run first
(fast path, possibly short-circuiting practical cases), async parts
run after.

### 4. Embedder interface

```js
interface Embedder {
  classify(text: string, hypothesis: string): Promise<number>;  // ∈ [0, 1]
  ready(): Promise<boolean>;
  name(): string;
  version(): string;
}
```

Zero-shot NLI primitive — model evaluates whether `text` entails the
`hypothesis`. Mapped to detector via:

```js
{
  hypothesis: 'This text frames two parties as morally equivalent.',
  threshold: 0.65,
  ...
}
```

**Why NLI primitive instead of embedding-vector primitive:** zero-shot
NLI requires no training corpus; works out of the box with any
multilingual NLI model. Embedding-centroid (C2 in original options
list) requires labeled corpus per detector — deferred until C1 is
shown to plateau.

The interface is small enough that **any** embedder substrate can be
adapted: HuggingFace local (mDeBERTa-XNLI), Voyage API, OpenAI
classification API, or hand-rolled. Customer chooses.

### 5. Failure mode for missing peer-dep

`loadEmbedder('mdeberta-xnli')` attempts dynamic `import()`. On
`MODULE_NOT_FOUND`, throws actionable error:

```
Semantic detector requires peer-dep model package "@pantheon-guard/model-mdeberta-xnli".

Install:
  npm install @pantheon-guard/model-mdeberta-xnli

Or supply a custom embedder via createMockEmbedder() / hand-rolled Embedder interface.
```

No silent fallback. No magic. Customer is told exactly what to install.

### 6. Mock embedder for testing

`createMockEmbedder({ fixtures: { 'X': 0.9 } })` returns a
deterministic embedder for unit tests. NEVER ship in production —
has no real ML, will not generalize.

`pantheon-guard` core tests use only MockEmbedder. Real-model behavior
is tested in the peer-dep package's own test suite.

## Coverage matrix

| Detector | Regex pack (sync) | Semantic pack (async) | Combined |
|---|---|---|---|
| `false_equivalence_levelling` | ✅ canonical + iter-3 broad with inhibitor | ✅ NLI for context-loss + verb-list breadth | stack via `stackPacksAsync` |
| `naturalization_fallacy` | ✅ scaffold-validated | not yet ported | regex only for now |
| `absence_argument` | ✅ scaffold-validated | not yet ported | regex only |
| `anecdotal_override` | ✅ scaffold-validated | not yet ported | regex only |
| `silence_as_concession` | ✅ scaffold-validated | not yet ported | regex only |

Semantic counterparts for the other four detectors are queued; FE was
prioritized as the one where regex limit was empirically demonstrated.

## What ships in C1 (this commit)

- `src/packs/semantic/embedder.js` — interface + MockEmbedder
- `src/packs/semantic/runner.js` — runPackAsync / applyPackAsync /
  stackPacksAsync / validateSemanticPack
- `src/packs/semantic/false-equivalence.js` — `feSemanticPack`
  definition with hypothesis, threshold (0.65 placeholder), severity,
  catalogue anchors
- `src/packs/semantic/index.js` — public exports + `loadEmbedder`
  peer-dep loader
- `test/packs-semantic.test.js` — 24 tests covering interface,
  validation, runner, stacking, peer-dep failure mode, mock embedder
- `docs/SEMANTIC-PACK-ARCHITECTURE.md` — this file

## What does NOT ship in C1

- Real model integration. `@pantheon-guard/model-mdeberta-xnli` peer
  package does not yet exist.
- Threshold calibration. The 0.65 figure is a placeholder; final value
  is TBD pending real-model + held-out positive corpus.
- Live-corpus probe with semantic detector. Same blocker — needs real
  model.
- Semantic counterparts for other four detectors. FE is the proof of
  concept; others ported only if FE ships well.

## Roadmap (C2 / C3)

**C2 — model integration (~3-4h next session):**
1. Create `@pantheon-guard/model-mdeberta-xnli` package
2. Wrap `@xenova/transformers` mDeBERTa-v3-base-mnli-xnli
3. Verify Embedder interface conformance
4. Performance benchmark: cold-start, per-call latency, memory
5. Publish to npm (or private registry)

**C3 — calibration + held-out probe (~2-3h):**
1. Manual-curated held-out positive corpus for FE (10-15 verbatim
   samples, owner involvement)
2. Threshold sweep on synthesis + iter-3 LIVE corpus
3. Measure catch / FP at sweep points
4. Pick threshold by Wilson-CI argmax with FP ≤ 5% constraint
5. REPORT.md with full discipline (pre-reg, CI, generalization claim)
6. Tier 1 promotion if catch ≥ 60% on held-out positives

**Decision gate after C3:**
- If FE semantic Tier 1 — port other 4 detectors to semantic.
- If still gap — Option C2 paradigm (embedding centroid with labeled
  corpus) becomes the next experiment.
- If unworkable — reposition commercially as Option A.

## Discipline reminders (per CLAUDE.md)

The lessons from FE iter-2 / iter-3 / LIVE probes carry over:

- **Synthesis ≠ live.** Calibrating threshold on synthesis is the
  selection-bias trap (memory `feedback_synthesis_zero_live_anchor.md`).
  Threshold must be calibrated against held-out positives.
- **Held-out corpus must be manual-curated** (memory
  `feedback_lexicon_for_opacity_detection.md`). Auto-pull = no
  generalization claim.
- **Pre-register before threshold sweep.** Decision rule fixed before
  numbers come in.
- **Report Wilson 95% CI**, not point estimates.
- **Tier label honest.** Tier 2 → Tier 1 promotion gated on N ≥ 10
  held-out positives + Wilson lower-bound ≥ 50% on catch.
