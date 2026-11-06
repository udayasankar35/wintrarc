import { describe, expect, it } from "vitest";
import { classifyPushError } from "./send";

describe("classifyPushError", () => {
  it.each([404, 410])("treats HTTP %i as an expired subscription", (code) => {
    expect(classifyPushError({ statusCode: code })).toEqual({
      kind: "expired",
      statusCode: code,
    });
  });

  it.each([400, 401, 403, 413, 429])(
    "treats HTTP %i as a rejected request",
    (code) => {
      expect(classifyPushError({ statusCode: code }).kind).toBe("rejected");
    },
  );

  it.each([500, 502, 503])("treats HTTP %i as a retryable failure", (code) => {
    expect(classifyPushError({ statusCode: code })).toEqual({
      kind: "failed",
      statusCode: code,
    });
  });

  it("treats errors without a status code as retryable failures", () => {
    expect(classifyPushError(new Error("socket hang up"))).toEqual({
      kind: "failed",
    });
    expect(classifyPushError("boom")).toEqual({ kind: "failed" });
    expect(classifyPushError(null)).toEqual({ kind: "failed" });
  });

  it("ignores a non-numeric statusCode", () => {
    expect(classifyPushError({ statusCode: "410" })).toEqual({
      kind: "failed",
    });
  });
});
