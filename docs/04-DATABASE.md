# Database

SQLite database shared with the WebScraper project.

**Location:** `/home/vscode/projects/WebScraper/data/events.db`
**Config:** `src/config/db.ts` exports `DB_PATH`

## Schema

### events

```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_datetime DATETIME,
    end_datetime DATETIME,
    category TEXT,
    source TEXT,
    city TEXT,
    created_at TEXT NOT NULL,
    event_url TEXT,
    detail_scraped INTEGER DEFAULT 0,
    detail_page_html TEXT,          -- avg 16KB/row, excluded from API queries
    detail_location TEXT,
    detail_description TEXT,
    detail_full_description TEXT,
    raw_data TEXT,
    FOREIGN KEY (run_id) REFERENCES runs(id)
);
```

### runs

```sql
CREATE TABLE runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent TEXT,
    location TEXT,
    cities TEXT,
    created_at TEXT,
    raw_summary_id INTEGER
);
```

### status

```sql
CREATE TABLE status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER,
    linked_run_id INTEGER,
    urls TEXT,
    start_time TEXT,
    end_time TEXT,
    duration REAL,
    events_found INTEGER,
    valid_events INTEGER,
    full_run INTEGER
);
```

### raw_summaries

```sql
CREATE TABLE raw_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER,
    location TEXT,
    max_search INTEGER,
    fetch_urls INTEGER,
    cities TEXT,
    search_queries TEXT,
    created_at TEXT
);
```

## Indexes

```sql
-- Existing
idx_events_start_datetime   ON events(start_datetime)
idx_events_end_datetime     ON events(end_datetime)
idx_events_category         ON events(category)
idx_events_run_id           ON events(run_id)
idx_status_run_id           ON status(run_id)
idx_raw_summaries_run_id    ON raw_summaries(run_id)
idx_raw_summaries_created_at ON raw_summaries(created_at)

-- Added for performance (dedup window function)
idx_events_dedup            ON events(name, location, start_datetime, created_at DESC)
```

## API Queries

### GET /api/events

Returns deduplicated events (latest per name+location+start_datetime):

```sql
WITH ranked_events AS (
  SELECT e.id, e.run_id, e.name, e.description, e.location, e.city,
         e.start_datetime, e.end_datetime, e.category, e.source, e.created_at,
         r.agent, r.cities as run_cities,
         s.duration as run_duration, s.events_found as run_events_found,
         s.valid_events as run_valid_events,
         ROW_NUMBER() OVER (
           PARTITION BY e.name, e.location, e.start_datetime
           ORDER BY e.created_at DESC
         ) as rn
  FROM events e
  LEFT JOIN runs r ON e.run_id = r.id
  LEFT JOIN status s ON r.id = s.run_id
)
SELECT * FROM ranked_events WHERE rn = 1
ORDER BY start_datetime ASC
```

**Performance note:** The query explicitly selects 11 event columns (not `e.*`) to avoid loading `detail_page_html` (~16KB/row) into the window function. This reduced query time from ~2s to ~0.2s.

With `?run_id=N`, returns all events for that run (no dedup).

Response includes `Cache-Control: public, max-age=300` (5-minute browser cache).

### GET /api/runs

```sql
SELECT r.*, s.duration, s.events_found, s.valid_events, s.start_time, s.end_time
FROM runs r
LEFT JOIN status s ON r.id = s.run_id
ORDER BY r.id DESC
```

Also cached for 5 minutes.

## Quick Debugging

```bash
# Connect
sqlite3 /home/vscode/projects/WebScraper/data/events.db

# Row counts
SELECT 'events' as t, COUNT(*) FROM events
UNION ALL SELECT 'runs', COUNT(*) FROM runs
UNION ALL SELECT 'status', COUNT(*) FROM status;

# Check indexes
SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';

# Find duplicates
SELECT name, location, start_datetime, COUNT(*) as n
FROM events GROUP BY name, location, start_datetime HAVING n > 1;

# Events by category
SELECT category, COUNT(*) FROM events WHERE category IS NOT NULL GROUP BY category ORDER BY 2 DESC;

# Events by city
SELECT city, COUNT(*) FROM events WHERE city IS NOT NULL GROUP BY city ORDER BY 2 DESC;

# Upcoming events
SELECT id, name, start_datetime FROM events
WHERE start_datetime >= datetime('now') ORDER BY start_datetime LIMIT 10;

# Run performance
SELECT s.run_id, r.agent, s.duration, s.events_found, s.valid_events
FROM status s JOIN runs r ON s.run_id = r.id ORDER BY s.run_id DESC LIMIT 10;
```
