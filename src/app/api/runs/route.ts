import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT r.*, 
             s.duration, 
             s.events_found, 
             s.valid_events, 
             s.start_time, 
             s.end_time,
             s.full_run
      FROM runs r
      LEFT JOIN status s ON r.id = s.run_id
      ORDER BY r.id DESC
    `);
    const response = NextResponse.json(result.rows);
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
}