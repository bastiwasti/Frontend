import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { DB_PATH } from '@/config/db';

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

    // Open DB in read-write mode to allow inserts
    const db = new Database(DB_PATH);

    // Ensure table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS city_coordinates (
        city_name TEXT PRIMARY KEY,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Batch-fetch known cities
    const placeholders = requestedCities.map(() => '?').join(', ');
    const rows = db
      .prepare(`SELECT city_name, lat, lng FROM city_coordinates WHERE city_name IN (${placeholders})`)
      .all(...requestedCities) as { city_name: string; lat: number; lng: number }[];

    const result: Record<string, Coords | null> = {};
    for (const city of requestedCities) result[city] = null;
    for (const row of rows) result[row.city_name] = { lat: row.lat, lng: row.lng };

    // Geocode unknown cities sequentially, respecting Nominatim's 1 req/sec limit
    const unknownCities = requestedCities.filter(c => result[c] === null);
    const insert = db.prepare(
      'INSERT OR IGNORE INTO city_coordinates (city_name, lat, lng) VALUES (?, ?, ?)'
    );

    for (let i = 0; i < unknownCities.length; i++) {
      if (i > 0) await sleep(1100);
      const city = unknownCities[i];
      const coords = await geocodeNominatim(city);
      if (coords) {
        insert.run(city, coords.lat, coords.lng);
        result[city] = coords;
      }
      // null stays in result for not-found cities (not stored in DB, retried next time)
    }

    db.close();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/city-coordinates:', error);
    return NextResponse.json({ error: 'Failed to fetch coordinates' }, { status: 500 });
  }
}
