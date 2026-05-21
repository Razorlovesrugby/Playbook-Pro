# ARM15 Documentation Index

*"Knowledge remains accessible" — Principle XI*

## Structure
```
docs/
  architecture/    ← Architecture Decision Records (ADRs)
  requirements/    ← Feature specs, user stories, V1/V2 scope
  prompts/         ← AI prompts (for V2 AI creation engine)
  ux/              ← Design decisions, gesture model, animation specs
  decisions/       ← Lightweight decisions that don't warrant full ADRs
  phase-specs/     ← Per-feature implementation specs (the work queue)
```

## Key Documents
- [Architecture: Why Konva.js](architecture/ADR-001-konva-over-raw-canvas.md)
- [UX: Approach B Gesture Model](ux/gesture-model-approach-b.md)
- [Requirements: V1 Scope](requirements/v1-scope.md)
- [Architecture: Ghost Overlay Branching](architecture/ADR-002-ghost-overlay.md)
- [UX: Tap-to-Filter Discoverability](ux/tap-to-filter-discoverability.md)

## Manifesto Compliance
Every document in docs/ is:
1. **Traceable** — linked from specs, commits, and PRs (Principle III)
2. **Versioned** — lives in git alongside code (Principle X)
3. **Human-readable** — plain markdown, no tools required (Principle V)
4. **Domain-structured** — organized by concept, not tool (Principle VI)
