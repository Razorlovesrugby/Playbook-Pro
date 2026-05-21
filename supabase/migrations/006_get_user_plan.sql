-- Helper function: get a user's current plan tier
-- Returns 'free', 'team', or 'club' based on active team subscriptions
-- Falls back to 'free' if user has no active paid team plan

CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  plan_result TEXT;
BEGIN
  SELECT t.plan INTO plan_result
  FROM teams t
  JOIN team_coaches tc ON tc.team_id = t.id
  WHERE tc.user_id = p_user_id
    AND (t.plan_expires_at IS NULL OR t.plan_expires_at > now())
  ORDER BY
    CASE t.plan
      WHEN 'club' THEN 1
      WHEN 'team' THEN 2
      ELSE 3
    END
  LIMIT 1;

  RETURN COALESCE(plan_result, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
