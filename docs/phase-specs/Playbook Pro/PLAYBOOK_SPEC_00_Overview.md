# PLAYBOOK — Module 00: Product Overview

**Product:** Playbook
**Module:** Overview (context only — no code)
**Version:** 1.0
**Status:** Reference — read before building any other module

---

## What Is Playbook?

Playbook is a web-based animated rugby play builder and shared library. Coaches draw rugby plays on a tactical canvas, animate them step-by-step, and share them with players via a link. Players watch the animation in their browser — no app download required.

It is a direct feature parity build of Rugby Everest (rugbyeverest.app), using a different tech stack and auth model.

---

## Two Types of User

### Coach
- Creates plays in the editor
- Saves plays to My Plays (private by default)
- Publishes plays to their team's shared playbook
- Manages team access
- Requires auth (magic link)
- Primary device: desktop or laptop

### Player
- Watches plays via a shared link
- Never needs an account
- Primary device: mobile phone

---

## Core Concepts

### Play
A rugby play. Has a title, difficulty level, category, and a sequence of Steps. A play can be private (My Plays), published to a team, or listed in the public library.

### Step
A single moment in the play. Each step has:
- A snapshot of where all players are standing at the start of that moment
- Lines showing what runs and passes happen during this step (up to 3 colour-coded Options)
- A text description (optional)

Steps are linear — step 1 → step 2 → step 3. There is no branching (branching is a V2 feature).

### Option
Within a single step, there can be up to 3 alternative scenarios — what the play does depending on how the defence reacts. These are called Options and are colour-coded:

| Option | Colour | Meaning |
|---|---|---|
| Option 1 | Yellow | The default plan — how the play is meant to run |
| Option 2 | Blue | Alternative if the defence shifts |
| Option 3 | Orange | Third read / further alternative |

All options are visible on the canvas simultaneously. In Step by Step mode, tapping an option card highlights those lines and dims the others.

### Line
A line drawn on the canvas showing either a run (solid) or a pass (dashed). Every line belongs to an option (1, 2, or 3). Lines have a start point (a player), an end point (a position or another player), and a line type.

### Player Node
A circle representing a player on the canvas. Attack players are grey circles with a jersey number. Defence players are red circles. The ball carrier is shown as a yellow oval.

### Field Zone
A view window onto the pitch. Coaches select a zone to zoom in on the relevant part of the field (e.g., Opp 22 for a finishing play, Full Field to show kick-offs).

| Zone | Description |
|---|---|
| Full Field | Entire 100×100 pitch |
| Opp 22 | Opposition 22m area |
| Opp Half | Opposition half |
| Own Half | Own half |
| Own 22 | Own 22m area |
| Lineout L | Left lineout area |
| Lineout R | Right lineout area |

---

## Coordinate System

The pitch is a normalised 0–100 grid on both axes.

```
(0,0) ─────────────── (100,0)
  │    LEFT TOUCHLINE       │
  │    ←──── X ────→        │
  │    ↑                    │
  │    Y                    │
  │    ↓                    │
  │                         │
(0,100) ──────────── (100,100)
```

- X = 0 (left touchline) → 100 (right touchline)
- Y = 0 (attacking try line) → 100 (own end)

Pitch markings at: Y=0 (try line), Y=5 (5m), Y=10 (10m), Y=22 (22m), Y=50 (halfway)
Touchline channels at: X=5, X=15, X=85, X=95

---

## Visual Language

| Element | Visual | Notes |
|---|---|---|
| Attack player | Grey filled circle, jersey number inside | Numbers 1–15 or custom |
| Defence player | Red filled circle | Placed manually by coach |
| Ball carrier | Yellow oval (elongated circle) | One per step |
| Run (Option 1) | Solid yellow line with arrowhead | #F5C518 |
| Pass (Option 1) | Dashed yellow line with arrowhead | #F5C518 |
| Run (Option 2) | Solid blue line with arrowhead | #4A90D9 |
| Pass (Option 2) | Dashed blue line with arrowhead | #4A90D9 |
| Run (Option 3) | Solid orange line with arrowhead | #FF8C00 |
| Pass (Option 3) | Dashed orange line with arrowhead | #FF8C00 |
| Pitch background | Dark navy | #0a0f1a |
| Pitch markings | White at 40% opacity | — |

---

## Data Flow

```
Coach opens editor
       │
       ▼
Draws players + lines per step
       │
       ▼
Play JSON saved to Supabase (plays table)
       │
       ├── Share: unique slug generated → public URL
       │          playbook.app/plays/{slug}
       │
       └── Publish to team: appears in team playbook
                   playbook.app/team/{team-slug}

Player opens link
       │
       ▼
Play JSON fetched from Supabase (no auth)
       │
       ▼
React-Konva canvas renders + animates locally
No video. No server-side rendering. Math only.
```

---

## The Play JSON (Top Level)

Everything in the product flows from this single object. Full schema in Module 01.

```json
{
  "play_id": "uuid",
  "title": "Out The Back Option",
  "slug": "out-the-back-option",
  "difficulty": "beginner",
  "category": "Attack Structure",
  "is_library_play": false,
  "field_zone": "opp_22",
  "info": {
    "what_is_it": "...",
    "when_to_use": "...",
    "why_it_works": "...",
    "key_positions": "...",
    "options_alternatives": "...",
    "common_mistakes": "..."
  },
  "steps": [ ... ]
}
```

---

## Page Map

| Route | Page | Auth |
|---|---|---|
| `/` | Home / landing | None |
| `/moves` | Play library | None |
| `/moves/{slug}` | Individual play viewer | None |
| `/editor` | Play editor (new play) | Optional (save requires auth) |
| `/editor/{play-id}` | Play editor (existing play) | Required (own play) |
| `/my-plays` | Saved plays | Required |
| `/team` | Team dashboard | Required |
| `/team/{team-slug}` | Team playbook (player view) | None |
| `/pricing` | Pricing page | None |
| `/tutorial` | How to use | None |
| `/auth` | Magic link auth | None |

---

## What This Module Is NOT

This module is a reference document. It does not contain buildable code. Every subsequent module references the concepts defined here.

Read this module first. Then build in the order specified in the Index.
