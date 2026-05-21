---
name: ui-ux-pro-max
description: Design system intelligence for ARM15 — shadcn/ui patterns, iPad-first responsive layouts, rugby visual language, color/typography system.
triggers:
  - Any UI component creation or modification
  - Responsive layout work
  - Visual polish tasks
  - Design system questions
---

# UI/UX Pro Max — ARM15 Design System

## When to Load
Load this skill before ANY UI work: component creation, layout changes, styling,
responsive breakpoints, animation design, or visual polish.

## Design Tokens

### Breakpoints (iPad-first)
```
iPad Portrait (primary):  802×560px canvas, content above fold
iPad Landscape:           3-panel (200px sidebar | 730px canvas | 220px properties)
Desktop:                  700px centred content
Phone:                    graceful degradation, functional reference
```

### Color System
```
Canvas bg:     #1a1a2e (dark pitch green)
Pitch marking: rgba(255,255,255,0.08)
Dot players:   team colors via coach config
Running lines: per-team color, 3px stroke
Ghost lines:   30-40% opacity of active line
Selection:     #4fc3f7 ring, 3px, pulsing
Branch active: full opacity
Branch ghost:  35% opacity #888
```

### Typography
```
Headings: Inter Variable, 600 weight
Body:     Inter Variable, 400 weight
Code words on canvas: Inter Variable, 500 weight, 14px, white
Phase names: Inter Variable, 600 weight, 12px, #ccc
Timeline bar: monospace for phase numbers
```

## shadcn/ui Patterns
All UI chrome uses shadcn/ui components with Tailwind:
- Buttons: `variant="outline"` for canvas toolbar, `variant="ghost"` for version tabs
- Sheets: use `<Sheet>` for Play Map bottom sheet on iPad, `<Sheet side="right">` for properties panel
- Tabs: `<Tabs>` for version switching (My Number strip)
- NEVER use `<Dialog>` or `<AlertDialog>` — no modals rule

## iPad-First Layout Template
```tsx
// Player Study View — iPad Portrait
<div className="flex flex-col h-screen bg-[#1a1a2e]">
  <div className="flex-none"> {/* Version tabs + My Number strip */} </div>
  <div className="flex-1 flex items-center justify-center">
    <Stage width={802} height={560}> {/* Konva canvas */} </Stage>
  </div>
  <div className="flex-none"> {/* Timeline bar */} </div>
</div>
```

## Anti-Patterns (Never Do)
- Never use `vh` units without `dvh` fallback for iOS Safari
- Never place interactive elements in the iOS safe area (bottom 34px)
- Never use hover-dependent interactions as the only affordance (iPad has no hover)
- Never use `overflow-y: scroll` on the main player view
- Never use a modal/dialog/overlay under any name
- Never implement a mode toggle for the canvas
