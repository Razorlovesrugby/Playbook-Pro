# PLAYBOOK — Module 01: Data Schema

**Product:** Playbook
**Module:** Data Schema
**Version:** 1.0
**Dependencies:** Module 00 (Overview)
**Agent task:** Set up Supabase project, run all migrations, seed library plays, verify RLS

---

## 1. User Story

**As the system**, I need a database that stores plays, users, teams, and pricing state — with public read access for published plays and row-level security for private data — so that coaches can create and share plays without players needing an account.

---

## 2. The Play JSON Object

This is the single source of truth for every play. It lives in the `play_data JSONB` column of the `plays` table.

```json
{
  "version": 1,
  "field_zone": "opp_22",
  "info": {
    "what_is_it": "A dummy runner off 9 pulls the defence while the ball goes out the back to a runner arriving at pace.",
    "when_to_use": "When the defence is rushing up fast and the first receiver is marked tightly.",
    "why_it_works": "The dummy line is believable — the defence commits to the wrong man.",
    "key_positions": "9, 10, 12, 13",
    "options_alternatives": "Option 2 uses 12 as the dummy instead of 10. Option 3 is a kick.",
    "common_mistakes": "The dummy runner must commit fully — a half-hearted dummy does nothing."
  },
  "steps": [
    {
      "step_id": "step_1",
      "step_number": 1,
      "description": "9 plays to 10 who shapes to pass. 12 runs the dummy line inside.",
      "players": [
        {
          "id": "p9",
          "team": "attack",
          "number": 9,
          "x": 48.0,
          "y": 45.0,
          "has_ball": true
        },
        {
          "id": "p10",
          "team": "attack",
          "number": 10,
          "x": 52.0,
          "y": 40.0,
          "has_ball": false
        },
        {
          "id": "p12",
          "team": "attack",
          "number": 12,
          "x": 58.0,
          "y": 38.0,
          "has_ball": false
        },
        {
          "id": "p13",
          "team": "attack",
          "number": 13,
          "x": 64.0,
          "y": 36.0,
          "has_ball": false
        },
        {
          "id": "d1",
          "team": "defence",
          "number": 1,
          "x": 52.0,
          "y": 32.0,
          "has_ball": false
        },
        {
          "id": "d2",
          "team": "defence",
          "number": 2,
          "x": 58.0,
          "y": 30.0,
          "has_ball": false
        }
      ],
      "lines": [
        {
          "id": "l1",
          "from_player_id": "p9",
          "to_player_id": "p10",
          "to_x": 52.0,
          "to_y": 40.0,
          "line_type": "pass",
          "option": 1
        },
        {
          "id": "l2",
          "from_player_id": "p10",
          "to_player_id": null,
          "to_x": 62.0,
          "to_y": 33.0,
          "line_type": "run",
          "option": 1
        },
        {
          "id": "l3",
          "from_player_id": "p12",
          "to_player_id": null,
          "to_x": 54.0,
          "to_y": 32.0,
          "line_type": "run",
          "option": 1
        },
        {
          "id": "l4",
          "from_player_id": "p10",
          "to_player_id": "p13",
          "to_x": 64.0,
          "to_y": 28.0,
          "line_type": "pass",
          "option": 2
        },
        {
          "id": "l5",
          "from_player_id": "p13",
          "to_player_id": null,
          "to_x": 70.0,
          "to_y": 25.0,
          "line_type": "run",
          "option": 2
        }
      ],
      "annotations": [
        {
          "id": "a1",
          "type": "text",
          "x": 44.0,
          "y": 44.0,
          "text": "Ruck ball",
          "end_x": null,
          "end_y": null
        }
      ]
    }
  ]
}
```

### Play JSON Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | integer | Yes | Schema version. Always 1 for V1 builds. |
| `field_zone` | string | Yes | One of: `full`, `opp_22`, `opp_half`, `own_half`, `own_22`, `lineout_l`, `lineout_r` |
| `info.what_is_it` | string | No | Coaching description shown in viewer |
| `info.when_to_use` | string | No | Situational guidance |
| `info.why_it_works` | string | No | Tactical explanation |
| `info.key_positions` | string | No | Positions involved |
| `info.options_alternatives` | string | No | What the options mean |
| `info.common_mistakes` | string | No | Common errors to avoid |
| `steps` | array | Yes | Ordered array of Step objects |

