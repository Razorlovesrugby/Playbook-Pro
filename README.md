# Playbook Pro

A rugby playbook platform for coaches and players. Coaches design animated plays on a canvas, publish them to a team, and players watch them on any device.

**Stack:** React 19 · TypeScript · Vite · Supabase (Postgres, Auth, RLS) · Konva / react-konva · Tailwind CSS

## Features

- Canvas play designer with drag-and-drop player positioning
- Animated play diagrams with movement paths and timing
- Team management with shared playbooks
- Magic-link authentication (no passwords)
- Public play library for browsing

## Getting started

Requires Node 18+ and a Supabase project.

```bash
npm install
cp supabase/.env.example .env.local   # fill in the VITE_* values
npm run dev
```

Database schema lives in `supabase/migrations/` and should be applied in order. Only the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values belong in the browser build. The service role key and database credentials in the example file are for local tooling only and must never be exposed to the client.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Documentation

- [How-to guide for coaches and players](GUIDE.md)
- [Architecture decisions](docs/architecture), for example why Konva was chosen over raw canvas
- [Requirements and V1 scope](docs/requirements)
- [UX decisions and gesture model](docs/ux)
- [Per-feature implementation specs](docs/phase-specs)
