-- Migration 008: Team management RLS policies
-- Adds write policies for teams and team_coaches (required by Module 08)

-- ═══════════════════════════════════════════════════════════════════
-- TEAMS
-- ═══════════════════════════════════════════════════════════════════

-- Any authenticated user can create a team
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Only the team owner can update team settings
DROP POLICY IF EXISTS "Team owner can update team" ON teams;
CREATE POLICY "Team owner can update team"
  ON teams FOR UPDATE
  USING (created_by = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- TEAM_COACHES
-- ═══════════════════════════════════════════════════════════════════

-- Any authenticated user can join as a coach (INSERT themselves)
DROP POLICY IF EXISTS "Users can join teams as coach" ON team_coaches;
CREATE POLICY "Users can join teams as coach"
  ON team_coaches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Team owners can remove coaches
DROP POLICY IF EXISTS "Team owner can delete coaches" ON team_coaches;
CREATE POLICY "Team owner can delete coaches"
  ON team_coaches FOR DELETE
  USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_coaches
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
