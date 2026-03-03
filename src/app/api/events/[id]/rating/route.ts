import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionEmail } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = await getSessionEmail();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating } = await request.json();

    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be an integer 1-5 or null' },
        { status: 400 }
      );
    }

    const eventId = Number(id);

    if (rating === null) {
      await query(
        'DELETE FROM event_ratings WHERE user_email = $1 AND event_id = $2',
        [userEmail, eventId]
      );
    } else {
      await query(
        `INSERT INTO event_ratings (user_email, event_id, rating, rated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_email, event_id)
         DO UPDATE SET rating = EXCLUDED.rating, rated_at = NOW()`,
        [userEmail, eventId, rating]
      );
    }

    // Return fresh aggregate
    const aggResult = await query(
      `SELECT ROUND(AVG(rating)::numeric, 1)::float AS avg_rating,
              COUNT(*)::int AS rating_count
       FROM event_ratings WHERE event_id = $1`,
      [eventId]
    );
    const agg = aggResult.rows[0] || { avg_rating: null, rating_count: 0 };

    return NextResponse.json({
      success: true,
      user_rating: rating,
      avg_rating: agg.rating_count > 0 ? agg.avg_rating : null,
      rating_count: agg.rating_count,
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }
}
