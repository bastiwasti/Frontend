import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { DB_PATH } from '@/config/db';

let indexEnsured = false;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');

    // Create dedup index once (needs writable connection)
    if (!indexEnsured) {
      const wdb = new Database(DB_PATH);
      wdb.exec(`CREATE INDEX IF NOT EXISTS idx_events_dedup ON events(name, location, start_datetime, created_at DESC)`);
      wdb.close();
      indexEnsured = true;
    }

    const db = new Database(DB_PATH, { readonly: true });

    const eventCols = `e.id, e.run_id, e.name, e.description, e.location, e.city,
               e.start_datetime, e.end_datetime, e.category, e.source, e.origin, e.created_at`;

    let events;
    if (runId) {
      events = db.prepare(`
        SELECT ${eventCols}, r.agent, r.cities as run_cities,
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
          SELECT ${eventCols},
                 ROW_NUMBER() OVER (
                   PARTITION BY e.name, e.location, e.start_datetime
                   ORDER BY e.created_at DESC
                 ) as rn
          FROM events e
        )
        SELECT * FROM ranked_events WHERE rn = 1
        ORDER BY start_datetime ASC
      `).all();
    }

    db.close();
    const response = NextResponse.json(events);
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}