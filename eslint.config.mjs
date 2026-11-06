import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Architecture boundaries from ARCHITECTURE.md, enforced by lint so they
// cannot erode silently.
const supabaseImports = [
  {
    group: ["@supabase/*"],
    message:
      "Only src/lib/data, src/lib/supabase and route handlers may import Supabase. Use a hook backed by src/lib/data.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // UI code never talks to Supabase directly.
    files: ["src/components/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: supabaseImports }],
    },
  },
  {
    // The rules layer is pure: no I/O, no React, no Supabase, no Next.
    files: ["src/lib/rules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...supabaseImports,
            {
              group: ["react", "react-dom", "next", "next/*"],
              message:
                "src/lib/rules must stay pure so the server, client and tests share one implementation.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    // The service worker is plain JavaScript that runs in a worker scope.
    "public/**",
  ]),
]);

export default eslintConfig;
