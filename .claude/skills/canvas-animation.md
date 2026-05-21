---
name: canvas-animation
description: Konva.js animation patterns for ARM15 — Tween engine, running lines, ghost overlay branching, phase transitions, decision node pauses.
triggers:
  - Any Konva.js / react-konva code
  - Animation implementation
  - Canvas rendering
  - Gesture system changes
---

# Canvas Animation — ARM15 Konva.js Patterns

## When to Load
Load this skill before any Konva.js work: canvas rendering, animation, gestures,
hit detection, tween configuration, or branching visualization.

## Canvas Architecture

### Layer Stack (bottom → top)
```
1. Pitch markings layer    — static, no hit detection
2. Background shapes layer — pitch area, try lines, set piece marks
3. Running lines layer     — active path at 100%, ghost branches at 30-40%
4. Player dots layer       — interactive, per-node hit detection
5. Labels layer            — role labels (Ball, Crash, Boot), code words
6. Selection layer         — selection rings, drag handles
7. UI overlay layer        — branch choice buttons, pass button
```

### Stage Configuration
```tsx
<Stage
  width={802}
  height={560}
  onMouseDown={handleStageMouseDown}
  onTouchStart={handleStageTouchStart}
  onMouseMove={handleStageMouseMove}
  onTouchMove={handleStageTouchMove}
  onMouseUp={handleStageMouseUp}
  onTouchEnd={handleStageTouchEnd}
>
```

## Animation Engine

### Running Lines (Straight)
```tsx
// Animate a dot from start to end over a curve
const anim = new Konva.Tween({
  node: dotRef.current,
  x: endX, y: endY,
  duration: 1.5, // seconds per phase
  easing: Konva.Easings.EaseInOut,
  onUpdate: () => {
    // Redraw connecting line from origin to current position
    lineRef.current.points([startX, startY, dotRef.current.x(), dotRef.current.y()]);
  },
  onFinish: () => {
    if (hasBranch) pauseForDecision();
    else advanceToNextPhase();
  }
});
anim.play();
```

### Ghost Overlay Branching
```
- All branch paths render simultaneously
- Active: strokeWidth 3, opacity 1.0
- Ghost:  strokeWidth 2, opacity 0.35, dash [8, 4]
- Tap ghost line → set as active, animate transition
```

### Decision Node Pause
```tsx
// At a branch point, animation pauses
// Large thumb-friendly buttons appear over lower canvas
<Group x={canvasWidth/2 - 120} y={canvasHeight - 80}>
  <Rect width={110} height={50} cornerRadius={8} fill="#4fc3f7" />
  <Text text="12 Crash" fontSize={16} fill="white" x={10} y={14} />
</Group>
<Group x={canvasWidth/2 + 10} y={canvasHeight - 80}>
  <Rect width={110} height={50} cornerRadius={8} fill="#4fc3f7" />
  <Text text="13 Sweep" fontSize={16} fill="white" x={10} y={14} />
</Group>
```

## Gesture System (Approach B)

### Selection
```
- Tap dot → select (selection ring appears, properties panel populates)
- Tap empty canvas → deselect, return to browse/pan mode
- Only selected dot responds to drag
```

### Movement
```
- Drag centre of selected dot → move, straight running line auto-draws
- Drag edge of selected dot → freehand path
  - Tablet: Bézier-smoothed
  - Desktop: curve presets via right-click menu
- Shift+drag (desktop) / Pass button (tablet) → drag to another dot = pass line
```

### Curve Presets (Desktop Only)
```
Inside shoulder cut   — tight arc, stays inside defender
Flat channel           — straight lateral shift
Diagonal support       — 45° running line
Loop                   — circular path behind the line
Wide channel           — arcing run to the touchline
```

## Hit Detection
```tsx
// Per-node hit detection with configurable hit area
<Circle
  x={player.x} y={player.y}
  radius={12}
  fill={player.color}
  hitStrokeWidth={20}  // generous touch target for iPad
  name="player-dot"
  id={`player-${player.jerseyNumber}`}
  onTap={() => selectPlayer(player.id)}
  onDragStart={...} onDragMove={...} onDragEnd={...}
  draggable={player.isSelected}
/>
```

## Tap-to-Filter Discoverability
1. **Post-animation pulse**: After first loop completes, all dots pulse once (400ms glow ring at 50% opacity). Teaches interactivity silently.
2. **Hover states (desktop)**: `cursor: pointer`, dot scales to 110%, glow on hover.
3. **My Number strip (iPad)**: Persistent `[1][2]...[15][All]` row below version tabs. Always visible.

## Anti-Patterns
- Never redraw the entire stage on every frame — use layer.batchDraw()
- Never forget to `anim.destroy()` on unmount
- Never use `draggable={true}` on unselected players
- Never hardcode canvas dimensions — use constants from design tokens
