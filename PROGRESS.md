# Progress

Last updated: 2026-11-07. **Current stage: 0, foundations.** The code is complete
and verified where this environment allows. Items that need the owner, a real
device or GitHub's own runners are listed under "Not yet verified".

## Stages

| #   | Stage                                               | Status                         |
| --- | --------------------------------------------------- | ------------------------------ |
| 0   | Foundations: scaffold, CI, early deploy, push spike | In review, owner steps pending |
| 1   | Design system and installable PWA shell             | Not started                    |
| 2   | Authentication, profiles, RLS, demo sandbox         | Not started                    |
| 3   | Data layer, habits, tasks, goals, focus, Today      | Not started                    |
| 4   | Realtime sync, offline queue, conflicts             | Not started                    |
| 5   | Analytics core and charts                           | Not started                    |
| 6   | Arcs, check-ins, insights                           | Not started                    |
| 7   | AI engine                                           | Not started                    |
| 8   | Reports (PDF, CSV, XLSX)                            | Not started                    |
| 9   | Notifications and scheduler                         | Not started                    |
| 10  | Gamification, onboarding, polish                    | Not started                    |
| 11  | Security audit, accessibility, performance, launch  | Not started                    |

## Stage 0: done, with evidence

All commands were run on the final code on 2026-11-07.

- [x] **Existing project inspected.** The repository held only a one-line
      README, so there was nothing to preserve.
- [x] **Scaffold and tooling.** Next.js 16.4.5 (Cache Components on), TypeScript 5
      strict with `noUncheckedIndexedAccess`, Tailwind 4, ESLint, Prettier,
      Vitest 5, Playwright. `npm run verify` (typecheck, lint, format check, unit
      tests) exits 0 with no errors and no warnings.
- [x] **Unit tests: 100 passing in 10 files.** They cover the push endpoint
      allowlist (including lookalike hosts, credentials tricks and the cloud
      metadata address), the push permission state machine for every state,
      iOS detection, the guarded test-push handler (disabled, missing and wrong
      token, rate limit, bad JSON, oversized body, forbidden endpoint, missing
      VAPID, expired subscription, no secret ever echoed), the rate limiter, the
      health throttle, the database ping and the environment spec.
- [x] **Production build succeeds.** Routes: `/` static, `/api/health` and
      `/api/dev/push-test` dynamic, `/dev/push-spike` partially prerendered,
      `/manifest.webmanifest` and the icons static.
- [x] **End-to-end: 16 passing** (8 tests on a desktop viewport and the same 8
      on a Pixel 7 viewport, real Chromium against the production build): home
      page renders with no console errors, no horizontal scroll, `/api/health`
      returns a different `checkedAt` on each request (proves it is not
      prerendered) and is `no-store`, manifest valid and both icons load as PNG,
      `/sw.js` served as JavaScript with `no-store`, security headers present
      and `x-powered-by` absent, the push test route returns 404 and the page
      shows "not found" while the spike is off.
- [x] **Push spike exercised in a real browser** with the spike enabled: the
      service worker registers and activates, the page reports "Allowed, but
      this device is not subscribed" when permission is granted without a
      subscription, no horizontal overflow at 375 px or 1280 px, and the failed
      subscribe is reported as a clear message instead of a crash.
- [x] **Push route probed over HTTP:** 401 with no token and with a wrong token,
      400 for malformed JSON, 400 `endpoint_not_allowed` for the cloud metadata
      address, 502 with no detail leaked for a send that cannot complete, and
      429 once ten calls a minute are exceeded.
- [x] **Architecture rules enforced by lint.** A probe importing `@supabase/*`
      from `src/components` and one importing `react` from `src/lib/rules` were
      both rejected, then removed.
- [x] **Environment handling.** `.env.example` and `scripts/env-spec.mjs`
      describe every variable. A test fails if they drift apart, if any secret
      has a value in the example, or if a `NEXT_PUBLIC_` variable is marked
      secret. `npm run check-env` names the two missing required variables on an
      empty environment and never prints values.
- [x] **Migration validated on a real Postgres 16.** `health_ping()` returns
      `timestamptz`, runs as the caller with an empty `search_path`, can be
      called by `anon`, `authenticated` and `service_role`, is refused for a role
      with no grants, returns the current time, and the migration can be applied
      twice. The query behind the `rls_enabled` guard reports a table without Row
      Level Security and passes once it is enabled.
- [x] **Keep-alive configured.** `vercel.json` daily cron and a scheduled GitHub
      Action both call `/api/health`, which queries Postgres.
- [x] **Dependency audit.** 0 vulnerabilities in production dependencies (CI
      fails on high severity). 8 moderate advisories in the lint toolchain
      (`@typescript-eslint`), development only, not upgraded because the fix is a
      breaking change.
- [x] **Secret scan** of the working tree for key patterns found nothing.
      `.env*` is git-ignored except `.env.example`.
- [x] **Documents:** `README.md`, `ARCHITECTURE.md`, `docs/RUNBOOK.md`,
      `docs/PUSH-SPIKE.md`.

## Not yet verified

- [ ] **CI green on GitHub.** The workflows are committed but have not run yet.
- [ ] **pgTAP database tests.** `supabase/tests/database/*.test.sql` run in the CI
      `database` job. They could not run here: pgTAP is not installed and Docker
      cannot pull the Supabase images from this environment. The same properties
      were checked in plain SQL above.
- [ ] **Vercel deployment loads over HTTPS.** Owner step.
- [ ] **Supabase project connected.** After `db push`, `/api/health` should show
      `"database": "ok"`. Owner step.
- [ ] **Keep-alive effectiveness.** Confirm the daily ping stops Supabase from
      pausing the project: check the dashboard after 8 days and record it here.
- [ ] **Real push delivery** on desktop Chrome or Edge, an installed Android PWA
      and an iPhone on iOS 16.4 or later installed to the Home Screen. Automated
      browsers cannot do this: Chrome does not support the Push API in incognito
      mode. Follow `docs/PUSH-SPIKE.md` and fill in its results table.

## Owner actions, in order

1. Merge the `stage-0-foundations` branch into `main`.
2. Create a free Supabase project. Put its URL and publishable key in
   `.env.local`. Run `npx supabase@latest link --project-ref <ref>` then
   `npx supabase@latest db push`.
3. Import the repository into Vercel (Hobby), add the same variables, and
   redeploy. Add the GitHub repository variable `APP_URL`.
4. Run the push test on your devices using `docs/PUSH-SPIKE.md`, record the
   results, then remove `ENABLE_PUSH_SPIKE` and redeploy.
5. Tell the agent the results. Stage 1 starts after you sign off on Stage 0.

## Deviations from the plan, for review

- **Limit warnings** (owner alert at 70% of Supabase limits) moved to Stage 9.
  They need the notifications table, which does not exist yet.
- **The push spike does not store subscriptions.** The page posts the
  subscription straight to the test route, because storing it needs tables that
  arrive in Stage 9.
- **Placeholder icons.** A generated ring-and-W mark so iOS can offer install and
  push. Stage 1 replaces it with real branding.
- **shadcn/ui deferred to Stage 1.** Stage 0 has only the colour tokens.
- **The home page is a status page**, not the product.
- **CI runs on every push**, not only on pull requests (decision D-007).

## Known limitations

- The rate limiter and the health throttle keep their state in memory, so they
  protect one server instance, not a whole serverless fleet. Database-backed
  limits arrive in Stage 2.
- Vercel Hobby cron runs at most once a day and not at an exact minute.
- Development-only dependency advisories listed above.

## Next

Stage 1: design system and installable PWA shell, after Stage 0 sign-off.
