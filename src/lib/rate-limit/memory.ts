export type LimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export type FixedWindowOptions = {
  /** Maximum requests allowed per key in one window. */
  limit: number;
  windowMs: number;
  /** Injectable clock so tests never depend on real time. */
  now?: () => number;
  /** Upper bound on tracked keys so memory cannot grow without limit. */
  maxKeys?: number;
};

/**
 * A small in-memory fixed-window limiter.
 *
 * It protects a single server instance only. Serverless instances do not
 * share memory, so this is a safety net for low-risk routes such as the push
 * spike. Per-user limits on real routes use a database-backed limiter from
 * Stage 2 onward.
 */
export function createFixedWindowLimiter(options: FixedWindowOptions) {
  const { limit, windowMs, now = Date.now, maxKeys = 10_000 } = options;
  const windows = new Map<string, { start: number; count: number }>();

  function makeRoom(time: number) {
    for (const [key, value] of windows) {
      if (time - value.start >= windowMs) windows.delete(key);
    }
    if (windows.size >= maxKeys) {
      const oldest = windows.keys().next();
      if (!oldest.done) windows.delete(oldest.value);
    }
  }

  return function check(key: string): LimitResult {
    const time = now();
    const current = windows.get(key);

    if (!current || time - current.start >= windowMs) {
      if (!current && windows.size >= maxKeys) makeRoom(time);
      windows.set(key, { start: time, count: 1 });
      return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    if (current.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: current.start + windowMs - time,
      };
    }

    current.count += 1;
    return { allowed: true, remaining: limit - current.count, retryAfterMs: 0 };
  };
}
