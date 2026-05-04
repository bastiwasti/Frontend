# Graph Report - /home/sebastian/projects/frontend  (2026-05-04)

## Corpus Check
- Corpus is ~18,885 words - fits in a single context window. You may not need a graph.

## Summary
- 159 nodes · 182 edges · 25 communities (17 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed67f43`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Main Page & Data Hooks|Main Page & Data Hooks]]
- [[_COMMUNITY_UI Components & Calendar Chips|UI Components & Calendar Chips]]
- [[_COMMUNITY_API Routes & AuthDB|API Routes & Auth/DB]]
- [[_COMMUNITY_Analytics Dashboard|Analytics Dashboard]]
- [[_COMMUNITY_Calendar Week Grid & Events|Calendar Week Grid & Events]]
- [[_COMMUNITY_Event Filters & Calendar UI|Event Filters & Calendar UI]]
- [[_COMMUNITY_Filter Logic & Persistence|Filter Logic & Persistence]]
- [[_COMMUNITY_Locations Page & Map|Locations Page & Map]]
- [[_COMMUNITY_Layout & Page Background|Layout & Page Background]]
- [[_COMMUNITY_Distance Precalculation Script|Distance Precalculation Script]]
- [[_COMMUNITY_Root Layout & Auth Provider|Root Layout & Auth Provider]]
- [[_COMMUNITY_Login & Google Sign-In|Login & Google Sign-In]]
- [[_COMMUNITY_City Coordinates API|City Coordinates API]]
- [[_COMMUNITY_Runs & Status Page|Runs & Status Page]]
- [[_COMMUNITY_Plotly Type Declarations|Plotly Type Declarations]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 16 edges
2. `query()` - 7 edges
3. `Select()` - 5 edges
4. `SelectValue()` - 5 edges
5. `SelectTrigger()` - 5 edges
6. `SelectItem()` - 5 edges
7. `getSessionEmail()` - 5 edges
8. `CardDescription()` - 4 edges
9. `LoadingSpinner()` - 4 edges
10. `Popover()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `PATCH()` --calls--> `getSessionEmail()`  [INFERRED]
  src/app/api/events/[id]/rating/route.ts → src/lib/auth.ts
- `GET()` --calls--> `getSessionEmail()`  [INFERRED]
  src/app/api/events/route.ts → src/lib/auth.ts
- `AnalyticsPage()` --calls--> `useEventsAndRuns()`  [INFERRED]
  src/app/(protected)/analytics/page.tsx → src/hooks/use-events-and-runs.ts
- `AnalyticsPage()` --calls--> `useAnalyticsData()`  [INFERRED]
  src/app/(protected)/analytics/page.tsx → src/hooks/use-analytics-data.ts
- `formatEventDateTime()` --calls--> `formatDate()`  [INFERRED]
  src/lib/event-utils.ts → src/components/calendar/day-events-modal.tsx

## Communities (25 total, 8 thin omitted)

### Community 0 - "Main Page & Data Hooks"
Cohesion: 0.16
Nodes (7): useCityDistances(), useEvents(), EmptyState(), Select(), SelectItem(), SelectTrigger(), SelectValue()

### Community 2 - "API Routes & Auth/DB"
Cohesion: 0.15
Nodes (7): geocodeNominatim(), GET(), sleep(), GET(), getSessionEmail(), query(), PATCH()

### Community 3 - "Analytics Dashboard"
Cohesion: 0.14
Nodes (8): AnalyticsChart(), ChartControls(), KpiCards(), AnalyticsPage(), useAnalyticsData(), useEventsAndRuns(), getDimensionValue(), CardDescription()

### Community 4 - "Calendar Week Grid & Events"
Cohesion: 0.12
Nodes (4): formatDate(), buildColorMap(), formatDateLocal(), formatEventDateTime()

### Community 5 - "Event Filters & Calendar UI"
Cohesion: 0.2
Nodes (3): Calendar(), Popover(), PopoverTrigger()

### Community 6 - "Filter Logic & Persistence"
Cohesion: 0.24
Nodes (9): useDebounce(), deserializeFilters(), isStringArray(), loadFromStorage(), saveToStorage(), serializeFilters(), useEventFilters(), applyEventFilters() (+1 more)

### Community 12 - "City Coordinates API"
Cohesion: 0.83
Nodes (3): geocodeNominatim(), GET(), sleep()

## Knowledge Gaps
- **1 isolated node(s):** `Plot`
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Components & Calendar Chips` to `Main Page & Data Hooks`, `Analytics Dashboard`, `Calendar Week Grid & Events`, `Event Filters & Calendar UI`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Locations Page & Map` to `Main Page & Data Hooks`, `Analytics Dashboard`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `formatDateLocal()` connect `Calendar Week Grid & Events` to `Main Page & Data Hooks`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `Plot` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components & Calendar Chips` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Analytics Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Calendar Week Grid & Events` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._