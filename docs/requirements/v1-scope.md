# V1 Scope — Ship This

**Status**: Current | **Date**: 2026-05-14

## What Ships in V1

### Core Features
1. **Coach Auth** — email/password via Supabase. Workspace auto-created on signup.
2. **My Plays Home** — grid/list of coach's plays. Create, duplicate, delete.
3. **Creator Studio** — 3-panel layout (sidebar / canvas / properties).
   Approach B gestures. Phase chaining and branching.
4. **20 Starter Templates** — 12 set piece (scrum, lineout, kickoff variants) +
   8 strike moves (crash, sweep, loop, cross-field kick).
5. **Multi-Phase Branching** — ghost overlay default. Phase branching with
   decision nodes. Active Path Timeline + Play Map.
6. **Publish** — one-click publish generates a shareable URL.
7. **Share** — WhatsApp share button + QR code for sideline distribution.
8. **Player View** — animation playback, tap-to-filter (jersey number),
   branch choice at decision nodes.
9. **PWA** — manifest + service worker. Add to Home Screen on iOS.

### Technical Requirements
- React + Vite + shadcn/ui + Tailwind
- Konva.js (react-konva) for canvas
- Supabase (Postgres, RLS, Auth, Edge Functions)
- TypeScript strict mode
- WCAG 2.2 AA compliance
- iPad portrait primary, iPad landscape + desktop secondary, phone tertiary
- Deployed on Vercel or Netlify

### Out of Scope (V2)
- AI Text-to-Pitch engine
- Player magic link auth
- Who's Green dashboard
- Offline/touchline mode
- Auto-set opponents
- Club branding
- Team management
- Freemium/payments
- Play analytics
- Undo/redo
- Export to image
- Play versioning
