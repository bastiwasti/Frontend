import { query } from '@/lib/db';
import { getSessionEmail } from '@/lib/auth';
import { HomeClient } from '@/components/home-client';
import type { Event } from '@/types';

export const revalidate = 300;

async function getEvents(): Promise<Event[]> {
  const result = await query(`
    SELECT id, name, description, location, start_datetime,
           end_datetime, category, source, city, origin, event_url,
           first_seen_at, last_seen_at, seen_count,
           avg_rating,
           COALESCE(rating_count, 0) AS rating_count
    FROM events_distinct
    WHERE start_datetime >= NOW() - INTERVAL '30 days'
    ORDER BY start_datetime ASC
  `);
  return result.rows;
}

async function getUserRatings(): Promise<Map<number, number>> {
  const email = await getSessionEmail();
  if (!email) return new Map();
  const result = await query(
    `SELECT event_id, rating FROM event_ratings WHERE user_email = $1`,
    [email]
  );
  return new Map(result.rows.map((r: { event_id: number; rating: number }) => [r.event_id, r.rating]));
}

async function getDistinctCities(): Promise<string[]> {
  const result = await query(`
    SELECT DISTINCT city FROM events_distinct
    WHERE start_datetime >= NOW() - INTERVAL '30 days'
      AND city IS NOT NULL
    ORDER BY city
  `);
  return result.rows.map((r: { city: string }) => r.city);
}

export default async function HomePage() {
  const [events, userRatings, cities] = await Promise.all([
    getEvents(),
    getUserRatings(),
    getDistinctCities(),
  ]);

  const eventsWithUserRatings: Event[] = events.map(e => ({
    ...e,
    user_rating: userRatings.get(e.id) ?? null,
  }));

  const userRatingsObj = Object.fromEntries(userRatings);

  return (
    <HomeClient
      initialEvents={eventsWithUserRatings}
      initialUserRatings={userRatingsObj}
      cities={cities}
    />
  );
}
