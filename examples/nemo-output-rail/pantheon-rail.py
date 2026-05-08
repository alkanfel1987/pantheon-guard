"""
pantheon-rail.py — register Pantheon Guard as a NeMo output action.

Mounts a custom action `pantheon_check` that NeMo can invoke from a Colang
flow. The action shells out to Node, runs Pantheon Guard's v0.4.1 stacked-
pack inspect over the model's draft, and returns a structured verdict
with calibrated confidence, evidence markers, pack-level violations, and
unmet domain requirements.

To wire into NeMo, register this action and call it from Colang:

    define flow check pantheon
      $verdict = execute pantheon_check(text=$bot_message)
      if not $verdict.passes
        bot inform blocked

The Node script is intentionally minimal — for production deploy
pantheon-guard as a long-lived sidecar to avoid 150ms cold-start cost.

v0.4.1 differences vs v0.2:
- Full pack stack (healthcare + news + news-de + news-hi + epistemology)
- Pack-level violations and unmet requirements surfaced separately
- `policy: 'calibrated'` + per-pack metadata in verdict
- Replication-probed: pack patterns survived overfit check (replication
  recall 57.1% on N=40 fresh OOS, vs 84.2% on training corpus — see
  `examples/learning-cycle-3domains-replication-runner.js`)

The verdict carries `confidence` per flag and an `abstain` field set when
input is too thin to support any honest claim. This lets your NeMo flow
distinguish "verdict said pass" from "verdict abstained" — useful for
auditing and for routing borderline cases to a human reviewer.
"""

import json
import subprocess
from pathlib import Path

# Path to the pantheon-guard package — adjust if installed elsewhere.
GUARD_DIR = Path(__file__).resolve().parent.parent.parent
GUARD_DIST = GUARD_DIR / "dist" / "index.cjs"


# v0.4.1 Node script — uses stackPacks() for full pack coverage.
# Returns the full verdict including pack-level violations and unmet
# requirements, so the Colang flow can route based on which pack class
# triggered (e.g. healthcare-specific vs generic manipulation).
NODE_SCRIPT_TEMPLATE = """
const path = require('path');
// argv tail = [GUARD_DIST, text] regardless of Node version (16-24+).
// Older Node (≤22) had argv[1]='[eval]'; newer Node (24+) skips that.
const args = process.argv.slice(-2);
const g = require(path.resolve(args[0]));
const text = args[1];
const stack = g.stackPacks([
  g.healthcarePack,
  g.newsPack,
  g.newsDePack,
  g.newsHiPack,
  g.epistemologyPack,
]);
const r = stack(text);
process.stdout.write(JSON.stringify({
  passes: r.passes,
  abstain: r.abstain,
  reason: r.reason,
  confidence: r.confidence,
  evidence: r.evidence,
  violations: r.violations,
  packViolations: r.packViolations || [],
  packEvidence: r.packEvidence || {},
  unmetRequirements: r.unmetRequirements || [],
  packs: r.packs || [],
  policy: r.policy,
}));
"""


def call_pantheon(text: str) -> dict:
    """Invoke Pantheon Guard via Node and return the structured verdict."""
    if not GUARD_DIST.exists():
        raise RuntimeError(
            f"Pantheon Guard build not found at {GUARD_DIST}. "
            "Run `npm run build` in the package root first."
        )

    proc = subprocess.run(
        ["node", "-e", NODE_SCRIPT_TEMPLATE, str(GUARD_DIST), text],
        capture_output=True,
        text=True,
        timeout=10,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"pantheon-rail node call failed: {proc.stderr}")
    return json.loads(proc.stdout)


# ─────────────────────────────────────────────
# NeMo Guardrails action registration
# ─────────────────────────────────────────────

try:
    from nemoguardrails.actions import action

    @action()
    async def pantheon_check(text: str) -> dict:
        """Output rail action — returns dict with passes, abstain, confidence, evidence, violations."""
        return call_pantheon(text)
except ImportError:
    # NeMo not installed — module still importable for direct testing.
    pass


if __name__ == "__main__":
    # Smoke test: run with python pantheon-rail.py "your text"
    import sys
    if len(sys.argv) < 2:
        sys.argv.append("Hurry, only 3 spots left! Don't miss out!")
    verdict = call_pantheon(sys.argv[1])
    print(json.dumps(verdict, indent=2, ensure_ascii=False))
