# Commercial Use Addendum

> This is a **template**, not a fully negotiated commercial agreement.
> Final terms for production use at scale (corporate AI products,
> commercial SaaS, internal corporate AI services) are negotiated
> separately. Contact information at the bottom of this file.

## What MIT covers

`pantheon-guard` is dual-licensed. Under [LICENSE-MIT.md](./LICENSE-MIT.md)
you may use, copy, modify, distribute and embed the package in:

- personal projects
- educational / academic use
- open-source projects
- non-commercial research
- evaluation and pilot deployments

The MIT license requires attribution: keep the copyright notice and
permission notice in any substantial copy of the code.

## What requires a commercial subscription

A commercial subscription is required when:

1. You embed `pantheon-guard` in a **commercial product** that you
   sell or license to customers;
2. You deploy `pantheon-guard` at runtime inside a **production**
   commercial AI service or SaaS;
3. You use `pantheon-guard` **internally** at a corporation with
   greater than 50 employees in production-facing AI systems.

Evaluation, pilots, and trials do not require a subscription.

## Pricing tiers (indicative — final pricing per contract)

| Tier        | Use case                                 | Indicative price |
|-------------|-------------------------------------------|------------------|
| Free        | Personal / OSS / educational / pilots     | $0               |
| Starter     | Small commercial projects, < $1M ARR       | $29 / month      |
| Team        | Mid-size SaaS or internal corp deployment  | $199 / month     |
| Enterprise  | Large-scale production, custom rules, SLA  | $1,990 / month + |
| Strategic   | OEM, embedding in another guardrails suite | Negotiated       |

Numbers are placeholders for the launch period. Final pricing depends
on volume, support requirements, and any custom-rule co-development.

## Brand and identity

`pantheon-guard` (the name) is associated with the upstream project
maintained by the author listed in `package.json`. Forks that materially
modify the deterministic ethical core (mahāvrata pipeline, rule packs,
calibrators, verification helpers) **must rename** to avoid implying
endorsement by upstream. This is a brand/trademark consideration, not a
restriction on modification. Modify freely under MIT; just don't ship
modifications under the `pantheon-guard` name.

Verification of provenance attestation (see [SECURITY.md](./SECURITY.md))
is provided as transparency, not as enforcement. Users and downstream
embedders are free to call, ignore, or remove the `verifySignature()`
helper as they see fit under the MIT license.

## What you get with a paid subscription

- Permission to use `pantheon-guard` per the use cases above
- Email support, response within 2 business days
- Priority on new rules, additional language patterns, and benchmark
  data releases
- Optional consulting on custom rule sets and integration patterns
- A signed commercial license document for procurement

## Contact

For commercial subscriptions, custom rule development, or integration
support: see the email address listed in `package.json` under `author`.

## Why dual-license

The MIT license keeps the package usable for OSS projects, individual
developers, researchers, and pilot evaluations — including by the major
guardrails suites whose users we want to reach. The commercial addendum
funds continued development of the deterministic rule layer and the
v0.2 classifier without venture-capital pressure to compromise the
deterministic nature of the core.

## Note on this template

This document is **not legal advice** and is not a complete commercial
agreement. It signals the intent and shape of the commercial terms.
The final document delivered with a paid subscription is reviewed by
counsel and may differ in specifics.
