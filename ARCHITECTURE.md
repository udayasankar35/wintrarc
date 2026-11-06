# WINTRARC architecture

This file is the source of truth for how the project is built. Read it and
`PROGRESS.md` at the start of every working session, and update both at the end.

## Purpose and constraints

WINTRARC is an AI-assisted habit, task, goal and focus tracker organised around
**Arcs**: time-boxed 30, 60 or 90-day seasons.

- It is a portfolio project used by its owner and a few invited friends. It is
  not a business: no ads, payments or paid features.
- It runs on free plans only: Supabase Free, Vercel Hobby, a public GitHub
  repository. The one optional paid item is the Claude API, behind hard budgets.
- The repository is public, so no secret may ever be committed.

## Stack

| Layer      | Choice                                           | Status          |
| ---------- | ------------------------------------------------ | --------------- |
| Framework  | Next.js 16.4.5, App Router, Cache Components     | Installed       |
| Language   | TypeScript 5, strict, `noUncheckedIndexedAccess` | Installed       |
| Styling    | Tailwind CSS 4, design tokens as CSS variables   | Installed       |
| Validation | Zod 4                                            | Installed       |
| Backend    | Supabase (Postgres, Auth, Realtime, pg_cron)     | Client + config |
| Push       | `web-push` with VAPID, plain `public/sw.js`      | Spike           |
| Tests      | Vitest 5, Playwright, pgTAP via Supabase CLI     | Installed       |
| CI         | GitHub Actions                                   | Installed       |
| UI kit     | shadcn/ui (Radix), Framer Motion                 | Stage 1         |
| Client     | TanStack Query with IndexedDB persistence        | Stage 3         |
| PWA cache  | Serwist, or the plain worker if it is enough     | Stage 1         |
| AI         | Anthropic SDK, server only                       | Stage 7         |
| Reports    | `@react-pdf/renderer`, `exceljs`                 | Stage 8         |
| Monitoring | Sentry                                           | Stage 11        |

## Folder structure

```text
src/
  app/          routes, layouts, route handlers (api/)
  components/   design-system primitives only            (Stage 1)
  features/     habits tasks goals arcs focus ...        (Stage 3 onward)
  lib/
    data/       typed repositories, the only Supabase callers (Stage 3)
    sync/       mutation queue, realtime, conflict rules      (Stage 4)
    rules/      pure functions: streaks, schedules, score     (Stage 3)
    health/     database health check and its throttle
    push/       endpoint allowlist, permission states, sender
    rate-limit/ in-memory limiter (database-backed from Stage 2)
    security/   constant-time comparison
supabase/       config.toml, migrations/, tests/database/
scripts/        env spec and checker, VAPID key generator
e2e/            Playwright tests
docs/           RUNBOOK.md, PUSH-SPIKE.md
```

## Boundaries (enforced by ESLint where marked)

- Components and features never import `@supabase/*`. They use hooks backed by
  `lib/data`. **Enforced** in `eslint.config.mjs`.
- `lib/rules` is pure: no I/O, no React, no Supabase, no Next. **Enforced.**
- The service-role key is used only in server-only code and Edge Functions.
- AI route handlers read data through the user's own JWT client, never the
  service role, and pass the model a compact verified JSON context.
- The dev seed script refuses to run when `NODE_ENV=production`.

## Non-negotiable rules

1. Read and update this file and `PROGRESS.md` every session. Build only the
   stage you were given.
2. A checklist item is done only with evidence. Anything that cannot be run in
   the build environment is marked "needs manual verification" with steps.
3. Every user-owned table has Row Level Security from the migration that
   creates it, plus a test that another user cannot read or write it. The
   `rls_enabled` database test fails the build if any public table lacks RLS.
4. No secret reaches client code, logs or the repository.
5. Completions are stored as a user-local `DATE` plus the IANA timezone. Streaks
   are never derived from UTC timestamps.
6. Numbers are deterministic (SQL or pure TypeScript with tests). Claude
   interprets and recommends; it never calculates statistics.
7. The AI proposes and the user approves. Nothing it generates changes the
   user's data until accepted.
8. Mutations are idempotent, optimistic and survive a refresh.
9. Be gentle: show consistency beside streaks, offer a minimum version of each
   habit, never use guilt copy.
10. TypeScript strict, Zod at every boundary, zero console errors.

## Next.js 16 notes

This version differs from older Next.js. The relevant guides ship in
`node_modules/next/dist/docs/` and `AGENTS.md` asks agents to read them.

- **Cache Components is on.** A route that reads request data, makes a network
  call or queries a database runs at request time. Dynamic work in a page must
  sit inside `<Suspense>`. A route handler that touches nothing dynamic could
  be prerendered at build time, so `/api/health` calls `await connection()`
  first. An end-to-end test proves the response changes between requests.
- **`middleware` is now `proxy`.** Stage 2 auth guards use `proxy.ts`.
- **`NEXT_PUBLIC_*` values are inlined at build time.** Changing one needs a
  redeploy, not just a restart.
- Fonts are not downloaded at build time. Stage 0 uses system fonts and Stage 1
  picks the final typefaces.

## Free-tier limits that shape the design

| Service      | Limit that matters                                                      |
| ------------ | ----------------------------------------------------------------------- |
| Supabase     | 500 MB database, 50,000 monthly users, 200 concurrent Realtime clients  |
| Supabase     | No automatic backups. Projects with low activity over 7 days are paused |
| Supabase     | Built-in email is limited to 2 messages per hour                        |
| Vercel Hobby | Personal, non-commercial use. Cron runs at most once a day              |
| GitHub       | Scheduled workflows in a public repo stop after 60 days of no activity  |

Consequences: scheduling uses Supabase `pg_cron`, Google sign-in is the main way
in, and a daily keep-alive keeps the project awake. See `docs/RUNBOOK.md`.

## Decisions log

| ID    | Decision                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| D-001 | Keep the scaffold's Next.js 16 and Cache Components rather than pin an older major.                               |
| D-002 | TypeScript 5 and `@types/node` 22. Vitest 5 needs Node types 22 or newer, and the project requires Node 22.       |
| D-003 | Health check is throttled to one database query per minute per instance, so a public route cannot flood the DB.   |
| D-004 | Supabase env var is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The legacy anon key works in the same variable.       |
| D-005 | Plain `public/sw.js` for Stage 0. Stage 1 decides whether Serwist is needed for offline caching.                  |
| D-006 | Push spike is guarded by an env flag, a secret token, an allowlist of real push-service hosts and a rate limit.   |
| D-007 | CI runs on every push, not only pull requests, so stage branches are tested without opening a pull request.       |
| D-008 | Playwright reads `CHROMIUM_PATH` so it can use a preinstalled browser locally. CI leaves it unset.                |
| D-009 | The push spike posts the subscription straight to the test route. Storing it needs tables that arrive in Stage 9. |

## Open questions

- Stage 2: set `auto_expose_new_tables = false` in `supabase/config.toml` so new
  tables are unreachable through the API until explicitly granted. Decide when
  the first user table is written.
- Stage 2: whether a free email provider works without owning a domain.
