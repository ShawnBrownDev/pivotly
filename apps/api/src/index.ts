import { Hono } from 'hono';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { ApiResponse } from '@pivotly/types';

// Load .env from monorepo root when present
const rootEnvPath = resolve(import.meta.dir, '../../.env');
if (existsSync(rootEnvPath)) {
  const content = readFileSync(rootEnvPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const app = new Hono();

app.get('/', (c) => {
  return c.json<ApiResponse<{ message: string }>>({
    data: { message: 'Pivotly API' },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example: use db (uncomment when you have DATABASE_URL set)
// import { db } from '@pivotly/db';
// app.get('/users', async (c) => {
//   const users = await db.select().from(usersTable);
//   return c.json({ data: users });
// });

export default {
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
};
