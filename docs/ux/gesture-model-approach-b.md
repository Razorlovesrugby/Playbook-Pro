# Approach B: Player-First Gesture Model

**Design Decision | Date**: 2026-05-14 | **Status**: Accepted

## The Problem
Canvas-based coaching tools typically use a mode toggle:
- "View Mode" → browse, pan, zoom
- "Edit Mode" → move dots, draw lines

This pattern has well-documented failures:
1. Coaches forget which mode they're in
2. Players get moved accidentally while trying to pan
3. UI chrome (mode buttons) wastes canvas space
4. Friction discourages iterative editing

## Approach B: Player-First Editing
Nothing on the canvas changes until the coach deliberately selects a player.
No mode toggle. No global lock.

### State Machine
```
BROWSE (default)
  ├── Tap player dot → SELECTED
  │     Selection ring appears, Properties Panel populates
  │     ├── Drag centre → MOVING (straight line auto-draws)
  │     ├── Drag edge → FREEHAND (Bézier/curve presets)
  │     ├── Shift+drag / Pass button → PASS (line to another dot)
  │     └── Tap empty → back to BROWSE
  └── Pan/zoom gestures → always available
```

### Key Behaviors
1. **Selection is visible**: 3px pulsing ring (#4fc3f7) around selected dot
2. **Everything else is inert**: unselected dots don't respond to drag
3. **Deselect is easy**: tap empty canvas → back to browse
4. **Desktop curve presets**: right-click on selected dot edge → menu of
   (inside shoulder cut, flat channel, diagonal support, loop, wide channel)
5. **Pass lines**: Shift+drag on desktop / dedicated Pass button on tablet

### Why This Protects AI-Generated Plays (V2)
In V2, AI generates complete plays. Approach B ensures the coach only touches
what they deliberately select — they can't accidentally ruin an AI-generated
formation by dragging across the canvas.

## Anti-Patterns This Avoids
- No mode toggle button anywhere in the UI
- No "Edit" / "View" labels
- No unlock/lock paradigm
- No "you are in edit mode" banners
