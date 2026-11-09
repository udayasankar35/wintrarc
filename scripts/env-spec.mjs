/**
 * The single list of environment variables WINTRARC understands.
 *
 * - stage: the build stage from which the variable matters.
 * - required: true, false, or a function (env, stage) => boolean for
 *   variables that are only needed in some configurations.
 * - secret: true when the value must never be committed, logged or sent to
 *   the browser. NEXT_PUBLIC_* values are always visible to the browser.
 *
 * `.env.example` is checked against this list by a unit test, so the two
 * cannot drift apart.
 */
export const ENV_SPEC = [
  // App
  {
    name: "NEXT_PUBLIC_APP_URL",
    group: "App",
    stage: 2,
    required: true,
    secret: false,
    description:
      "Public URL of this deployment, for example https://wintrarc.vercel.app",
  },

  // Supabase
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    group: "Supabase",
    stage: 0,
    required: true,
    secret: false,
    description: "Project URL from Supabase: Project Settings, API.",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    group: "Supabase",
    stage: 0,
    required: true,
    secret: false,
    description:
      "Publishable key (sb_publishable_...). The legacy anon key also works. Safe for the browser because Row Level Security protects the data.",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    group: "Supabase",
    stage: 2,
    required: true,
    secret: true,
    description:
      "Server only. Used for account deletion and scheduled jobs. Bypasses Row Level Security, so it must never reach the browser or the repository.",
  },

  // Push
  {
    name: "ENABLE_PUSH_SPIKE",
    group: "Push",
    stage: 0,
    required: false,
    secret: false,
    description:
      "Set to true to switch on the Stage 0 push test page and route. Remove it after testing.",
  },
  {
    name: "PUSH_SPIKE_TOKEN",
    group: "Push",
    stage: 0,
    required: (env) => env.ENABLE_PUSH_SPIKE === "true",
    secret: true,
    description: "At least 16 random characters. Protects the push test route.",
  },
  {
    name: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    group: "Push",
    stage: 0,
    required: (env, stage) => stage >= 9 || env.ENABLE_PUSH_SPIKE === "true",
    secret: false,
    description: "Generate the pair with `npm run vapid`.",
  },
  {
    name: "VAPID_PRIVATE_KEY",
    group: "Push",
    stage: 0,
    required: (env, stage) => stage >= 9 || env.ENABLE_PUSH_SPIKE === "true",
    secret: true,
    description: "Generate the pair with `npm run vapid`. Never share it.",
  },
  {
    name: "VAPID_SUBJECT",
    group: "Push",
    stage: 0,
    required: (env, stage) => stage >= 9 || env.ENABLE_PUSH_SPIKE === "true",
    secret: false,
    description:
      "Contact for the push services, as mailto:you@example.com or an https URL.",
  },

  // Auth
  {
    name: "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    group: "Auth",
    stage: 2,
    required: true,
    secret: false,
    description:
      "Cloudflare Turnstile site key that protects the demo sandbox. The secret key is entered in the Supabase dashboard, not here.",
  },

  // Rate limiting
  {
    name: "UPSTASH_REDIS_REST_URL",
    group: "Rate limiting",
    stage: 2,
    required: false,
    secret: false,
    description: "Optional. Without it, limits use a database-backed counter.",
  },
  {
    name: "UPSTASH_REDIS_REST_TOKEN",
    group: "Rate limiting",
    stage: 2,
    required: false,
    secret: true,
    description: "Optional. Pairs with UPSTASH_REDIS_REST_URL.",
  },

  // AI
  {
    name: "ANTHROPIC_API_KEY",
    group: "AI",
    stage: 7,
    required: false,
    secret: true,
    description:
      "Optional. Without it the AI screens show that AI is not configured.",
  },
  {
    name: "ANTHROPIC_MODEL",
    group: "AI",
    stage: 7,
    required: false,
    secret: false,
    description: "Model used for coaching and reports.",
  },
  {
    name: "ANTHROPIC_MODEL_FAST",
    group: "AI",
    stage: 7,
    required: false,
    secret: false,
    description: "Optional cheaper model for parsing tasks from text.",
  },
  {
    name: "AI_DAILY_TOKEN_BUDGET_USER",
    group: "AI",
    stage: 7,
    required: false,
    secret: false,
    description: "Daily token budget for each signed-in friend.",
  },
  {
    name: "AI_DAILY_TOKEN_BUDGET_DEMO",
    group: "AI",
    stage: 7,
    required: false,
    secret: false,
    description: "Daily token budget for each demo sandbox.",
  },
  {
    name: "AI_DAILY_TOKEN_BUDGET_GLOBAL",
    group: "AI",
    stage: 7,
    required: false,
    secret: false,
    description:
      "Daily token cap across all users. The last line of cost defence.",
  },

  // Scheduled jobs
  {
    name: "CRON_SECRET",
    group: "Jobs",
    stage: 9,
    required: true,
    secret: true,
    description:
      "Shared secret that protects routes called by schedulers. At least 16 random characters.",
  },

  // Observability
  {
    name: "NEXT_PUBLIC_SENTRY_DSN",
    group: "Observability",
    stage: 11,
    required: false,
    secret: false,
    description: "Optional. Error reporting.",
  },
  {
    name: "SENTRY_AUTH_TOKEN",
    group: "Observability",
    stage: 11,
    required: false,
    secret: true,
    description: "Optional. Uploads source maps at build time.",
  },
  {
    name: "SENTRY_ORG",
    group: "Observability",
    stage: 11,
    required: false,
    secret: false,
    description: "Optional. Sentry organisation slug.",
  },
  {
    name: "SENTRY_PROJECT",
    group: "Observability",
    stage: 11,
    required: false,
    secret: false,
    description: "Optional. Sentry project slug.",
  },

  // Development pages
  {
    name: "ENABLE_DESIGN_GALLERY",
    group: "Development",
    stage: 1,
    required: false,
    secret: false,
    description:
      "Set to true to switch on the /dev/design component gallery. Leave unset in production.",
  },
];
