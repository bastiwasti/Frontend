import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

type Coords = { lat: number; lng: number };

async function geocodeNominatim(city: string): Promise<Coords | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'EventsGallery/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const citiesParam = searchParams.get('cities') ?? '';

    const requestedCities = Array.from(
      new Set(
        citiesParam
          .split(',')
          .map(c => decodeURIComponent(c).trim())
          .filter(Boolean)
      )
    );

    if (requestedCities.length === 0) {
      return NextResponse.json({});
    }

    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS city_coordinates (
        city_name TEXT PRIMARY KEY,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Batch-fetch known cities
    const placeholders = requestedCities.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `SELECT city_name, lat, lng FROM city_coordinates WHERE city_name IN (${placeholders})`,
      requestedCities
    );

    const coordsMap: Record<string, Coords | null> = {};
    for (const city of requestedCities) coordsMap[city] = null;
    for (const row of result.rows) {
      coordsMap[row.city_name] = { lat: row.lat, lng: row.lng };
    }

    // Geocode unknown cities sequentially, respecting Nominatim's 1 req/sec limit
    const unknownCities = requestedCities.filter(c => coordsMap[c] === null);

    for (let i = 0; i < unknownCities.length; i++) {
      if (i > 0) await sleep(1100);
      const city = unknownCities[i];
      const coords = await geocodeNominatim(city);
      if (coords) {
        await query(
          'INSERT INTO city_coordinates (city_name, lat, lng) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [city, coords.lat, coords.lng]
        );
        coordsMap[city] = coords;
      }
    }

    return NextResponse.json(coordsMap);
  } catch (error) {
    console.error('Error in /api/city-coordinates:', error);
    return NextResponse.json({ error: 'Failed to fetch coordinates' }, { status: 500 });
  }
}
