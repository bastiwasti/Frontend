import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionEmail } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');
    const source = searchParams.get('source');

    let events;
    if (runId) {
      const eventCols = `e.id, e.run_id, e.name, e.description, e.location, e.city,
                 e.start_datetime, e.end_datetime, e.category, e.source, e.origin, e.created_at`;
      const result = await query(`
        SELECT ${eventCols}, r.agent, r.cities as run_cities,
               s.duration as run_duration,
               s.events_found as run_events_found,
               s.valid_events as run_valid_events
        FROM events e
        LEFT JOIN runs r ON e.run_id = r.id
        LEFT JOIN status s ON r.id = s.run_id
        WHERE e.run_id = $1
        ORDER BY e.start_datetime ASC
      `, [Number(runId)]);
      events = result.rows;
    } else if (source === 'raw') {
      const eventCols = `e.id, e.run_id, e.name, e.description, e.location, e.city,
                 e.start_datetime, e.end_datetime, e.category, e.source, e.origin, e.created_at`;
      const result = await query(`
        WITH ranked_events AS (
          SELECT ${eventCols},
                 ROW_NUMBER() OVER (
                   PARTITION BY e.name, e.location, e.start_datetime
                   ORDER BY e.created_at DESC
                 ) as rn
          FROM events e
        )
        SELECT * FROM ranked_events WHERE rn = 1
        ORDER BY start_datetime ASC
      `);
      events = result.rows;
    } else {
      const userEmail = await getSessionEmail();
      const result = await query(`
        SELECT ed.id, ed.name, ed.description, ed.location, ed.start_datetime,
               ed.end_datetime, ed.category, ed.source, ed.city, ed.origin, ed.event_url,
               ed.first_seen_at, ed.last_seen_at, ed.seen_count,
               ur.rating AS user_rating,
               agg.avg_rating,
               COALESCE(agg.rating_count, 0) AS rating_count
        FROM events_distinct ed
        LEFT JOIN event_ratings ur
          ON ur.event_id = ed.id AND ur.user_email = $1
        LEFT JOIN LATERAL (
          SELECT ROUND(AVG(er.rating)::numeric, 1)::float AS avg_rating,
                 COUNT(*)::int AS rating_count
          FROM event_ratings er
          WHERE er.event_id = ed.id
        ) agg ON true
        ORDER BY ed.start_datetime ASC
      `, [userEmail]);
      events = result.rows;
    }

    const response = NextResponse.json(events);
    if (runId || source === 'raw') {
      response.headers.set('Cache-Control', 'public, max-age=300');
    } else {
      response.headers.set('Cache-Control', 'no-cache');
    }
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
