# Progress

Last updated: 2026-11-09. **Current stage: 1, design system and installable PWA
shell.** Stage 0 is merged to `main`. Stage 1 is built and verified in this
environment; items that need the owner or a real device are listed under "Not
yet verified". Stage 2 does not start until Stage 1 is signed off.

## Stages

| #   | Stage                                               | Status                      |
| --- | --------------------------------------------------- | --------------------------- |
| 0   | Foundations: scaffold, CI, early deploy, push spike | Merged, owner steps pending |
| 1   | Design system and installable PWA shell             | Built, awaiting review      |
| 2   | Authentication, profiles, RLS, demo sandbox         | Not started                 |
| 3   | Data layer, habits, tasks, goals, focus, Today      | Not started                 |
| 4   | Realtime sync, offline queue, conflicts             | Not started                 |
| 5   | Analytics core and charts                           | Not started                 |
| 6   | Arcs, check-ins, insights                           | Not started                 |
| 7   | AI engine                                           | Not started                 |
| 8   | Reports (PDF, CSV, XLSX)                            | Not started                 |
| 9   | Notifications and scheduler                         | Not started                 |
| 10  | Gamification, onboarding, polish                    | Not started                 |
| 11  | Security audit, accessibility, performance, launch  | Not started                 |
| 12  | Optional: Android APK (Trusted Web Activity)        | Optional, after Stage 11    |

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
- [x] **CI green on GitHub.** Run 42312974687 on commit `683881c` (branch
      `stage-0-foundations`) passed both jobs. `verify`: install, typecheck, lint,
      formatting, unit tests, build, production audit, end-to-end tests. `database`:
      local Supabase started, migrations applied, `supabase test db` passed. The
      pgTAP tests (`health_ping` and the `rls_enabled` guard) therefore ran on a real
      Supabase stack, which this environment could not do itself.

## Stage 1: built, with evidence

Verified on the final code on 2026-11-09 in this environment (real Chromium
against the production build).

- [x] **Design tokens in both themes, with a System, Light and Dark switch.**
      Dark is the default. A script in `<head>` sets the theme before first
      paint: a test proves the saved theme is on `<html>` at
      `domcontentloaded`. The switch persists across reload, follows the device
      while on System (including a change made after load), and the page works
      with storage blocked.
- [x] **Contrast is enforced, not eyeballed.** A unit test parses
      `globals.css` and checks every text pair at 4.5:1 or more and every
      control, ring and graphic pair at 3:1 or more, in both themes. It caught
      that the gold fill is only 1.3:1 on the light page, so graphics use a
      darker `--accent-graphic` there.
- [x] **The 18 primitives and a chart wrapper**, all in `src/components/ui`:
      Button, IconButton (tooltip, label and key hint), Input, Select,
      Checkbox, Switch, Dialog, Drawer, Popover, Tabs, Toast with Undo,
      Skeleton, EmptyState, Card, Stat, Badge, Progress, ArcRing, and
      ChartFrame (Chart/Table tabs, a labelled unit, an accessible table).
      The gallery at `/dev/design` shows each in every state and renders with
      no console errors and no horizontal overflow.
- [x] **Responsive shell.** Sidebar from 1024px, icon rail with a labelled
      drawer from 768px, bottom tab bar with safe-area padding below that. End
      to end, all 11 pages were opened at 375, 768 and 1280px in both themes
      (66 page checks): status 200, one h1, no horizontal overflow, no console
      errors, and a screenshot kept for each. Phone tab targets measure 44px or
      more.
- [x] **A real page and an honest empty state for every section** (Today,
      Habits, Tasks, Goals, Arcs, Focus, Analytics, Insights, Reports, More,
      Settings). No sample data outside the gallery. A unit test fails if a
      navigation link has no page.
- [x] **Command palette and shortcuts.** Ctrl/Cmd+K opens a navigation-only
      palette; `g` then a letter jumps to a section; `?` lists every shortcut.
      Letter shortcuts are ignored while typing. Verified: the palette filters,
      Enter navigates, Escape closes and returns focus, an empty search says so,
      and `gh` typed into the palette does not navigate. The matcher is a pure
      module with unit tests for chords, sequences, the one-second timeout and
      typing targets.
- [x] **PWA.** Manifest with `id`, `scope`, standalone display, three icons
      (192, 512, maskable 512) and four shortcuts. The icons are generated by
      `scripts/generate-icons.mjs` from the same geometry as the in-app logo;
      a test reads each PNG header and confirms its size matches the manifest.
      Chrome's own installability check (`Page.getInstallabilityErrors`)
      reports no errors other than "incognito", which is how Playwright runs.
- [x] **Offline.** The service worker (Serwist) precaches 32 static files
      including both fonts, the icons and `/offline`. With the network cut, a
      request for `/habits` shows the offline page with the app's fonts, and the
      app recovers when the network returns. **No page or API response is ever
      stored**: a test visits `/habits`, `/settings` and `/api/health` and
      inspects every cache. The old `/sw.js` address now returns 404.
- [x] **Install experience** for Android and desktop (the browser's own
      prompt, captured at load), iOS (Share, then Add to Home Screen) and
      browsers with only a menu option. A unit-tested state machine picks the
      right instructions. The prompt itself needs a real device (see below).
- [x] **Accessibility gate.** axe-core with the WCAG 2.0, 2.1 and 2.2 A and AA
      rules found no violations across 11 pages, `/offline` and the gallery, at
      375 and 1280px, in both themes (56 runs), and on the open command
      palette and shortcut list in both themes and the tablet drawer. A
      deliberately bad page was used to confirm the gate does find problems
      (contrast and missing alt text).
