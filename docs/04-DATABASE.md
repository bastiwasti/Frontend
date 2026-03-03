# Database

PostgreSQL database shared with the WebScraper project.

**Location:** PostgreSQL (vmpostgres → webscraper schema)
**Config:** `src/config/db.ts` exports `DB_CONFIG`
**Connection:** `postgresql://jobsearch_readonly:password@localhost:5432/vmpostgres?options=-csearch_path%3Dwebscraper`

## Schema

### events

```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    run_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    category TEXT,
    source TEXT,
    city TEXT,
    created_at TIMESTAMP NOT NULL,
    event_url TEXT,
    detail_scraped INTEGER DEFAULT 0,
    detail_page_html TEXT,
    detail_location TEXT,
    detail_description TEXT,
    detail_full_description TEXT,
    raw_data TEXT,
    origin TEXT,
    FOREIGN KEY (run_id) REFERENCES runs(id)
);
```

### runs

```sql
CREATE TABLE runs (
    id SERIAL PRIMARY KEY,
    agent TEXT NOT NULL,
    location TEXT,
    cities TEXT,
    created_at TIMESTAMP NOT NULL,
    raw_summary_id INTEGER
);
```

### status

```sql
CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    run_id INTEGER NOT NULL,
    linked_run_id INTEGER,
    urls TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration REAL,
    events_found INTEGER DEFAULT 0,
    valid_events INTEGER DEFAULT 0,
    events_regex INTEGER DEFAULT 0,
    events_llm INTEGER DEFAULT 0,
    full_run INTEGER DEFAULT 0,
    FOREIGN KEY (run_id) REFERENCES runs(id),
    FOREIGN KEY (linked_run_id) REFERENCES runs(id)
);
```

### raw_summaries

```sql
CREATE TABLE raw_summaries (
    id SERIAL PRIMARY KEY,
    run_id INTEGER,
    location TEXT,
    max_search INTEGER,
    fetch_urls INTEGER,
    cities TEXT,
    search_queries TEXT,
    raw_summary TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (run_id) REFERENCES runs(id)
);
```

### events_distinct

```sql
-- Materialized view/table for deduplicated events
CREATE TABLE events_distinct (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    city TEXT,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    category TEXT,
    source TEXT,
    origin TEXT,
    event_url TEXT,
    rating INTEGER,
    first_seen_at TIMESTAMP,
    last_seen_at TIMESTAMP,
    seen_count INTEGER
);
```

### city_coordinates

```sql
CREATE TABLE city_coordinates (
    city_name TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### city_road_distances

```sql
CREATE TABLE city_road_distances (
    home_city TEXT NOT NULL,
    city TEXT NOT NULL,
    km REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (home_city, city)
);
```

## Indexes

```sql
-- events
idx_events_start_datetime   ON events(start_datetime)
idx_events_end_datetime     ON events(end_datetime)
idx_events_category         ON events(category)
idx_events_run_id           ON events(run_id)
idx_events_dedup            ON events(name, location, start_datetime, created_at DESC)

-- status
idx_status_run_id           ON status(run_id)

-- raw_summaries
idx_raw_summaries_run_id    ON raw_summaries(run_id)
idx_raw_summaries_created_at ON raw_summaries(created_at)

-- events_distinct
idx_events_distinct_start   ON events_distinct(start_datetime)
idx_events_distinct_category ON events_distinct(category)
idx_events_distinct_city    ON events_distinct(city)

-- locations (Ausflüge feature)
idx_locations_category      ON locations(category)
idx_locations_city          ON locations(city)
idx_locations_distance      ON locations(distance_km)
idx_locations_source        ON locations(source)
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
psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SET search_path TO webscraper"

# Row counts
SELECT 'events' as t, COUNT(*) FROM events
UNION ALL SELECT 'runs', COUNT(*) FROM runs
UNION ALL SELECT 'status', COUNT(*) FROM status;

# Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'webscraper';

# Find duplicates
SELECT name, location, start_datetime, COUNT(*) as n
FROM events GROUP BY name, location, start_datetime HAVING n > 1;

# Events by category
SELECT category, COUNT(*) FROM events WHERE category IS NOT NULL GROUP BY category ORDER BY 2 DESC;

# Events by city
SELECT city, COUNT(*) FROM events WHERE city IS NOT NULL GROUP BY city ORDER BY 2 DESC;

# Upcoming events
SELECT id, name, start_datetime FROM events
WHERE start_datetime >= CURRENT_TIMESTAMP ORDER BY start_datetime LIMIT 10;

# Run performance
SELECT s.run_id, r.agent, s.duration, s.events_found, s.valid_events
FROM status s JOIN runs r ON s.run_id = r.id ORDER BY s.run_id DESC LIMIT 10;
```
