<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Mariam — Comprehensive School Management Platform. Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Supabase (Postgres, Auth, RLS, Storage).

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config; `next lint` is removed in v16)
- `npm run typecheck` — `tsc --noEmit`

## Conventions

- Path alias `@/*` maps to `src/*`.
- Server Components by default. Add `'use client'` only for interactivity.
- All authorization is enforced in the Data Access Layer (`src/lib/dal/*`) and in Postgres RLS policies. Never rely on UI hiding alone.
- `src/proxy.ts` does optimistic cookie-only checks only. It is not an authorization boundary.
- Supabase clients: `src/lib/supabase/client.ts` (browser), `server.ts` (RSC/actions), `proxy.ts` (session refresh).
- Money is stored in `numeric(12,2)` and always paired with an ISO 4217 currency code.
- All timestamps are `timestamptz` in UTC.
