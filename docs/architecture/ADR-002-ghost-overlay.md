# ADR-002: Ghost Overlay Branching

**Status**: Accepted | **Date**: 2026-05-14 | **Author**: Architecture

## Context
Rugby plays have branching paths (if the crash ball fails, sweep around).
ARM15 needs to display these visually. Three approaches considered:

## Options Considered

### Option A: Sequential Tabs
Each branch is a separate tab. Player taps to switch.
- Pros: Simple implementation
- Cons: Player can only see one branch at a time. Destroys the spatial
  relationship. Belsize Park PDFs show all variants on one page — this
  would be a regression.

### Option B: AI-Annotated Branch Markers ✅
Small numbered badges at decision points that show "3 options here" with AI summary.
This was initially planned (see project brief) but later rejected in favor of
the Ghost Overlay approach which is simpler and more PDF-like.

### Option C: Ghost Overlay ✅ (Selected)
All branch paths render simultaneously on the canvas:
- Active branch: 100% opacity, 3px stroke
- Ghost branches: 30-40% opacity, 2px dashed stroke
- Tap a ghost line → animate transition to that branch

## Decision
**Ghost Overlay (Option C)**. This matches the PDF mental model where a single
page shows all variants and the running lines tell the story. No AI annotation
needed — role labels (Ball, Crash, Boot) provide sufficient identification.

## Consequences
- Canvas renders all branches simultaneously (potential performance impact
  with many branches — mitigate with layer caching)
- Ghost lines need distinct visual treatment (dashed, low opacity)
- Decision nodes pause animation and show thumb-friendly choice buttons
- Timeline bar shows ◆2/◆3 indicators at branch points
- Play Map visualizes the full decision tree as a separate diagram
