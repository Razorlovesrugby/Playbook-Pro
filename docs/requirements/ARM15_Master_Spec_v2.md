# ARM15 Interactive Playbook — Master Specification v3.0

**Version:** 3.0
**Date:** 2026-05-14
**Author:** ARM15 Technical Architecture
**Status:** V1 POC — UX Architecture Complete, Pre-Build

---

## Table of Contents

1. [Product Vision — Why This Beats a PDF](#1-product-vision--why-this-beats-a-pdf)
2. [The Five Value-Adds Over a Static Playbook](#2-the-five-value-adds-over-a-static-playbook)
3. [V1 Scope — Proof of Concept](#3-v1-scope--proof-of-concept)
4. [Technical Architecture](#4-technical-architecture)
5. [Coach Authentication & Multi-User Workspace](#5-coach-authentication--multi-user-workspace)
6. [Device Priority & Pixel Budgets](#6-device-priority--pixel-budgets)
7. [Player View — The Digital Toolbox](#7-player-view--the-digital-toolbox)
8. [Player-Specific View (Tap to Filter)](#8-player-specific-view-tap-to-filter)
9. [My Plays — Coach Home Screen](#9-my-plays--coach-home-screen)
10. [Creator Studio — Canvas & Controls](#10-creator-studio--canvas--controls)
11. [Creator Studio — Gesture Input Model](#11-creator-studio--gesture-input-model)
12. [Composable Block System](#12-composable-block-system)
13. [Phase & Branching System](#13-phase--branching-system)
14. [The 20 Starter Templates](#14-the-20-starter-templates)
15. [Publish & Share Flow](#15-publish--share-flow)
16. [Code Words, Role Labels & Visual Language](#16-code-words-role-labels--visual-language)
17. [Data Model & Schemas](#17-data-model--schemas)
18. [Edge Cases & Error Handling](#18-edge-cases--error-handling)
19. [V2 Roadmap — Make It Perfect](#19-v2-roadmap--make-it-perfect)
20. [Implementation Checkpoints](#20-implementation-checkpoints)

---

## 1. Product Vision — Why This Beats a PDF

### What We're Replacing

Coaches at grassroots rugby clubs currently build their tactical playbooks as PDFs or PowerPoints. A typical example: the "Belsize Park RFC 24/25 Toolbox" — a 27-page PDF organized by game situation (attack off first receiver, attack off ruck, backs from scrum, lineout plays). Each page has a code word (SAW, CHAINSAW, JEFF, BORIS, AVENUE), colored dots for players, arrows for running lines, dashed arrows for passes, role labels (Ball, Crash, Bang, Boot), and brief text descriptions.

These PDFs work. Players can read them. Coaches know how to make them. **ARM15 does not reinvent this visual language.** We keep the same visual cues — numbered dots, solid running lines, dashed pass lines, role labels, code words, chapter organization — and add five things a static PDF physically cannot do.

Crucially: a PDF page showing CHAINSAW draws **all branch variants simultaneously** on one diagram. Coaches and players can see every option at a glance. The running lines are the explanation — no text annotation required. ARM15 preserves this mental model. The canvas always shows all branch paths at once.

### What We Are

ARM15 Interactive Playbook is the coach's Toolbox PDF, but the dots move. It is a web-based, animated, interactive version of the exact playbook document that grassroots rugby coaches already create and distribute. Same look. Same structure. Same simplicity. Five layers of measurable value on top.

### V1 = Proof of Concept

V1 proves that the animated, interactive version is strictly better than the PDF for both coach and player. Raw and functional — not pretty, not branded. If players prefer it to the PDF and coaches find it faster to create, everything else follows.

### Core Design Principles

1. **Look Like the PDF:** The visual language of dots, arrows, code words, and role labels must be instantly familiar to any coach or player who has used a static playbook. No learning curve.
2. **JSON-over-Video:** No video files ever. All play data is mathematical JSON (X/Y coordinates). The frontend canvas animates locally on the device. Server costs near zero.
3. **iPad & Laptop First:** Deep study and play installation happen on iPad and laptop. Players sit at home the night before training. Mobile is secondary — sideline reference only.
4. **Zero Friction Player Access:** Players never download an app. They tap a WhatsApp link and see the play in their browser. Open links, like an unlisted YouTube video.
5. **Code Words Are King:** The play's code word (SAW, CHAINSAW, JEFF) is the biggest text on every screen. When a player hears it on the pitch, they should instantly picture the play.
6. **Composable Building Blocks:** Templates aren't full plays — they're modular blocks (set pieces + strike moves) that coaches snap together and customize.
7. **15-a-Side Locked:** V1 computes exactly 15 attacking nodes. The pitch is a normalized X/Y grid (0–100 on both axes). No 7s, no League, no exceptions.
8. **All Branches Visible Simultaneously:** The canvas always renders all branch paths at once — active branch at full opacity, alternatives as ghost lines. Matches the PDF mental model. The visual is the explanation.

---

## 2. The Five Value-Adds Over a Static Playbook

### Value-Add 1: Animation (Timing & Sequencing)

**PDF problem:** A static diagram shows start AND end positions overlapping on one image. Players have to mentally reconstruct what happens first, second, third. Arrows cross, positions overlap, timing is invisible.

**ARM15 solution:** The dots actually move. Phase 1 animates, then Phase 2, then Phase 3. The player sees the exact sequence — who moves first, when the pass happens, where the support runners arrive. Timing becomes obvious instead of guesswork.

### Value-Add 2: Player-Specific View

**PDF problem:** Every player sees the same diagram with all 15 players and all arrows. A winger has to mentally filter out the 14 other players to find their one running line.

**ARM15 solution:** The player taps their jersey number. Everyone else dims. Their running line highlights. Their role label pops. One tap, crystal clarity.

### Value-Add 3: Accountability Tracking (V2)

**PDF problem:** The coach sends the PDF to WhatsApp. No way to know if anyone opened it.

**ARM15 solution (V2):** "Who's Green" dashboard — traffic-light roster showing exactly who has viewed each play, when, on what device.

### Value-Add 4: Instant Distribution, Always Current

**PDF problem:** Coach updates a play. Re-exports the PDF. Re-sends it. Players have old versions. Versioning chaos.

**ARM15 solution:** One link per play. Always shows the latest version. No re-sending, no old files.

### Value-Add 5: AI-Powered Creation (V2)

**PDF problem:** The coach spends hours in PowerPoint manually drawing dots and arrows.

**ARM15 solution (V2):** Coach speaks or types a play in plain English. AI generates the diagram. Coach fine-tunes with gestures. The canvas gesture model (Approach B) is built for precisely this — corrective precision, not blank-canvas construction.

---

## 3. V1 Scope — Proof of Concept

### In Scope (Ship This)

**Coach side:**
- Coach email/password auth via Supabase
- Multi-user shared workspace (individual logins, shared plays, activity trail)
- "My Plays" home screen with play cards (code word + category tag + status)
- Creator Studio: dark tactical canvas, pitch-first layout, Approach B gesture model
- Code word naming as a first-class field
- Role labels: coach assigns roles to key players (Ball, Crash, Bang, Boot — or any custom label)
- Approach B gesture input: player-first editing (tap to select, gesture within selection)
- Predefined curve presets on desktop; Bézier smoothing on tablet touch
- 20 starter templates (Set Piece Blocks + Strike Move Blocks)
- Coach can save custom reusable blocks
- Composable block chaining (set piece → strike move)
- Multi-phase branching with unlimited depth
- Ghost overlay as default branch view (all paths visible simultaneously)
- Active Path Timeline Bar + `◆N` branch indicators + Play Map overlay
- Phase naming: required short name field per phase (max 20 chars)
- Chapter/category organization
- Publish generates a live, open URL

**Player side:**
- Playbook home: chapters organized by category, code words as hero text
- Play view: code word dominant, pitch canvas with role labels
- Ghost overlay: all branch paths visible simultaneously, active branch highlighted
- "Choose Your Own Adventure" pause: animation pauses at Decision Node, large branch buttons appear
- Animation: ~2–3 seconds per phase, scrubber with play/pause and seek
- iPad portrait and laptop/desktop primary; iPhone portrait secondary
- Tap-to-filter discoverability: post-animation pulse + hover states + "My Number" strip (iPad)

**Visual language (matching the PDF):**
- Numbered dots for attacking players (red/accent for key roles with labels, white for supporting)
- Blue/grey squares for defenders (coach-placed in V1)
- Solid lines for running paths, dashed lines for passes
- Role labels floating below key player dots
- Code word as biggest text on every screen

### Out of Scope (V2)

- Player authentication (magic link)
- Auto-filtered player view (auto-highlights their number on open based on account)
- Who's Green accountability dashboard
- Offline / touchline mode (service worker play caching)
- AI Text-to-Pitch engine (voice/text prompt → play JSON)
- Auto-set opponents (AI-adjusted defensive layer)
- Club branding (badge, team colors, branded share links)
- Team management (player roster, profiles, multiple squads)
- Freemium gating / payments
- Play analytics (branch heatmaps, replay counts)
- Animation speed control for players
- Export to static image
- Play versioning
- Undo/redo

---

## 4. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|---|---|---|
| **UI Framework** | **React + Vite** | Mature ecosystem, first-class Supabase client, clean component model for canvas + panels |
| **Canvas Engine** | **Konva.js (React-Konva)** | Node-based canvas with built-in hit detection, configurable hit areas, touch/pinch, layers, Tween animation — eliminates weeks of raw Canvas API work |
| **UI Components** | **shadcn/ui** | Full component library for non-canvas UI (auth pages, play cards, panels, dialogs, tabs) |
| **Deployment** | **Vercel or Netlify** | Static site, instant global CDN, zero-config CI/CD |
| **PWA** | **manifest + service worker** | "Add to Home Screen" on iPad/iPhone gives full-screen native feel. Caches play JSON for offline (V2). Zero impact on link-based access. |
| **Backend / Auth / DB** | **Supabase** | Postgres database, Row Level Security, built-in email/password auth, Edge Functions for publish logic — unchanged from v2.1 spec |

### Why Konva.js Over Raw Canvas

The pitch canvas requires:
- Per-node hit detection with configurable inner and outer hit areas (required for Approach B gesture model — centre vs. edge of dot)
- Touch event handling (tap, drag, pinch-to-zoom) on iPad Safari
- Layered rendering (pitch markings / player nodes / route lines / annotations as separate layers)
- Tween animation engine for player movement between phases
- Drag-and-drop node repositioning

Konva.js provides all of this as a React-native API. The alternative — building it in raw HTML5 Canvas JS — would require custom implementation of all the above, consuming multiple checkpoints and introducing inconsistency across browsers. Konva is production-proven on interactive canvas applications at this complexity level.

### Data Flow — The Golden Rule

Every interaction in the system produces or consumes one thing: a **Play JSON object**. This is the single source of truth.

```
Coach builds play  →  Play JSON saved to Supabase
Coach publishes    →  Unique slug generated, points to Play JSON
Player opens link  →  Play JSON fetched, Konva canvas animates locally
```

No video encoding. No image generation. No server-side rendering. The frontend is a dumb animation engine that reads math.

### System Diagram

```
┌─────────────────────────────────────────────────────┐
│           COACH (iPad Landscape / Desktop)           │
│                                                     │
│  ┌───────────┐  ┌────────────────┐  ┌────────────┐  │
│  │ Block      │  │ Konva Canvas   │  │ Properties │  │
│  │ Library    │  │ (React-Konva)  │  │ Panel      │  │
│  │ Sidebar    │  │ Approach B     │  │ (shadcn)   │  │
│  └───────────┘  └────────────────┘  └────────────┘  │
│                         │                            │
└─────────────────────────┼────────────────────────────┘
                          │  Save / Publish
                          ▼
┌─────────────────────────────────────────────────────┐
│                    SUPABASE                          │
│  Auth │ Postgres (plays, coaches, blocks) │ Edge Fn  │
└─────────────────────────┼────────────────────────────┘
                          │  JSON via slug
                          ▼
┌─────────────────────────────────────────────────────┐
│       PLAYER (iPad Portrait / Laptop / iPhone)       │
│  Konva Canvas (read-only) │ Scrubber │ Branch UI     │
└─────────────────────────────────────────────────────┘
```

---

## 5. Coach Authentication & Multi-User Workspace

### Auth Model

Coaches sign up and log in via Supabase email/password authentication. Standard credentials — no magic links for coaches in V1.

### Shared Workspace

- **First coach signs up** → a new workspace is automatically created
- **Additional coaches** → workspace owner invites by email; they create their own account and join
- **Activity trail:** every play records `created_by` and `last_edited_by` with timestamps
- **No roles/permissions in V1:** all coaches in a workspace have equal access

### Workspace Data Model

- One workspace = one coaching team
- Plays belong to the workspace, not to individual coaches
- Custom blocks belong to the workspace (shared library)
- All coaches see all plays and blocks

---

## 6. Device Priority & Pixel Budgets

Deep study and play installation happen on **iPad and laptop first**. Mobile is secondary — quick reference on the sideline or commute.

### Player View — iPad Portrait (834 × 1194px) — Primary Consumption

```
┌─────────────────────────────────────────────────────────────┐
│  ← Toolbox                    Attack off First Receiver      │  50px
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        CHAINSAW                             │  100px (~72pt)
│                                                             │
│      Ball fixes inside shoulder, Crash splits,              │  48px
│      Bang attacks the line, Boot wide option.               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│              PITCH CANVAS  802 × 560px                      │  560px
│              (Konva — all branch paths visible)             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ▶  ──────────────────○───────────────────────────  0:04   │  52px
├─────────────────────────────────────────────────────────────┤
│  [ Option A: Ball ] [ Option B: Crash ] [ Option C: Bang ]  │  52px
├─────────────────────────────────────────────────────────────┤
│  My number: [1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][All] │  36px
└─────────────────────────────────────────────────────────────┘
Total: 50+100+48+560+52+52+36 = 898px / 1194px. No scroll needed.
```

Key rules:
- Code word renders at ~72pt. Dominant on screen. No ambiguity.
- Canvas at 802×560 gives 1.43:1 ratio — matches attacking zone proportions. Player dots at 24px diameter: legible jersey numbers, comfortable tap targets.
- Version tabs are a full horizontal strip. Up to 4 options display without stacking; beyond 4 they scroll horizontally.
- "My Number" strip always visible below version tabs — explicit tap-to-filter entry point on tablet.
- Everything above the fold. Zero scrolling on a standard iPad.

### Player View — Laptop / Desktop (1280 × 800px minimum)

```
┌────────────────────────────────────────────────────────────────┐
│  ← Toolbox                    Attack off First Receiver        │  50px
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         CHAINSAW                                               │  80px
│         Ball fixes inside shoulder, Crash splits, Bang attacks │  40px
│                                                                │
├──────────┬─────────────────────────────────────────┬──────────┤
│  190px   │      PITCH CANVAS  700 × 490px          │  190px   │  490px
│ (margin) │      (Konva — ghost overlay default)    │ (margin) │
├──────────┴─────────────────────────────────────────┴──────────┤
│               ▶  ──────────○──────────────────────────  0:04  │  52px
├────────────────────────────────────────────────────────────────┤
│         [ Option A: Ball ] [ Option B: Crash ] [ Option C: Bang ] │  52px
└────────────────────────────────────────────────────────────────┘
Total height: 50+80+40+490+52+52 = 764px / 800px ✓
```

On laptop, hover states replace the "My Number" strip:
- Hovering a player dot → cursor becomes pointer, dot scales 110% + glow ring
- 800ms hover delay → tooltip: "Click to highlight your position"

### Creator Studio — iPad Landscape (1194 × 834px)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  ARM15   CHAINSAW — Attack off First Receiver        [Save Draft] [Preview] [Publish ↗]  │  54px
├───────────────┬────────────────────────────────────────────────────┬─────────────────────┤
│               │                                                    │                     │
│  BLOCK        │                                                    │  PROPERTIES         │
│  LIBRARY      │                                                    │  Selected: #12      │
│  200px        │             PITCH CANVAS                          │  Inside Centre      │
│               │             ~730 × 560px                          │  X: 30   Y: 15     │
│  Set Piece ▾  │             (React-Konva)                         │                     │
│  [Lineout]    │                                                    │  Role label:        │
│  [Scrum]      │                                                    │  [ Crash         ] │
│  [Kickoff]    │                                                    │                     │
│               │                                                    │  Path:              │
│  Strike ▾     │                                                    │  [⌒ Inside cut  ▾] │
│  [12 Crash]   │                                                    │                     │
│  [13 Sweep]   │                                                    │  Actions:           │
│  [Pod L/R]    │                                                    │  [✓] Carry         │
│               │                                                    │  [ ] Dummy run     │
│  My Blocks ▾  │                                                    │                     │
│               │                                                    │  [× Remove]        │
├───────────────┴────────────────────────────────────────────────────┴─────────────────────┤
│  [🗺] [Phase 1: Lineout] ──◆2── [Phase 2: 13 Sweep] ──◆3── [Phase 3: Skip to wing] ■   │  80px
└──────────────────────────────────────────────────────────────────────────────────────────┘
Columns: 200px + ~730px + 220px + ~44px gutters = 1194px ✓
Heights: 54px + ~640px + 80px = 774px / 834px ✓
```

At 730×560px, player dots render at 28px diameter — large enough for precise Approach B edge-vs-centre distinction on touch. Properties Panel at 220px shows role label, coordinates, curve preset picker, and action checklist without crowding.

---

## 7. Player View — The Digital Toolbox

The player view is the product's most important screen. It must feel like flipping through the coach's Toolbox PDF — but better.

### 7.1 Playbook Home (Chapter List)

When a player taps a shared playbook link, they see the team's playbook organized exactly like the PDF: by chapter/category.

```
┌───────────────────────────────┐
│  Belsize Park RFC             │
│  2024/25 Season Toolbox       │
├───────────────────────────────┤
│  ATTACK OFF FIRST RECEIVER    │
│                               │
│  ┌─────────────────────────┐  │
│  │  SAW              4 opts│  │
│  │  Ball, Crash, Bang, Boot│  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │  CHAINSAW         4 opts│  │
│  │  Ball, Crash, Bang, Boot│  │
│  └─────────────────────────┘  │
│                               │
│  ATTACK OFF THE RUCK          │
│                               │
│  ┌─────────────────────────┐  │
│  │  DRILL            2 opts│  │
│  │  Ruck strike play       │  │
│  └─────────────────────────┘  │
│                               │
│  BACKS OFF SCRUM              │
│                               │
│  ┌─────────────────────────┐  │
│  │  JEFF             2 opts│  │
│  │  Left hand — narrow     │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### 7.2 Play View (Watching a Play)

```
┌───────────────────────────────┐
│  ← Back     Attack off 10    │  ← Category breadcrumb
├───────────────────────────────┤
│                               │
│          CHAINSAW             │  ← Code word: biggest text
│  Ball fixes inside shoulder,  │
│  Crash splits, Bang attacks   │
│                               │
├───────────────────────────────┤
│                               │
│  [Ghost lines of ALL options  │
│   visible simultaneously.     │
│   Active branch full opacity, │
│   inactive at 30–40% opacity] │
│                               │
│     ■D  ■D  ■D  ■D  ■D       │
│         ⬤10  ──→  ⬤12        │
│        Ball    Crash          │
│    ○9 - - →⬤10               │
│    ○1 ○4 ○6       ⬤14  ○15   │
│                    Boot       │
│                               │
├───────────────────────────────┤
│  ▶  ────────○──────────       │  ← Scrubber
├───────────────────────────────┤
│  [Ball] [Crash] [Bang] [Boot] │  ← Version tabs (branch options)
├───────────────────────────────┤
│  [1][2][3]...[15]    [All]    │  ← My Number strip (iPad only)
└───────────────────────────────┘
```

**Key design rules:**
- The **code word** is the largest text on screen.
- **All branch paths visible simultaneously.** Active branch is full opacity. Inactive branch paths render as ghost lines (30–40% opacity). Tapping a ghost line switches the active branch — no tab required, though version tabs also work.
- **Key players** (those with role labels) render as red/accent dots. Supporting players render as white/neutral dots.
- **Role labels** float below the key player dots. Always visible, never hidden.
- **Defenders** render as blue squares labeled "D."
- **Version tabs** are named after the branch options. Tapping a tab switches the active branch and re-animates.

### 7.3 Animation Behavior

- Default speed: ~2–3 seconds per phase, ease-in-out
- Pass lines animate as a moving dash between passer and receiver at the moment of the pass
- Running lines trace behind the moving dot (leave a trail)
- **At a Decision Node:** animation pauses. Ghost lines of all branch options become visible. Two or three large thumb-friendly buttons appear overlaid on the lower canvas:

```
┌─────────────────────────────────────────┐
│  ┌──────────────────┐ ┌───────────────┐ │
│  │  Option A        │ │  Option B     │ │
│  │  12 Crash        │ │  13 Sweep     │ │
│  └──────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

Player taps their choice → animation continues down that path. The running lines tell the story — no additional annotation needed on the branches.

- Scrubber: play/pause, drag to seek within current phase
- Annotations fade in at the start of their phase

### 7.4 Responsive Behavior

- **iPad portrait (834px):** Full layout as above. All elements above the fold. My Number strip visible.
- **Laptop/desktop (≥1024px):** Centred card, max content width 700px. Hover states replace My Number strip.
- **iPhone portrait (375–430px):** Canvas fills full width. Version tabs scroll horizontally if needed. My Number strip collapses to a scrollable row. Code word scales down to ~48pt. This is the secondary reference view — functional, not optimised.

---

## 8. Player-Specific View (Tap to Filter)

This is Value-Add #2. One tap isolates exactly what a player needs to know.

### How It Works

1. The player is watching a play (all 15 dots visible).
2. They tap a player dot on canvas **or** tap their number in the "My Number" strip.
3. **Instantly:**
   - That player's dot brightens and slightly enlarges
   - Their running line brightens to full opacity
   - Their role label pops in accent color
   - All other players dim to ~20% opacity
   - All other running/pass lines dim to ~10% opacity
   - Pass lines connected to this player (incoming or outgoing) stay bright
4. Tapping the dimmed background or tapping the player again restores the full view. Tapping `[All]` in the My Number strip also restores.

### Discoverability — Three Layers, No Popups

**Layer 1 — Post-Animation Pulse (teaches once, silently)**
After the play completes its first full animation loop, all 15 player dots simultaneously pulse once — a 400ms ease-out glow ring that expands from each dot and fades. Fires once per play, never repeats. No text. The motion signals that dots are interactive.

**Layer 2 — Hover States (laptop/desktop only)**
Hovering any player dot: cursor → pointer, dot scales to 110% + soft glow ring. After 800ms hover delay, tooltip: "Click to highlight your position."

**Layer 3 — My Number Strip (iPad primary)**
Persistent horizontal strip below version tabs: `[1][2][3]...[15][All]`. Always visible. Explicit number selection without requiring the player to locate and tap their dot on the canvas. Solves fat-finger discoverability gap.

### V1 vs V2

- **V1 (manual):** Any viewer taps any number to filter. No auth needed. Works for everyone.
- **V2 (auto):** When the player is authenticated and linked to a jersey number, the play auto-highlights their number on open. They can tap others.

---

## 9. My Plays — Coach Home Screen

### Play Card Content

Each play appears as a card showing:
- **Code word** (e.g., "CHAINSAW") — biggest text on the card
- **Category tag** (e.g., "Attack off 10", "Scrum backs")
- **Published status:** green dot + "Published" or gray dot + "Draft"
- **Branch count:** "4 options" or "2 versions"
- **Last edited:** relative timestamp + who edited (e.g., "Edited 2h ago by Sean")

### Actions

- **[+ New Play]** → Creator Studio (prompts template selection or blank start)
- **Click a play card** → opens in Creator Studio for editing
- **Quick-copy link** on published plays
- **Delete play** (with confirmation)
- **Duplicate play**
- **Assign to category**

---

## 10. Creator Studio — Canvas & Controls

### Screen Layout

See Section 6 for the full iPad landscape and laptop pixel budgets.

### Canvas Specification

**Coordinate system:**
- Origin (0, 0) = top-left (left touchline at the attacking try line)
- X: 0 (left touchline) → 100 (right touchline)
- Y: 0 (attacking try line) → 100 (defending end)

**Pitch markings** (white lines on dark background):
- Try line: Y = 0
- 5m line: Y = 5
- 10m line: Y = 10
- 22m line: Y = 22
- Halfway: Y = 50
- Touchline channels: X = 5, 15, 85, 95

**Visual style:**
- Background: dark navy/charcoal (#1a1a2e or similar)
- Pitch markings: white, ~40% opacity
- Player dots: white filled circles, jersey number centred in dark text
- Running lines: blue (#4a9eff), solid
- Pass lines: orange (#ff9f43), dashed with animated flow
- Ghost branch lines: same color as active, 30–40% opacity
- Selected node: bright accent ring (Konva `stroke` on the selected node)
- Ghost positions (previous phase end): faint white outlines, ~20% opacity

**Canvas behaviors:**
- Zoom: scroll-wheel on desktop, pinch on tablet. Range: 50%–200%
- Pan: drag on empty canvas space (no player selected)
- Grid snap: optional toggle, snaps to nearest 2-unit increment

### Konva Layer Structure

The canvas is organised into four Konva layers from bottom to top:

1. **Pitch layer** — static pitch markings, try lines, channels. Renders once.
2. **Route layer** — all running lines, pass lines, and ghost branch paths.
3. **Node layer** — all 15 attacking player dots + defender squares. Interactive hit detection here.
4. **Annotation layer** — text labels, callout pills. Always on top.

Separating routes from nodes allows ghost branch paths to be rendered below the player dots without cluttering hit detection.

---

## 11. Creator Studio — Gesture Input Model

### Approach B: Player-First Editing

**Core principle:** Nothing on the canvas changes until the coach deliberately selects a player. Selection is the edit gate. No mode toggle, no global canvas lock/unlock. Unselected players cannot be moved or have their paths changed accidentally.

This model is built for both V1 (manual creation) and V2 (AI-generated play correction). In V2, the AI-generated canvas is protected by default — only the players the coach explicitly selects can be modified.

### Selection Mechanic

- **Tap/click any player dot** → selects that player
  - Selection ring appears (Konva stroke, bright accent color)
  - Properties Panel populates with that player's data
  - Only this player's dot and connected routes are now interactive
- **Tap/click empty canvas space** → deselects all. Canvas returns to browse/pan mode.
- **Tap/click another player dot** → switches selection to that player (previous auto-deselects)

### Three Gesture Zones (active only on the selected player)

All three gestures operate simultaneously on the selected player — no sub-mode switching required.

**1. Centre Drag → Move Player (straight line)**
- Drag from the **inner 60%** of the selected dot's hit area
- Player moves to the new position
- A straight blue running line auto-draws from the original start position to the new end position
- Updates `end_x`, `end_y` for the current phase

**2. Edge Drag → Freehand Path (curved line)**
- Drag from the **outer 40%** of the selected dot's hit area
- Freehand path mode activates
- **On tablet/touch:** raw stroke captured → smoothed to cubic Bézier on pointer release
- **On desktop/mouse:** no freehand. Instead, right-clicking (or a small quick-pick menu on the selected player) offers predefined curve presets:
  - ⌒ Inside shoulder cut
  - → Flat channel run
  - ↗ Diagonal support line
  - ↺ Loop (support run behind)
  - ↘ Wide channel

  Coach selects the curve type; the system draws the path. This sidesteps the #1 industry-wide failure point — imprecise freehand curved routes with a mouse.

**3. Pass Gesture → Pass Line**
- **Desktop:** Hold `Shift` while dragging from the selected player dot toward another player dot. If the drag ends on another dot, an orange dashed pass line connects them.
- **Tablet:** Tap the "Pass" button that appears in the Properties Panel when a player is selected, then tap the receiving player dot.
- Pass line adds `pass` action to the source player, `receive` to the target.
- If the drag/tap does not land on another player dot, the pass line cancels.

### Cursor Feedback (desktop)

| State | Cursor |
|---|---|
| Hovering any unselected player dot | `pointer` (hand) |
| Player selected, hovering centre of dot | `move` (four-arrow) |
| Player selected, hovering edge of dot | `crosshair` |
| Hovering empty canvas | `grab` (pan mode) |
| Dragging canvas | `grabbing` |

### Annotations

- Click/tap anywhere on empty canvas → places a text annotation at that X/Y position
- Opens inline text input at the clicked position
- Small white text with a subtle dark background pill
- Annotations stored per phase with X/Y coordinates
- Require no player selection — annotations are independent of the player selection state

---

## 12. Composable Block System

### What is a Block?

A block is a reusable building unit: **one phase + its immediate branches** (if any). Blocks are the atoms that compose a full play.

### Two Categories of System Blocks

**Set Piece Blocks** — how you win the ball:
- Lineout formations, scrum setups, kickoff receives, restarts
- Form Phase 1 of a play

**Strike Move Blocks** — what you do with the ball:
- 12 crash, 13 sweep, pod attacks, backs moves
- Form Phase 2+ of a play

### How Blocks Compose

```
[Set Piece Block: 5m Lineout 4-Man]
         │
         ▼  "What happens next?"
[Strike Move Block: 12 Crash]
```

When a block attaches:
1. The END positions of the previous phase become the START positions of the new block
2. System auto-maps player positions (Player 9's end position in the lineout → Player 9's start position in the strike move)
3. Coach adjusts from there using Approach B gestures

### The Block Library Sidebar

Three accordion sections:
1. **Set Piece Blocks** — system-provided set piece templates
2. **Strike Move Blocks** — system-provided strike move templates
3. **My Blocks** — custom blocks saved by coaches in this workspace

### Saving Custom Blocks

1. Right-click (or tap button) on a phase in the Timeline Bar
2. Select "Save as Block"
3. Name it (e.g., "Our 12 Crash — Sean's Version")
4. Appears in "My Blocks" — available to all coaches in the workspace

---

## 13. Phase & Branching System

### How Phases Work

A play is a tree of phases. Each phase is a time segment where players move from start to end positions.

- **Phase 1** is always the root (set piece or starting formation)
- After each phase, the coach chooses: **"Add a variation (branch)" or "Add the next phase"**
- Phases pulled from the Block Library or built from scratch

### Branch Points

A branch point is where the play forks into multiple versions.

**Creating a branch:**
- Click `[+ Branch]` at the end of a phase in the Timeline Bar → dialog: "How many options? [2] [3]" → name each option
- Or select a player on canvas and press `D` hotkey → creates a branch named after that player's potential actions

**Branch rules:**
- A branch point creates 2 or 3 child phases (never 1)
- Each child phase inherits the parent's END positions as its START positions
- No hard limit on depth

### Phase Naming (Required)

Every phase requires a **short name (max 20 characters)** entered when the phase is added. The system prompts inline: *"Name this phase..."* with a default suggestion from the block template name if one was used.

Phase names appear in:
- The Timeline Bar
- The Play Map overlay
- Player-facing version tabs and branch buttons

### Canvas: Ghost Overlay as Default

When a play reaches a branch point, **all branch paths render simultaneously on the canvas:**
- Active branch: 100% opacity
- Inactive branches: 30–40% opacity, same visual style (ghost lines)

This matches the PDF mental model — coaches and players see the entire decision space at once. The running lines tell the story. Role labels (Ball, Crash, Boot) are the only identifiers needed on the branches.

Tapping any ghost line on the canvas switches it to the active branch. The previous active branch dims to ghost. The Timeline Bar updates to show the newly active path.

### Timeline Bar

The Timeline Bar always shows **one clean linear path** — from Phase 1 to the currently selected terminal phase.

```
[🗺] [Phase 1: Lineout] ──◆2── [Phase 2: 13 Sweep] ──◆3── [Phase 3: Skip to wing] ■
  ◄  ▶  ■  ──────────○────────────────────────  [+ Branch]  [+ Phase]
```

- `[🗺]` — Play Map button, far left, always visible
- **Phase pills** — clickable; clicking switches canvas to that phase's context
- `◆2` / `◆3` — branch indicators; tapping opens inline branch picker showing all options at that point
- **Scrubber** — play/pause, seek
- `■` — terminal phase marker (play ends on this path)

### Play Map Overlay

Tapping `[🗺]` opens the full decision tree:
- **iPad:** bottom sheet slides up over the canvas
- **Laptop:** floating panel appears over the right side of the canvas (not displacing layout)

The Play Map renders all phase nodes as pills connected by tree lines. The active path is highlighted. Any node is tappable to jump to that phase. Dismiss with a swipe down (iPad) or `Escape` (laptop).

```
┌─────────────────────────────────────────────────────┐
│  PLAY MAP — CHAINSAW                           [×]   │
│                                                     │
│              [Phase 1: Lineout]                     │
│                /             \                      │
│     [2: 12 Crash]        [2: 13 Sweep] ●           │
│       /       \           /    |    \               │
│  [3: Offload] [3: Recycle] [3:Kick][3:Ruck][3:Skip]●│
│                                     ● = active      │
└─────────────────────────────────────────────────────┘
```

### Ghost Positions (Phase Context)

When editing any phase beyond Phase 1, the canvas shows faint ghost outlines (~20% opacity) of the previous phase's END positions. Coaches see where players "came from" without obscuring the current phase.

---

## 14. The 20 Starter Templates

### Set Piece Blocks (12 Templates)

#### Lineout (5)

| # | ID | Name | Description |
|---|---|---|---|
| 1 | `lineout_5m_4man` | 5m Lineout — 4-Man | Attacking lineout 5m out. 4 jumpers, 9 at base, backs flat at 15m. |
| 2 | `lineout_5m_6man` | 5m Lineout — 6-Man | Full 6-man line 5m out. Compressed back line for close-range power. |
| 3 | `lineout_22m_4man` | 22m Lineout — 4-Man | Lineout on the 22m. 4-man line, backs spread wider with depth. |
| 4 | `lineout_22m_maul` | 22m Lineout — Driving Maul | 6-man configured for a driving maul. Backs in close support. |
| 5 | `lineout_halfway` | Halfway Lineout | Midfield lineout with balanced forward/back positioning. |

#### Scrum (4)

| # | ID | Name | Description |
|---|---|---|---|
| 6 | `scrum_5m_left` | 5m Scrum — Left | Attacking scrum 5m out, left side. 9 feeds, backs aligned right. |
| 7 | `scrum_5m_right` | 5m Scrum — Right | Mirror of left-side scrum. |
| 8 | `scrum_22m_centre` | 22m Scrum — Centre | Scrum on the 22m, centre pitch. Standard 9-10-12-13 alignment. |
| 9 | `scrum_halfway` | Halfway Scrum | Midfield scrum with balanced back line. |

#### Kick-Off & Restarts (3)

| # | ID | Name | Description |
|---|---|---|---|
| 10 | `kickoff_receive_deep` | Receive Kick-Off — Deep | Formation for receiving a deep kick-off. Back 3 deep, pods positioned. |
| 11 | `kickoff_receive_short` | Receive Kick-Off — Short | Tight pod for contestable short kick-off. |
| 12 | `kickoff_own` | Own Kick-Off | Kicking team formation. Chaser lines and spacing. |

### Strike Move Blocks (8 Templates)

| # | ID | Name | Description |
|---|---|---|---|
| 13 | `strike_12_crash` | 12 Crash | Inside centre hard line off 10. Direct, inside-shoulder carry. |
| 14 | `strike_13_sweep` | 13 Sweep | Outside centre sweep around the corner. 15 in support depth. |
| 15 | `strike_pod_left` | Pod Attack — Left | Three forward pods set left, 9 distributing. Backs loaded right. |
| 16 | `strike_pod_right` | Pod Attack — Right | Mirror of pod_left. |
| 17 | `strike_backs_move` | Backs Move | 10-12-13-14 running a structured backs move. Forwards in ruck support. |
| 18 | `strike_miss_pass` | Miss Pass to 13 | 10 misses 12, hits 13 in space. 12 runs a dummy/hold line. |
| 19 | `strike_loop_play` | First Receiver Loop | 10 passes to 12, loops behind to receive return pass. Creates overlap. |
| 20 | `strike_kick_chase` | Cross-Kick & Chase | 10 puts a cross-kick to the far wing. 14 and 15 chase. Forwards cover. |

---

## 15. Publish & Share Flow

### Publishing a Play

When the coach clicks **[Publish & Share]:**

**Step 1 — Validation:**
- Phase 1 must have all 15 players placed
- Every phase must have a name (max 20 chars)
- Every non-terminal phase must have at least 2 branches OR a sequential next phase
- At least one terminal phase must exist
- Warn (non-blocking) if any phase has zero player movement

**Step 2 — If valid:**
- A unique 6-character alphanumeric slug is generated (collision-checked)
- Play is marked as published
- URL: `play.arm15.com/view/{slug}`
- Share dialog:
  - URL (tap to copy)
  - WhatsApp deep link (`whatsapp://send?text=Check out this play: {url}`)
  - QR code

**Step 3 — If invalid:**
- Red error banner listing every validation failure with clickable links to jump to the offending phase/node

### Live Link Behavior

The published link **always reflects the latest saved version**. No re-publishing needed after edits.

### Unpublishing

Coach can unpublish at any time. The link immediately returns: "This play is no longer available."

### No Player Auth

Players access published links with zero authentication. Anyone with the URL can view.

---

## 16. Code Words, Role Labels & Visual Language

### 16.1 Code Words

Every play has a **code word** — a short, memorable name (e.g., SAW, CHAINSAW, JEFF, BORIS, AVENUE). This is how the play is called on the pitch.

- Required field when creating a play
- Biggest text on every screen where the play appears
- All-caps by convention
- No uniqueness constraint within a workspace

### 16.2 Role Labels

Role labels are short tags the coach assigns to key players — what that player's job is in THIS specific play.

**Examples from the Belsize Park Toolbox:**
- Ball = the player who receives and fixes the defender
- Crash = attacks the inside shoulder
- Bang = attacks the line deeper
- Boot = power option if space is wide

**How they work:**
- Coach selects a player dot and types a custom role label (free text)
- Not all 15 players need labels — typically 3–5 key players per play
- Role labels render as small text floating below the player's dot, always visible
- Players with role labels render as accent-colored dots (red). Players without labels render as neutral dots (white).
- Role labels stored per-phase (a player's role can change between phases)
- **On ghost branch lines:** role labels are visible at reduced opacity on ghost paths — coaches and players can identify roles across all visible branches simultaneously

### 16.3 Visual Language Reference

| PDF Element | ARM15 Equivalent | Style |
|---|---|---|
| Colored ovals with numbers | Numbered circle dots | Red for key players (with role labels), white for supporting |
| Blue squares for defenders | Blue/grey square dots labeled "D" | Coach places manually in V1 |
| Solid black arrows | Running lines (solid) | Animate during playback; trace behind moving dot |
| Red dashed arrows | Pass lines (dashed, orange) | Animate as moving dash at moment of pass |
| Role text (Ball, Crash, Bang) | Role labels | Floating below key player's dot; visible on ghost paths |
| Code word (SAW, JEFF) | Code word field | Largest text on every screen |
| Page title (e.g., "Attack off First Receiver") | Category / chapter heading | Organizes the playbook in coach and player views |
| Side-by-side play variants on one page | Ghost overlay (all branches simultaneously) | All paths on canvas at once — active full opacity, others 30–40% |
| Legend text | Coach annotations | Text labels at X/Y positions on canvas |

---

## 17. Data Model & Schemas

### 17.1 The Play JSON Object

```json
{
  "play_id": "uuid",
  "version": 1,
  "metadata": {
    "code_word": "CHAINSAW",
    "name": "Attack off First Receiver — Chainsaw",
    "description": "Ball fixes inside shoulder, Crash splits, Bang attacks the line, Boot wide option.",
    "category": "Attack off first receiver",
    "created_by": "coach_uuid",
    "workspace_id": "workspace_uuid",
    "created_at": "2026-05-14T10:30:00Z",
    "updated_at": "2026-05-14T14:22:00Z",
    "last_edited_by": "coach_uuid",
    "published": true,
    "publish_slug": "8f7a9b"
  },
  "canvas": {
    "width": 100,
    "height": 100,
    "pitch_markings": {
      "try_line_y": 0,
      "five_m_y": 5,
      "ten_m_y": 10,
      "twenty_two_y": 22,
      "halfway_y": 50,
      "five_m_x": [5, 95],
      "fifteen_m_x": [15, 85]
    }
  },
  "phases": [
    {
      "phase_id": "phase_1",
      "label": "5m Lineout",
      "duration_ms": 2500,
      "parent_branch_id": null,
      "source_block_id": "lineout_5m_4man",
      "nodes": {
        "attacking": [
          {
            "player_number": 12,
            "position_name": "Inside Centre",
            "role_label": "Crash",
            "is_key_player": true,
            "start_x": 30.0,
            "start_y": 15.0,
            "end_x": 42.0,
            "end_y": 8.0,
            "path_type": "curved",
            "path_preset": "inside_shoulder_cut",
            "path_points": [
              {"x": 34.0, "y": 12.0},
              {"x": 38.0, "y": 9.5}
            ],
            "actions": ["carry"]
          }
        ],
        "defending": [
          {
            "defender_id": "d1",
            "start_x": 35.0,
            "start_y": 5.0,
            "end_x": 35.0,
            "end_y": 5.0,
            "path_type": "static"
          }
        ]
      },
      "annotations": [
        {
          "text": "4-man lineout — throw to 4",
          "x": 10,
          "y": 2,
          "style": "callout"
        }
      ],
      "branches": [
        {
          "branch_id": "branch_1a",
          "label": "12 Crash",
          "next_phase_id": "phase_2a"
        },
        {
          "branch_id": "branch_1b",
          "label": "13 Sweep",
          "next_phase_id": "phase_2b"
        }
      ]
    }
  ]
}
```

### 17.2 Node Schema

| Field | Type | Description |
|---|---|---|
| `player_number` | integer (1–15) | Jersey number. Fixed across all phases. |
| `position_name` | string | Human-readable position. Auto-set from number. |
| `role_label` | string or null | Coach-assigned role (e.g., "Ball", "Crash"). Null if not a key player. |
| `is_key_player` | boolean | Derived from `role_label != null`. Controls rendering (accent vs neutral dot). |
| `start_x`, `start_y` | float (0–100) | Position at START of this phase. |
| `end_x`, `end_y` | float (0–100) | Position at END of this phase. |
| `path_type` | enum | `static`, `linear`, `curved` |
| `path_preset` | string or null | Desktop curve preset name (e.g., `inside_shoulder_cut`, `flat_channel`, `diagonal_support`, `loop`, `wide_channel`). Null for touch-drawn paths. |
| `path_points` | array of {x, y} | Bézier waypoints for curved paths. Empty for static/linear. |
| `actions` | array of strings | `carry`, `pass`, `receive`, `kick`, `ruck`, `dummy_run`, `support_line`, `throw`, `jump`, `lift` |

### 17.3 Supabase Tables

#### `workspaces`
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `coaches`
```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  workspace_id UUID REFERENCES workspaces(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `plays`
```sql
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  created_by UUID REFERENCES coaches(id) NOT NULL,
  last_edited_by UUID REFERENCES coaches(id),
  code_word TEXT NOT NULL,
  name TEXT,
  description TEXT,
  category TEXT,
  play_json JSONB NOT NULL,
  published BOOLEAN DEFAULT false,
  publish_slug TEXT UNIQUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_plays_slug ON plays(publish_slug) WHERE publish_slug IS NOT NULL;
```

#### `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `blocks`
```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  block_json JSONB NOT NULL,
  created_by UUID REFERENCES coaches(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 17.4 Row Level Security

```sql
-- Coaches see only their workspace's plays
CREATE POLICY workspace_plays ON plays
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM coaches WHERE id = auth.uid())
  );

-- Coaches see system blocks + their workspace's custom blocks
CREATE POLICY visible_blocks ON blocks
  FOR SELECT USING (
    is_system = true
    OR workspace_id IN (SELECT workspace_id FROM coaches WHERE id = auth.uid())
  );

-- Published plays are readable by anyone (no auth required)
CREATE POLICY public_published_plays ON plays
  FOR SELECT USING (published = true);
```

---

## 18. Edge Cases & Error Handling

### Coach Side

| Scenario | Handling |
|---|---|
| Publish with missing players in Phase 1 | Block publish. Red banner: "Phase 1 is missing players: #4, #7, #11." |
| Publish with unnamed phase | Block publish. Red banner: "Phase [X] has no name. Click to name it." |
| Delete a phase with children | Confirmation: "Deleting this phase will also delete all its branches. Continue?" |
| Branch with only 1 option | UI prevents this. Minimum 2 options. |
| Two coaches editing same play | Last-write-wins with timestamp. On conflict: "Modified by {coach} at {time}. Overwrite or reload?" |
| Browser crash mid-edit | Auto-save every 10 seconds. Recovery dialog on next load: "Unsaved changes found. Restore?" |
| Block library template corrupted | System templates seeded from version-controlled JSON. Re-seed on deploy. |
| Approach B: edge drag does not land cleanly | Path drawing cancels on pointer release if no valid path was drawn. No partial route created. |
| Desktop curve preset applied to wrong player | Coach deselects and re-selects correct player. Preset only applies to the selected node. |
| Extremely deep branching tree | Play Map handles unlimited depth via scrollable tree view. Soft warning at depth 5+: "This play is getting complex. Players may find it hard to follow." |

### Player Side

| Scenario | Handling |
|---|---|
| Link opened but play is unpublished | "This play is no longer available." |
| Slow connection (>5s) | Skeleton loader. JSON (~2–5KB) loads first; Konva JS bundle in parallel. |
| Very complex play (many branches) | Ghost overlay shows all paths. Version tabs scroll horizontally. Play Map available via `[🗺]` if needed. |
| Player taps ghost line on canvas | Switches active branch — same as tapping the corresponding version tab. |
| "My Number" strip tap on unplaced player | Graceful no-op. Player #X not present in this play (e.g., substitutes). |

---

## 19. V2 Roadmap — Make It Perfect

### 19.1 AI Text-to-Pitch Engine

Coach speaks or types a natural-language prompt (e.g., "5m attacking lineout, 4-man, 12 crash off 10"). A provider-agnostic LLM API, constrained by a strict system prompt, outputs a valid Play JSON object. The Konva canvas auto-populates with all 15 players positioned, routes drawn, role labels assigned.

The Approach B gesture model is built for exactly this moment — the AI-generated canvas is protected by default (unselected players cannot be moved). The coach makes targeted corrections by tapping individual players.

### 19.2 Player Authentication (Magic Link)

Email-based passwordless auth for players. First access triggers the magic link gate. Persistent cookie for frictionless return. Builds the club's player database silently.

With player auth: the play auto-highlights the player's jersey number on open (auto-filtered view). They can tap others to explore.

### 19.3 Who's Green Accountability Dashboard

Coach roster view with traffic-light indicators (✅ viewed / ❌ not viewed) per play. Real-time updates via Supabase Realtime. "Send Reminder" button emails unviewed players. Requires player auth.

### 19.4 Auto-Set Opponents (Defensive Layer)

15 opponent dots auto-placed using template-matched defaults + LLM adjustment based on the attacking formation. Rendered as red hollow circles. Fully editable. Togglable defensive layer.

### 19.5 Club Branding & Beautification

Club badge, team colors applied to canvas accents, player dots, UI. Branded share links.

### 19.6 Offline / Touchline Mode

Service worker caches JSON payloads (enabled by PWA foundation in V1). Cache-first for play data. Pre-caches all published plays on coach auth.

### 19.7 Team Management

Player roster (name, position, jersey number, email), profiles, multiple squads (1st XV, 2nd XV, U20s). Canvas dots linkable to real players from roster.

### 19.8 Additional V2 Features

- Animation speed control (0.5x / 1x / 2x) for players
- Play analytics (branch selection heatmaps, replay counts, time per phase)
- Export to static image (PNG/SVG of any phase)
- Play versioning (each publish creates a snapshot)
- Undo/redo in Creator Studio (Konva supports this natively via state snapshots)
- Freemium gating (3 free published plays, Stripe integration for unlimited)
- Team playbook library (folders, tags, search, archive, season organisation)

---

## 20. Implementation Checkpoints

V1 broken into self-contained, testable checkpoints. Each has a clear deliverable.

### Checkpoint 1 — Supabase Foundation
- Supabase project created
- All tables migrated (`workspaces`, `coaches`, `plays`, `blocks`, `categories`)
- RLS policies applied and tested
- Email/password auth working (coach can sign up, log in, session persists)
- Workspace auto-created on first coach signup
- Invite flow: existing coach invites another by email

### Checkpoint 2 — Data Layer + Templates
- Play JSON CRUD via Supabase JS client (create, read, update, delete)
- Play JSON validation function (schema compliance check including phase name requirement)
- Slug generation + uniqueness check
- Seed `blocks` table with all 20 system templates
- Block CRUD for custom blocks

### Checkpoint 3 — Canvas Engine: Static Rendering (React + Konva)
- React + Vite project scaffolded with Konva.js and shadcn/ui
- PWA manifest + service worker configured
- Four-layer Konva canvas: Pitch / Routes / Nodes / Annotations
- Reads a Play JSON and renders all 15 attacking dots for Phase 1
- Pitch markings rendered at correct coordinates
- Zoom (scroll-wheel + pinch) and pan (drag on empty space) working

### Checkpoint 4 — Canvas Engine: Animation
- Nodes animate from start to end over `duration_ms` with ease-in-out (Konva Tween)
- Curved path support (Bézier interpolation through `path_points`)
- Blue running lines trace player movement
- Orange dashed pass lines animate between passer/receiver
- Annotations render at X/Y with fade-in
- Scrubber: play/pause, seek, skip between phases
- Ghost positions (previous phase end outlines) at 20% opacity

### Checkpoint 5 — Ghost Overlay Branching (Canvas)
- When play has branches, all branch paths render simultaneously
- Active branch: 100% opacity. Inactive branches: 30–40% opacity
- Role labels visible on ghost paths at reduced opacity
- Tapping a ghost line switches active branch
- "Choose Your Own Adventure" pause at Decision Node: animation pauses, branch buttons render over lower canvas

### Checkpoint 6 — Creator Studio: Approach B Gesture Model
- Player-first selection: tap a dot → selection ring, Properties Panel populates
- Tap empty space → deselects
- Centre drag → move player + auto-draw straight running line
- Edge drag → freehand path (tablet: Bézier smooth on release; desktop: curve preset picker via right-click/quick menu)
- Pass gesture: Shift+drag desktop / Pass button tablet → pass line between two dots
- Desktop cursor states: pointer / move / crosshair / grab / grabbing
- Annotation placement (click empty canvas → inline text input)

### Checkpoint 7 — Creator Studio: Timeline Bar + Play Map
- Active Path Timeline Bar with phase pills, `◆N` branch indicators, inline branch picker
- Phase naming: required field prompted inline when phase is added
- `[+ Branch]` creates 2–3 child phases with name prompts
- `[+ Phase]` adds sequential next phase with name prompt
- `D` hotkey on selected player creates branch
- Phase switching: click phase pill → canvas updates
- `[🗺]` Play Map: bottom sheet (iPad) / floating panel (laptop) with full tree diagram, tappable nodes

### Checkpoint 8 — Block Library + Composable Chaining
- Block Library sidebar with accordion sections (Set Piece / Strike Move / My Blocks)
- Click template → populates Phase 1
- "What happens next?" prompt after Phase 1
- Pull blocks from library to attach as next phase
- Auto-mapping of end positions → start positions when chaining
- Save custom blocks from any phase → "My Blocks"

### Checkpoint 9 — Player View (iPad + Laptop + iPhone)
- Player view pages: Playbook Home (chapter list) + Play View
- iPad portrait layout at full pixel budget (802×560 canvas, no scroll)
- Laptop centred card layout (700×490 canvas)
- iPhone portrait graceful degradation
- Tap-to-filter: post-animation pulse (once) + hover states (laptop) + My Number strip (iPad)
- Player-specific highlight/dim with `[All]` restore
- Version tabs + branch button "Choose Your Own Adventure" pause

### Checkpoint 10 — Publish, Share & My Plays Polish
- Publish validation (all rules including phase naming check)
- Slug generation + publish toggle
- Share dialog: URL copy, WhatsApp deep link, QR code
- Preview mode in Creator Studio (phone-viewport and iPad-viewport toggle)
- Unpublish flow
- My Plays home screen: play cards with code word, tag, status, branch count, last edited
- New Play / Edit / Duplicate / Delete flows
- Auto-save (10s interval) in Creator Studio
- Cross-browser testing (Safari iOS, Chrome Android, Chrome Desktop, Safari macOS)
- Performance: first paint < 2s on 4G; Konva canvas interactive < 1s after JSON load
- Full edge case handling from Section 18
- Coach invite flow tested end-to-end

---

## Appendix A: Position Number Mapping

| # | Position | Group |
|---|---|---|
| 1 | Loosehead Prop | Forward |
| 2 | Hooker | Forward |
| 3 | Tighthead Prop | Forward |
| 4 | Lock | Forward |
| 5 | Lock | Forward |
| 6 | Blindside Flanker | Forward |
| 7 | Openside Flanker | Forward |
| 8 | Number 8 | Forward |
| 9 | Scrum Half | Back |
| 10 | Flyhalf | Back |
| 11 | Left Wing | Back |
| 12 | Inside Centre | Back |
| 13 | Outside Centre | Back |
| 14 | Right Wing | Back |
| 15 | Fullback | Back |

## Appendix B: Curve Preset Library (Desktop)

| Preset ID | Name | Description | Typical Use |
|---|---|---|---|
| `inside_shoulder_cut` | ⌒ Inside Shoulder Cut | Arcs into the inside shoulder of the defender | 12 Crash, 13 Cut |
| `flat_channel` | → Flat Channel Run | Straight horizontal run along a channel | Support runner, Winger flat |
| `diagonal_support` | ↗ Diagonal Support Line | Diagonal angle toward the breakdown | Flanker support, 8 carry |
| `loop` | ↺ Loop (Support Behind) | Arc behind the ball carrier to receive return pass | First receiver loop, 10 loop |
| `wide_channel` | ↘ Wide Channel | Diagonal run to the wide channel | 14 run, Skip-pass receiver |

## Appendix C: Glossary

- **Block:** A reusable building unit = one phase + its immediate branches.
- **Set Piece Block:** Represents how you win the ball (lineout, scrum, kickoff formation).
- **Strike Move Block:** Represents what you do with the ball after winning it.
- **Phase:** A discrete time segment where players move from start to end positions.
- **Phase Name:** Required short label (max 20 chars) identifying each phase. Used in Timeline Bar, Play Map, and player-facing branch buttons.
- **Branch / Branch Point:** A decision point where the play forks into 2–3 alternative outcomes.
- **Ghost Overlay:** All branch paths rendered simultaneously — active branch at 100% opacity, inactive branches at 30–40% opacity. Default canvas state at any branch point.
- **Choose Your Own Adventure:** The player-facing moment at a Decision Node — animation pauses, branch buttons appear, player chooses their path.
- **Decision Node:** The moment in a play's timeline where a branch point occurs.
- **Terminal Phase:** A phase with no further branches (play ends on this path).
- **Approach B / Player-First Editing:** The gesture model where a player dot must be selected before any canvas modification is possible. Protects unselected content.
- **Play Map:** The full decision tree view, accessible via `[🗺]` in the Timeline Bar.
- **Active Path:** The currently selected root-to-terminal sequence shown in the Timeline Bar.
- **My Number Strip:** The persistent `[1][2]...[15][All]` row on iPad player view for tap-to-filter access.
- **Node:** A single player represented as a numbered dot on the canvas.
- **Slug:** A 6-character alphanumeric string used in the play's public URL.
- **Play JSON:** The single JSON object describing an entire play's structure, positions, and branching logic.
- **Workspace:** The shared environment where all coaches on a team see the same plays and blocks.

---

*End of ARM15 Master Specification v3.0 — Updated 2026-05-14*
