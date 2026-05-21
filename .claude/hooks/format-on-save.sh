#!/bin/bash
# format-on-save.sh — Auto-format on file save
# Runs Prettier + ESLint on changed files
# Fires: always, on any file save

set -e

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json|css|md)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

echo "→ Formatting staged files..."
npx prettier --write $STAGED_FILES

echo "→ Linting staged files..."
npx eslint --fix $STAGED_FILES

echo "→ Re-staging formatted files..."
git add $STAGED_FILES

echo "✓ Format complete"
