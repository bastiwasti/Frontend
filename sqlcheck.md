# Database Debugging Guide

This document provides SQL queries for debugging the Events Gallery database. All queries are copy-paste ready with expected output examples.

## Database Location
```bash
/home/vscode/projects/WebScraper/data/events.db
```

## Quick Access
```bash
# Connect to database
sqlite3 /home/vscode/projects/WebScraper/data/events.db

# Run a single query from command line
sqlite3 /home/vscode/projects/WebScraper/data/events.db "SELECT COUNT(*) FROM events;"
```

---

## Quick Health Checks

### 1. Table Row Counts
Check if tables have data.

```sql
SELECT 
  'events' as table_name, COUNT(*) as row_count FROM events
UNION ALL
SELECT 'runs', COUNT(*) FROM runs
UNION ALL
SELECT 'status', COUNT(*) FROM status
UNION ALL
SELECT 'raw_summaries', COUNT(*) FROM raw_summaries;
```

**Expected Output:**
```
table_name     row_count
-------------  ----------
events         2
runs           1
status         1
raw_summaries   1
```

---

## Events Table Queries

### 2. All Events - Quick Overview
```sql
SELECT 
  id,
  name,
  datetime(start_datetime) as start,
  datetime(end_datetime) as end,
  location,
  category
FROM events;
```

**Expected Output:**
```
id  name                start                end                  location      category
--  -----------------  -------------------  --------------------  -------------  --------
1   Zeugniswochenende   2025-02-01 00:00:00  2025-02-01 00:00:00  St. Martin     Sonstige
2   Jugendberufshilfe  2025-02-08 10:00:00  2025-02-08 13:00:00  Gemeindehaus    Sonstige
```

### 3. Data Integrity - NULL Values
Check for missing critical data.

```sql
SELECT 
  COUNT(*) - COUNT(start_datetime) as missing_start_datetime,
  COUNT(*) - COUNT(end_datetime) as missing_end_datetime,
  COUNT(*) - COUNT(name) as missing_name,
  COUNT(*) - COUNT(location) as missing_location,
  COUNT(*) - COUNT(category) as missing_category,
  COUNT(*) - COUNT(source) as missing_source
FROM events;
```

**Expected Output (if clean):**
```
missing_start_datetime  missing_end_datetime  missing_name  missing_location  missing_category  missing_source
--------------------  --------------------  -------------  ----------------  ----------------  ----------------
0                    0                    0              0                 0                 0
```

### 4. Invalid Date Checks
Find events with invalid date ranges.

```sql
SELECT id, name, start_datetime, end_datetime
FROM events
WHERE start_datetime IS NULL 
   OR end_datetime IS NULL
   OR (end_datetime IS NOT NULL AND start_datetime > end_datetime);
```

**Expected Output (if clean):**
```
id  name  start_datetime  end_datetime
--  ----  -------------  -------------
```

### 5. Upcoming Events
Find events from today onward.

```sql
SELECT 
  id,
  name,
  datetime(start_datetime) as start,
  datetime(end_datetime) as end,
  location,
  category
FROM events
WHERE start_datetime >= datetime('now', 'start of day')
ORDER BY start_datetime ASC;
```

**Expected Output:**
```
id  name                start                end                  location      category
--  -----------------  -------------------  --------------------  -------------  --------
2   Jugendberufshilfe  2025-02-08 10:00:00  2025-02-08 13:00:00  Gemeindehaus    Sonstige
```

### 6. Events in Date Range (Calendar Filter Test)
Simulate frontend date range filter.

```sql
SELECT 
  id,
  name,
  datetime(start_datetime) as start,
  datetime(end_datetime) as end
FROM events
WHERE start_datetime >= '2025-02-01' 
  AND start_datetime <= '2025-02-28'
ORDER BY start_datetime ASC;
```

**Expected Output:**
```
id  name                start                end
--  -----------------  -------------------  -------------------
1   Zeugniswochenende   2025-02-01 00:00:00  2025-02-01 00:00:00
2   Jugendberufshilfe  2025-02-08 10:00:00  2025-02-08 13:00:00
```

