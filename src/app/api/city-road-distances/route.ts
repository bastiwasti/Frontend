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

async function getRoadDistanceKm(
  homeLng: number,
  homeLat: number,
  cityLng: number,
  cityLat: number
): Promise<number | null> {
  // OSRM uses lng,lat order (not lat,lng)
  const url = `http://router.project-osrm.org/route/v1/driving/${homeLng},${homeLat};${cityLng},${cityLat}?overview=false`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'EventsGallery/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    return data.routes[0].distance / 1000;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

let tablesEnsured = false;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const homeCity = decodeURIComponent(searchParams.get('home') ?? '').trim();
    const citiesParam = searchParams.get('cities') ?? '';

    const requestedCities = Array.from(
      new Set(
        citiesParam
          .split(',')
          .map(c => decodeURIComponent(c).trim())
          .filter(Boolean)
      )
    );

    if (!homeCity || requestedCities.length === 0) {
      return NextResponse.json({});
    }

    const db = new Database(DB_PATH);

    if (!tablesEnsured) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS city_coordinates (
          city_name TEXT PRIMARY KEY,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS city_road_distances (
          home_city  TEXT NOT NULL,
          city       TEXT NOT NULL,
          km         REAL NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          PRIMARY KEY (home_city, city)
        )
      `);
      tablesEnsured = true;
    }

    // --- Step 1: ensure all cities + home are geocoded ---
    const allCitiesToGeocode = Array.from(new Set([homeCity, ...requestedCities]));
    const coordPlaceholders = allCitiesToGeocode.map(() => '?').join(', ');
    const coordRows = db
      .prepare(`SELECT city_name, lat, lng FROM city_coordinates WHERE city_name IN (${coordPlaceholders})`)
      .all(...allCitiesToGeocode) as { city_name: string; lat: number; lng: number }[];

    const coords: Record<string, Coords | null> = {};
    for (const city of allCitiesToGeocode) coords[city] = null;
    for (const row of coordRows) coords[row.city_name] = { lat: row.lat, lng: row.lng };

    const unknownCities = allCitiesToGeocode.filter(c => coords[c] === null);
    if (unknownCities.length > 0) {
      const insertCoord = db.prepare(
        'INSERT OR IGNORE INTO city_coordinates (city_name, lat, lng) VALUES (?, ?, ?)'
      );
      for (let i = 0; i < unknownCities.length; i++) {
        if (i > 0) await sleep(1100);
        const city = unknownCities[i];
        const c = await geocodeNominatim(city);
        if (c) {
          insertCoord.run(city, c.lat, c.lng);
          coords[city] = c;
        }
      }
    }

    // --- Step 2: batch-load cached road distances ---
    const result: Record<string, number | null> = {};
    for (const city of requestedCities) result[city] = null;

    const distPlaceholders = requestedCities.map(() => '?').join(', ');
    const distRows = db
      .prepare(
        `SELECT city, km FROM city_road_distances WHERE home_city = ? AND city IN (${distPlaceholders})`
      )
      .all(homeCity, ...requestedCities) as { city: string; km: number }[];

    for (const row of distRows) result[row.city] = row.km;

    // --- Step 3: on-demand OSRM for any uncached pairs (fallback for new cities) ---
    const uncached = requestedCities.filter(c => result[c] === null);
    const homeCoords = coords[homeCity];

    if (uncached.length > 0 && homeCoords) {
      const insertDist = db.prepare(
        'INSERT OR REPLACE INTO city_road_distances (home_city, city, km) VALUES (?, ?, ?)'
      );
      const distances = await Promise.all(
        uncached.map(city => {
          const c = coords[city];
          if (!c) return Promise.resolve(null);
          return getRoadDistanceKm(homeCoords.lng, homeCoords.lat, c.lng, c.lat);
        })
      );
      for (let i = 0; i < uncached.length; i++) {
        const km = distances[i];
        if (km !== null) {
          insertDist.run(homeCity, uncached[i], km);
          result[uncached[i]] = km;
        }
      }
    }

    db.close();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/city-road-distances:', error);
    return NextResponse.json({ error: 'Failed to fetch road distances' }, { status: 500 });
  }
}
