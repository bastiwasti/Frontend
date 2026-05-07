-- Migration: Precompute ratings in events_distinct
-- Run on: vmpostgres, schema webscraper

BEGIN;

-- 1. Add columns
ALTER TABLE events_distinct
  ADD COLUMN IF NOT EXISTS avg_rating FLOAT,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill from existing ratings
UPDATE events_distinct ed
SET avg_rating = r.avg_rating,
    rating_count = r.rating_count
FROM (
  SELECT event_id,
         ROUND(AVG(rating)::numeric, 1)::float AS avg_rating,
         COUNT(*)::int AS rating_count
  FROM event_ratings
  GROUP BY event_id
) r
WHERE ed.id = r.event_id;

-- 3. Trigger function to keep ratings in sync
CREATE OR REPLACE FUNCTION update_event_distinct_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_event_id INTEGER;
BEGIN
  target_event_id := COALESCE(NEW.event_id, OLD.event_id);
  UPDATE events_distinct
  SET avg_rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)::float
        FROM event_ratings WHERE event_id = target_event_id
      ),
      rating_count = (
        SELECT COUNT(*)::int
        FROM event_ratings WHERE event_id = target_event_id
      )
  WHERE id = target_event_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_event_ratings_changed ON event_ratings;
CREATE TRIGGER trg_event_ratings_changed
  AFTER INSERT OR UPDATE OR DELETE ON event_ratings
  FOR EACH ROW EXECUTE FUNCTION update_event_distinct_rating();

COMMIT;
