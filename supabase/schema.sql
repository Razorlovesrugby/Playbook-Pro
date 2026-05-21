-- Playbook: Combined Schema
-- Generated from Spec 01 - Data Schema
-- Run this entire file in Supabase SQL Editor to set up the database



-- ═══════════════════════════════════════════════════════════════════
-- 001_profiles.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- Migration 001: Profiles table + auto-create trigger
     2|-- Extends auth.users with display info
     3|
     4|CREATE TABLE IF NOT EXISTS profiles (
     5|  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     6|  display_name TEXT,
     7|  avatar_url TEXT,
     8|  created_at TIMESTAMPTZ DEFAULT now()
     9|);
    10|
    11|-- Auto-create profile on signup
    12|CREATE OR REPLACE FUNCTION public.handle_new_user()
    13|RETURNS TRIGGER AS $$
    14|BEGIN
    15|  INSERT INTO public.profiles (id, display_name)
    16|  VALUES (new.id, new.raw_user_meta_data->>'display_name');
    17|  RETURN new;
    18|END;
    19|$$ LANGUAGE plpgsql SECURITY DEFINER;
    20|
    21|DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    22|CREATE TRIGGER on_auth_user_created
    23|  AFTER INSERT ON auth.users
    24|  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    25|


-- ═══════════════════════════════════════════════════════════════════
-- 002_plays.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- Migration 002: Plays table
     2|-- Core table storing play JSON + metadata
     3|
     4|CREATE TABLE IF NOT EXISTS plays (
     5|  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     6|  title TEXT NOT NULL DEFAULT 'Untitled Play',
     7|  slug TEXT UNIQUE,
     8|  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
     9|  category TEXT,
    10|  is_library_play BOOLEAN DEFAULT false,
    11|  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    12|  play_data JSONB NOT NULL DEFAULT '{}',
    13|  published BOOLEAN DEFAULT false,
    14|  created_at TIMESTAMPTZ DEFAULT now(),
    15|  updated_at TIMESTAMPTZ DEFAULT now()
    16|);
    17|
    18|-- Auto-update updated_at trigger
    19|CREATE OR REPLACE FUNCTION update_updated_at()
    20|RETURNS TRIGGER AS $$
    21|BEGIN
    22|  NEW.updated_at = now();
    23|  RETURN NEW;
    24|END;
    25|$$ LANGUAGE plpgsql;
    26|
    27|DROP TRIGGER IF EXISTS plays_updated_at ON plays;
    28|CREATE TRIGGER plays_updated_at
    29|  BEFORE UPDATE ON plays
    30|  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
    31|
    32|-- Indexes
    33|CREATE INDEX IF NOT EXISTS idx_plays_slug ON plays(slug) WHERE slug IS NOT NULL;
    34|CREATE INDEX IF NOT EXISTS idx_plays_library ON plays(is_library_play, difficulty, category) WHERE is_library_play = true;
    35|CREATE INDEX IF NOT EXISTS idx_plays_created_by ON plays(created_by, created_at DESC);
    36|


-- ═══════════════════════════════════════════════════════════════════
-- 003_teams.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- Migration 003: Teams, team_coaches, team_plays
     2|
     3|CREATE TABLE IF NOT EXISTS teams (
     4|  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     5|  name TEXT NOT NULL,
     6|  slug TEXT UNIQUE NOT NULL,
     7|  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     8|  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'team', 'club')),
     9|  plan_expires_at TIMESTAMPTZ,
    10|  paddle_subscription_id TEXT,
    11|  paddle_customer_id TEXT,
    12|  created_at TIMESTAMPTZ DEFAULT now()
    13|);
    14|
    15|-- Team coaches (one owner, can add more coaches on Club plan)
    16|CREATE TABLE IF NOT EXISTS team_coaches (
    17|  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    18|  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    19|  role TEXT DEFAULT 'coach' CHECK (role IN ('owner', 'coach')),
    20|  joined_at TIMESTAMPTZ DEFAULT now(),
    21|  PRIMARY KEY (team_id, user_id)
    22|);
    23|
    24|-- Plays published to a team playbook
    25|CREATE TABLE IF NOT EXISTS team_plays (
    26|  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    27|  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
    28|  published_by UUID REFERENCES auth.users(id),
    29|  sort_order INTEGER DEFAULT 0,
    30|  published_at TIMESTAMPTZ DEFAULT now(),
    31|  PRIMARY KEY (team_id, play_id)
    32|);
    33|
    34|CREATE INDEX IF NOT EXISTS idx_team_plays_team ON team_plays(team_id, sort_order);
    35|


