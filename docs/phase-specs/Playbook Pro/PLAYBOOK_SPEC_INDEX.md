# Playbook — Master Spec Index

**Product:** Playbook
**Version:** 1.0
**Date:** 2026-05-21
**Status:** Ready to Build — Agentic Development

---

## What This Is

Playbook is a web-based animated rugby play builder and library.
It is a feature-for-feature rebuild of Rugby Everest, using React + Konva + Supabase.
It is architecturally separate from ARM15. ARM15 differentiators (branching nodes, AI, ghost overlay) are V2.

---

## Module Map

| File | Module | What the AI builds |
|---|---|---|
| `PLAYBOOK_SPEC_00_Overview.md` | Product Overview | Context, stack decisions, core concepts, user types |
| `PLAYBOOK_SPEC_01_DataSchema.md` | Data Schema | Supabase tables, Play JSON, RLS policies, seeded library |
| `PLAYBOOK_SPEC_02_CanvasCore.md` | Canvas Core | Konva setup, pitch rendering, player nodes, line drawing |
| `PLAYBOOK_SPEC_03_AnimationEngine.md` | Animation Engine | Step animation, tweening, speed control, Overview vs Step-by-Step |
| `PLAYBOOK_SPEC_04_PlayViewer.md` | Play Viewer | Viewer page (both modes), controls, info panels, share |
| `PLAYBOOK_SPEC_05_PlayEditor.md` | Play Editor | Editor page, all draw tools, templates, step management |
| `PLAYBOOK_SPEC_06_PlayLibrary.md` | Play Library | Public library, filters, play cards, search |
| `PLAYBOOK_SPEC_07_Auth.md` | Auth & Share | Magic link auth, public play URLs, save/share flow |
| `PLAYBOOK_SPEC_08_TeamDashboard.md` | Team Dashboard | Team creation, playbook publishing, player access |
| `PLAYBOOK_SPEC_09_Pricing.md` | Pricing & Paywall | Free/Team/Club tiers, Season Pass, Paddle integration |
| `PLAYBOOK_SPEC_10_EdgeCases.md` | Edge Cases | All failure states, error handling, cross-cutting concerns |

---

## Build Order

Build modules in this sequence. Each module depends on the ones above it.

```
01 DataSchema     ← build first, everything depends on this
02 CanvasCore     ← Konva foundation
03 AnimationEngine ← depends on CanvasCore
07 Auth           ← Supabase magic link
04 PlayViewer     ← depends on AnimationEngine + Auth
05 PlayEditor     ← depends on CanvasCore + Auth + DataSchema
06 PlayLibrary    ← depends on PlayViewer + DataSchema
08 TeamDashboard  ← depends on Auth + PlayViewer
09 Pricing        ← depends on TeamDashboard + Auth
10 EdgeCases      ← applies across all modules, implement inline
```

---

## V1 Feature Parity (Rugby Everest Clone)

These are the exact features to ship in V1:

- [ ] Public play library with difficulty + category filters
- [ ] Play viewer: Overview (auto-play) + Step by Step (manual)
- [ ] Playback speed: 0.5x / 1x / 2x
- [ ] 3-option colour system per step (Yellow=Option 1, Blue=Option 2, Orange=Option 3)
- [ ] Option card filtering in Step by Step mode
- [ ] Play editor with all draw tools
- [ ] Field zone selector (Full Field, Opp 22, Opp Half, Own Half, Own 22, Lineout L/R)
- [ ] Templates (Scrum L/C/R, Lineout L/R, Kickoffs, 22m Drop, Blank)
- [ ] Magic link auth (no Google, no password)
- [ ] Save plays to My Plays
- [ ] Shareable public URLs (no auth to view)
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
| Framework | React 18 + Vite |
| Canvas | Konva.js + react-konva |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend / Auth / DB | Supabase (Postgres + RLS + Magic Link) |
| Payments | Paddle.com (Merchant of Record) |
| Deployment | Vercel |
| Language | TypeScript throughout |

---

## Core Design Rules (Never Break These)

1. **No video files.** All play data is JSON. Canvas animates locally.
2. **No auth to view.** Any play URL works for anonymous viewers.
3. **Mobile-first viewer.** Coaches edit on desktop. Players watch on phone.
4. **JSON is the truth.** One Play JSON object drives everything — editor, viewer, share link.
5. **Rugby Everest parity first.** Match every visible feature before adding anything new.
