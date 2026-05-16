# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Goazen — public concert/event listing site for the French Basque Country and Landes. Next.js 15 (App Router) + React 19 RC + Payload CMS 3 + MongoDB. Deployed on Vercel; media on S3. UI is in French.

## Commands

Package manager is **pnpm** (lockfile checked in). Always use it.

```bash
pnpm dev                    # Next dev server (port 3000 → falls back to 3001 if busy)
pnpm devsafe                # nukes .next first
pnpm build                  # next build
pnpm start                  # next start (after build)
pnpm lint                   # next lint (ESLint + next/core-web-vitals)
pnpm test                   # vitest run (only formulaire/* has tests right now)
pnpm test:watch
pnpm generate:types         # regenerate src/payload-types.ts from collection configs
pnpm generate:importmap     # regenerate src/app/(payload)/admin/importMap.js
pnpm payload run <file.ts>  # boot Payload + run an ad-hoc script (Local API access)
```

**After any schema change to `src/collections/*` you must run `pnpm generate:types`** — `payload-types.ts` is the source of truth for the rest of the app and drifts silently if forgotten.

If you add or remove a Payload admin component (e.g. anything mounted via `admin.components` in `payload.config.ts`), also run `pnpm generate:importmap`.

## Running one-off DB scripts

`pnpm payload run path/to/script.ts` boots the Payload config (env, DB, plugins) and runs the script with `import { getPayload } from 'payload'` + `import config from './src/payload.config'` available. This is the only sanctioned way to do data backfills / inspections — there is no `tsx` or `ts-node` in dependencies.

## Architecture

### Route groups

Two top-level route groups in `src/app/`:

- `(app)/` — public site. Server Components by default, with `'use client'` islands. All DB reads go through server actions in `(app)/queries/`.
- `(payload)/` — Payload admin (`/admin`) + its API routes (`/api/*` mounted by Payload). Access policies live in `(payload)/access/`.

A separate `src/app/api/` directory holds custom Next routes that are **not** Payload's: `/api/revalidate` (cache busting via `revalidateTag`) and `/api/get-city-region` (used by middleware).

### Region / city model — the load-bearing detail

Events have a `location` relationship (preferred) **or** a free-text `location_alt` + an event-level `region` enum (`pays-basque | landes`). The event-level `region` field is **hidden in admin when a location is selected** (`Events.ts` `admin.condition: (data) => !data.location`), so for any event with a location the canonical region comes from `location.city V2.region`.

Locations have **two parallel city fields** during a migration:
- `city` — legacy `select` enum (slugified city names)
- `city V2` — relationship to the `cities` collection (the City doc carries `region`)

Many older Location docs still only have `city` set; their `city V2` is null. Any query that filters events by region must handle both paths or those events disappear from results. When touching region/city filtering, read [`src/app/(app)/queries/get-events.ts`](src/app/(app)/queries/get-events.ts) carefully and verify behaviour for legacy-only locations.

The middleware in [`src/middleware.ts`](src/middleware.ts) rewrites legacy `/concerts/<city>/...` URLs to `/concerts/<region>/<city>/...` by calling `/api/get-city-region` — keep that route alive if you refactor.

### Data flow

```
React Server Components / Server Actions
        │
        ▼
src/app/(app)/queries/*.ts     ← 'use server' wrappers around payload.find/update
        │   (some wrapped in unstable_cache with tag 'events')
        ▼
src/app/(app)/(client)/payload-client.ts
        │   const payload = await getPayload({ config })   ← top-level await
        ▼
Payload Local API → mongooseAdapter → MongoDB
```

Mutations from collection `afterChange` hooks (e.g. Events.slug) POST to `/api/revalidate?tag=events` to invalidate the `unstable_cache` entries — keep that contract intact when adding new cached queries (use the same `'events'` tag, or add and revalidate a new one explicitly).

### Payload admin extensions

CSV export buttons in the dashboard are mounted via `admin.components.afterDashboard` in `payload.config.ts`. They are **client components** (`'use client'`) that call the server-side `_getEvents` and build the CSV in the browser before triggering a `Blob` download. There's no HTTP endpoint for the export — it's button → server action → CSV → `<a download>`.

Files: [`src/app/(app)/components/Export*.tsx`](src/app/(app)/components/).

### Forms

The public event submission form (`/formulaire`) uses `@ts-react/form` + `react-hook-form` + `zod`. Schema lives in [`create-event-form-schema.ts`](src/app/(app)/formulaire/create-event-form-schema.ts) (with the only Vitest test next to it). Event creation goes through `(app)/queries/create-event.ts`, not through the Payload REST API.

### TypeScript paths

```
@/*               → src/*
@payload-config   → src/payload.config.ts
```

### Generated files — do not edit

- `src/payload-types.ts` — regenerated by `pnpm generate:types`
- `src/app/(payload)/admin/importMap.js` — regenerated by `pnpm generate:importmap`

## Env

`.env.local` is the dev/staging credentials file (not in git). Critical vars: `DATABASE_URI` (MongoDB), `PAYLOAD_SECRET`, `S3_*`, `RESEND_API_KEY`, `NEXT_PUBLIC_URL` (used by collection hooks to call `/api/revalidate`). Clerk vars exist but Payload's built-in auth on the `users` collection is what guards `/admin`.

`env.ts` only declares a small subset (Resend / Maps / `NEXT_PUBLIC_URL`) via `@t3-oss/env-nextjs`; everything else is read directly from `process.env`.

## Local DB

`docker-compose.yml` boots a local MongoDB. Set `DATABASE_URI=mongodb://mongo/<db>` if you use it; otherwise point `DATABASE_URI` at your remote dev cluster.
