-- Migration 004: Slug generation function
-- Generates a unique URL-safe slug from a play title + random suffix

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

  -- Try with random numeric suffix
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
