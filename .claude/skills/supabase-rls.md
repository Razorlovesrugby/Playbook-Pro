---
name: supabase-rls
description: Supabase patterns for ARM15 — Row Level Security, Edge Functions, auth flow, database schema conventions, realtime subscriptions.
triggers:
  - Any Supabase query, mutation, or migration
  - Auth flow changes
  - RLS policy creation
  - Edge Function deployment
---

# Supabase RLS & Backend Patterns — ARM15

## When to Load
Load before any Supabase work: queries, migrations, RLS policies, auth changes,
Edge Functions, or realtime subscriptions.

## Schema Conventions

### Tables
```sql
-- All tables include these columns:
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
-- updated_at auto-managed via trigger:
CREATE TRIGGER set_updated_at BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.set_updated_at();
```

### Naming
```
Table names:   snake_case, plural (plays, phases, players, workspaces)
Column names:  snake_case (jersey_number, play_id, created_by)
PK:            id uuid DEFAULT gen_random_uuid()
FK:            referenced_table_id
```

## RLS Patterns

### Coach Ownership (Creator Studio)
```sql
-- Coaches own plays in their workspace
CREATE POLICY "Coaches manage own plays"
  ON plays FOR ALL
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND role = 'coach'
  ))
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND role = 'coach'
  ));
```

### Public Read (Player View)
```sql
-- Published plays are readable by anyone (no auth required)
CREATE POLICY "Anyone can view published plays"
  ON plays FOR SELECT
  USING (is_published = true);
```

### Player-Specific View (V2)
```sql
-- V2: Player magic link → can view only their assigned plays
CREATE POLICY "Players view assigned plays"
  ON plays FOR SELECT
  USING (
    is_published = true
    AND id IN (
      SELECT play_id FROM player_assignments
      WHERE player_id = auth.uid()
    )
  );
```

## Auth Flow

### Coach Auth (V1)
```
1. Coach signs up with email/password → Supabase Auth
2. On signup, trigger creates workspace + workspace_members row
3. JWT stored in localStorage, sent with every Supabase call
4. RLS policies enforce coach role for mutations
```

### Player Auth (V2 — Deferred)
```
1. Coach sends magic link via WhatsApp
2. Player taps link → anonymous session created
3. Player claims account → email/password (optional)
4. Player role has SELECT-only access
```

## Edge Functions

### Publish Play
```tsx
// Client calls Edge Function to publish
const { data, error } = await supabase.functions.invoke('publish-play', {
  body: { playId: '...' }
});
// Edge Function:
// 1. Validates play completeness (all phases named, no missing players)
// 2. Sets is_published = true
// 3. Generates short share URL
// 4. Returns share URL
```

## Realtime (V2)
```tsx
// Coach sees Who's Green dashboard in realtime
const channel = supabase
  .channel('play-views')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'play_views',
  }, (payload) => {
    updateWhoIsGreen(payload.new);
  })
  .subscribe();
```

## Anti-Patterns
- Never expose `service_role` key in client code — Edge Functions only
- Never run raw SQL without RLS — always test as anon/player role
- Never skip `.single()` on queries expecting one row
- Never forget error handling on every Supabase call
- Never use `auth.uid()` in RLS policies for public/anonymous access — use `true`
