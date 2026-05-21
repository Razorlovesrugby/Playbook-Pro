# Playbook — Agent Constitution

## Identity

Playbook is a web-based animated rugby play builder and shared library.
It is a feature-for-feature rebuild of Rugby Everest (rugbyeverest.app)
using React + Konva.js + Supabase. Everything is free — no paywalls.

Coaches draw plays on a tactical canvas, animate them step-by-step, and share
them with players via a link. Players watch in their browser — no app, no login.

**North Star**: JSON is the truth. Rugby Everest parity first.
One Play JSON object drives the editor, the viewer, and the share link.

## Five Unbreakable Rules (All Agents)

1. **No video files.** All play data is JSON. The canvas animates locally.
   No server-side rendering. No MP4s. Math only.

2. **No auth to view.** Any play URL works for anonymous viewers.
   `/moves/{slug}` and `/team/{team-slug}` are public. No login wall.

3. **Mobile-first viewer.** Coaches edit on desktop. Players watch on phone.
   Viewer must be fully usable on a 375px-wide screen with touch.

4. **JSON is the truth.** One Play JSON object in a Supabase JSONB column
   (`plays.play_data`) drives everything — editor state, viewer rendering,
   animation, share link. See Module 01 for the schema.

5. **Rugby Everest parity first.** Match every visible feature of
   rugbyeverest.app before adding anything new. V2 differentiators
   (branching, ghost overlay, AI, code words) are deferred.

## Tech Stack (Fixed)

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Framework   | React 18 + Vite                                      |
| Canvas      | Konva.js + react-konva                               |
| UI          | shadcn/ui + Tailwind CSS                             |
| Backend/DB  | Supabase (Postgres, RLS, Magic Link, Edge Functions) |
| Deployment  | Vercel                                                |
| Language    | TypeScript, strict mode. No `any` without comment.   |

## Domain Structure

```
src/
  canvas/          # PlaybookCanvas, coordinate mapping, 4-layer Konva setup
  animation/       # Animation engine: tweens, Overview mode, Step by Step
  viewer/          # Play viewer page (/moves/:slug), controls, info panels
  editor/          # Play editor (/editor), draw tools, templates, step tabs
  library/         # Play library (/moves), filter bar, card grid, search
  auth/            # Supabase magic link, session, callback
  teams/           # Team dashboard (coach) + team playbook (player)
  shared/          # shadcn/ui wrappers, hooks, types, Play JSON types, utils
```

## Module Map & Build Order

Build in this sequence. Each module depends on the ones above it.

```
01 DataSchema     ← build first. Everything depends on this.
02 CanvasCore     ← Konva foundation: pitch, players, lines, annotations.
03 AnimationEngine ← depends on CanvasCore. Tweens, Overview, Step by Step.
07 Auth           ← Supabase magic link. No dependencies on Canvas.
04 PlayViewer     ← depends on AnimationEngine + Auth.
05 PlayEditor     ← depends on CanvasCore + Auth + DataSchema.
06 PlayLibrary    ← depends on PlayViewer + DataSchema.
08 TeamDashboard  ← depends on Auth + PlayViewer.
10 EdgeCases      ← cross-cutting: implement inline as you build each module.
```

Full specs: `docs/phase-specs/Playbook Pro/PLAYBOOK_SPEC_00_Overview.md`
through `PLAYBOOK_SPEC_10_EdgeCases.md`. Read the relevant spec before
building any module.

## V1 Scope (Ship This)

- [ ] Public play library with difficulty + category filters
- [ ] Play viewer: Overview (auto-play) + Step by Step (manual)
- [ ] Playback speed: 0.5x / 1x / 2x
- [ ] 3-option colour system: Option 1 Yellow, Option 2 Blue, Option 3 Orange
- [ ] Option card filtering in Step by Step mode
- [ ] Play editor with all draw tools (Run, Pass, Arrow, Circle, Text, Target, Eraser)
- [ ] Field zone selector (Full Field, Opp 22, Opp Half, Own Half, Own 22, Lineout L/R)
- [ ] Templates (Scrum L/C/R, Lineout L/R, Kickoffs, 22m Drop, Blank)
- [ ] Magic link auth only — no passwords, no Google, no OAuth
- [ ] Save plays to My Plays (private by default)
- [ ] Shareable public URLs (no auth to view)
- [ ] Team dashboard + publish to team playbook
- [ ] No paywalls. No pricing tiers. Everything is free for everyone.
- [ ] 6 seeded library plays across categories

