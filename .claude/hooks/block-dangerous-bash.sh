#!/bin/bash
# block-dangerous-bash.sh — Prevent destructive commands
# Fires: before any shell command execution
# Blocks: rm -rf, force push to main, drop database, etc.

COMMAND="$1"

# Patterns that should always be blocked
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf ."
  "git push --force origin main"
  "git push --force origin master"
  "git push -f origin main"
  "git push -f origin master"
  "DROP DATABASE"
  "DROP TABLE"
  "TRUNCATE"
  "> /dev/sda"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "⛔ BLOCKED: Dangerous command detected: '$COMMAND'"
    echo "   Matched pattern: '$pattern'"
    echo "   This command will not execute."
    exit 1
  fi
done

exit 0
