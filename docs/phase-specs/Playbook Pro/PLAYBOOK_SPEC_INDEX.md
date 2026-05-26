# Playbook — Master Spec Index

**Product:** Playbook
**Version:** 1.0
**Date:** 2026-05-21
**Last built:** 2026-05-25 (Spec 04)
**Status:** In Progress

---

## What This Is

Playbook is a web-based animated rugby play builder and library.
It is a feature-for-feature rebuild of Rugby Everest, using React + Konva + Supabase.
It is architecturally separate from ARM15. ARM15 differentiators (branching nodes, AI, ghost overlay) are V2.

---

## Module Map

| File | Module | Status | What the AI builds |
|---|---|---|---|
| `PLAYBOOK_SPEC_00_Overview.md` | Product Overview | ✅ Reference | Context, stack decisions, core concepts, user types |
| `PLAYBOOK_SPEC_01_DataSchema.md` | Data Schema | ✅ SQL written — awaiting manual deploy | Supabase tables, Play JSON, RLS policies, seeded library |
| `PLAYBOOK_SPEC_02_CanvasCore.md` | Canvas Core | ✅ Built | 4-layer Konva stage, pitch, nodes, lines, annotations, responsive |
| `PLAYBOOK_SPEC_03_AnimationEngine.md` | Animation Engine | ✅ Built | usePlayAnimation hook, AnimatedCanvas, SpeedControl, line draw, ball transfer |
| `PLAYBOOK_SPEC_04_PlayViewer.md` | Play Viewer | ✅ Built — needs Supabase to serve real plays | /moves/:slug page, both modes, controls, info panels, share |
| `PLAYBOOK_SPEC_05_PlayEditor.md` | Play Editor | ⏳ Next up | Editor page, all draw tools, templates, step management |
| `PLAYBOOK_SPEC_06_PlayLibrary.md` | Play Library | 🔜 Pending | Public library, filters, play cards, search |
| `PLAYBOOK_SPEC_07_Auth.md` | Auth & Share | 🔜 Pending | Magic link auth, public play URLs, save/share flow |
| `PLAYBOOK_SPEC_08_TeamDashboard.md` | Team Dashboard | 🔜 Pending | Team creation, playbook publishing, player access |
| `PLAYBOOK_SPEC_09_Pricing.md` | Pricing & Paywall | 🔜 Pending | Free/Team/Club tiers, Season Pass, Paddle integration |
| `PLAYBOOK_SPEC_10_EdgeCases.md` | Edge Cases | 🔜 Pending | All failure states, error handling, cross-cutting concerns |

---

## ⚠️ Manual Steps Required (You Must Do These)

These cannot be done by the AI — they require your accounts, credentials, or browser access.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `playbook-pro` (or similar)
3. Note your **Project URL** and **anon public key** from Project Settings → API

### 2. Run the Database Migrations

Option A — Supabase CLI (recommended):
```bash
cd /path/to/Playbook-Pro
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Option B — Supabase Dashboard SQL editor, paste files in order:
```
supabase/migrations/001_profiles.sql
supabase/migrations/002_plays.sql
supabase/migrations/003_teams.sql
supabase/migrations/004_slug_function.sql
supabase/migrations/005_rls_policies.sql
supabase/migrations/006_get_user_plan.sql
supabase/migrations/007_seed_library_plays.sql
```

After running migrations, the seeded library plays will be live and `/moves/:slug` will serve real data.

### 3. Create Your `.env` File

Copy `.env.example` to `.env.local` in the project root and fill in your values:
```bash
cp .env.example .env.local
```
Then edit `.env.local`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Deploy to Vercel (when ready)

1. Push the branch to GitHub (or merge to main)
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add the same env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel project settings
4. Deploy

---

## V1 Feature Parity (Rugby Everest Clone)

- [x] Play viewer: Overview (auto-play) + Step by Step (manual)
- [x] Playback speed: 0.5x / 1x / 2x
- [x] 3-option colour system per step (Yellow=Option 1, Blue=Option 2, Orange=Option 3)
- [x] Option card filtering in Step by Step mode
- [x] Shareable public URLs (no auth to view)
- [ ] Public play library with difficulty + category filters
- [ ] Play editor with all draw tools
- [ ] Field zone selector (Full Field, Opp 22, Opp Half, Own Half, Own 22, Lineout L/R)
- [ ] Templates (Scrum L/C/R, Lineout L/R, Kickoffs, 22m Drop, Blank)
- [ ] Magic link auth (no Google, no password)
- [ ] Save plays to My Plays
- [ ] Team dashboard + publish to team playbook
- [ ] Free / Team / Club pricing tiers
- [ ] Season Pass model (pay 8 months, keep 12)
- [ ] Paddle.com payments

---

## V2 Differentiators (ARM15 Features — Add Later)

Do NOT build these in V1:

- True branching nodes (fork in timeline, player picks A or B)
- Ghost overlay (all branch paths simultaneously at opacity)
- AI play generation (LLM → Play JSON)
- Choose Your Own Adventure player view
- Who's Green accountability dashboard
- Code words / role labels
- Composable block system
- Offline / PWA mode
- Play analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Canvas | Konva.js 9 + react-konva 19 |
| UI Components | Tailwind CSS v4 (shadcn/ui — pending) |
| Routing | react-router-dom v7 |
| Backend / Auth / DB | Supabase (Postgres + RLS + Magic Link) |
| Payments | Paddle.com (Merchant of Record) — Module 09 |
| Deployment | Vercel |
| Language | TypeScript 5.8 strict mode |

---

## Core Design Rules (Never Break These)

1. **No video files.** All play data is JSON. Canvas animates locally.
2. **No auth to view.** Any play URL works for anonymous viewers.
3. **Mobile-first viewer.** Coaches edit on desktop. Players watch on phone.
4. **JSON is the truth.** One Play JSON object drives everything — editor, viewer, share link.
5. **Rugby Everest parity first.** Match every visible feature before adding anything new.

---

## Build Log

| Date | Spec | Action | Notes |
|---|---|---|---|
| 2026-05-21 | 01 — Data Schema | SQL extracted | 7 migration files in `supabase/migrations/`, combined `supabase/schema.sql`, `.env.example`. **Awaiting manual Supabase deploy.** |
| 2026-05-21 | 02 — Canvas Core | Built | `src/canvas/` — 4-layer Konva stage (Pitch, Line, Node, Annotation), coordinate mapping (0–100 grid), responsive ResizeObserver. |
| 2026-05-25 | 03 — Animation Engine | Built | `src/animation/` — `usePlayAnimation` hook, `AnimatedCanvas` (Konva tween control via node refs), `SpeedControl`, line draw-in animation (dash-offset), ball transfer at 50% of pass. Page Visibility API pause. |
| 2026-05-25 | 04 — Play Viewer | Built | `src/viewer/` — `/moves/:slug` route. Desktop 5-col grid / mobile single-column. `ViewerCanvas` (responsive wrapper + play overlay), `ModeTabs`, `StepControls`, `OptionCards`, `InfoPanels` (accordion), `Badges`, `ShareButton`, `NotFoundPage`. Supabase data fetch with null guard. Auth gate UI stubbed — wired in Module 07. react-router-dom + Tailwind CSS v4 installed. **Viewer shows 404 until Supabase migrations are run.** |
