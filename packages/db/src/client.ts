import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Set it in .env at repo root or in the environment.');
  }
  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    const target = getDb();
    const value = target[prop as keyof typeof target];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
