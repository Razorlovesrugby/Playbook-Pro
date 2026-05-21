# ARM15 Interactive Playbook — Agent Constitution

## Identity
ARM15 animates rugby coaching playbooks. It takes the PDF playbook coaches already make
(Belsize Park RFC Toolbox benchmark) and layers on animation, player-specific views,
and shared URLs. Same visual language — code words, numbered dots, role labels,
running lines, chapter structure — now moving.

**North Star**: The dots move. The player taps their number. Everything else dims.

## Unbreakable UX Rules (All Agents)

1. **iPad-first layout**. iPad portrait canvas is 802×560px, above the fold.
   No scroll required for player study view. Build for iPad, degrade to phone.
2. **No modals**. No popups, no dialogs, no overlays. Ever.
   Tap-to-filter discoverability uses post-animation pulse + hover states + My Number strip.
3. **Approach B gestures**. Nothing moves until the coach selects a player.
   - Tap dot → select (selection ring, Properties panel populates)
   - Drag centre → move, straight line auto-draws
   - Drag edge → freehand (Bézier on tablet, curve presets on desktop)
   - Shift+drag/Press Pass → pass line to another dot
   - Tap empty → deselect, browse/pan mode
   - Unselected dots are immovable. No mode toggle.
4. **Ghost overlay branching**. All branch paths render simultaneously.
   Active 100%, inactive 30-40%. Tap ghost → switch active branch.
5. **Timeline bar** shows one clean Active Path with ◆2/◆3 branch indicators
   and a [🗺] Play Map button (bottom sheet on iPad, floating panel on laptop).
6. **Every phase requires a short name (max 20 chars)** — required, validated on publish.

## Tech Stack (Fixed)
- **UI**: React + Vite + shadcn/ui + Tailwind
- **Canvas**: Konva.js (react-konva) — hit detection, touch/pinch, Tween engine
- **Backend**: Supabase (Postgres, RLS, email/password auth, Edge Functions)
- **Deploy**: Vercel or Netlify (static + CDN)
- **PWA**: manifest + service worker (Add to Home Screen for iOS)
- **Language**: TypeScript, strict mode. No `any` without explicit justification.

## Domain Structure
```
src/
  canvas/          # Konva stage, layers, animation engine, gesture system
  studio/          # Creator Studio: sidebar, canvas, properties panel
  player/          # Player study view, tap-to-filter, decision nodes
  playbook/        # Play CRUD, templates, publish, share
  auth/            # Supabase auth, workspace
  shared/          # shadcn/ui wrappers, hooks, types, utils
  pwa/             # Service worker, manifest, offline cache
```

## Agent Coordination (Who Does What)
- **You (Hermes)** — Plan, review, orchestrate. Never write source code.
- **code-reviewer subagent** — TypeScript, React, Konva patterns, test coverage.
- **ux-auditor subagent** — iPad-first, gesture model, animation, no-modals rule.
- **accessibility-agent subagent** — WCAG 2.2 AA, keyboard nav, screen reader.
- **supabase-agent subagent** — DB schema, migrations, RLS, edge functions.

Before any implementation task, load relevant skills with skill_view().
After any code change, run the ux-auditor agent. After any DB change, run supabase-agent.

## Code Quality Gates (Must Pass Before Merge)
1. `npm run lint` zero errors
2. `npm run typecheck` — TypeScript strict, no escape hatches
3. No component exceeds 300 lines — extract subcomponents
4. Every Konva shape has accessible `name` and `id` props
5. Every async Supabase call has error handling
6. No modals. Not one.

## V1 vs V2 Scope
**V1 (Ship This)**: Coach auth, shared workspace, My Plays, Creator Studio (Approach B),
20 starter templates, block chaining, multi-phase branching (ghost overlay),
Active Path Timeline + Play Map, publish to URL, WhatsApp share + QR,
player view with animation + tap-to-filter.

**V2 (Deferred)**: AI Text-to-Pitch, player magic link auth, Who's Green dashboard,
offline/touchline mode, auto-set opponents, club branding, team management,
freemium/payments, play analytics, undo/redo, export image, versioning.

## Manifesto Compliance
This project follows the Agile Vibe Coding Manifesto (Agile Vibe Coding Manifesto.pdf).
Every change has traceable intent (docs/phase-specs/). Domain structure is discoverable.
Generated code is reviewable by the ux-auditor and code-reviewer subagents.
Architecture (.claude/) guides and constrains all generation.
