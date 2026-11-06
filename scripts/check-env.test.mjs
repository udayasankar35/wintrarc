import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkEnv } from "./check-env.mjs";
import { ENV_SPEC } from "./env-spec.mjs";

const names = (list) => list.map((v) => v.name);

describe("checkEnv", () => {
  it("requires the Supabase connection from stage 0", () => {
    const result = checkEnv({}, 0);
    expect(result.ok).toBe(false);
    expect(names(result.missing)).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ]);
  });

  it("passes when the stage 0 variables are set", () => {
    const result = checkEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      },
      0,
    );
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("treats blank or whitespace values as missing", () => {
    const result = checkEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: "   ",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      },
      0,
    );
    expect(names(result.missing)).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(names(result.missing)).toContain(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  });

  it("requires push spike variables only when the spike is enabled", () => {
    const base = {
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
    };
    expect(checkEnv(base, 0).ok).toBe(true);

    const enabled = checkEnv({ ...base, ENABLE_PUSH_SPIKE: "true" }, 0);
    expect(enabled.ok).toBe(false);
    expect(names(enabled.missing).sort()).toEqual([
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
      "PUSH_SPIKE_TOKEN",
      "VAPID_PRIVATE_KEY",
      "VAPID_SUBJECT",
    ]);
  });

  it("does not ask for later-stage variables early", () => {
    const early = names(checkEnv({}, 0).missing);
    expect(early).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(early).not.toContain("CRON_SECRET");
    expect(names(checkEnv({}, 0).optionalMissing)).not.toContain(
      "ANTHROPIC_API_KEY",
    );
  });

  it("requires the service role key and Turnstile from stage 2", () => {
    const stage2 = names(checkEnv({}, 2).missing);
    expect(stage2).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(stage2).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(stage2).toContain("NEXT_PUBLIC_APP_URL");
  });

  it("requires VAPID keys and the cron secret from stage 9", () => {
    const stage9 = names(checkEnv({}, 9).missing);
    expect(stage9).toContain("VAPID_PRIVATE_KEY");
    expect(stage9).toContain("CRON_SECRET");
  });

  it("keeps the Anthropic key optional because AI degrades gracefully", () => {
    const result = checkEnv({}, 11);
    expect(names(result.missing)).not.toContain("ANTHROPIC_API_KEY");
    expect(names(result.optionalMissing)).toContain("ANTHROPIC_API_KEY");
  });
});

describe(".env.example", () => {
  const text = readFileSync(
    new URL("../.env.example", import.meta.url),
    "utf8",
  );
  const entries = new Map(
    text
      .split("\n")
      .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).trim()];
      }),
  );

  it("documents every variable in the spec", () => {
    const missing = ENV_SPEC.filter((v) => !entries.has(v.name)).map(
      (v) => v.name,
    );
    expect(missing).toEqual([]);
  });

  it("contains no variable that the spec does not know", () => {
    const known = new Set(ENV_SPEC.map((v) => v.name));
    const extra = [...entries.keys()].filter((name) => !known.has(name));
    expect(extra).toEqual([]);
  });

  it("never ships a value for a secret", () => {
    const leaked = ENV_SPEC.filter(
      (v) => v.secret && (entries.get(v.name) ?? "") !== "",
    ).map((v) => v.name);
    expect(leaked).toEqual([]);
  });

  it("has no duplicate or malformed spec entries", () => {
    const seen = new Set();
    for (const v of ENV_SPEC) {
      expect(seen.has(v.name)).toBe(false);
      seen.add(v.name);
      expect(v.description.length).toBeGreaterThan(0);
      expect(Number.isInteger(v.stage)).toBe(true);
      expect(typeof v.secret).toBe("boolean");
    }
  });

  it("never marks a NEXT_PUBLIC_ variable as secret", () => {
    const wrong = ENV_SPEC.filter(
      (v) => v.name.startsWith("NEXT_PUBLIC_") && v.secret,
    ).map((v) => v.name);
    expect(wrong).toEqual([]);
  });
});
