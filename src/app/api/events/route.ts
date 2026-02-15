import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { DB_PATH } from '@/config/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');

    const db = new Database(DB_PATH, { readonly: true });

    let events;
    if (runId) {
      events = db.prepare(`
        SELECT e.*, r.agent, r.cities as run_cities, 
               s.duration as run_duration, 
               s.events_found as run_events_found, 
               s.valid_events as run_valid_events
        FROM events e
        LEFT JOIN runs r ON e.run_id = r.id
        LEFT JOIN status s ON r.id = s.run_id
        WHERE e.run_id = ?
        ORDER BY e.start_datetime ASC
      `).all(Number(runId));
    } else {
      events = db.prepare(`
        WITH ranked_events AS (
          SELECT e.*, r.agent, r.cities as run_cities,
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
      `).all();
    }

    db.close();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}