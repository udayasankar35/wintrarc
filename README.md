# WINTRARC

> Become the person you said you'd be.

An AI-assisted habit, task, goal and focus tracker built around **Arcs**:
time-boxed 30, 60 or 90-day seasons with a theme, linked goals and a
retrospective. One account, the same state on every device, as an installable
web app with real push notifications.

**Status: Stage 0 of 12, foundations.** The app shell, sign-in and the Today
screen arrive in the next stages. See [PROGRESS.md](PROGRESS.md) for exactly what
works today and what is still to come.

It is a portfolio project, run on free plans (Next.js on Vercel, Supabase), and
shared with a few invited friends.

## Run it locally

Requires Node 22 or later.

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run check-env            # lists anything still missing
npm run dev                  # http://localhost:3000
```

The app starts without Supabase values. `/api/health` then reports
`"database": "not_configured"`.

## Scripts

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Start the development server                          |
| `npm run build`     | Production build                                      |
| `npm run verify`    | Typecheck, lint, formatting check and unit tests      |
| `npm test`          | Unit tests (Vitest)                                   |
| `npm run e2e`       | Browser tests (Playwright). Run `npm run build` first |
| `npm run check-env` | Report missing environment variables (`-- --stage N`) |
| `npm run vapid`     | Generate a VAPID key pair for push notifications      |

Browser tests need Playwright's Chromium: `npx playwright install chromium`.

## Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In Project Settings, API, copy the project URL and the publishable key into
   `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Apply the migrations:

   ```bash
   npx supabase@latest login
   npx supabase@latest link --project-ref <your-project-ref>
   npx supabase@latest db push
   ```

4. Check `http://localhost:3000/api/health`. It should report `"database": "ok"`.

Never put the service-role key in a `NEXT_PUBLIC_` variable or commit it.

## Deploy to Vercel

1. Import this repository at [vercel.com](https://vercel.com) (the Hobby plan is
   free for personal projects).
2. Add the same environment variables in Project Settings, Environment
   Variables. Redeploy after changing any `NEXT_PUBLIC_` value.
3. In GitHub, add the repository variable `APP_URL` with your deployment URL so
   the daily keep-alive job knows where to call. See
   [docs/RUNBOOK.md](docs/RUNBOOK.md).

## Push notifications

The Stage 0 push test and the steps for testing on Android and iPhone are in
[docs/PUSH-SPIKE.md](docs/PUSH-SPIKE.md). iPhone push works only for the app
installed to the Home Screen, on iOS 16.4 or later.

## Project documents

- [ARCHITECTURE.md](ARCHITECTURE.md): stack, boundaries, rules and decisions
- [PROGRESS.md](PROGRESS.md): stage checklist with evidence and manual tests
- [docs/RUNBOOK.md](docs/RUNBOOK.md): keeping the free-tier project alive
- [docs/PUSH-SPIKE.md](docs/PUSH-SPIKE.md): the push test and device results
