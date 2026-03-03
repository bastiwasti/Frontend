# Plan: Per-User Event Rating System

> **Status:** IMPLEMENTED — Per-user ratings via `event_ratings` join table, with individual + average display.

## Context
Users want to rate events (1-5 stars). Each user sees their own rating and an average across all users. User identification uses email (works for Google OAuth now, Apple OAuth later).

### Database Schema

**`event_ratings`** — per-user ratings (new):
```sql
CREATE TABLE event_ratings (
    user_email  VARCHAR(255) NOT NULL,
    event_id    INTEGER NOT NULL REFERENCES events_distinct(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    rated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_email, event_id)
);
CREATE INDEX idx_event_ratings_event_id ON event_ratings(event_id);
```

**`events_distinct`** — still has `rating` column from v1 (unused, kept for rollback safety).

### Architecture

- **User identification:** email from NextAuth session (provider-agnostic)
- **Auth helper:** `getSessionEmail()` in `src/lib/auth.ts`
- **Events API:** LEFT JOINs `event_ratings` to return `user_rating`, `avg_rating`, `rating_count` per event
- **Rating API:** Auth-gated PATCH endpoint — upsert/delete on `event_ratings`, returns fresh aggregates
- **Frontend:** `Event` type has `user_rating`, `avg_rating`, `rating_count` (replaces old `rating` field)

### Files

| File | Role |
|------|------|
| `scripts/migrate-per-user-ratings.sql` | Migration script |
| `src/lib/auth.ts` | `getSessionEmail()` helper |
| `src/types/index.ts` | `Event.user_rating`, `avg_rating`, `rating_count` |
| `src/app/api/events/route.ts` | JOIN query for per-user + aggregate ratings |
| `src/app/api/events/[id]/rating/route.ts` | Auth + upsert/delete + aggregate response |
| `src/hooks/use-events.ts` | `updateEventRating(id, userRating, avgRating, ratingCount)` |
| `src/components/calendar/event-details-modal.tsx` | Interactive "Your Rating:" + average display |
| `src/components/calendar/day-events-modal.tsx` | Read-only stars + average text |
| `src/components/ui/star-rating.tsx` | Reusable star component (unchanged from v1) |
