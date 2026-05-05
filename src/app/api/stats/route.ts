import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [scrapeRes, ratingRes, dailyRes, totalsRes] = await Promise.all([
      query(`
        SELECT r.id, r.cities,
               s.start_time, s.end_time, s.duration,
               s.events_found, s.valid_events, s.events_regex, s.events_llm
        FROM runs r
        JOIN status s ON s.run_id = r.id
        WHERE s.full_run = 1 AND s.end_time IS NOT NULL
        ORDER BY r.id DESC
        LIMIT 1
      `),
      query(`
        SELECT r.id,
               s.start_time, s.end_time, s.duration,
               s.events_rated, s.ratings_failed, s.input_tokens, s.output_tokens
        FROM runs r
        JOIN status s ON s.run_id = r.id
        WHERE s.agent_type = 'rating' AND s.end_time IS NOT NULL
        ORDER BY r.id DESC
        LIMIT 1
      `),
      query(`
        SELECT to_char(date_trunc('day', r.created_at::timestamp), 'YYYY-MM-DD') AS day,
               COALESCE(SUM(CASE WHEN s.full_run = 1          THEN s.events_found   ELSE 0 END), 0)::int AS found,
               COALESCE(SUM(CASE WHEN s.full_run = 1          THEN s.valid_events   ELSE 0 END), 0)::int AS valid,
               COALESCE(SUM(CASE WHEN s.agent_type = 'rating' THEN s.events_rated   ELSE 0 END), 0)::int AS rated,
               COALESCE(SUM(CASE WHEN s.agent_type = 'rating' THEN s.ratings_failed ELSE 0 END), 0)::int AS failures,
               COALESCE(SUM(CASE WHEN s.agent_type = 'rating' THEN s.input_tokens   ELSE 0 END), 0)::int AS input_tokens,
               COALESCE(SUM(CASE WHEN s.agent_type = 'rating' THEN s.output_tokens  ELSE 0 END), 0)::int AS output_tokens
        FROM runs r
        JOIN status s ON s.run_id = r.id
        WHERE r.created_at::timestamp > NOW() - INTERVAL '7 days'
        GROUP BY 1
        ORDER BY 1 DESC
      `),
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM events_distinct)                 AS events_distinct,
          (SELECT COUNT(*)::int FROM event_ratings)                   AS user_ratings,
          (SELECT COUNT(DISTINCT user_email)::int FROM event_ratings) AS rating_users,
          (SELECT COUNT(DISTINCT event_id)::int FROM event_ratings)   AS rated_events
      `),
    ]);

    const sr = scrapeRes.rows[0];
    const last_scrape = sr ? {
      run_id: sr.id,
      started_at: sr.start_time,
      ended_at: sr.end_time,
      duration_seconds: sr.duration,
      cities: sr.cities,
      events_found: sr.events_found ?? 0,
      valid_events: sr.valid_events ?? 0,
      events_regex: sr.events_regex ?? 0,
      events_llm: sr.events_llm ?? 0,
    } : null;

    const rr = ratingRes.rows[0];
    const last_rating = rr ? {
      run_id: rr.id,
      started_at: rr.start_time,
      ended_at: rr.end_time,
      duration_seconds: rr.duration,
      events_rated: rr.events_rated ?? 0,
      ratings_failed: rr.ratings_failed ?? 0,
      input_tokens: rr.input_tokens ?? 0,
      output_tokens: rr.output_tokens ?? 0,
    } : null;

    const response = NextResponse.json({
      timestamp: new Date().toISOString(),
      last_scrape,
      last_rating,
      daily_7d: dailyRes.rows,
      totals: totalsRes.rows[0],
    });
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch (err) {
    console.error('[stats] failed:', err);
    return NextResponse.json({ error: 'stats_unavailable' }, { status: 500 });
  }
}
