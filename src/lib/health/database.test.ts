import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const createClient = vi.fn(() => ({ rpc }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) =>
    (createClient as (...a: unknown[]) => unknown)(...args),
}));

import { pingDatabase } from "./database";

const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

describe("pingDatabase", () => {
  beforeEach(() => {
    rpc.mockReset();
    createClient.mockClear();
  });

  it("reports not_configured without calling Supabase when env is missing", async () => {
    expect(await pingDatabase({})).toBe("not_configured");
    expect(
      await pingDatabase({
        NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      }),
    ).toBe("not_configured");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("reports ok when health_ping succeeds", async () => {
    rpc.mockResolvedValue({ data: "2026-11-06T00:00:00Z", error: null });
    expect(await pingDatabase(env)).toBe("ok");
    expect(rpc).toHaveBeenCalledWith("health_ping");
  });

  it("never persists a session for the health client", async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    await pingDatabase(env);
    expect(createClient).toHaveBeenCalledWith(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  });

  it("reports error when the database returns an error", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await pingDatabase(env)).toBe("error");
  });

  it("reports error when the request throws, for example a paused project", async () => {
    rpc.mockRejectedValue(new TypeError("fetch failed"));
    expect(await pingDatabase(env)).toBe("error");
  });
});
