-- Migration 002: Plays table
-- Core table storing play JSON + metadata

CREATE TABLE IF NOT EXISTS plays (
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

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS plays_updated_at ON plays;
CREATE TRIGGER plays_updated_at
  BEFORE UPDATE ON plays
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plays_slug ON plays(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plays_library ON plays(is_library_play, difficulty, category) WHERE is_library_play = true;
CREATE INDEX IF NOT EXISTS idx_plays_created_by ON plays(created_by, created_at DESC);
