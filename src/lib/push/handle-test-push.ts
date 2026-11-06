import { z } from "zod";
import type { LimitResult } from "@/lib/rate-limit/memory";
import { safeEqual } from "@/lib/security/timing";
import { isAllowedPushEndpoint } from "./endpoint";
import { classifyPushError, type PushSender, type VapidConfig } from "./send";

const MAX_BODY_BYTES = 4096;

const bodySchema = z.object({
  subscription: z.object({
    endpoint: z.string().max(2048),
    keys: z.object({
      p256dh: z.string().min(1).max(256),
      auth: z.string().min(1).max(64),
    }),
  }),
  title: z.string().max(80).optional(),
  body: z.string().max(200).optional(),
});

export type TestPushDeps = {
  env: Record<string, string | undefined>;
  sender: PushSender;
  limiter: (key: string) => LimitResult;
};

function json(body: unknown, status: number, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function readVapid(env: TestPushDeps["env"]): VapidConfig | null {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;
  const subject = env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return null;
  if (!subject.startsWith("mailto:") && !subject.startsWith("https://")) {
    return null;
  }
  return { publicKey, privateKey, subject };
}

/**
 * Sends one test push to a subscription supplied by the caller.
 *
 * This route exists only to prove delivery in Stage 0. It is hidden unless
 * ENABLE_PUSH_SPIKE=true, needs a secret token, only talks to real push
 * services, and is rate limited. The production delivery pipeline in Stage 9
 * reads subscriptions from the database instead and has no such route.
 */
export async function handleTestPush(
  request: Request,
  deps: TestPushDeps,
): Promise<Response> {
  const { env } = deps;

  // Pretend the route does not exist unless the spike is switched on.
  if (env.ENABLE_PUSH_SPIKE !== "true") {
    return new Response(null, { status: 404 });
  }

  const expectedToken = env.PUSH_SPIKE_TOKEN;
  if (!expectedToken || expectedToken.length < 16) {
    return json({ error: "spike_token_not_configured" }, 503);
  }

  // Rate limit before checking the token so guessing it is not free.
  const limit = deps.limiter(clientKey(request));
  if (!limit.allowed) {
    return json({ error: "rate_limited" }, 429, {
      "Retry-After": String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))),
    });
  }

  const suppliedToken = request.headers.get("x-spike-token") ?? "";
  if (!safeEqual(suppliedToken, expectedToken)) {
    return json({ error: "unauthorized" }, 401);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return json({ error: "body_too_large" }, 413);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "invalid_body" }, 400);
  }

  const { subscription, title, body } = parsed.data;
  if (!isAllowedPushEndpoint(subscription.endpoint)) {
    return json({ error: "endpoint_not_allowed" }, 400);
  }

  const vapid = readVapid(env);
  if (!vapid) {
    return json({ error: "vapid_not_configured" }, 503);
  }

  try {
    const { statusCode } = await deps.sender(
      subscription,
      {
        title: title ?? "WINTRARC test",
        body: body ?? "If you can read this, push works on this device.",
        url: "/dev/push-spike",
        tag: "wintrarc-spike",
      },
      vapid,
    );
    return json({ ok: true, statusCode }, 200);
  } catch (error) {
    const failure = classifyPushError(error);
    if (failure.kind === "expired") {
      return json({ ok: false, kind: "expired" }, 410);
    }
    return json(
      { ok: false, kind: failure.kind, statusCode: failure.statusCode },
      502,
    );
  }
}
