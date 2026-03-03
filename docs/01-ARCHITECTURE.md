# Architecture

Next.js 16 / React 19 / TypeScript app displaying scraped events from PostgreSQL.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI (shadcn/ui pattern)
- **Auth:** NextAuth.js (beta) with Google OAuth
- **Database:** PostgreSQL via pg (connection pooling)
- **Charts:** react-plotly.js (dynamic import, SSR disabled)
- **Dates:** date-fns, react-day-picker
- **Icons:** Lucide React

## Project Structure

```
src/
├── types/
│   └── index.ts                    # All domain types (Event, Run, DateRange, filters, analytics)
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── event-utils.ts              # formatEventDateTime, formatDateLocal, formatDateUTCKey
│   ├── color-utils.ts              # COLOR_PALETTE (17 colours), buildColorMap
│   ├── filter-utils.ts             # hasActiveFilters, applyEventFilters
│   ├── analytics-utils.ts          # getDimensionValue, dimension/metric/chartType options
│   └── utils.ts                    # cn() Tailwind merge helper
│   ├── db.ts                       # Database connection (PostgreSQL via pg)
├── hooks/
│   ├── use-events.ts               # useEvents() → { events, isLoading, error }
│   ├── use-runs.ts                 # useRuns() → { runs, isLoading }
│   ├── use-events-and-runs.ts      # useEventsAndRuns() → parallel fetch
│   ├── use-event-filters.ts        # useEventFilters(events) → filters, filteredEvents, uniqueValues
│   ├── use-event-colors.ts         # useEventColors(cities, categories) → colorMode, getColor
│   └── use-analytics-data.ts       # useAnalyticsData(params) → chartData, layout
├── components/
│   ├── ui/                         # Base UI (button, card, select, calendar, popover, etc.)
│   │   ├── loading-spinner.tsx     # <LoadingSpinner message? />
│   │   └── empty-state.tsx         # <EmptyState title? description? />
│   ├── events/
│   │   ├── event-filters-panel.tsx # Shared 4-select filter panel + extraFilters slot
│   │   ├── event-card.tsx          # Event card with expand/collapse
│   │   └── event-count-badge.tsx   # <EventCountBadge count isFiltering? />
│   ├── calendar/
│   │   ├── calendar-week-grid.tsx  # Week navigation + day cells with event chips
│   │   ├── calendar-event-chip.tsx # Single event chip in calendar cell
│   │   ├── color-legend.tsx        # Colour swatches + city/category toggle
│   │   ├── event-details-modal.tsx # Full event details dialog
│   │   └── day-events-modal.tsx    # All events for a clicked day
│   ├── analytics/
│   │   ├── kpi-cards.tsx           # 4 KPI summary cards
│   │   ├── data-source-filter.tsx  # All/run toggle + date range picker
│   │   ├── chart-controls.tsx      # Dimension/groupBy/metric/chartType selects
│   │   └── analytics-chart.tsx     # Plotly chart wrapper
│   ├── auth/                       # GoogleSignInButton, UserMenu
│   ├── providers/
│   │   └── session-provider.tsx    # NextAuth SessionProvider wrapper
│   └── Navigation.tsx              # Top nav bar with route links
├── config/
│   └── db.ts                       # DB_CONFIG for PostgreSQL connection
├── app/
│   ├── layout.tsx                  # Root layout (fonts, AuthProvider, Navigation)
│   ├── (protected)/
│   │   ├── page.tsx                # / — Calendar grid view (~95 lines)
│   │   ├── calendar/page.tsx       # /calendar — Event cards gallery (~100 lines)
│   │   ├── analytics/page.tsx      # /analytics — Charts & KPIs (~115 lines)
│   │   └── status/page.tsx         # /status — Runs table (~50 lines)
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handlers
│   │   ├── events/route.ts         # GET /api/events
│   │   └── runs/route.ts           # GET /api/runs
│   └── login/page.tsx              # Public login page
└── middleware.ts                    # Route protection (redirects unauthenticated to /login)
```

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Calendar grid | Week-by-week calendar with colour-coded event chips, click to expand |
| `/calendar` | Events gallery | Filterable card grid with expand/collapse, Run ID filter |
| `/analytics` | Analytics | KPI cards, Plotly charts, dimension/metric selectors |
| `/status` | Run status | Table of scraper runs with timing and event counts |
| `/login` | Login | Google OAuth sign-in (public) |

## Data Flow

```
PostgreSQL DB (vmpostgres → webscraper schema)
    │
    ├── GET /api/events → deduplicates via ROW_NUMBER window function
    │                      returns 11 fields per event (no HTML blobs)
    │                      Cache-Control: 5 min
    │
    └── GET /api/runs   → joins runs + status tables
                          Cache-Control: 5 min
    │
    ▼
useEvents() / useRuns() / useEventsAndRuns()  (client-side hooks)
    │
    ▼
useEventFilters()  → debounced filtering (300ms), unique values extraction
    │
    ▼
Page shells → compose hooks + shared components
```

## Key Patterns

**Calendar date grouping** uses `formatDateLocal` (not UTC) so events appear on the local calendar day. See `event-utils.ts`.

**Analytics filtering** is separate from `useEventFilters` — it filters by `run_id`/`dataSource` locally in `analytics/page.tsx` and `useAnalyticsData`.

**Calendar run filter** — `calendar/page.tsx` adds a local `runIdFilter` state on top of `useEventFilters`, passed to `EventFiltersPanel` via `extraFilters` slot.

**Colour assignment** — `buildColorMap` cycles through a 17-colour palette. `useEventColors` provides `getColor(value)` based on city or category mode.
