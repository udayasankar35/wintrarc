/**
 * Wraps an async check so it runs at most once per ttlMs and concurrent
 * callers share one in-flight call. The health route is public, so this stops
 * a flood of requests from turning into a flood of database queries.
 * Failures are not cached: the next caller retries immediately.
 */
export function createThrottled<T>(
  check: () => Promise<T>,
  ttlMs: number,
  now: () => number = Date.now,
): () => Promise<T> {
  let cached: { at: number; value: T } | null = null;
  let inflight: Promise<T> | null = null;

  return function run(): Promise<T> {
    if (cached && now() - cached.at < ttlMs) {
      return Promise.resolve(cached.value);
    }
    if (inflight) return inflight;

    inflight = check()
      .then((value) => {
        cached = { at: now(), value };
        return value;
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };
}
