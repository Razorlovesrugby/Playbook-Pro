-- Migration 003: Teams, team_coaches, team_plays

CREATE TABLE IF NOT EXISTS teams (
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
CREATE TABLE IF NOT EXISTS team_coaches (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'coach' CHECK (role IN ('owner', 'coach')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- Plays published to a team playbook
CREATE TABLE IF NOT EXISTS team_plays (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  published_by UUID REFERENCES auth.users(id),
  sort_order INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, play_id)
);

CREATE INDEX IF NOT EXISTS idx_team_plays_team ON team_plays(team_id, sort_order);
