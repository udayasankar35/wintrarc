import { describe, expect, it } from "vitest";
import { createFixedWindowLimiter } from "./memory";

function clock(start = 0) {
  let time = start;
  return {
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

describe("createFixedWindowLimiter", () => {
  it("allows requests up to the limit and then blocks", () => {
    const c = clock();
    const check = createFixedWindowLimiter({
      limit: 3,
      windowMs: 1000,
      now: c.now,
    });
    expect(check("a")).toEqual({
      allowed: true,
      remaining: 2,
      retryAfterMs: 0,
    });
    expect(check("a").remaining).toBe(1);
    expect(check("a").remaining).toBe(0);
    const blocked = check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(1000);
  });

  it("reports the time left in the window when blocked", () => {
    const c = clock();
    const check = createFixedWindowLimiter({
      limit: 1,
      windowMs: 1000,
      now: c.now,
    });
    check("a");
    c.advance(400);
    expect(check("a").retryAfterMs).toBe(600);
  });

  it("starts a fresh window once the old one has expired", () => {
    const c = clock();
    const check = createFixedWindowLimiter({
      limit: 1,
      windowMs: 1000,
      now: c.now,
    });
    check("a");
    expect(check("a").allowed).toBe(false);
    c.advance(1000);
    expect(check("a").allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const c = clock();
    const check = createFixedWindowLimiter({
      limit: 1,
      windowMs: 1000,
      now: c.now,
    });
    expect(check("a").allowed).toBe(true);
    expect(check("b").allowed).toBe(true);
    expect(check("a").allowed).toBe(false);
  });

  it("never tracks more keys than maxKeys", () => {
    const c = clock();
    const check = createFixedWindowLimiter({
      limit: 1,
      windowMs: 10_000,
      maxKeys: 2,
      now: c.now,
    });
    check("a");
    check("b");
    // "c" forces eviction of the oldest key ("a"), so "a" gets a fresh window.
    check("c");
    expect(check("a").allowed).toBe(true);
  });
});
