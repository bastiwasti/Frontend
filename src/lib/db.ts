import Database from 'better-sqlite3';
import { DB_PATH } from '@/config/db';

export function getDb() {
  const db = new Database(DB_PATH, { readonly: true });
  return db;
}
