# Runbook

Operational notes for keeping WINTRARC alive on free plans. Stage 11 expands this
with backups, incident steps and a restore drill.

## Keep the project awake

Supabase pauses a free project that sees little activity for 7 days. A paused
project means a dead demo link and no reminders, so two independent jobs call
`/api/health` once a day. That route runs a real query against Postgres.

| Job           | Where                             | Time (UTC) |
| ------------- | --------------------------------- | ---------- |
| Vercel cron   | `vercel.json`                     | 03:00      |
| GitHub Action | `.github/workflows/keepalive.yml` | 03:17      |

Set up:

1. Deploy to Vercel so `/api/health` exists.
2. In GitHub, open Settings, Secrets and variables, Actions, Variables, and add
   `APP_URL` with your deployment URL, for example `https://wintrarc.vercel.app`.
3. Run the workflow once from the Actions tab (Run workflow) and confirm it is
   green.

Caveats:

- Vercel Hobby cron is not exact. A run can land up to an hour from its time.
- GitHub disables scheduled workflows in a public repository after 60 days
  without repository activity. If the Keep alive workflow stops, open the Actions
  tab and re-enable it, or push any commit. The Vercel cron keeps running either
  way.
- Whether these pings count as activity for Supabase's pause rule is expected
  but not yet confirmed. After the first deployment, check the Supabase
  dashboard after 8 days and record the result in `PROGRESS.md`.

## If the project is paused

Open the Supabase dashboard and restore the project. Check Supabase's current
rules for how long a paused project can be restored. Until it is restored,
`/api/health` reports `degraded` with HTTP 503.

## Environment variables

- `NEXT_PUBLIC_*` values are inlined at build time. After changing one, redeploy.
- Run `npm run check-env -- --stage N` to list what is missing for stage N.
- Never paste a secret into a chat, an issue or a commit. If one leaks, rotate it
  at the source, then update `.env.local` and Vercel.

## Rotating secrets

| Secret             | Effect of rotating                                                      |
| ------------------ | ----------------------------------------------------------------------- |
| `PUSH_SPIKE_TOKEN` | None beyond the spike page. Change it, redeploy.                        |
| VAPID key pair     | Every existing push subscription stops working. Avoid unless it leaked. |
| Service role key   | Rotate in Supabase, update Vercel, redeploy.                            |

## Backups

The Supabase free plan has no automatic backups. Until Stage 11 adds a documented
backup script, treat the database as non-critical and rely on the in-app export
that arrives in Stage 2. Never commit a database dump.
