import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison for secrets such as API tokens.
 * Both values are hashed first so the buffers always have equal length,
 * which avoids leaking the secret's length through timing.
 */
export function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
