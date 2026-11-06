import { describe, expect, it } from "vitest";
import { safeEqual } from "./timing";

describe("safeEqual", () => {
  it("accepts identical strings", () => {
    expect(safeEqual("a-long-secret-token", "a-long-secret-token")).toBe(true);
  });

  it("rejects different strings of the same length", () => {
    expect(safeEqual("secret-token-aaaa", "secret-token-aaab")).toBe(false);
  });

  it("rejects strings of different length without throwing", () => {
    expect(safeEqual("short", "a much longer value")).toBe(false);
    expect(safeEqual("", "x")).toBe(false);
  });

  it("treats two empty strings as equal", () => {
    expect(safeEqual("", "")).toBe(true);
  });
});
