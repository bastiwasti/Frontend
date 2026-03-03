-- Per-user event ratings migration
-- Creates event_ratings table and migrates existing ratings

-- 1. Create the per-user ratings table
CREATE TABLE IF NOT EXISTS webscraper.event_ratings (
    user_email  VARCHAR(255) NOT NULL,
    event_id    INTEGER NOT NULL REFERENCES webscraper.events_distinct(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    rated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_email, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_ratings_event_id ON webscraper.event_ratings(event_id);

-- 2. Grant permissions to the app's DB user
GRANT SELECT, INSERT, UPDATE, DELETE ON webscraper.event_ratings TO jobsearch_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON webscraper.event_ratings TO jobsearch_readonly;

-- 3. Migrate existing ratings to primary user
INSERT INTO webscraper.event_ratings (user_email, event_id, rating)
SELECT 'sebastiankappler@gmx.de', id, rating
FROM webscraper.events_distinct
WHERE rating IS NOT NULL
ON CONFLICT (user_email, event_id) DO NOTHING;
