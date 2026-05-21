---
name: accessibility-audit
description: WCAG 2.2 AA audit patterns for ARM15 — canvas ARIA, keyboard navigation, screen reader support, touch targets, color contrast.
triggers:
  - Accessibility review
  - Canvas interaction changes
  - New UI components
  - Pre-merge audit
---

# Accessibility Audit — ARM15

## When to Load
Load before any merge, after UI changes, or when implementing canvas interactions.

## ARM15-Specific A11y Requirements

### Canvas Accessibility
Canvas is inherently inaccessible. ARM15 mitigates this:
```tsx
<Stage
  aria-label="Rugby play canvas. ${activePhaseName}. ${playerCount} players visible."
  role="img"
  tabIndex={0}
  onKeyDown={handleCanvasKeyboard}
>
```
- Every shape has `name` and `id` props — used for ARIA
- Role labels (Ball, Crash, Boot) rendered as visible text — not just visual
- Phase transitions announced via `aria-live="polite"` region outside canvas
- Keyboard navigation: Tab to canvas, arrow keys to cycle players, Enter to select

### Touch Targets (iPad Primary)
```
Minimum touch target: 44×44px (Apple HIG)
Player dots:          hitStrokeWidth=20 → 44px effective diameter
Branch buttons:       110×50px minimum
Version tabs:         44×44px minimum
My Number strip:      each [N] 44×44px
```

### Color Contrast
```
Canvas bg (#1a1a2e) vs white text:  12.3:1 ✓
Canvas bg vs ghost lines (#888):     3.5:1 ✓ (non-essential)
Selection ring (#4fc3f7) vs bg:      5.2:1 ✓
Branch buttons (#4fc3f7) vs white:   3.1:1 ⚠ (use 14px+ bold text)
```

### Screen Reader Flow
```
1. "ARM15 Playbook — [Play Name]"
2. "Version tabs: [List versions]"
3. "Canvas: [Phase description]. [N] players."
4. "Player [Jersey]: [Role]. Position [x, y]."
5. "Timeline: Phase 2 of 4. [Phase name]."
6. "Branch options: [12 Crash], [13 Sweep]."
```

### Keyboard Navigation
```
Tab         → Focus canvas
Arrow keys  → Cycle through player dots (selection outline)
Enter/Space → Select focused player
Arrow keys  → Move selected player (1px increments)
Shift+Arrow → Move 10px
Escape      → Deselect player
Tab         → Move to next focusable element
```

## Automated Checks (run in CI)
```bash
# axe-core for static content
npx @axe-core/cli --stdout http://localhost:5173

# Touch target audit script
node .claude/hooks/check-touch-targets.js

# Color contrast check
npx color-contrast-checker --config .claude/a11y-colors.json
```

## Anti-Patterns
- Never rely solely on color to convey information
- Never use `aria-hidden="true"` on interactive elements
- Never nest interactive elements inside other interactive elements
- Never omit `alt` text on images — even decorative ones get `alt=""`
- Never prevent zoom with `user-scalable=no` in viewport meta