### 7. Multi-Day Events
Find events spanning multiple days.

```sql
SELECT 
  id,
  name,
  datetime(start_datetime) as start,
  datetime(end_datetime) as end,
  julianday(end_datetime) - julianday(start_datetime) as days
FROM events
WHERE end_datetime IS NOT NULL
  AND date(start_datetime) != date(end_datetime)
ORDER BY start_datetime ASC;
```

**Expected Output (if clean):**
```
id  name  start  end  days
--  ----  -----  ---  ----
```

### 8. Events by Category
```sql
SELECT category, COUNT(*) as count
FROM events
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;
```

**Expected Output:**
```
category  count
--------  -----
Sonstige  2
```

### 9. Events by Location
```sql
SELECT location, COUNT(*) as count
FROM events
WHERE location IS NOT NULL
GROUP BY location
ORDER BY count DESC;
```

**Expected Output:**
```
location      count
-------------  -----
St. Martin    1
Gemeindehaus   1
```

### 10. Events by City
```sql
SELECT city, COUNT(*) as count
FROM events
WHERE city IS NOT NULL AND city != ''
GROUP BY city
ORDER BY count DESC;
```

**Expected Output:**
```
city  count
----  -----
```

### 11. Events by Run ID
```sql
SELECT run_id, COUNT(*) as event_count
FROM events
GROUP BY run_id
ORDER BY run_id;
```

**Expected Output:**
```
run_id  event_count
-------  -----------
1        2
```

### 12. Most Recent Events
```sql
SELECT 
  id,
  name,
  datetime(start_datetime) as start,
  datetime(created_at) as created
FROM events
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Output:**
```
id  name                start                created
--  -----------------  -------------------  -------------------
2   Jugendberufshilfe  2025-02-08 10:00:00  2026-02-08 09:59:46
1   Zeugniswochenende   2025-02-01 00:00:00  2026-02-08 09:59:46
```

---

## Status Table Queries

### 13. All Run Statistics
```sql
SELECT 
  s.run_id,
  r.agent,
  s.duration as run_duration_seconds,
  s.events_found,
  s.valid_events,
  s.full_run,
  datetime(s.start_time) as started,
  datetime(s.end_time) as ended
FROM status s
JOIN runs r ON s.run_id = r.id
ORDER BY s.run_id DESC;
```

**Expected Output:**
```
run_id  agent            run_duration_seconds  events_found  valid_events  full_run  started                  ended
-------  ---------------  -------------------  -------------  -------------  --------  -----------------------  -----------------
1        scraper, analyzer  7                   2              2              1         2025-02-08 09:59:46     2025-02-08 09:59:53
```

### 14. Runs with Zero Valid Events
```sql
SELECT s.run_id, s.events_found, s.valid_events
FROM status s
WHERE s.valid_events = 0
ORDER BY s.run_id;
```

**Expected Output (if clean):**
```
run_id  events_found  valid_events
-------  -------------  -------------
```

### 15. Runs with Invalid Duration
```sql
SELECT run_id, duration
FROM status
WHERE duration IS NULL OR duration < 0 OR duration > 86400;
```

**Expected Output (if clean):**
```
run_id  duration
-------  --------
```

### 16. Run Performance Comparison
```sql
SELECT 
  run_id,
  events_found,
  valid_events,
  CASE 
    WHEN events_found > 0 THEN ROUND((valid_events * 100.0 / events_found), 2)
    ELSE 0
  END as success_rate_percent
FROM status
ORDER BY run_id;
```

**Expected Output:**
```
run_id  events_found  valid_events  success_rate_percent
-------  -------------  -------------  -------------------
1        2              2              100.0
```

---

## Raw Summaries Table Queries

### 17. Scraping Metadata
```sql
SELECT 
  id,
  run_id,
  location,
  max_search,
  fetch_urls,
  cities,
  datetime(created_at) as created
