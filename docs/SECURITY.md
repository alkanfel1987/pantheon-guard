---
tags: [security, threat-model, watermark, integrity, hardening]
status: shipped
created: 2026-05-04
related: [PHILOSOPHY.md, PAC-BAYES-BOUND.md, CONFORMAL.md]
---

# Security Model and Watermarking

> **Claim of this note.** v0.3 ships three security artifacts:
> (1) text normalization that closes the bypass vectors found in the
> v0.2.2 audit, (2) HMAC-signed verdicts for tamper-evident downstream
> consumption, (3) frozen-rule hashes for build-integrity verification.
> Each addresses a distinct threat in the threat model below.

---

## 1. Threat model

| Adversary | Capability | Goal |
|---|---|---|
| **Content attacker** | controls input text | bypass detection, ship manipulative content past the guard |
| **Pipeline tamperer** | sits between guard and consumer (proxy, log relay) | rewrite verdicts to flip a "block" into a "pass" |
| **Supply-chain attacker** | replaces npm artifact, patches source | weaken rules silently |
| **Operator misconfiguration** | wrong calibration data, stale prior | unintended OOD-gap, no malicious intent |

What this module does NOT defend against:
- Prompt-injection inside the *upstream LLM* (that is the upstream
  guardrail's job — pantheon-guard sits *after* the LLM).
- Compromise of the HMAC secret (see §4.4 — out of scope, key
  management is a separate problem).
- Active exploitation of underlying Node / V8 vulnerabilities.

---

## 2. Audit findings — v0.2.2 had real bypass vectors

The v0.3 hardening was triggered by a security audit that probed
v0.2.2's calibrated detector with adversarial inputs. With neutral
metadata (`urgency: 0.3, paused: true`), several attacks let
manipulative copy through with `passes: true`:

| Vector | Example | v0.2.2 result |
|---|---|---|
| Cyrillic + Latin homoglyphs | `Huррy, you'll rеgrеt missing this last chance` | `passes: true` (conf 0.474) |
| Leetspeak in fear word | `Hurry, y0u'll r3gr3t miss1ng this last chance` | `passes: true` (conf 0.474) |
| Zero-width inserted | `Hu​rry, ...` (U+200B inside) | partial bypass |
| Fullwidth ASCII | `Ｈｕｒｒｙ, ...` | full bypass on urgency word |

These were live bypasses. v0.3 closes all of them; see
`test/adversarial.test.js` for the regression suite.

---

## 3. Defense (1) — text normalization

`src/normalize.js` runs before regex matching:

1. **NFKC normalization.** Collapses fullwidth, ligatures, compatibility
   forms — closes the `Ｈｕｒｒｙ` family.
2. **Zero-width strip.** Removes U+200B, U+200C, U+200D, U+FEFF, BOM,
   bidi overrides U+2068-U+2069, line separators, mongolian vowel
   separator, all Unicode formatting (Cf) chars commonly inserted to
   break regex.
3. **Mixed-script homoglyph fold.** Cyrillic / Greek lookalikes
   (`а`, `е`, `о`, `р`, `у`, `с`, `х`, etc.) are folded to Latin twins
   **only inside words containing both scripts** — pure Russian text
   passes through untouched, preserving Russian regex matches.
4. **Leetspeak fold.** Digits substitute for letters between letter
   neighbors (`l3ft` → `left`); does not touch standalone digits like
   "3 spots".
5. **Spaced-letter collapse.** Sequences `h u r r y` collapse to
   `hurry`. Regular phrases unaffected.

Each transformation is unit-tested (`test/conformal-weighted.test.js`
and the regression cases in `test/detect-patterns.test.js` all pass
with normalization wired in).

The original text is preserved on the action object; only the regex
layer sees the normalized view.

---

## 4. Defense (2) — verdict signing (watermark)

`src/sign.js` exports `inspectSigned()` and `verifySignedVerdict()`.
Verdicts are signed with HMAC-SHA-256 over a canonical-JSON
serialization of the payload, plus library version, signature
version, and timestamp.

### 4.1 What the signature binds together

The signed payload includes:

```javascript
{
  passes, abstain, reason,
  confidence, evidence, violations, policy,    // from inspect()
  text_sha256,                                 // HMAC of the input text
  library: 'pantheon-guard',
  library_version,
  signature_version,
  timestamp,
  signature,                                   // HMAC-SHA-256 hex
}
```

Tampering with any field invalidates the signature. Replaying the
signature against different text fails because `text_sha256` is bound
to the input.

### 4.2 Canonical JSON

`canonicalize()` produces a deterministic serialization with keys
sorted lexicographically at every level. This is required for the
HMAC to be reproducible across JS engines and runtime versions.

### 4.3 Timing-safe comparison

`verifyPayload()` uses `crypto.timingSafeEqual` (Node built-in) so a
high-throughput rejection path does not leak information about
partial signature matches. Length mismatch is checked first to avoid
the comparator throwing.

### 4.4 Key management — out of scope

The signing secret is supplied by the caller. Recommendations:

- Use ≥ 32 random bytes from a CSPRNG.
- Store in a secret manager (AWS KMS, GCP Secret Manager, HashiCorp
  Vault), not in source.
- Rotate periodically; sign verdicts include `signature_version` to
  support future scheme upgrades.
- Old signatures remain verifiable with archived secrets — useful for
  audit trails after rotation.

If the secret is compromised, an attacker can fabricate verdicts.
That is an HMAC-system property, not a pantheon-guard limitation.
For non-repudiable signatures across distrustful parties, switch to
asymmetric signing (Ed25519) — planned for v0.4.

---

## 5. Defense (3) — frozen-rule integrity (rule-watermark)

`src/integrity.js` exports `getIntegrity()`, `assertRuleSetHash()`,
and `getBuildFingerprint()`. At module load, SHA-256 hashes are
computed over canonical JSON of every frozen rule structure
(`MAHAVRATA`, `LAWS`, `PRINCIPLES`, `FIVE_STEP_ALGORITHM`,
`SVADHARMA_SCHEMA`, `LAYERS`, `GUNAS`, `PRIORITY`, `CALIBRATOR_PARAMS`).

### 5.1 Use cases

| Workflow | Action |
|---|---|
| CI / CD pipeline | `assertRuleSetHash(EXPECTED)` at startup; fail build if rule set drifted from baseline committed to `release-baseline.json` |
| Production deployment | log `getBuildFingerprint()` at startup; alert on drift |
| Forensic audit | pair signed verdict (§4) with integrity fingerprint to bind decision to a specific build |

### 5.2 v0.3.0-pre.1 baseline

```
rule_set_hash:          1da1b908e3577579fb01e43811f255c4f772b4de5e96d20deb5c265f72797848
calibrator_params_hash: 718349b8fd5dbdb150da61c5b9e91aca18cd297be16ba49c44002b6613ad5664
build_fingerprint:      1434724a34f04e30
```

Any deviation from these values on `v0.3.0-pre.1` indicates the
library has been modified or replaced. CI assertion code:

```javascript
import { assertRuleSetHash } from 'pantheon-guard';
assertRuleSetHash('1da1b908e3577579fb01e43811f255c4f772b4de5e96d20deb5c265f72797848');
```

### 5.3 Rule vs calibrator separation

Calibrator parameters are versioned separately from the frozen rule
set. This lets v0.3+ tune calibrator constants against the
BENCHMARK ground truth (changing `calibrator_params_hash`) without
invalidating the rule integrity hash. Customers who require frozen
calibration can pin both hashes; customers who allow tuning pin
only `rule_set_hash` and observe `calibrator_params_hash` for drift
notification.

---

## 6. Adversarial test suite

`test/adversarial.test.js` (22 tests) is the canonical regression set
for known bypass vectors. Each test is named after the technique it
catches. If a new bypass is discovered:

1. Add a test to `adversarial.test.js` that demonstrates the bypass.
2. Run `npm test` — it should fail.
3. Fix `src/normalize.js` (or the relevant rule) until it passes.
4. Commit. Never weaken the test to make it green.

This is the same discipline as test-driven security in any mature
project. The audit transcript for v0.2.2 → v0.3.0 lives in git
history of `test/adversarial.test.js`.

---

## 7. ReDoS resistance

The audit also stress-tested regex patterns for catastrophic
backtracking. Two tests in `adversarial.test.js`:

- 100 KB benign text → < 1 second.
- 100 KB pathological repetition `(hurry · 20 + a · 100)^80` → < 1 second.

Patterns are word-list alternations with bounded lookarounds; they
are linear in input length and not vulnerable to ReDoS. If a future
pattern adds nested quantifiers, the regression tests catch it.

---

## 8. Comparison to industry watermarking

The closest related work is content-watermarking for AI-generated
text (Kirchenbauer et al. 2023, Aaronson 2022) — these embed signals
in *the LLM output* itself. Pantheon Guard's watermark is different:
it certifies the *guard verdict*, not the LLM output. The two
compose cleanly — an LLM output can carry both an
output-watermark (from the model) and a guard-verdict-signature
(from pantheon-guard) for full chain-of-custody.

We do *not* watermark LLM output ourselves; that is upstream of our
layer. Our watermark says "this verdict was rendered by a verified
copy of pantheon-guard at this timestamp" — which is the trust
question downstream pipelines actually need answered.

---

## 9. References

- NIST SP 800-90B — entropy source recommendations for HMAC keys.
- Krawczyk, H., Bellare, M., Canetti, R. *HMAC: Keyed-Hashing for
  Message Authentication.* RFC 2104, 1997.
- Unicode Technical Standard #39 — *Unicode Security Mechanisms*.
  https://www.unicode.org/reports/tr39/
- Kirchenbauer, J. et al. *A Watermark for Large Language Models.*
  ICML 2023. (For comparison only; this is upstream content
  watermarking, not our verdict watermark.)
- Aaronson, S. *Watermarking GPT outputs.* (Talk, 2022.)