-- ═══════════════════════════════════════════════════════════════════
-- 004_slug_function.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- Migration 004: Slug generation function
     2|-- Generates a unique URL-safe slug from a play title + random suffix
     3|
     4|CREATE OR REPLACE FUNCTION generate_play_slug(title TEXT)
     5|RETURNS TEXT AS $$
     6|DECLARE
     7|  base_slug TEXT;
     8|  candidate TEXT;
     9|  counter INTEGER := 0;
    10|BEGIN
    11|  -- Convert title to kebab-case
    12|  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    13|  base_slug := trim(both '-' from base_slug);
    14|  -- Truncate to 50 chars
    15|  base_slug := left(base_slug, 50);
    16|
    17|  -- Try with random numeric suffix
    18|  candidate := base_slug || '-' || floor(random() * 9000000000 + 1000000000)::TEXT;
    19|
    20|  WHILE EXISTS (SELECT 1 FROM plays WHERE slug = candidate) LOOP
    21|    counter := counter + 1;
    22|    candidate := base_slug || '-' || floor(random() * 9000000000 + 1000000000)::TEXT;
    23|    IF counter > 10 THEN
    24|      RAISE EXCEPTION 'Could not generate unique slug after 10 attempts';
    25|    END IF;
    26|  END LOOP;
    27|
    28|  RETURN candidate;
    29|END;
    30|$$ LANGUAGE plpgsql;
    31|


-- ═══════════════════════════════════════════════════════════════════
-- 005_rls_policies.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- RLS Policies: Row Level Security for all Playbook tables
     2|-- Enable RLS on all tables first, then apply policies
     3|
     4|ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
     5|ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
     6|ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
     7|ALTER TABLE team_coaches ENABLE ROW LEVEL SECURITY;
     8|ALTER TABLE team_plays ENABLE ROW LEVEL SECURITY;
     9|
    10|-- ═══════════════════════════════════════════════════════════════════
    11|-- PLAYS
    12|-- ═══════════════════════════════════════════════════════════════════
    13|
    14|-- Anyone can read published plays or library plays (no auth required)
    15|DROP POLICY IF EXISTS "Public plays are readable by anyone" ON plays;
    16|CREATE POLICY "Public plays are readable by anyone"
    17|  ON plays FOR SELECT
    18|  USING (published = true OR is_library_play = true);
    19|
    20|-- Authenticated coaches can read their own plays
    21|DROP POLICY IF EXISTS "Coaches can read own plays" ON plays;
    22|CREATE POLICY "Coaches can read own plays"
    23|  ON plays FOR SELECT
    24|  USING (auth.uid() = created_by);
    25|
    26|-- Coaches can insert their own plays
    27|DROP POLICY IF EXISTS "Coaches can insert plays" ON plays;
    28|CREATE POLICY "Coaches can insert plays"
    29|  ON plays FOR INSERT
    30|  WITH CHECK (auth.uid() = created_by);
    31|
    32|-- Coaches can update their own plays
    33|DROP POLICY IF EXISTS "Coaches can update own plays" ON plays;
    34|CREATE POLICY "Coaches can update own plays"
    35|  ON plays FOR UPDATE
    36|  USING (auth.uid() = created_by);
    37|
    38|-- Coaches can delete their own plays
    39|DROP POLICY IF EXISTS "Coaches can delete own plays" ON plays;
    40|CREATE POLICY "Coaches can delete own plays"
    41|  ON plays FOR DELETE
    42|  USING (auth.uid() = created_by);
    43|
    44|-- ═══════════════════════════════════════════════════════════════════
    45|-- PROFILES
    46|-- ═══════════════════════════════════════════════════════════════════
    47|
    48|DROP POLICY IF EXISTS "Profiles readable by owner" ON profiles;
    49|CREATE POLICY "Profiles readable by owner"
    50|  ON profiles FOR SELECT
    51|  USING (auth.uid() = id);
    52|
    53|DROP POLICY IF EXISTS "Profiles updatable by owner" ON profiles;
    54|CREATE POLICY "Profiles updatable by owner"
    55|  ON profiles FOR UPDATE
    56|  USING (auth.uid() = id);
    57|
    58|-- ═══════════════════════════════════════════════════════════════════
    59|-- TEAMS
    60|-- ═══════════════════════════════════════════════════════════════════
    61|
    62|-- Team playbooks readable by anyone (players browse without auth)
    63|DROP POLICY IF EXISTS "Teams are publicly readable" ON teams;
    64|CREATE POLICY "Teams are publicly readable"
    65|  ON teams FOR SELECT
    66|  USING (true);
    67|
    68|-- ═══════════════════════════════════════════════════════════════════
    69|-- TEAM_COACHES
    70|-- ═══════════════════════════════════════════════════════════════════
    71|
    72|DROP POLICY IF EXISTS "Team coaches readable by team members" ON team_coaches;
    73|CREATE POLICY "Team coaches readable by team members"
    74|  ON team_coaches FOR SELECT
    75|  USING (
    76|    user_id = auth.uid()
    77|    OR team_id IN (SELECT team_id FROM team_coaches WHERE user_id = auth.uid())
    78|  );
    79|
    80|-- ═══════════════════════════════════════════════════════════════════
    81|-- TEAM_PLAYS
    82|-- ═══════════════════════════════════════════════════════════════════
    83|
    84|-- Anyone can see plays published to a team
    85|DROP POLICY IF EXISTS "Team plays readable by anyone" ON team_plays;
    86|CREATE POLICY "Team plays readable by anyone"
    87|  ON team_plays FOR SELECT
    88|  USING (true);
    89|
    90|-- Only team coaches can publish/unpublish
    91|DROP POLICY IF EXISTS "Team coaches can manage team plays" ON team_plays;
    92|CREATE POLICY "Team coaches can manage team plays"
    93|  ON team_plays FOR ALL
    94|  USING (
    95|    team_id IN (SELECT team_id FROM team_coaches WHERE user_id = auth.uid())
    96|  );
    97|


