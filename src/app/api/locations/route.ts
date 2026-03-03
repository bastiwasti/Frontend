import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, description, address, city, postal_code,
             latitude, longitude, category, subcategory,
             opening_hours, website_url, phone, rating,
             source, distance_km
      FROM locations
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY distance_km ASC
    `);

    const response = NextResponse.json(result.rows);
    response.headers.set('Cache-Control', 'public, max-age=300');
    return response;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
