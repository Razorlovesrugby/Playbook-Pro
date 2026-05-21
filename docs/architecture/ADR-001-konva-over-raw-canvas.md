# ADR-001: Konva.js over Raw Canvas API

**Status**: Accepted | **Date**: 2026-05-14 | **Author**: Architecture

## Context
ARM15 needs a performant canvas rendering engine for animated rugby play diagrams.
Requirements include:

- Per-node hit detection with configurable hit areas
- Touch/pinch/gesture support for iPad
- Layered rendering (pitch → lines → dots → labels → selection)
- Built-in animation/Tween engine for dot movement
- React integration

## Options Considered

### Option A: Raw HTML5 Canvas API
- Pros: Zero dependencies, full control, smallest bundle
- Cons: No built-in hit detection, no layering system, no tween engine,
  manual React reconciliation, complex touch handling
- Estimated overhead: 3-4 extra checkpoints to replicate Konva features

### Option B: Konva.js (react-konva) ✅
- Pros: React-native declarative API, built-in hit detection with hitStrokeWidth,
  layer system, Tween engine with easing functions, touch/pinch out of the box,
  well-documented
- Cons: 150KB bundle, abstraction layer, learning curve
- Selected because it directly solves all canvas requirements

### Option C: PixiJS
- Pros: WebGL accelerated, fast for complex scenes
- Cons: Game-engine oriented, overkill for 2D diagrams, React integration is
  third-party, no built-in tween for non-sprite objects

## Decision
**Use Konva.js (react-konva)**. The hit detection, layering, and Tween engine
directly match ARM15's canvas requirements. The bundle size is acceptable for
the features gained.

## Consequences
- All canvas code uses react-konva declarative components
- Gesture system built on Konva's event model
- Animation uses Konva.Tween with EaseInOut easing
- Performance-sensitive areas use `layer.batchDraw()` instead of `stage.draw()`
- Konva shapes must have `name` and `id` props for accessibility
