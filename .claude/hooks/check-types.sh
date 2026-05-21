#!/bin/bash
# check-types.sh — TypeScript strict type checking
# Fires: before merge, on build
# Runs: tsc --noEmit with strict mode

set -e

echo "→ Running TypeScript strict type check..."

if [ ! -f "tsconfig.json" ]; then
  echo "⚠ No tsconfig.json found — skipping type check"
  exit 0
fi

if npx tsc --noEmit 2>&1; then
  echo "✓ TypeScript: clean"
  exit 0
else
  echo "⛔ TypeScript errors found. Fix before merging."
  exit 1
fi
