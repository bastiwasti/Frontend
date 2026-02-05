import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';

const dbPath = '/root/projects/WebScraper/data/events.db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');

    const db = new Database(dbPath, { readonly: true });
    
    let events;
    if (runId) {
      events = db.prepare('SELECT * FROM events WHERE run_id = ? ORDER BY created_at DESC').all(Number(runId));
    } else {
      events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
    }
    
    db.close();
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}