import { createClient } from "@supabase/supabase-js";
import { createThrottled } from "./throttle";

export type DatabaseStatus = "ok" | "error" | "not_configured";

/**
 * Calls the public.health_ping() function, which makes a real round trip to
 * Postgres. That round trip counts as project activity, which is what keeps a
 * free Supabase project from being paused for inactivity.
 */
export async function pingDatabase(
  env: Record<string, string | undefined> = process.env,
): Promise<DatabaseStatus> {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return "not_configured";

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.rpc("health_ping");
    return error ? "error" : "ok";
  } catch {
    return "error";
  }
}

/** At most one database query per minute per server instance. */
export const checkDatabase = createThrottled(() => pingDatabase(), 60_000);
