# Security & Supply-Chain Integrity

> **TL;DR:** Every published version of `pantheon-guard` is cryptographically
> signed via npm provenance (Sigstore / OIDC). You can verify any installed
> version with a single command. Removal or bypass of this signature in
> derivative works is a commercial-license violation.

---

## What is signed

Starting with `v0.4.2`, every release published to the npm registry is
attested with **npm provenance** ([RFC](https://github.com/npm/rfcs/blob/main/accepted/0049-link-packages-to-source-and-build.md)).
The attestation cryptographically binds:

1. The exact published artifact (tarball SHA-256)
2. The source-code commit it was built from
3. The GitHub Actions workflow that built and published it
4. The time the signing happened

This means a consumer can verify, without trusting any private key we
hold, that the package they install was built from the public source
in this repository via the [`publish.yml`](./.github/workflows/publish.yml)
workflow.

## How to verify (as a user)

After `npm install pantheon-guard`, run:

```bash
npm audit signatures
```

You should see `pantheon-guard@<version>` listed under
**verified registry signatures** and the provenance attestation
should be present.

For a deeper check, fetch the attestation directly:

```bash
npm view pantheon-guard@<version> dist
```

The `dist.attestations` field contains a Sigstore bundle which can be
verified independently against the Sigstore transparency log.

## How to verify (as an embedding application — "seed")

If you embed `pantheon-guard` in a downstream product ("seed") and want
to refuse to start when the installed `pantheon-guard` cannot be
attested, add a runtime check:

```js
import { execSync } from 'node:child_process';

function assertPantheonGuardAttested() {
  try {
    const out = execSync('npm audit signatures --json', { encoding: 'utf-8' });
    const data = JSON.parse(out);
    const ok = data.invalid?.length === 0 && data.unsigned?.length === 0;
    if (!ok) {
      throw new Error('pantheon-guard signature verification failed');
    }
  } catch (e) {
    throw new Error(`Cannot verify pantheon-guard attestation: ${e.message}`);
  }
}
```

A built-in helper is exported as `verifySignature()` from the package
entry point (since `v0.4.3`). See API docs.

## What is NOT signed (yet)

- The data packs (catalogue-derived rule sets) live inside the same
  tarball and therefore inherit the same attestation. But individual
  pack updates pushed via dynamic-update channels (not yet implemented)
  will require their own signature chain. That work is tracked in
  `ROADMAP.md`.
- The lexicons live in the tarball and are covered by the same chain.

## Why provenance, not a separate signing key

We considered `minisign` / `ed25519` with our own keypair. We chose
npm provenance because:

- No private key to lose, rotate, or have stolen
- Ephemeral signing through GitHub Actions OIDC
- Public transparency log (Sigstore Rekor) — anyone can audit when
  and how a release was signed
- Native to the npm ecosystem — `npm audit signatures` Just Works
- Industry-standard, used by major OSS projects

## Tamper-resistance for derivative works

Per [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md), **removing,
bypassing, or stubbing out signature verification in a derivative
work is a license violation** (see commercial addendum, section
"Signature integrity"). This is the legal floor; the cryptographic
floor is the provenance attestation itself.

Practically: anyone can fork this repo and strip the verifier. But
doing so in a commercial product breaks the commercial license, and
in a public OSS fork it is a clear signal to downstream users that
the fork has weakened safety guarantees relative to upstream.

## Reporting a vulnerability

Email the address in `package.json` `author` field. Do not file public
GitHub issues for security problems. We aim for a 5-business-day
acknowledgement.

## Verification baseline

If you are an enterprise evaluating `pantheon-guard`, the minimum
supply-chain checks we recommend in your procurement audit:

1. `npm audit signatures` passes for the installed version
2. The provenance attestation points to commit and tag matching the
   release notes
3. The build workflow (`publish.yml`) has not been modified in a way
   that could exfiltrate the signing identity (last reviewed commit
   tag is in CHANGELOG)
4. The published tarball, when extracted, contains only files listed
   in `package.json` `files` field
