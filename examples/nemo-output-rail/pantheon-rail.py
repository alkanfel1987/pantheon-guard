"""
pantheon-rail.py — register Pantheon Guard as a NeMo output action.

Mounts a custom action `pantheon_check` that NeMo can invoke from a Colang
flow. The action shells out to Node, runs Pantheon Guard's checkMahavrata
+ detectPatterns over the model's draft, and returns (passes, reason).

To wire into NeMo, register this action and call it from Colang:

    define flow check pantheon
      $verdict = execute pantheon_check(text=$bot_message)
      if not $verdict.passes
        bot inform blocked

The Node script is intentionally minimal — for production deploy
@pantheon/guard as a long-lived sidecar to avoid 150ms cold-start cost.
"""

import json
import subprocess
from pathlib import Path

# Path to the @pantheon/guard package — adjust if installed elsewhere.
GUARD_DIR = Path(__file__).resolve().parent.parent.parent
GUARD_DIST = GUARD_DIR / "dist" / "index.cjs"


NODE_SCRIPT_TEMPLATE = """
const path = require('path');
const g = require(path.resolve(process.argv[2]));
const text = process.argv[3];
const contains = g.detectPatterns(text);
const r = g.checkMahavrata({
  text,
  intent: 'persuade',
  urgency: 0.5,
  paused: true,
  contains,
});
process.stdout.write(JSON.stringify({
  passes: r.passes,
  violations: r.violations,
  contains,
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
        ["node", "-e", NODE_SCRIPT_TEMPLATE, "--", str(GUARD_DIST), text],
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
        """Output rail action — returns dict with passes, violations, contains."""
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
