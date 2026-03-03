import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

type Coords = { lat: number; lng: number };

async function geocodeNominatim(city: string): Promise<Coords | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Germany')}&format=json&limit=1`;
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

    const allCitiesToGeocode = Array.from(new Set([homeCity, ...requestedCities]));
    const coordPlaceholders = allCitiesToGeocode.map((_, i) => `$${i + 1}`).join(', ');
    const coordResult = await query(
      `SELECT city_name, lat, lng FROM city_coordinates WHERE city_name IN (${coordPlaceholders})`,
      allCitiesToGeocode
    );

    const coords: Record<string, Coords | null> = {};
    for (const city of allCitiesToGeocode) coords[city] = null;
    for (const row of coordResult.rows) {
      coords[row.city_name] = { lat: row.lat, lng: row.lng };
    }

    const unknownCities = allCitiesToGeocode.filter(c => coords[c] === null);
    if (unknownCities.length > 0) {
      for (let i = 0; i < unknownCities.length; i++) {
        if (i > 0) await sleep(1100);
        const city = unknownCities[i];
        const c = await geocodeNominatim(city);
        if (c) {
          await query(
            'INSERT INTO city_coordinates (city_name, lat, lng) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [city, c.lat, c.lng]
          );
          coords[city] = c;
        }
      }
    }

    const result: Record<string, number | null> = {};
    for (const city of requestedCities) result[city] = null;

    const distPlaceholders = requestedCities.map((_, i) => `$${i + 2}`).join(', ');
    const distResult = await query(
      `SELECT city, km FROM city_road_distances WHERE home_city = $1 AND city IN (${distPlaceholders})`,
      [homeCity, ...requestedCities]
    );

    for (const row of distResult.rows) {
      result[row.city] = row.km;
    }

    const uncached = requestedCities.filter(c => result[c] === null);
    const homeCoords = coords[homeCity];

    if (uncached.length > 0 && homeCoords) {
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
          await query(
            'INSERT INTO city_road_distances (home_city, city, km) VALUES ($1, $2, $3) ON CONFLICT (home_city, city) DO UPDATE SET km = EXCLUDED.km',
            [homeCity, uncached[i], km]
          );
          result[uncached[i]] = km;
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/city-road-distances:', error);
    return NextResponse.json({ error: 'Failed to fetch road distances' }, { status: 500 });
  }
}