-- ═══════════════════════════════════════════════════════════════════
-- 006_get_user_plan.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- Helper function: get a user's current plan tier
     2|-- Returns 'free', 'team', or 'club' based on active team subscriptions
     3|-- Falls back to 'free' if user has no active paid team plan
     4|
     5|CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
     6|RETURNS TEXT AS $$
     7|DECLARE
     8|  plan_result TEXT;
     9|BEGIN
    10|  SELECT t.plan INTO plan_result
    11|  FROM teams t
    12|  JOIN team_coaches tc ON tc.team_id = t.id
    13|  WHERE tc.user_id = p_user_id
    14|    AND (t.plan_expires_at IS NULL OR t.plan_expires_at > now())
    15|  ORDER BY
    16|    CASE t.plan
    17|      WHEN 'club' THEN 1
    18|      WHEN 'team' THEN 2
    19|      ELSE 3
    20|    END
    21|  LIMIT 1;
    22|
    23|  RETURN COALESCE(plan_result, 'free');
    24|END;
    25|$$ LANGUAGE plpgsql SECURITY DEFINER;
    26|


-- ═══════════════════════════════════════════════════════════════════
-- 007_seed_library_plays.sql
-- ═══════════════════════════════════════════════════════════════════

     1|-- Seed Data: Library Plays
     2|-- Populates the public play library with 6 plays across categories
     3|-- is_library_play = true, published = true, created_by = null
     4|
     5|-- ═══════════════════════════════════════════════════════════════════
     6|-- PLAY 1: Out The Back Option (COMPLETE - 3 steps)
     7|-- ═══════════════════════════════════════════════════════════════════
     8|
     9|INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
    10|VALUES (
    11|  'Out The Back Option',
    12|  'out-the-back-option-1000000001',
    13|  'beginner',
    14|  'Attack Structure',
    15|  true,
    16|  true,
    17|  '{
    18|    "version": 1,
    19|    "field_zone": "opp_22",
    20|    "info": {
    21|      "what_is_it": "A dummy runner off 9 pulls the defence while the ball goes out the back to a runner arriving at pace.",
    22|      "when_to_use": "When the defence is rushing up fast and the first receiver is marked tightly.",
    23|      "why_it_works": "The dummy line is believable — the defence commits to the wrong man.",
    24|      "key_positions": "9, 10, 12, 13",
    25|      "options_alternatives": "Option 2 uses 12 as the dummy instead of 10. Option 3 is a kick.",
    26|      "common_mistakes": "The dummy runner must commit fully — a half-hearted dummy does nothing."
    27|    },
    28|    "steps": [
    29|      {
    30|        "step_id": "step_1",
    31|        "step_number": 1,
    32|        "description": "9 plays to 10 who shapes to pass. 12 runs the dummy line inside.",
    33|        "players": [
    34|          {"id": "p9", "team": "attack", "number": 9, "x": 48, "y": 45, "has_ball": true},
    35|          {"id": "p10", "team": "attack", "number": 10, "x": 52, "y": 40, "has_ball": false},
    36|          {"id": "p12", "team": "attack", "number": 12, "x": 58, "y": 38, "has_ball": false},
    37|          {"id": "p13", "team": "attack", "number": 13, "x": 64, "y": 36, "has_ball": false},
    38|          {"id": "d1", "team": "defence", "number": 1, "x": 52, "y": 32, "has_ball": false},
    39|          {"id": "d2", "team": "defence", "number": 2, "x": 58, "y": 30, "has_ball": false}
    40|        ],
    41|        "lines": [
    42|          {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 52, "to_y": 40, "line_type": "pass", "option": 1},
    43|          {"id": "l2", "from_player_id": "p10", "to_player_id": null, "to_x": 62, "to_y": 33, "line_type": "run", "option": 1},
    44|          {"id": "l3", "from_player_id": "p12", "to_player_id": null, "to_x": 54, "to_y": 32, "line_type": "run", "option": 1}
    45|        ],
    46|        "annotations": [
    47|          {"id": "a1", "type": "text", "x": 44, "y": 44, "text": "Ruck ball", "end_x": null, "end_y": null}
    48|        ]
    49|      },
    50|      {
    51|        "step_id": "step_2",
    52|        "step_number": 2,
    53|        "description": "10 passes behind 12 to 13 arriving at pace. 12s dummy run holds the defence.",
    54|        "players": [
    55|          {"id": "p9", "team": "attack", "number": 9, "x": 50, "y": 42, "has_ball": false},
    56|          {"id": "p10", "team": "attack", "number": 10, "x": 55, "y": 38, "has_ball": true},
    57|          {"id": "p12", "team": "attack", "number": 12, "x": 56, "y": 33, "has_ball": false},
    58|          {"id": "p13", "team": "attack", "number": 13, "x": 62, "y": 32, "has_ball": false},
    59|          {"id": "d1", "team": "defence", "number": 1, "x": 54, "y": 34, "has_ball": false},
    60|          {"id": "d2", "team": "defence", "number": 2, "x": 57, "y": 33, "has_ball": false}
    61|        ],
    62|        "lines": [
    63|          {"id": "l1", "from_player_id": "p10", "to_player_id": "p13", "to_x": 62, "to_y": 32, "line_type": "pass", "option": 1},
    64|          {"id": "l2", "from_player_id": "p13", "to_player_id": null, "to_x": 72, "to_y": 28, "line_type": "run", "option": 1}
    65|        ],
    66|        "annotations": []
    67|      },
    68|      {
    69|        "step_id": "step_3",
    70|        "step_number": 3,
    71|        "description": "13 breaks the line and looks for support. 10 trails inside for the offload.",
    72|        "players": [
    73|          {"id": "p9", "team": "attack", "number": 9, "x": 52, "y": 40, "has_ball": false},
    74|          {"id": "p10", "team": "attack", "number": 10, "x": 58, "y": 35, "has_ball": false},
    75|          {"id": "p13", "team": "attack", "number": 13, "x": 70, "y": 28, "has_ball": true},
    76|          {"id": "p14", "team": "attack", "number": 14, "x": 74, "y": 22, "has_ball": false}
    77|        ],
    78|        "lines": [
    79|          {"id": "l1", "from_player_id": "p13", "to_player_id": null, "to_x": 80, "to_y": 18, "line_type": "run", "option": 1},
    80|          {"id": "l2", "from_player_id": "p10", "to_player_id": null, "to_x": 65, "to_y": 30, "line_type": "run", "option": 1}
    81|        ],
    82|        "annotations": [
    83|          {"id": "a1", "type": "text", "x": 48, "y": 20, "text": "Try line", "end_x": null, "end_y": null}
    84|        ]
    85|      }
    86|    ]
    87|  }'::jsonb
    88|);
    89|
    90|-- ═══════════════════════════════════════════════════════════════════
    91|-- PLAY 2: The Crash Ball (COMPLETE - 3 steps)
    92|-- ═══════════════════════════════════════════════════════════════════
    93|
    94|INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
    95|VALUES (
    96|  'The Crash Ball',
    97|  'the-crash-ball-2000000002',
    98|  'beginner',
    99|  'Attack Structure',
   100|  true,
   101|  true,
   102|  '{
   103|    "version": 1,
   104|    "field_zone": "opp_22",
   105|    "info": {
   106|      "what_is_it": "12 runs a hard crash line off 10 to suck in defenders and create quick ball.",
   107|      "when_to_use": "When you need front-foot ball and the defence is drifting. Good on slow ruck ball.",
   108|      "why_it_works": "The crash runner bends the line, forces defenders to commit, and opens space wide.",
   109|      "key_positions": "10, 12, 13",
   110|      "options_alternatives": "Option 2: 10 pulls the pass and goes out the back to 13. Option 3: 12 offloads before contact.",
   111|      "common_mistakes": "Crash runner must run straight — drifting makes the pass too easy to read."
   112|    },
   113|    "steps": [
   114|      {
   115|        "step_id": "step_1",
   116|        "step_number": 1,
   117|        "description": "9 passes to 10. 12 shapes to run the crash line.",
   118|        "players": [
   119|          {"id": "p9", "team": "attack", "number": 9, "x": 40, "y": 45, "has_ball": true},
   120|          {"id": "p10", "team": "attack", "number": 10, "x": 46, "y": 42, "has_ball": false},
   121|          {"id": "p12", "team": "attack", "number": 12, "x": 50, "y": 38, "has_ball": false},
   122|          {"id": "p13", "team": "attack", "number": 13, "x": 56, "y": 40, "has_ball": false},
   123|          {"id": "d6", "team": "defence", "number": 6, "x": 48, "y": 32, "has_ball": false},
   124|          {"id": "d12", "team": "defence", "number": 12, "x": 52, "y": 34, "has_ball": false}
   125|        ],
   126|        "lines": [
   127|          {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 46, "to_y": 42, "line_type": "pass", "option": 1},
   128|          {"id": "l2", "from_player_id": "p12", "to_player_id": null, "to_x": 56, "to_y": 30, "line_type": "run", "option": 1}
   129|        ],
   130|        "annotations": [
   131|          {"id": "a1", "type": "text", "x": 36, "y": 44, "text": "Ruck", "end_x": null, "end_y": null}
   132|        ]
   133|      },
   134|      {
   135|        "step_id": "step_2",
   136|        "step_number": 2,
   137|        "description": "10 hits 12 on a short, flat pass. 12 runs directly at the inside shoulder of the defensive 6.",
   138|        "players": [
   139|          {"id": "p9", "team": "attack", "number": 9, "x": 42, "y": 44, "has_ball": false},
   140|          {"id": "p10", "team": "attack", "number": 10, "x": 46, "y": 40, "has_ball": true},
   141|          {"id": "p12", "team": "attack", "number": 12, "x": 50, "y": 36, "has_ball": false},
   142|          {"id": "p13", "team": "attack", "number": 13, "x": 54, "y": 38, "has_ball": false},
   143|          {"id": "d6", "team": "defence", "number": 6, "x": 50, "y": 33, "has_ball": false},
   144|          {"id": "d12", "team": "defence", "number": 12, "x": 54, "y": 34, "has_ball": false}
   145|        ],
   146|        "lines": [
   147|          {"id": "l1", "from_player_id": "p10", "to_player_id": "p12", "to_x": 50, "to_y": 36, "line_type": "pass", "option": 1},
   148|          {"id": "l2", "from_player_id": "p12", "to_player_id": null, "to_x": 52, "to_y": 30, "line_type": "run", "option": 1},
   149|          {"id": "l3", "from_player_id": "p13", "to_player_id": null, "to_x": 60, "to_y": 42, "line_type": "run", "option": 2}
   150|        ],
   151|        "annotations": [
   152|          {"id": "a1", "type": "arrow", "x": 50, "y": 45, "text": "", "end_x": 52, "end_y": 28}
   153|        ]
   154|      },
   155|      {
   156|        "step_id": "step_3",
   157|        "step_number": 3,
   158|        "description": "12 takes contact and presents quick ball. 9 clears to 10 who attacks the space behind.",
   159|        "players": [
   160|          {"id": "p9", "team": "attack", "number": 9, "x": 48, "y": 42, "has_ball": false},
   161|          {"id": "p10", "team": "attack", "number": 10, "x": 50, "y": 38, "has_ball": true},
   162|          {"id": "p12", "team": "attack", "number": 12, "x": 52, "y": 30, "has_ball": false},
   163|          {"id": "p13", "team": "attack", "number": 13, "x": 60, "y": 42, "has_ball": false},
   164|          {"id": "p11", "team": "attack", "number": 11, "x": 66, "y": 32, "has_ball": false}
   165|        ],
   166|        "lines": [
   167|          {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 50, "to_y": 38, "line_type": "pass", "option": 1},
   168|          {"id": "l2", "from_player_id": "p10", "to_player_id": "p11", "to_x": 66, "to_y": 32, "line_type": "pass", "option": 1},
   169|          {"id": "l3", "from_player_id": "p11", "to_player_id": null, "to_x": 78, "to_y": 22, "line_type": "run", "option": 1}
   170|        ],
   171|        "annotations": [
   172|          {"id": "a1", "type": "text", "x": 54, "y": 26, "text": "Quick ball", "end_x": null, "end_y": null}
   173|        ]
   174|      }
   175|    ]
   176|  }'::jsonb
   177|);
   178|
   179|-- ═══════════════════════════════════════════════════════════════════
   180|-- PLAY 3: Lineout Drive (STUB - 1 step, fills library)
   181|-- ═══════════════════════════════════════════════════════════════════
   182|
   183|INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
   184|VALUES (
   185|  'Lineout Drive',
   186|  'lineout-drive-3000000003',
   187|  'beginner',
   188|  'Set Piece',
   189|  true,
   190|  true,
   191|  '{
   192|    "version": 1,
   193|    "field_zone": "lineout_l",
   194|    "info": {
   195|      "what_is_it": "Set-piece maul from a 5-man lineout. Hooker throws, jumper catches, maul forms and drives forward.",
   196|      "when_to_use": "Attacking lineout inside the opposition 22.",
   197|      "why_it_works": "Disciplined maul is nearly impossible to legally stop. Commits forwards and creates mismatches in the backs.",
   198|      "key_positions": "2, 4, 5, 8",
   199|      "options_alternatives": "Option 2 peels off the back early. Option 3 fakes the maul and goes wide.",
   200|      "common_mistakes": "Jumper must transfer the ball to the scrum-half immediately — holding on invites the sack."
   201|    },
   202|    "steps": [{
   203|      "step_id": "step_1",
   204|      "step_number": 1,
   205|      "description": "Hooker throws to jumper at 2. Maul forms. Forwards bind and drive.",
   206|      "players": [
   207|        {"id": "p2", "team": "attack", "number": 2, "x": 50, "y": 80, "has_ball": false},
   208|        {"id": "p4", "team": "attack", "number": 4, "x": 48, "y": 55, "has_ball": true},
   209|        {"id": "p5", "team": "attack", "number": 5, "x": 52, "y": 55, "has_ball": false},
   210|        {"id": "p8", "team": "attack", "number": 8, "x": 50, "y": 62, "has_ball": false}
   211|      ],
   212|      "lines": [
   213|        {"id": "l1", "from_player_id": "p2", "to_player_id": "p4", "to_x": 48, "to_y": 55, "line_type": "pass", "option": 1},
   214|        {"id": "l2", "from_player_id": "p5", "to_player_id": null, "to_x": 50, "to_y": 40, "line_type": "run", "option": 1}
   215|      ],
   216|      "annotations": [
   217|        {"id": "a1", "type": "text", "x": 40, "y": 85, "text": "Lineout", "end_x": null, "end_y": null},
   218|        {"id": "a2", "type": "target", "x": 48, "y": 55, "text": "Jumper", "end_x": null, "end_y": null}
   219|      ]
   220|    }]
   221|  }'::jsonb
   222|);
   223|
   224|-- ═══════════════════════════════════════════════════════════════════
   225|-- PLAY 4: Scrum Backs Move (STUB)
   226|-- ═══════════════════════════════════════════════════════════════════
   227|
   228|INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
   229|VALUES (
   230|  'Scrum Backs Move',
   231|  'scrum-backs-move-4000000004',
   232|  'intermediate',
   233|  'Set Piece',
   234|  true,
   235|  true,
   236|  '{
   237|    "version": 1,
   238|    "field_zone": "opp_half",
   239|    "info": {
   240|      "what_is_it": "Off the scrum, 8 picks and goes blind before releasing 9 who hits 10 with a miss-pass to 13 on the loop.",
   241|      "when_to_use": "Scrum feed on the left side of the field. Defence is narrow.",
   242|      "why_it_works": "The blindside pick-and-go draws the back-row defence in, creating the overlap out wide.",
   243|      "key_positions": "8, 9, 10, 13",
   244|      "options_alternatives": "Option 2: 10 takes it flat and hits 12 on the crash. Option 3: 10 cross-kicks to 14.",
   245|      "common_mistakes": "8 must commit the blindside winger — a soft carry lets them drift onto the backs."
   246|    },
   247|    "steps": [{
   248|      "step_id": "step_1",
   249|      "step_number": 1,
   250|      "description": "Scrum set. 8 controls at the base. 9 and 10 set up for the move.",
   251|      "players": [
   252|        {"id": "p8", "team": "attack", "number": 8, "x": 44, "y": 50, "has_ball": true},
   253|        {"id": "p9", "team": "attack", "number": 9, "x": 40, "y": 48, "has_ball": false},
   254|        {"id": "p10", "team": "attack", "number": 10, "x": 52, "y": 42, "has_ball": false},
   255|        {"id": "p12", "team": "attack", "number": 12, "x": 58, "y": 40, "has_ball": false},
   256|        {"id": "p13", "team": "attack", "number": 13, "x": 64, "y": 38, "has_ball": false}
   257|      ],
   258|      "lines": [
   259|        {"id": "l1", "from_player_id": "p8", "to_player_id": "p9", "to_x": 40, "to_y": 48, "line_type": "pass", "option": 1}
   260|      ],
   261|      "annotations": [
   262|        {"id": "a1", "type": "text", "x": 36, "y": 52, "text": "Scrum", "end_x": null, "end_y": null}
   263|      ]
   264|    }]
   265|  }'::jsonb
   266|);
   267|
   268|-- ═══════════════════════════════════════════════════════════════════
   269|-- PLAY 5: The Skip Pass (STUB)
   270|-- ═══════════════════════════════════════════════════════════════════
   271|
   272|INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
   273|VALUES (
   274|  'The Skip Pass',
   275|  'the-skip-pass-5000000005',
   276|  'intermediate',
   277|  'Attack Structure',
   278|  true,
   279|  true,
   280|  '{
   281|    "version": 1,
   282|    "field_zone": "opp_half",
   283|    "info": {
   284|      "what_is_it": "10 deliberately skips 12 with a long pass to 13 to exploit a rushed defence on the outside.",
   285|      "when_to_use": "When the defence is up fast on 12 but leaving space outside. Good on front-foot ball.",
   286|      "why_it_works": "The skip pass isolates the outside defender and gives the outside backs a 2-on-1 or 3-on-2.",
   287|      "key_positions": "10, 12, 13, 14",
   288|      "options_alternatives": "Option 2: 12 runs a decoy line to hold the D. Option 3: 10 dummies the skip and hits 12 short.",
   289|      "common_mistakes": "Skip pass must be flat and hard — a floated pass is intercept bait."
   290|    },
   291|    "steps": [{
   292|      "step_id": "step_1",
   293|      "step_number": 1,
   294|      "description": "9 feeds 10. 12 runs a hard decoy line. 10 skips 12 and hits 13.",
   295|      "players": [
   296|        {"id": "p9", "team": "attack", "number": 9, "x": 38, "y": 48, "has_ball": true},
   297|        {"id": "p10", "team": "attack", "number": 10, "x": 44, "y": 44, "has_ball": false},
   298|        {"id": "p12", "team": "attack", "number": 12, "x": 50, "y": 40, "has_ball": false},
   299|        {"id": "p13", "team": "attack", "number": 13, "x": 58, "y": 36, "has_ball": false},
   300|        {"id": "p14", "team": "attack", "number": 14, "x": 66, "y": 32, "has_ball": false}
   301|      ],
   302|      "lines": [
   303|        {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 44, "to_y": 44, "line_type": "pass", "option": 1},
   304|        {"id": "l2", "from_player_id": "p10", "to_player_id": "p13", "to_x": 58, "to_y": 36, "line_type": "pass", "option": 1},
   305|        {"id": "l3", "from_player_id": "p12", "to_player_id": null, "to_x": 48, "to_y": 32, "line_type": "run", "option": 1}
   306|      ],
   307|      "annotations": [
   308|        {"id": "a1", "type": "text", "x": 56, "y": 50, "text": "SKIP", "end_x": null, "end_y": null}
   309|      ]
   310|    }]
   311|  }'::jsonb
   312|);
   313|
   314|-- ═══════════════════════════════════════════════════════════════════
   315|-- PLAY 6: Defensive Blitz (STUB)
   316|-- ═══════════════════════════════════════════════════════════════════
   317|
   318|INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
   319|VALUES (
   320|  'Defensive Blitz',
   321|  'defensive-blitz-6000000006',
   322|  'intermediate',
   323|  'Defence',
   324|  true,
   325|  true,
   326|  '{
   327|    "version": 1,
   328|    "field_zone": "own_half",
   329|    "info": {
   330|      "what_is_it": "Aggressive line-speed defence with the blindside winger shooting up to cut off the wide pass.",
   331|      "when_to_use": "When the opposition is playing wide-to-wide and you want to force them back inside.",
   332|      "why_it_works": "The blitz denies time and space for the first receiver, forcing rushed decisions and handling errors.",
   333|      "key_positions": "6, 7, 10, 11",
   334|      "options_alternatives": "Option 2: Hold the line and drift. Option 3: Double-blitz through 6 and 7.",
   335|      "common_mistakes": "If the blitz is mistimed, the opposition can chip behind or offload to the space vacated."
   336|    },
   337|    "steps": [{
   338|      "step_id": "step_1",
   339|      "step_number": 1,
   340|      "description": "Defensive line set. 11 shoots up to pressure the first receiver. 6 and 7 cover inside.",
   341|      "players": [
   342|        {"id": "d6", "team": "defence", "number": 6, "x": 46, "y": 38, "has_ball": false},
   343|        {"id": "d7", "team": "defence", "number": 7, "x": 50, "y": 36, "has_ball": false},
   344|        {"id": "d11", "team": "defence", "number": 11, "x": 56, "y": 34, "has_ball": false},
   345|        {"id": "d12", "team": "defence", "number": 12, "x": 52, "y": 40, "has_ball": false},
   346|        {"id": "d13", "team": "defence", "number": 13, "x": 60, "y": 38, "has_ball": false}
   347|      ],
   348|      "lines": [
   349|        {"id": "l1", "from_player_id": "d11", "to_player_id": null, "to_x": 52, "to_y": 38, "line_type": "run", "option": 1},
   350|        {"id": "l2", "from_player_id": "d6", "to_player_id": null, "to_x": 42, "to_y": 44, "line_type": "run", "option": 1}
   351|      ],
   352|      "annotations": [
   353|        {"id": "a1", "type": "text", "x": 40, "y": 24, "text": "BLITZ LINE", "end_x": null, "end_y": null}
   354|      ]
   355|    }]
   356|  }'::jsonb
   357|);
   358|