## V2 Scope (ARM15 Differentiators — Do NOT Build in V1)

- True branching nodes (fork in timeline, player picks A or B)
- Ghost overlay (all branch paths simultaneously at opacity)
- AI play generation (LLM → Play JSON)
- Choose Your Own Adventure player view
- Who's Green accountability dashboard
- Code words / role labels on canvas
- Composable block system
- Offline / PWA mode
- Play analytics

## Core Design Rules (from specs)

- **No branching in V1.** Steps are linear: Step 1 → Step 2 → Step 3.
- **Up to 3 colour-coded Options per step.** All options visible simultaneously.
  Option 1 (Yellow #F5C518), Option 2 (Blue #4A90D9), Option 3 (Orange #FF8C00).
- **Canvas coordinate system:** 0–100 grid on both axes. Zone viewport clips.
  All play data uses 0–100 coordinates regardless of active field zone.
- **4 Konva layers** (bottom→top): Pitch, Lines, Nodes, Annotations.
  Only the Node layer has hit detection enabled.
- **Animation model:** Players animate along their Option 1 lines from step to step.
  Overview auto-plays all steps sequentially. Step by Step advances manually.
- **Responsive canvas:** Fills container, maintains zone-specific aspect ratio.
  Mobile viewer stacks controls vertically. Desktop shows side-by-side layout.
- **Dark theme throughout:** pitch background #0a0f1a, white pitch markings at 35% opacity.

## Visual Specs Reference

| Element           | Visual                                          |
|-------------------|-------------------------------------------------|
| Pitch background  | #0a0f1a (dark navy)                             |
| Attack player     | Grey circle (#6B7280), jersey number, white     |
| Defence player    | Red circle (#EF4444), number/'D', white         |
| Ball carrier      | Yellow oval (#F5C518), jersey number, dark      |
| Run line (solid)  | 2.5px arrow, colour by option                   |
| Pass line (dashed)| 2.5px arrow, dash [8,5], colour by option       |
| Option 1 colour   | #F5C518 (Yellow)                                |
| Option 2 colour   | #4A90D9 (Blue)                                  |
| Option 3 colour   | #FF8C00 (Orange)                                |

## Agent Coordination (Who Does What)

- **You (Hermes)** — Plan, review, orchestrate. Never write source code.
  Delegate all implementation to subagents.
- **code-reviewer** — TypeScript, React, Konva patterns, test coverage.
- **ux-auditor** — Mobile-first viewer, canvas UX, touch targets ≥44px, animation smoothness.
- **accessibility-agent** — WCAG 2.2 AA, keyboard nav, screen reader, colour contrast.
- **supabase-agent** — DB schema, migrations, RLS, edge functions.

Before any implementation task, run `skill_view()` on the relevant skill.
After any code change, run the ux-auditor. After any DB change, run supabase-agent.

## Code Quality Gates (Must Pass Before Merge)

1. `npm run lint` — zero errors
2. `npm run typecheck` — TypeScript strict, no escape hatches
3. No component exceeds 300 lines — extract subcomponents
4. Every Konva shape has `name` and `id` props
5. Every async Supabase call has error handling (try/catch + error toast)
6. Play JSON validated before every Supabase insert (see Module 10 validator)
7. All canvas touch containers use `touchAction: 'none'` to prevent scroll
8. All interactive elements on mobile ≥ 44×44px tap target
9. Skeleton loaders on every data-fetching component
10. CanvasErrorBoundary wraps every canvas instance

## Repository URLs

| Environment | URL                                              |
|-------------|--------------------------------------------------|
| Production  | https://playbook.app (planned)                   |
| GitHub      | https://github.com/Razorlovesrugby/Playbook-Pro  |

## Manifesto Compliance

This project follows the Agile Vibe Coding Manifesto (`Agile Vibe Coding Manifesto.pdf`).
Every change has traceable intent in `docs/phase-specs/`. Domain structure is discoverable.
Generated code is reviewable by subagents. Architecture (`.claude/`) guides all generation.
