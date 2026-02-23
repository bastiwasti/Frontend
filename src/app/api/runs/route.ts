import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { DB_PATH } from '@/config/db';

export async function GET() {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const runs = db.prepare(`
      SELECT r.*, 
             s.duration, 
             s.events_found, 
             s.valid_events, 
             s.start_time, 
             s.end_time
      FROM runs r
      LEFT JOIN status s ON r.id = s.run_id
      ORDER BY r.id DESC
    `).all();
    db.close();
    const response = NextResponse.json(runs);
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
}