# Graph Report - .  (2026-05-08)

## Corpus Check
- Corpus is ~21,196 words - fits in a single context window. You may not need a graph.

## Summary
- 317 nodes · 334 edges · 35 communities (31 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1672dbd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `Communities (36 total, 5 thin omitted)` - 17 edges
2. `cn()` - 16 edges
3. `Graph Report - .  (2026-05-07)` - 10 edges
4. `query()` - 10 edges
5. `Deployment` - 9 edges
6. `Google OAuth Setup` - 8 edges
7. `Schema` - 8 edges
8. `Per-User Star/Rating System` - 7 edges
9. `getSessionEmail()` - 7 edges
10. `Architecture` - 6 edges

## Surprising Connections (you probably didn't know these)
- `PATCH()` --calls--> `getSessionEmail()`  [EXTRACTED]
  src/app/api/events/[id]/rating/route.ts → src/lib/auth.ts
- `GET()` --calls--> `getSessionEmail()`  [EXTRACTED]
  src/app/api/user-ratings/route.ts → src/lib/auth.ts
- `formatEventDateTime()` --calls--> `formatDate()`  [INFERRED]
  src/lib/event-utils.ts → src/components/calendar/day-events-modal.tsx
- `AnalyticsPage()` --calls--> `useEventsAndRuns()`  [EXTRACTED]
  src/app/(protected)/analytics/page.tsx → src/hooks/use-events-and-runs.ts
- `AnalyticsPage()` --calls--> `useAnalyticsData()`  [EXTRACTED]
  src/app/(protected)/analytics/page.tsx → src/hooks/use-analytics-data.ts

## Communities (35 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (17): geocodeNominatim(), GET(), sleep(), geocodeNominatim(), GET(), sleep(), HomeClient(), getSessionEmail() (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (7): navItems, cn(), Calendar(), Popover(), PopoverTrigger(), StarFilterButtons(), StarFilterButtonsProps

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (26): Communities (36 total, 5 thin omitted), Community 0 - "Community 0", Community 10 - "Community 10", Community 11 - "Community 11", Community 12 - "Community 12", Community 13 - "Community 13", Community 14 - "Community 14", Community 15 - "Community 15" (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (18): API Queries, city_coordinates, city_road_distances, code:sql (SELECT r.*, s.duration, s.events_found, s.valid_events, s.st), code:bash (# Connect), code:sql (-- Materialized view/table for deduplicated events), code:sql (-- events), Database (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (10): AnalyticsChart(), ChartControls(), KpiCards(), AnalyticsPage(), useAnalyticsData(), useEventsAndRuns(), useLocations(), getDimensionValue() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (8): DistanceFilter, distanceOptions, HomeClientProps, EmptyState(), Select(), SelectItem(), SelectTrigger(), SelectValue()

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): Acceptance Tests, Auth & API:, Average Display:, code:bash (psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SE), code:bash (psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SE), code:bash (psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SE), code:bash (psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SE), code:bash (psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SE) (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): code:block1 (Browser → nginx (SSL, port 443) → Next.js (port 3000) → Post), code:bash (# Check status), code:bash (cd /home/vscode/projects/Frontend), code:nginx (server {), code:bash (sudo nginx -t && sudo systemctl reload nginx), code:env (# OAuth Credentials), code:bash (# Service running?), code:bash (git log --oneline -5                    # Find previous good) (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (4): formatDate(), buildColorMap(), formatDateLocal(), formatEventDateTime()

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (14): 1. Create Project, 2. OAuth Consent Screen, 3. Create Credentials, 4. Configure Environment, Auth Flow, Calendar API (Future), code:env (GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com), code:typescript (const { data: session } = useSession();) (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (9): useDebounce(), deserializeFilters(), isStringArray(), loadFromStorage(), saveToStorage(), serializeFilters(), useEventFilters(), applyEventFilters() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (4): GoogleSignInButton(), Footer(), HometownImageBox(), PageBackground()

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): Architecture, code:block1 (src/), code:block2 (PostgreSQL DB (vmpostgres → webscraper schema)), Data Flow, Key Patterns, Project Structure, Routes, Tech Stack

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (7): code:bash (npm run build), code:bash (sudo systemctl restart frontend.service), code:bash (sudo systemctl status frontend.service), Deployment, Deployment Process, graphify, Service Details

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (7): code:bash (npm install), code:bash (npm run build), Documentation, Eventig, Quick Start, Routes, Stack

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (5): Architecture, Context, Database Schema, Files, Plan: Per-User Event Rating System

## Knowledge Gaps
- **82 isolated node(s):** `code:bash (npm run build)`, `code:bash (sudo systemctl restart frontend.service)`, `code:bash (sudo systemctl status frontend.service)`, `Service Details`, `graphify` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 8`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `HomeClient()` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `code:bash (npm run build)`, `code:bash (sudo systemctl restart frontend.service)`, `code:bash (sudo systemctl status frontend.service)` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._