### Step Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `step_id` | string | Yes | Unique within play (e.g., `step_1`) |
| `step_number` | integer | Yes | Display order (1-based) |
| `description` | string | No | Text shown in Step by Step mode |
| `players` | array | Yes | All player nodes visible in this step |
| `lines` | array | Yes | All lines (can be empty) |
| `annotations` | array | Yes | All annotations (can be empty) |

### Player Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique within play (e.g., `p9`, `d1`) |
| `team` | enum | Yes | `attack` or `defence` |
| `number` | integer | Yes | Jersey number shown in circle |
| `x` | float | Yes | X position (0–100) |
| `y` | float | Yes | Y position (0–100) |
| `has_ball` | boolean | Yes | If true, render as yellow oval instead of circle |

### Line Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique within step |
| `from_player_id` | string | Yes | References a player `id` in this step |
| `to_player_id` | string or null | No | If set, line terminates on this player (for passes) |
| `to_x` | float | Yes | End X coordinate |
| `to_y` | float | Yes | End Y coordinate |
| `line_type` | enum | Yes | `run` (solid) or `pass` (dashed) |
| `option` | integer | Yes | 1, 2, or 3 |

### Annotation Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique within step |
| `type` | enum | Yes | `text`, `arrow`, `circle`, `target` |
| `x` | float | Yes | Start X position |
| `y` | float | Yes | Start Y position |
| `text` | string | No | For `text` type only |
| `end_x` | float or null | No | For `arrow` type — arrowhead X |
| `end_y` | float or null | No | For `arrow` type — arrowhead Y |

---

## 3. Supabase Tables

Run these migrations in order.

### Migration 001 — Profiles

```sql
-- Extends auth.users with display info
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Migration 002 — Plays

```sql
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Play',
  slug TEXT UNIQUE,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  is_library_play BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  play_data JSONB NOT NULL DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plays_updated_at
  BEFORE UPDATE ON plays
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Index slug for fast public lookups
CREATE INDEX idx_plays_slug ON plays(slug) WHERE slug IS NOT NULL;
-- Index for library queries
CREATE INDEX idx_plays_library ON plays(is_library_play, difficulty, category) WHERE is_library_play = true;
-- Index for user's plays
CREATE INDEX idx_plays_created_by ON plays(created_by, created_at DESC);
```

### Migration 003 — Teams

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'team', 'club')),
  plan_expires_at TIMESTAMPTZ,
  paddle_subscription_id TEXT,
  paddle_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team coaches (one owner, can add more coaches on Club plan)
CREATE TABLE team_coaches (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'coach' CHECK (role IN ('owner', 'coach')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- Plays published to a team playbook
CREATE TABLE team_plays (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  published_by UUID REFERENCES auth.users(id),
  sort_order INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, play_id)
);

CREATE INDEX idx_team_plays_team ON team_plays(team_id, sort_order);
```

### Migration 004 — Slug Generation Function

```sql
-- Generates a URL-safe slug from a title + random suffix
CREATE OR REPLACE FUNCTION generate_play_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to kebab-case
  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  -- Truncate to 50 chars
  base_slug := left(base_slug, 50);
  
  -- Try base slug first, then add numeric suffix
  candidate := base_slug || '-' || floor(random() * 9000000000 + 1000000000)::TEXT;
  
  WHILE EXISTS (SELECT 1 FROM plays WHERE slug = candidate) LOOP
    counter := counter + 1;
    candidate := base_slug || '-' || floor(random() * 9000000000 + 1000000000)::TEXT;
    IF counter > 10 THEN
      RAISE EXCEPTION 'Could not generate unique slug after 10 attempts';
    END IF;
  END LOOP;
  
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_plays ENABLE ROW LEVEL SECURITY;

-- ── PLAYS ──────────────────────────────────────────────────────────

-- Anyone can read published plays or library plays (no auth required)
CREATE POLICY "Public plays are readable by anyone"
  ON plays FOR SELECT
  USING (published = true OR is_library_play = true);

-- Authenticated coaches can read their own plays
CREATE POLICY "Coaches can read own plays"
  ON plays FOR SELECT
  USING (auth.uid() = created_by);

-- Coaches can insert their own plays
CREATE POLICY "Coaches can insert plays"
  ON plays FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Coaches can update their own plays
CREATE POLICY "Coaches can update own plays"
  ON plays FOR UPDATE
  USING (auth.uid() = created_by);

-- Coaches can delete their own plays
CREATE POLICY "Coaches can delete own plays"
  ON plays FOR DELETE
  USING (auth.uid() = created_by);

-- ── PROFILES ───────────────────────────────────────────────────────

CREATE POLICY "Profiles readable by owner"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles updatable by owner"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── TEAMS ──────────────────────────────────────────────────────────

-- Team playbooks readable by anyone (players browse without auth)
CREATE POLICY "Teams are publicly readable"
  ON teams FOR SELECT
  USING (true);

-- Only team members can see team management details
-- (This is enforced at app layer — team slug is the public identifier)

-- ── TEAM_COACHES ───────────────────────────────────────────────────

CREATE POLICY "Team coaches readable by team members"
  ON team_coaches FOR SELECT
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT team_id FROM team_coaches WHERE user_id = auth.uid())
  );

-- ── TEAM_PLAYS ─────────────────────────────────────────────────────

-- Anyone can see plays published to a team
CREATE POLICY "Team plays readable by anyone"
  ON team_plays FOR SELECT
  USING (true);

-- Only team coaches can publish/unpublish
CREATE POLICY "Team coaches can manage team plays"
  ON team_plays FOR ALL
  USING (
    team_id IN (SELECT team_id FROM team_coaches WHERE user_id = auth.uid())
  );
```