FROM raw_summaries
ORDER BY run_id DESC;
```

**Expected Output:**
```
id  run_id  location  max_search  fetch_urls  cities     created
--  -------  --------  ----------  -----------  ---------  -------------------
1   1        dormagen  10          1            dormagen    2026-02-08 09:59:46
```

### 18. Search Queries Used
```sql
SELECT run_id, search_queries
FROM raw_summaries
WHERE search_queries IS NOT NULL;
```

**Expected Output:**
```
run_id  search_queries
-------  --------------
1        events, activities
```

---

## JOIN Queries (Matching API Logic)

### 19. Events with Full Run Metadata
This matches the `/api/events` API query logic.

```sql
SELECT 
  e.id,
  e.name,
  e.description,
  e.location,
  e.city,
  e.start_datetime,
  e.end_datetime,
  e.category,
  e.source,
  e.created_at,
  r.agent,
  r.cities as run_cities,
  s.duration as run_duration,
  s.events_found as run_events_found,
  s.valid_events as run_valid_events
FROM events e
LEFT JOIN runs r ON e.run_id = r.id
LEFT JOIN status s ON r.id = s.run_id
ORDER BY e.start_datetime ASC;
```

**Expected Output:**
```
id  name                location     start_datetime        end_datetime          agent            run_duration  run_events_found  run_valid_events
--  -----------------  ------------  --------------------  --------------------  ---------------  ------------  ----------------  -----------------
1   Zeugniswochenende   St. Martin   2025-02-01T00:00:00  2025-02-01T00:00:00  scraper, analyzer  7             2                2
2   Jugendberufshilfe  Gemeindehaus  2025-02-08T10:00:00  2025-02-08T13:00:00  scraper, analyzer  7             2                2
```

### 20. Filter by Run ID
```sql
SELECT e.id, e.name, e.start_datetime, r.agent
FROM events e
LEFT JOIN runs r ON e.run_id = r.id
WHERE e.run_id = 1
ORDER BY e.start_datetime ASC;
```

**Expected Output:**
```
id  name                start_datetime        agent
--  -----------------  --------------------  ---------------
1   Zeugniswochenende   2025-02-01T00:00:00  scraper, analyzer
2   Jugendberufshilfe  2025-02-08T10:00:00  scraper, analyzer
```

### 21. Filter by Category
```sql
SELECT e.id, e.name, e.start_datetime, e.category
FROM events e
WHERE e.category = 'Sonstige'
ORDER BY e.start_datetime ASC;
```

**Expected Output:**
```
id  name                start_datetime        category
--  -----------------  --------------------  --------
1   Zeugniswochenende   2025-02-01T00:00:00  Sonstige
2   Jugendberufshilfe  2025-02-08T10:00:00  Sonstige
```

---

## Performance & Indexes

### 22. Check Indexes
```sql
SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%';
```

**Expected Output:**
```
name                          tbl_name
----------------------------  ----------
idx_status_run_id              status
idx_raw_summaries_created_at   raw_summaries
idx_raw_summaries_run_id       raw_summaries
idx_events_start_datetime      events
idx_events_end_datetime        events
idx_events_category           events
idx_events_run_id            events
```

### 23. Explain Query Plan
See how SQLite processes the query.

```sql
EXPLAIN QUERY PLAN
SELECT * FROM events WHERE start_datetime >= '2025-02-01' ORDER BY start_datetime;
```

**Expected Output:**
```
addr  opcode           p1  p2  p3  p4  p5
----  ---------------  ---  ---  ---  ---  ---
0     Init             0   17
1     OpenRead         2   4   0   0
2     OpenRead         3   6   0   0
3     Affinity         3   0
4     SeekGe           3   1   3   0
5     IdxGE           1   6   0
6     IdxLT            1   7   0
7     DecrJumpZero     7   8
8     RowData          3   0
9     Rowid            1   0
10    Ne               1   3
11    If               1   14
12    SeekGT           3   1   5
13    IdxGT            1   7
14    IfPos             1   2
15    ResultRow        0   17
16    Halt             0   0
```

---

## Common Issues and Fixes

### Issue 1: Events Not Showing in Frontend

**Symptoms:**
- API returns data but frontend shows "No events found"
- Events count shows 0

**Debug Queries:**

Check if events exist:
```sql
SELECT COUNT(*) FROM events;
```

Check date format:
```sql
SELECT id, name, start_datetime, end_datetime
FROM events
LIMIT 1;
```

**Possible Causes:**
1. **Invalid date format** - Frontend expects ISO 8601 format
   - Fix: Ensure dates are in `YYYY-MM-DDTHH:MM:SS` format
   - Example: `2025-02-08T10:00:00`

2. **All events in the past** - Calendar filter may exclude past events
   - Fix: Clear frontend date filter or check frontend filter logic

3. **NULL critical fields** - Frontend filtering out events with missing data
   - Fix: Populate missing start_datetime fields

**Verification:**
```sql
-- Check for future events
SELECT COUNT(*) FROM events WHERE start_datetime >= datetime('now');
```

---

### Issue 2: Date Filter Not Working

**Symptoms:**
- Calendar filter not showing expected events
- Events disappear when selecting date range

**Debug Queries:**

Test date range manually:
```sql
SELECT id, name, start_datetime
FROM events
WHERE start_datetime >= '2025-02-01' 
  AND start_datetime <= '2025-02-28'
