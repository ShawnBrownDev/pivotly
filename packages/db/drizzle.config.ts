import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'drizzle-kit';

// Load .env from monorepo root so DATABASE_URL is set when running db:migrate / db:push
function loadRootEnv() {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
    resolve(process.cwd(), '../../.env'),
  ];
  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) process.env[key] = value;
        }
      }
      return;
    }
  }
}
loadRootEnv();

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
