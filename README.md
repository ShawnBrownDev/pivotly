# Pivotly

Pivotly is a mobile app to validate startup ideas before you build. Get feedback, validation scores, and see what others think—with optional account creation so you can browse without signing up.

Monorepo: React Native (Expo) mobile app + Hono API, with shared packages for DB (Drizzle + Neon), types, and utils.

## Structure

```
pivotly/
  apps/
    mobile/     Expo React Native app (Expo Router, file-based routes)
    api/        Hono API server (Neon Postgres)
  packages/
    db/         Drizzle schema + Neon serverless client
    types/      Shared TypeScript types
    utils/      Shared validation (Zod) and helpers
```

## Architecture (mobile)

- **Routes:** `app/*.tsx` (expo-router): index (splash) → main → login / sign-up / home; privacy, terms, profile.
- **Auth:** Placeholder auth context in `lib/auth-context.tsx`; ready for Neon Auth (or other) integration. Demo mode is clearly labeled when auth is not connected.
- **Theme:** System light/dark via `useColorScheme`; tokens in `constants/theme.ts` and `hooks/use-app-theme.ts`.
- **Store readiness:** Privacy Policy and Terms of Service screens; Delete Account placeholder in Profile; no fake login in production without labels; no hardcoded secrets in app code.

## Setup

1. **Install (Bun)**

   ```bash
   bun install
   ```

2. **Environment**

   - Root `.env`: add `DATABASE_URL` for Neon (used by API and `packages/db` when running from repo root).
   - For authenticated idea and comment creation, the API must verify JWTs: set `NEON_AUTH_BASE_URL` in `.env` to your Neon Auth HTTP URL (same value as `EXPO_PUBLIC_NEON_AUTH_URL` in mobile, e.g. `https://your-branch.neon.tech/neondb/auth`). The API uses it to fetch JWKS and verify `Authorization: Bearer` tokens.
   - API loads `.env` from repo root when present.
   - Do not put API keys or secrets in the mobile app; use EAS Secrets or environment variables for build-time config.

## Scripts (from repo root)

| Script        | Description              |
|---------------|--------------------------|
| `bun run dev:mobile` | Start Expo (apps/mobile) |
| `bun run dev:api`   | Start API dev server (apps/api) |
| `bun run build`     | Build API (apps/api)     |
| `bun run build:mobile` | Export mobile app     |

From `apps/mobile`: `bun run start`, `bun run ios`, `bun run android`, `bun run web`.  
From `apps/api`: `bun run dev`, `bun run start`, `bun run build`.

## EAS Build (store submission)

From `apps/mobile`:

- **Configure:** `app.config.ts` defines name, version, `ios.bundleIdentifier` and `android.package` (e.g. `com.pivotly.app`). Update these for your team.
- **Build:** `eas build --platform ios` or `eas build --platform android` (requires EAS CLI: `npm i -g eas-cli` and `eas login`).
- **Submit:** Use `eas submit` with the appropriate profile; fill in `eas.json` submit section (e.g. Apple ID, service account for Play).

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
