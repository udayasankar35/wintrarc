import { connection } from "next/server";
import { checkDatabase } from "@/lib/health/database";

/**
 * Liveness and database check. It is called daily by a Vercel cron and a
 * scheduled GitHub Action so a free Supabase project keeps seeing activity.
 *
 * connection() makes the route run per request. Without it, Cache Components
 * could prerender the response at build time and freeze it.
 */
export async function GET() {
  await connection();

  const database = await checkDatabase();
  const healthy = database !== "error";

  return Response.json(
    {
      status: healthy ? "ok" : "degraded",
      database,
      checkedAt: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
