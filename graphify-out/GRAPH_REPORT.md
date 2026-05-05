# Graph Report - .  (2026-05-05)

## Corpus Check
- Corpus is ~19,335 words - fits in a single context window. You may not need a graph.

## Summary
- 161 nodes · 184 edges · 24 communities (16 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9aa8c3a`
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
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 16 edges
2. `query()` - 8 edges
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

## Communities (24 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (10): geocodeNominatim(), GET(), sleep(), geocodeNominatim(), GET(), sleep(), GET(), getSessionEmail() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (7): useCityDistances(), useEvents(), EmptyState(), Select(), SelectItem(), SelectTrigger(), SelectValue()

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (8): AnalyticsChart(), ChartControls(), KpiCards(), AnalyticsPage(), useAnalyticsData(), useEventsAndRuns(), getDimensionValue(), CardDescription()

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (4): formatDate(), buildColorMap(), formatDateLocal(), formatEventDateTime()

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (3): Calendar(), Popover(), PopoverTrigger()

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (9): useDebounce(), deserializeFilters(), isStringArray(), loadFromStorage(), saveToStorage(), serializeFilters(), useEventFilters(), applyEventFilters() (+1 more)

## Knowledge Gaps
- **1 isolated node(s):** `Plot`
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 2` to `Community 1`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Community 7` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `formatDateLocal()` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `Plot` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._