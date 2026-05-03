#!/usr/bin/env bash
# run.sh — side-by-side baseline (NeMo only) vs Pantheon-guarded NeMo
#
# Usage: ./run.sh
# Requires: nemoguardrails CLI in PATH, OPENAI_API_KEY env var, Node 16+,
#           and `npm run build` already executed in the @pantheon/guard root.

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "OPENAI_API_KEY is not set" >&2
  exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "  Baseline (NeMo default rails only) — manipulation expected"
echo "═══════════════════════════════════════════════════════════════"
nemoguardrails chat --config="$DIR/baseline.yml" < adversarial.txt || true

echo
echo "═══════════════════════════════════════════════════════════════"
echo "  With Pantheon Guard output rail — manipulation should be caught"
echo "═══════════════════════════════════════════════════════════════"
nemoguardrails chat --config="$DIR/config.yml" < adversarial.txt || true

echo
echo "Done. Diff the two transcripts to see the value Pantheon adds."