---

## 5. Library Play Seeds

The public library must be pre-populated. Seed these plays with `is_library_play = true`, `published = true`, and `created_by = null`.

Seed at least 6 library plays covering the main categories. Each play must have a complete `play_data` JSON with at least 3 steps and at least Options 1 and 2 demonstrated.

Minimum seed set:

| Title | Difficulty | Category | Steps |
|---|---|---|---|
| Out The Back Option | beginner | Attack Structure | 3 |
| The Crash Ball | beginner | Attack Structure | 3 |
| Lineout Drive | beginner | Set Piece | 4 |
| Scrum Backs Move | intermediate | Set Piece | 4 |
| The Skip Pass | intermediate | Attack Structure | 3 |
| Defensive Blitz | intermediate | Defence | 3 |

Seed script (run after migrations):

```sql
INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'Out The Back Option',
  'out-the-back-option-1000000001',
  'beginner',
  'Attack Structure',
  true,
  true,
  '{ ... full play_data JSON ... }'
);
-- Repeat for all 6 library plays
```

---

## 6. Free Tier Enforcement

The 3-play limit for free users is enforced at the application layer, not the database.

When a free-tier user attempts to save a 4th play:
1. Check: `SELECT COUNT(*) FROM plays WHERE created_by = auth.uid()`
2. If count >= 3 AND user has no active team subscription → show upgrade prompt
3. Do NOT insert the play

Add a helper function to check plan status:

```sql
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  plan TEXT;
BEGIN
  SELECT t.plan INTO plan
  FROM teams t
  JOIN team_coaches tc ON tc.team_id = t.id
  WHERE tc.user_id = get_user_plan.user_id
    AND (t.plan_expires_at IS NULL OR t.plan_expires_at > now())
  ORDER BY 
    CASE t.plan 
      WHEN 'club' THEN 1 
      WHEN 'team' THEN 2 
      ELSE 3 
    END
  LIMIT 1;
  
  RETURN COALESCE(plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Slug collision on generation | `generate_play_slug` retries up to 10 times with new random suffix |
| Play JSON is malformed | Insert rejected at app layer — validate JSON schema before sending to Supabase |
| User deletes account | `created_by` set to NULL, play remains (orphaned public plays still viewable) |
| Team plan expires | `plan_expires_at` check in `get_user_plan` — falls back to `free` |
| play_data exceeds Supabase JSONB limit (1GB) | Not a real concern at this scale — plays are typically 5–50KB |
| Library play seeded with wrong category | Admin updates via Supabase dashboard directly |
| Duplicate library plays | Slug uniqueness constraint prevents duplicates |

---

## 8. Build Notes for AI Agent

**What to build:**
1. Create a new Supabase project
2. Run all 4 migrations in order
3. Apply all RLS policies
4. Create the `generate_play_slug` and `get_user_plan` functions
5. Seed the library with at minimum 2 complete plays (can stub others)
6. Verify RLS: unauthenticated request can read library plays, cannot write

**Acceptance criteria:**
- `SELECT * FROM plays WHERE is_library_play = true` returns seeded plays without auth
- `INSERT INTO plays (...)` with `created_by = random_uuid` fails RLS
- `get_user_plan(uid)` returns `'free'` for a user with no team
- Slug generation produces unique slugs on 100 sequential inserts

**Environment variables to expose to the frontend:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
