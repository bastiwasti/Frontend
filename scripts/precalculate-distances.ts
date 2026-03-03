/**
 * Pre-calculates road distances between all city pairs in city_coordinates
 * and stores them in city_road_distances.
 *
 * Run with: npx tsx scripts/precalculate-distances.ts
 * Safe to re-run — skips already-cached pairs.
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'vmpostgres',
  user: process.env.PG_USER || 'jobsearch',
  password: process.env.PG_PASSWORD || 'jobsearch',
  max: 1,
});

const SCHEMA = process.env.PG_SCHEMA || 'webscraper';
const BATCH_SIZE = 10;

type CityRow = { city_name: string; lat: number; lng: number };

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

async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${SCHEMA}`);
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function main() {
  await query(`
    CREATE TABLE IF NOT EXISTS city_road_distances (
      home_city  TEXT NOT NULL,
      city       TEXT NOT NULL,
      km         REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (home_city, city)
    )
  `);

  const citiesResult = await query('SELECT city_name, lat, lng FROM city_coordinates');
  const cities = citiesResult.rows as CityRow[];

  if (cities.length < 2) {
    console.log('Not enough cities in city_coordinates to calculate distances.');
    await pool.end();
    return;
  }

  console.log(`Found ${cities.length} cities. Building ${cities.length * (cities.length - 1)} ordered pairs...`);

  const allPairs: [CityRow, CityRow][] = [];
  for (const a of cities) {
    for (const b of cities) {
      if (a.city_name !== b.city_name) allPairs.push([a, b]);
    }
  }

  const cachedResult = await query('SELECT home_city, city FROM city_road_distances');
  const cached = new Set(
    cachedResult.rows.map((r: { home_city: string; city: string }) => `${r.home_city}|||${r.city}`)
  );

  const missing = allPairs.filter(([a, b]) => !cached.has(`${a.city_name}|||${b.city_name}`));
  console.log(`${cached.size} pairs already cached, ${missing.length} to calculate.`);

  if (missing.length === 0) {
    console.log('All distances already pre-calculated!');
    await pool.end();
    return;
  }

  let done = 0;
  let failed = 0;

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(([a, b]) => getRoadDistanceKm(a.lng, a.lat, b.lng, b.lat))
    );

    for (let j = 0; j < batch.length; j++) {
      const [a, b] = batch[j];
      const km = results[j];
      if (km !== null) {
        await query(
          'INSERT INTO city_road_distances (home_city, city, km) VALUES ($1, $2, $3) ON CONFLICT (home_city, city) DO UPDATE SET km = EXCLUDED.km',
          [a.city_name, b.city_name, km]
        );
        done++;
      } else {
        console.warn(`  FAILED: ${a.city_name} → ${b.city_name}`);
        failed++;
      }
    }

    process.stdout.write(`\r  Progress: ${i + batch.length}/${missing.length} pairs processed`);
  }

  console.log(`\nDone. ${done} stored, ${failed} failed.`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
