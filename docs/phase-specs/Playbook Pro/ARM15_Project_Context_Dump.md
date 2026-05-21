# ARM15 Interactive Playbook — Full Project Context Dump
*Use this as a system prompt or opening context block when starting a new AI chat on this project.*

---

## WHO WE ARE

**Project:** ARM15 Interactive Playbook  
**Stack:** WeWeb (frontend canvas) + Supabase (backend/auth/DB) + Custom HTML5 Canvas JS  
**Stage:** V1 POC — spec complete (Master Spec v2.1), moving into build  
**Date of this dump:** 2026-05-14

---

## WHAT WE'RE BUILDING

A web-based, animated, interactive 2D tactical whiteboard for **15-a-side Rugby Union only**. It replaces the static PDF playbook that grassroots rugby coaches currently distribute (e.g., Belsize Park RFC's 27-page "Toolbox"). Same visual language as the PDF — numbered dots, arrows, code words, role labels, chapter structure — but the dots move.

**The core rule:** We do NOT render or save video files. All play data is mathematical JSON (X/Y coordinates, 0–100 grid). The frontend animates locally on the device. Server costs near zero.

---

## THE 5 VALUE-ADDS OVER A PDF

1. **Animation** — dots actually move so players see timing/sequencing, not just overlapping positions
2. **Player-specific view** — tap your jersey number, everyone else dims, your path highlights
3. **Accountability tracking** — (V2) "Who's Green" dashboard showing who has viewed each play
4. **Instant distribution, always current** — one link, always latest version, no re-sending
5. **AI-powered creation** — (V2) coach types plain English, AI generates the diagram

---

## TECHNICAL CONSTRAINTS (HARD RULES)

- **Strictly 15-a-side locked.** 15 attacking nodes, up to 15 defensive nodes. No 7s, no League.
- **X/Y grid: 0–100 on both axes.** Origin (0,0) = top-left (left touchline at attacking try line). X = left→right touchline. Y = attacking try line → own end.
- **No linear animations only.** Every play must support branching (a pause where user selects Option A or B).
- **No video. No image generation. No server-side rendering.** JSON → canvas → local animation.
- **Low-code feasible.** All UI and backend logic must be achievable in WeWeb + Supabase (no custom infra).
- **Zero-friction player access.** Players never download an app. V1 = open URL (no auth). V2 = magic link.

---

## V1 SCOPE — WHAT WE'RE SHIPPING

### Coach Side
- Email/password auth via Supabase
- Multi-user shared workspace (individual logins, shared plays, activity trail)
- "My Plays" home screen (play cards: code word + category tag + status + last edited)
- **Creator Studio:** dark tactical canvas, pitch-first layout, slim bottom toolbar
- Code word as a required first-class field (biggest text everywhere)
- Role labels on key players (free text: Ball, Crash, Bang, Boot — or anything coach defines)
- Three gesture input modes: drag to move (straight line), long-press for freehand (curved), Shift+drag for pass
- 20 system templates (12 set piece blocks + 8 strike move blocks)
- Custom block saving (any phase + its branches → saved to "My Blocks")
- Composable block chaining (set piece → strike move, end positions auto-map to next start positions)
- Multi-phase branching: unlimited depth, 2–3 options per branch point
- Three branch comparison modes: tab switching, side-by-side split, ghost overlay
- Chapter/category organization — coach assigns plays to chapters
- Publish: open URL with 6-char slug, WhatsApp deep link, QR code
- Auto-save every 10 seconds

### Player Side
- Playbook home: chapters organized by category, code words as hero text
- Play view: code word dominant, animated canvas, role labels on key players
- **Player-specific view (tap to filter):** tap any jersey number → their path highlights, everyone else dims to ~20%
- Version tabs below pitch for branch options
- Animation: ~2–3s per phase, ease-in-out, scrubber with play/pause + seek
- Portrait mobile-first (375px primary), responsive to tablet

### Visual Language (must match the PDF)
| Element | Style |
|---|---|
| Key players (with role labels) | Red/accent numbered circles |
| Supporting players | White numbered circles |
| Defenders | Blue/grey squares labeled "D" |
| Running lines | Blue solid lines, animate as moving trail |
| Pass lines | Orange dashed lines, animate as moving dash |
| Role labels | Small text floating below player dot |
| Code word | Largest text on every screen |
| Chapter headings | Category/chapter text above play groups |

---

## V1 OUT OF SCOPE (V2)

Player auth (magic link), auto-filtered player view, Who's Green dashboard, offline/touchline mode, AI text-to-pitch engine, auto-set opponents, club branding, team management, freemium gating, play analytics, speed control, export to image, play versioning, undo/redo.

---

## TECH STACK

| Layer | Tech | Notes |
|---|---|---|
| Frontend | WeWeb | Visual builder, outputs web-native. Strong Supabase integration. |
| Canvas | Custom HTML5 Canvas JS | Embedded as a JS component inside WeWeb pages |
| Backend/Auth/DB | Supabase | Postgres + RLS + email/password auth + Edge Functions |
| Hosting | WeWeb Deploy + Supabase | Static frontend on WeWeb, API/DB on Supabase |

---

## DATA FLOW — THE GOLDEN RULE

```
Coach builds play  →  Play JSON saved to Supabase
Coach publishes    →  Unique 6-char slug generated, points to Play JSON
Player opens link  →  Play JSON fetched, canvas animates locally
```

Everything produces or consumes one thing: **a Play JSON object.**

---

## KEY DATA SCHEMAS

### Play JSON (top-level structure)
```json
{
  "play_id": "uuid",
  "version": 1,
  "metadata": {
    "code_word": "CHAINSAW",
    "name": "Attack off First Receiver — Chainsaw",
    "description": "Ball fixes inside shoulder, Crash splits, Bang attacks.",
    "category": "Attack off first receiver",
    "created_by": "coach_uuid",
    "workspace_id": "workspace_uuid",
    "published": true,
    "publish_slug": "8f7a9b"
  },
  "canvas": {
    "width": 100,
    "height": 100,
    "pitch_markings": {
      "try_line_y": 0, "five_m_y": 5, "ten_m_y": 10,
      "twenty_two_y": 22, "halfway_y": 50,
      "five_m_x": [5, 95], "fifteen_m_x": [15, 85]
    }
  },
  "phases": [
    {
      "phase_id": "phase_1",
      "label": "5m Lineout — 4-Man",
      "duration_ms": 2500,
      "parent_branch_id": null,
      "source_block_id": "lineout_5m_4man",
      "nodes": {
        "attacking": [ /* 15 node objects — see Node Schema */ ]
      },
      "annotations": [{ "text": "4-man lineout", "x": 10, "y": 2 }],
      "branches": [
        { "branch_id": "branch_1a", "label": "Option A — 12 Crash", "next_phase_id": "phase_2a" },
        { "branch_id": "branch_1b", "label": "Option B — 13 Sweep", "next_phase_id": "phase_2b" }
      ]
    }
  ]
}
```

### Node Schema (one player, one phase)
| Field | Type | Description |
|---|---|---|
| `player_number` | int 1–15 | Jersey number |
| `position_name` | string | Auto-set from number |
| `role_label` | string or null | Coach-assigned role ("Ball", "Crash"). Null = supporting player. |
| `is_key_player` | boolean | Derived: role_label != null. Controls dot color. |
| `start_x`, `start_y` | float 0–100 | Position at start of phase |
| `end_x`, `end_y` | float 0–100 | Position at end of phase |
| `path_type` | enum | `static`, `linear`, `curved` |
| `path_points` | array {x,y} | Bezier waypoints for curved paths |
| `actions` | array | `carry`, `pass`, `receive`, `kick`, `ruck`, `dummy_run`, `support_line`, `throw`, `jump`, `lift` |

### Branching Rules
- Phase 1 is always root (`parent_branch_id` = null)
- A phase has 0 branches (terminal), 2 branches, or 3 branches. Never 1.
- No hard depth limit.
- Each child phase inherits parent's end positions as its start positions.

---

## SUPABASE TABLES

```sql
-- workspaces: one per coaching team
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- coaches: linked to Supabase auth
CREATE TABLE coaches (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  workspace_id UUID REFERENCES workspaces(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- plays: the core content table
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

-- categories: coach-defined chapters
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- blocks: system templates + custom coach blocks
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),  -- NULL for system templates
  name TEXT NOT NULL,
  category TEXT NOT NULL,       -- 'set_piece' or 'strike_move'
  subcategory TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  block_json JSONB NOT NULL,
  created_by UUID REFERENCES coaches(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies
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

-- Published plays readable by ANYONE (no auth)
CREATE POLICY public_published_plays ON plays
  FOR SELECT USING (published = true);
```

---

## THE 20 SYSTEM BLOCK TEMPLATES

### Set Piece Blocks (12)
| ID | Name |
|---|---|
| `lineout_5m_4man` | 5m Lineout — 4-Man |
| `lineout_5m_6man` | 5m Lineout — 6-Man |
| `lineout_22m_4man` | 22m Lineout — 4-Man |
| `lineout_22m_maul` | 22m Lineout — Driving Maul |
| `lineout_halfway` | Halfway Lineout |
| `scrum_5m_left` | 5m Scrum — Left |
| `scrum_5m_right` | 5m Scrum — Right |
| `scrum_22m_centre` | 22m Scrum — Centre |
| `scrum_halfway` | Halfway Scrum |
| `kickoff_receive_deep` | Receive Kick-Off — Deep |
| `kickoff_receive_short` | Receive Kick-Off — Short |
| `kickoff_own` | Own Kick-Off |

### Strike Move Blocks (8)
| ID | Name |
|---|---|
| `strike_12_crash` | 12 Crash |
| `strike_13_sweep` | 13 Sweep |
| `strike_pod_left` | Pod Attack — Left |
| `strike_pod_right` | Pod Attack — Right |
| `strike_backs_move` | Backs Move |
| `strike_miss_pass` | Miss Pass to 13 |
| `strike_loop_play` | First Receiver Loop |
| `strike_kick_chase` | Cross-Kick & Chase |

---

## POSITION NUMBER MAPPING (1–15)

1 Loosehead Prop, 2 Hooker, 3 Tighthead Prop, 4 Lock, 5 Lock, 6 Blindside Flanker, 7 Openside Flanker, 8 Number 8, 9 Scrum Half, 10 Flyhalf, 11 Left Wing, 12 Inside Centre, 13 Outside Centre, 14 Right Wing, 15 Fullback

---

## BUILD PLAN — 10 CHECKPOINTS

| # | Checkpoint | Key Deliverable |
|---|---|---|
| 1 | Supabase Foundation | Tables, RLS, auth, workspace auto-create, invite flow |
| 2 | Data Layer + Templates | Play JSON CRUD, slug gen, seed 20 system blocks |
| 3 | Canvas: Static Rendering | Dark pitch + 15 dots from JSON, zoom/pan |
| 4 | Canvas: Animation | Node movement, pass lines, scrubber, phases |
| 5 | Creator Studio: Basic Builder | Drag/freehand/pass input, properties panel, save draft |
| 6 | Composable Blocks + Chaining | Block library, auto-map positions, custom block saving |
| 7 | Branching System | Branch creation, timeline tree, 3 comparison modes |
| 8 | Player Mobile View | 375px player view, animation, version tabs, tap-to-filter |
| 9 | Publish & Share | Validation, slug, share dialog, WhatsApp link, QR |
| 10 | My Plays Home + Polish + QA | Home screen, auto-save, cross-browser, performance |

---

## V2 ROADMAP (NOT BUILDING YET)

- **Auto-set opponents:** AI-adjusted defensive layer, 15 red hollow circles, draggable
- **AI text-to-pitch:** coach describes play in English → LLM outputs valid Play JSON
- **Club branding:** badge upload, team colors, branded share links
- **Team management:** player roster, multiple squads, dot-to-real-player linking
- **Player auth:** email magic link, persistent cookie, no app download
- **Who's Green:** traffic-light accountability dashboard per play per player
- **Offline/touchline mode:** service worker cache, sync on reconnect
- **Speed control, analytics, versioning, export, undo/redo, freemium gating**

---

## GLOSSARY

- **Block:** One phase + its immediate branches. Reusable building atom.
- **Set Piece Block:** How you win the ball (lineout, scrum, kickoff).
- **Strike Move Block:** What you do with the ball.
- **Phase:** One time segment where players move start→end.
- **Branch:** A decision fork where the play splits into 2–3 options.
- **Terminal Phase:** A phase with no further branches (play ends here).
- **Node:** A single player — a numbered dot on the canvas.
- **Slug:** 6-char alphanumeric string in the public URL.
- **Ghost Outline:** Faint previous-phase end positions shown as spatial context.
- **Play JSON:** The single JSON object describing the entire play — positions, paths, branches.
- **Workspace:** Shared environment where all coaches on a team see the same plays and blocks.
- **Code Word:** The play's name as called on the pitch (SAW, CHAINSAW, JEFF). Required field. Always the biggest text on screen.
- **Role Label:** Short tag assigned to key players in a specific play (Ball, Crash, Bang, Boot). Free text, per-phase, 3–5 players per play.

---

*ARM15 Master Spec v2.1 — Context dump generated 2026-05-14*
