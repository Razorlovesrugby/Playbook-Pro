# ARM15 Interactive Playbook — Project Context
**Last updated:** 2026-05-14 | **Status:** UX Architecture Complete, Pre-Build

---

## What It Is

ARM15 is the coach's PDF playbook, but the dots move. It's a web-based, animated, interactive version of the tactical playbook that grassroots rugby coaches already create in PowerPoint and distribute as PDFs. Same visual language — code words, numbered dots, role labels, running lines, chapter structure — with five things a PDF can't do layered on top.

The design benchmark is the **Belsize Park RFC 24/25 Toolbox** — a 27-page PDF with code words (SAW, CHAINSAW, JEFF), colored dots, arrows, and role labels (Ball, Crash, Bang, Boot). ARM15 doesn't reinvent this. It animates it.

---

## The Five Value-Adds Over a PDF

1. **Animation** — dots actually move so players see timing and sequencing, not just start/end positions
2. **Player-specific view** — tap your jersey number, everyone else dims, your role is isolated
3. **Accountability** (V2) — "Who's Green" dashboard: coach sees exactly who has viewed each play
4. **Always current** — one link per play, always the latest version, no re-sending PDFs
5. **AI creation** (V2) — coach speaks a play into existence, AI generates the diagram, gestures fine-tune it

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React + Vite |
| Canvas Engine | Konva.js (React-Konva) |
| UI Components | shadcn/ui |
| Deployment | Vercel or Netlify (static + CDN) |
| PWA | Yes — manifest + service worker (Add to Home Screen on iPad/iPhone) |
| Backend / Auth / DB | Supabase — Postgres, RLS, email/password auth, Edge Functions |

**Why Konva.js:** the pitch canvas needs per-node hit detection with configurable hit areas, touch/pinch support, layered rendering, and a built-in Tween animation engine. Konva provides all of this as a React-native API. Raw Canvas API would cost multiple extra checkpoints to replicate it.

**Player access:** still a URL. Players tap a WhatsApp link, it opens in Safari/Chrome. No app download, no login. PWA is opt-in (Add to Home Screen) not required.

---

## Device Priority

**Primary (build for these first):**
- iPad portrait — player study view (802×560px canvas, everything above the fold, no scroll)
- iPad landscape — Creator Studio (3-panel: 200px sidebar / 730px canvas / 220px properties)
- Laptop / desktop — player study view (700px centred content) and Creator Studio

**Secondary:**
- iPhone portrait — functional reference view, graceful degradation of the iPad layout

Deep study happens on a sofa with an iPad. Sideline reference happens on a phone. Design in that order.

---

## Gesture Model — Approach B: Player-First Editing

Nothing on the canvas changes until the coach deliberately selects a player. No mode toggle, no global lock.

- **Tap any player dot** → selects that player (selection ring appears, Properties Panel populates)
- **Drag centre of selected dot** → moves player, straight running line auto-draws
- **Drag edge of selected dot** → freehand path (tablet: Bézier-smoothed; desktop: predefined curve presets via right-click)
- **Shift+drag desktop / Pass button tablet** → drag to another dot = pass line
- **Tap empty canvas** → deselects, canvas returns to browse/pan mode

Unselected players cannot be accidentally moved. This also protects AI-generated plays in V2 — the coach only touches what they deliberately select.

**Desktop curve presets** (sidesteps the industry-wide curved-line failure): inside shoulder cut, flat channel, diagonal support, loop, wide channel.

---

## Canvas Branching — Ghost Overlay Default

All branch paths render on the canvas simultaneously. Active branch at 100% opacity. Inactive branches as ghost lines at 30–40% opacity. Tapping a ghost line switches the active branch.

This matches the PDF mental model — a PDF page shows all variants at once and the running lines tell the story. No AI annotation on branches needed. Role labels (Ball, Crash, Boot) are the only identifiers required.

**Player experience at a Decision Node:** animation pauses, large thumb-friendly branch buttons appear over the lower canvas (e.g., "12 Crash" / "13 Sweep"). Player taps their choice. Animation continues.

---

## Timeline Bar

- Always shows one clean Active Path (root → current terminal phase)
- `◆2` / `◆3` indicators at branch points — tap to open inline branch picker
- `[🗺]` Play Map button — bottom sheet (iPad) / floating panel (laptop) showing the full decision tree as a visual diagram with all phase nodes and connecting lines
- Every phase requires a **short name (max 20 chars)** — required field, prompted inline, validated on publish

---

## Tap-to-Filter Discoverability (No Popups)

Three layers, no modals:
1. **Post-animation pulse** — after first loop, all dots pulse once (400ms glow ring). Teaches interactivity silently.
2. **Hover states** (laptop) — pointer cursor + dot scales 110% + glow on hover.
3. **My Number strip** (iPad) — persistent `[1][2]...[15][All]` row below version tabs. Always visible, explicit entry point.

---

## V1 Scope (Ship This)

Coach auth, shared workspace, My Plays home, Creator Studio with Approach B gestures, 20 starter templates (12 set piece + 8 strike move), composable block chaining, multi-phase branching with ghost overlay, Active Path Timeline + Play Map, publish to live URL, WhatsApp share + QR, player view with animation and tap-to-filter.

## V2 (Deferred)

AI Text-to-Pitch engine, player magic link auth, Who's Green dashboard, offline/touchline mode, auto-set opponents, club branding, team management, freemium/payments, play analytics, undo/redo, export to image, play versioning.

---

## Key Reference

Full technical specification: **ARM15_Master_Spec_v3.0** (ARM15_Master_Spec_v2.md in this folder)
