import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join('/root', 'projects', 'WebScraper', 'data', 'events.db');

export function getDb() {
  const db = new Database(dbPath, { readonly: true });
  return db;
}
