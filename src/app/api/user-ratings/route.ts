import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionEmail } from '@/lib/auth';

export async function GET() {
  try {
    const userEmail = await getSessionEmail();
    if (!userEmail) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'private, max-age=0, must-revalidate' },
      });
    }
    const result = await query(
      `SELECT event_id, rating FROM event_ratings WHERE user_email = $1`,
      [userEmail]
    );
    return NextResponse.json(result.rows, {
      headers: { 'Cache-Control': 'private, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch user ratings' }, { status: 500 });
  }
}
