-- RLS Policies: Row Level Security for all Playbook tables
-- Enable RLS on all tables first, then apply policies

ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_plays ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- PLAYS
-- ═══════════════════════════════════════════════════════════════════

-- Anyone can read published plays or library plays (no auth required)
DROP POLICY IF EXISTS "Public plays are readable by anyone" ON plays;
CREATE POLICY "Public plays are readable by anyone"
  ON plays FOR SELECT
  USING (published = true OR is_library_play = true);

-- Authenticated coaches can read their own plays
DROP POLICY IF EXISTS "Coaches can read own plays" ON plays;
CREATE POLICY "Coaches can read own plays"
  ON plays FOR SELECT
  USING (auth.uid() = created_by);

-- Coaches can insert their own plays
DROP POLICY IF EXISTS "Coaches can insert plays" ON plays;
CREATE POLICY "Coaches can insert plays"
  ON plays FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Coaches can update their own plays
DROP POLICY IF EXISTS "Coaches can update own plays" ON plays;
CREATE POLICY "Coaches can update own plays"
  ON plays FOR UPDATE
  USING (auth.uid() = created_by);

-- Coaches can delete their own plays
DROP POLICY IF EXISTS "Coaches can delete own plays" ON plays;
CREATE POLICY "Coaches can delete own plays"
  ON plays FOR DELETE
  USING (auth.uid() = created_by);

-- ═══════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Profiles readable by owner" ON profiles;
CREATE POLICY "Profiles readable by owner"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles updatable by owner" ON profiles;
CREATE POLICY "Profiles updatable by owner"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════
-- TEAMS
-- ═══════════════════════════════════════════════════════════════════

-- Team playbooks readable by anyone (players browse without auth)
DROP POLICY IF EXISTS "Teams are publicly readable" ON teams;
CREATE POLICY "Teams are publicly readable"
  ON teams FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- TEAM_COACHES
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Team coaches readable by team members" ON team_coaches;
CREATE POLICY "Team coaches readable by team members"
  ON team_coaches FOR SELECT
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT team_id FROM team_coaches WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════
-- TEAM_PLAYS
-- ═══════════════════════════════════════════════════════════════════

-- Anyone can see plays published to a team
DROP POLICY IF EXISTS "Team plays readable by anyone" ON team_plays;
CREATE POLICY "Team plays readable by anyone"
  ON team_plays FOR SELECT
  USING (true);

-- Only team coaches can publish/unpublish
DROP POLICY IF EXISTS "Team coaches can manage team plays" ON team_plays;
CREATE POLICY "Team coaches can manage team plays"
  ON team_plays FOR ALL
  USING (
    team_id IN (SELECT team_id FROM team_coaches WHERE user_id = auth.uid())
  );