ORDER BY start_datetime;
```

Check for NULL dates:
```sql
SELECT COUNT(*) FROM events WHERE start_datetime IS NULL;
```

**Possible Causes:**
1. **Date format mismatch** - Query format doesn't match database format
   - Fix: Use `datetime()` function for consistent formatting
   - Example: `WHERE datetime(start_datetime) >= '2025-02-01'`

2. **Time zone issues** - Events stored in UTC, displayed in local time
   - Fix: Normalize timezone in query
   - Example: `WHERE datetime(start_datetime, 'localtime') >= '2025-02-01'`

3. **Inclusive/exclusive boundaries** - Filter logic mismatch
   - Fix: Verify filter uses correct comparison operators (>= vs >)

---

### Issue 3: Category Filter Returns Nothing

**Symptoms:**
- Category dropdown shows options, but selecting one returns no events
- Category count doesn't match expected

**Debug Queries:**

Check exact category values:
```sql
SELECT DISTINCT category, COUNT(*) 
FROM events 
WHERE category IS NOT NULL 
GROUP BY category;
```

Check for whitespace issues:
```sql
SELECT id, name, category, length(category) as length
FROM events
WHERE category LIKE '%Sonstige%';
```

**Possible Causes:**
1. **Whitespace or special characters** - Categories have hidden spaces
   - Fix: Use `TRIM()` function
   - Example: `WHERE TRIM(category) = 'Sonstige'`

2. **Case sensitivity** - Category case doesn't match
   - Fix: Use `COLLATE NOCASE` for case-insensitive comparison
   - Example: `WHERE category COLLATE NOCASE = 'sonstige'`

3. **NULL vs empty string** - Mix of NULL and ''
   - Fix: Normalize to either NULL or ''
   - Example: `UPDATE events SET category = NULL WHERE category = '';`

---

### Issue 4: Events Not Sorted Correctly

**Symptoms:**
- Events appear in wrong order
- Newer events shown before older events

**Debug Queries:**

Check sorting:
```sql
SELECT id, name, start_datetime
FROM events
ORDER BY start_datetime ASC;
```

Check for NULL dates affecting sort:
```sql
SELECT id, name, start_datetime
FROM events
WHERE start_datetime IS NULL;
```

**Possible Causes:**
1. **NULL start_datetime** - NULLs sort to beginning or end
   - Fix: Populate all start_datetime fields
   - Example: `UPDATE events SET start_datetime = created_at WHERE start_datetime IS NULL;`

2. **Wrong sort direction** - ASC vs DESC mismatch
   - Fix: Verify API and frontend use same direction
   - Current: API uses ASC (earliest first)

3. **String vs date comparison** - Dates stored as strings
   - Fix: Use `datetime()` function for proper sorting
   - Example: `ORDER BY datetime(start_datetime) ASC`

---

### Issue 5: Run Shows No Events

**Symptoms:**
- Status table shows run completed with events_found > 0
- Events table has 0 rows for that run_id

**Debug Queries:**

Check run exists:
```sql
SELECT id, agent FROM runs WHERE id = 1;
```

Check run's events:
```sql
SELECT COUNT(*) FROM events WHERE run_id = 1;
```

Check run status:
```sql
SELECT run_id, events_found, valid_events 
FROM status 
WHERE run_id = 1;
```

**Possible Causes:**
1. **Transaction not committed** - Events in transaction but not saved
   - Fix: Commit transaction or restart application

2. **Rollback occurred** - Events inserted but rolled back on error
   - Fix: Check application logs for rollback reasons

3. **Wrong run_id** - Events linked to different run
   - Fix: Verify run_id values match
   - Example: Check next available run_id: `SELECT MAX(run_id) FROM events;`

---

### Issue 6: Performance Issues

**Symptoms:**
- Queries run slowly
- Frontend takes long to load

**Debug Queries:**

Check indexes exist:
```sql
SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'events';
```

Analyze slow query:
```sql
EXPLAIN QUERY PLAN
SELECT * FROM events 
WHERE start_datetime >= '2025-02-01' 
ORDER BY start_datetime;
```

**Possible Causes:**
1. **Missing indexes** - No index on filtered columns
   - Fix: Create indexes on frequently queried columns
   - Example: `CREATE INDEX idx_events_location ON events(location);`

2. **Large dataset** - Too many rows for current hardware
   - Fix: Add date range filtering to reduce result set
   - Example: Always filter by recent dates first

3. **JOIN performance** - Complex joins slow down queries
   - Fix: Optimize JOIN order or add foreign key indexes
   - Example: Ensure idx_events_run_id exists (it does!)

---

### Issue 7: Duplicate Events

**Symptoms:**
- Same event appears multiple times
- COUNT(*) higher than expected

**Debug Queries:**

Find exact duplicates:
```sql
SELECT name, location, start_datetime, COUNT(*) as count
FROM events
GROUP BY name, location, start_datetime
HAVING COUNT(*) > 1;
```

Find similar duplicates (fuzzy match):
```sql
SELECT e1.id, e1.name, e2.id, e2.name
FROM events e1
JOIN events e2 ON e1.name = e2.name AND e1.id < e2.id;
```

**Possible Causes:**
1. **Run executed twice** - Same scraper run repeated
   - Fix: Check status table for duplicate run entries
   - Example: `SELECT run_id, COUNT(*) FROM status GROUP BY run_id HAVING COUNT(*) > 1;`

2. **Idempotency issue** - Scraper inserts duplicates
   - Fix: Add UNIQUE constraint or check before insert

3. **Data source duplicates** - Same event from multiple sources
   - Fix: Deduplicate by source or normalize data

---

## Quick Reference

### Date Functions
```sql
-- Current date/time
SELECT datetime('now');

-- Start of today
SELECT datetime('now', 'start of day');

-- Start of month
SELECT datetime('now', 'start of month');

-- Add days
SELECT datetime('now', '+7 days');

-- Format date
SELECT datetime(start_datetime, 'localtime') as local_time;
```

### Useful Aggregates
```sql
-- Count
SELECT COUNT(*) FROM events;

-- Average
SELECT AVG(duration) FROM status;

-- Sum
SELECT SUM(events_found) FROM status;

-- Max/Min
SELECT MAX(start_datetime), MIN(start_datetime) FROM events;
```

### String Functions
```sql
-- Length
SELECT LENGTH(name) FROM events;

-- Trim whitespace
SELECT TRIM(category) FROM events;

-- Substring
SELECT SUBSTRING(name, 1, 10) FROM events;

-- Uppercase/Lowercase
SELECT UPPER(name), LOWER(name) FROM events;
```

---

## Exit Database
```sql
.quit
```

---

**Last Updated:** 2026-02-08
**Database Version:** SQLite 3
**Tables:** events, runs, status, raw_summaries
