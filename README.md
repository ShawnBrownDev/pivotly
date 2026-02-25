# Pivotly

Monorepo: React Native (Expo) mobile app + Hono API, with shared packages for DB (Drizzle + Neon), types, and utils.

## Structure

```
pivotly/
  apps/
    mobile/     Expo React Native app
    api/        Hono API server (Neon Postgres)
  packages/
    db/         Drizzle schema + Neon serverless client
    types/      Shared TypeScript types
    utils/      Shared validation (Zod) and helpers
```

## Setup

1. **Install (Bun)**

   ```bash
   bun install
   ```

2. **Environment**

   - Root `.env`: add `DATABASE_URL` for Neon (used by API and `packages/db` when running from repo root).
   - API loads `.env` from repo root when present.

## Scripts (from repo root)

| Script        | Description              |
|---------------|--------------------------|
| `bun run dev:mobile` | Start Expo (apps/mobile) |
| `bun run dev:api`   | Start API dev server (apps/api) |
| `bun run build`     | Build API (apps/api)     |
| `bun run build:mobile` | Export mobile app     |

From `apps/mobile`: `bun run start`, `bun run ios`, `bun run android`, `bun run web`.  
From `apps/api`: `bun run dev`, `bun run start`, `bun run build`.

## Workspace packages

- **Mobile** can import: `@pivotly/types`, `@pivotly/utils`
- **API** can import: `@pivotly/db`, `@pivotly/types`, `@pivotly/utils`

Metro (mobile) is configured to resolve workspace packages; TypeScript path aliases are set in each app/package.

## DB (Drizzle + Neon)

- Schema: `packages/db/src/schema.ts`
- Client: `packages/db` exports `db` and schema. Use in API with `import { db } from '@pivotly/db'`.
- From `packages/db`: `bun run db:generate`, `bun run db:push`, `bun run db:studio` (set `DATABASE_URL` in env).

## Tech

- **Runtime / package manager:** Bun  
- **Mobile:** Expo (React Native), expo-router  
- **API:** Hono  
- **DB:** Neon (Postgres), Drizzle ORM  
- **Shared:** TypeScript, Zod (in `@pivotly/utils`)
