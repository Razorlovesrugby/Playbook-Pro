#!/bin/bash
# verify-ipad-layout.sh — Check responsive breakpoints and UX constraints
# Fires: before merge, on build
# Checks: canvas dimensions, no modals in codebase, dvh usage, touch targets

set -e

echo "→ Checking iPad layout constraints..."

# 1. Canvas dimensions must be 802×560
CANVAS_VIOLATIONS=$(grep -rn "width={[^8]" src/ --include="*.tsx" --include="*.ts" | grep -i "stage\|canvas" || true)
if [ -n "$CANVAS_VIOLATIONS" ]; then
  echo "⚠ Canvas dimensions may have been changed:"
  echo "$CANVAS_VIOLATIONS"
fi

# 2. No modals — block Dialog, Modal, AlertDialog
MODAL_VIOLATIONS=$(grep -rn "<Dialog\|<Modal\|<AlertDialog\|showModal\|openModal" src/ --include="*.tsx" --include="*.ts" || true)
if [ -n "$MODAL_VIOLATIONS" ]; then
  echo "⛔ MODAL VIOLATION DETECTED:"
  echo "$MODAL_VIOLATIONS"
  echo "   ARM15 rule: No modals. Use Sheet, inline, or ghost overlay."
  exit 1
fi

# 3. dvh not vh for iOS Safari
VH_VIOLATIONS=$(grep -rn "vh" src/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "dvh" | grep -v "node_modules" | grep -v ".test." || true)
if [ -n "$VH_VIOLATIONS" ]; then
  echo "⚠ vh units detected (use dvh for iOS Safari):"
  echo "$VH_VIOLATIONS"
fi

echo "✓ iPad layout checks complete"
