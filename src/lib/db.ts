import { Pool } from 'pg';
import { DB_CONFIG } from '@/config/db';

const pool = new Pool(DB_CONFIG);

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${DB_CONFIG.schema}`);
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