- [x] **Keyboard.** Skip link is the first tab stop and moves focus into the
      page. Dialogs and drawers trap focus and close on Escape.
- [x] **Static checks.** `npm run typecheck` (app and worker), ESLint, Prettier
      and `npm test` pass with no errors or warnings. **273 unit tests in 20
      files** (up from 100). **167 end-to-end tests pass** (161 on a desktop
      viewport, 6 on a Pixel 7 profile).
- [x] **Dependencies.** `npm audit --omit=dev`: 0 vulnerabilities. Full audit:
      11 moderate, development tools only (the lint toolchain and Serwist's
      build helpers). Three high advisories from a nested zod were removed
      with an override (D-018).

### Defects the gate found, and fixed

- Escape took two presses in every dialog and drawer: focus landed on the Close
  button, whose tooltip took the first Escape.
- Dialogs opened by shortcut did not return focus on close.
- A system theme change between first paint and hydration was missed.
- The Skeleton was invisible on a light card.
- The segmented control's targets were 40px; now 44px.
- The offline page promised that work was "safe on this device", which is not
  true until Stage 4. The sentence is removed.
- The current-page marker was clipped in the sidebar.

- [x] **CI green on GitHub.** Run 42581816155 on commit `332633e` (branch
      `stage-1-design-system`) passed both jobs. `verify`: install, typecheck
      (app and worker), lint, formatting, 273 unit tests, build, production
      audit, 167 end-to-end tests on GitHub's runner. `database`: migrations and
      pgTAP. The run uploaded the `e2e-screenshots` artifact.

## Not yet verified

Stage 1, needs a real device or the deployed site:

- [ ] **Install prompt on Android Chrome**, and on desktop Chrome and Edge. The
      prompt, the standalone window, the four shortcuts on a long press of the
      icon, and how the maskable icon crops on your launcher.
- [ ] **iPhone:** Share, then Add to Home Screen, then open from the Home Screen.
      Check the status bar colour and the icon.
- [ ] **Cmd+K on a Mac keyboard.** The matcher is unit-tested with the Command
      key; a real Mac has not been used.
- [ ] **Screen reader pass** (VoiceOver or TalkBack). axe cannot judge reading
      order or whether labels make sense aloud.
- [ ] **Bottom tab bar on a phone with a notch or gesture bar**, for safe-area
      spacing.
- [ ] **Service worker update after a deploy.** The new worker takes over at
      once; confirm an open tab keeps working after a second deploy.
- [ ] **Lighthouse on the deployed site** (performance, PWA, accessibility).
- [ ] **The worker route on Vercel.** It is prerendered at build and works under
      `next start` here; confirm `/serwist/sw.js` loads on the deployment.

Stage 0, still open:

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

1. Review and merge the `stage-1-design-system` pull request.
2. Create a free Supabase project. Put its URL and publishable key in
   `.env.local`. Run `npx supabase@latest link --project-ref <ref>` then
   `npx supabase@latest db push`.
3. Import the repository into Vercel (Hobby), add the same variables, and
   redeploy. Add the GitHub repository variable `APP_URL`.
4. Run the push test on your devices using `docs/PUSH-SPIKE.md`, record the
   results, then remove `ENABLE_PUSH_SPIKE` and redeploy.
5. Try the install and keyboard checks under "Not yet verified" on your own
   devices and tell the agent the results. Stage 2 starts after you sign off
   on Stage 1.

## Deviations from the plan, for review

- **Limit warnings** (owner alert at 70% of Supabase limits) moved to Stage 9.
  They need the notifications table, which does not exist yet.
- **The push spike does not store subscriptions.** The page posts the
  subscription straight to the test route, because storing it needs tables that
  arrive in Stage 9.
- **The home page is now the Today page.** The Stage 0 status page moved to
  Settings, under System status.
- **CI runs on every push**, not only on pull requests (decision D-007).
- **Stage 1: no Framer Motion.** CSS animations on transform and opacity covered
  every interaction. Revisit in Stage 3 (D-011).
- **Stage 1: no shadcn CLI.** Components are hand-written in the same style
  (D-011).
- **Stage 1: new optional Stage 12** for an Android APK, added at the owner's
  request. It does not change Stages 2 to 11.
- **Stage 1: the name is "Wintrarc" in the interface** and WINTRARC in the
  documents (D-022). Say if you want one spelling everywhere.
- **Stage 1: quick-action shortcuts** (`New habit`, `New task`, `Start focus`)
  open their pages with `?new=1` or `?start=1`. The pages ignore those until the
  forms exist in Stage 3.

## Known limitations

- The rate limiter and the health throttle keep their state in memory, so they
  protect one server instance, not a whole serverless fleet. Database-backed
  limits arrive in Stage 2.
- Vercel Hobby cron runs at most once a day and not at an exact minute.
- Development-only dependency advisories listed above.
- The component gallery code is part of the bundle even when the gallery is off,
  so its scripts are also precached. The page itself returns 404 unless
  `ENABLE_DESIGN_GALLERY=true`.
- Safari and Firefox on desktop have no install prompt event; the install card
  shows the menu steps for them.
- Brand icons are a first pass: the Arc ring on a dark tile.

## Next

Stage 2: authentication, profiles, Row Level Security and the demo sandbox,
after Stage 1 sign-off. Stage 12 (Android APK) is optional and comes last.
