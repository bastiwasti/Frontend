# Events Gallery

A Next.js web app for browsing scraped events with calendar views, analytics, and Google OAuth.

**Live:** https://eventig.app

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in Google OAuth credentials + NEXTAUTH_SECRET
npm run dev                   # http://localhost:3000
```

Production:

```bash
npm run build
sudo systemctl restart frontend
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Calendar grid — week view with colour-coded event chips |
| `/calendar` | Event cards — filterable gallery with expand/collapse |
| `/analytics` | Charts & KPIs — Plotly charts with dimension/metric selectors |
| `/status` | Run status — scraper run history table |

## Stack

Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS 4 / Radix UI / SQLite / NextAuth.js / date-fns / Plotly

## Documentation

See [docs/](docs/00-INDEX.md):

- [Architecture](docs/01-ARCHITECTURE.md) — project structure, types, hooks, components
- [Deployment](docs/02-DEPLOYMENT.md) — systemd, nginx, build workflow
- [Google OAuth](docs/03-GOOGLE-OAUTH.md) — setup, auth flow, troubleshooting
- [Database](docs/04-DATABASE.md) — schema, indexes, API queries, debugging
