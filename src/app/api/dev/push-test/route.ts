import { handleTestPush } from "@/lib/push/handle-test-push";
import { webPushSender } from "@/lib/push/send";
import { createFixedWindowLimiter } from "@/lib/rate-limit/memory";

const limiter = createFixedWindowLimiter({ limit: 10, windowMs: 60_000 });

/** Stage 0 push spike. Hidden unless ENABLE_PUSH_SPIKE=true. */
export async function POST(request: Request) {
  return handleTestPush(request, {
    env: process.env,
    sender: webPushSender,
    limiter,
  });
}
