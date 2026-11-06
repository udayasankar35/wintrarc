import { describe, expect, it, vi } from "vitest";
import { handleTestPush, type TestPushDeps } from "./handle-test-push";

const TOKEN = "spike-token-0123456789";

const validEnv = {
  ENABLE_PUSH_SPIKE: "true",
  PUSH_SPIKE_TOKEN: TOKEN,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: "public-key",
  VAPID_PRIVATE_KEY: "private-key",
  VAPID_SUBJECT: "mailto:owner@example.com",
};

const validBody = {
  subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc",
    keys: { p256dh: "p256dh-value", auth: "auth-value" },
  },
};

function without<T extends Record<string, string>, K extends keyof T>(
  source: T,
  key: K,
): Omit<T, K> {
  const copy = { ...source };
  delete copy[key];
  return copy;
}

function makeRequest(
  body: unknown,
  headers: Record<string, string> = { "x-spike-token": TOKEN },
) {
  return new Request("https://app.test/api/dev/push-test", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeDeps(overrides: Partial<TestPushDeps> = {}): TestPushDeps {
  return {
    env: validEnv,
    sender: vi.fn().mockResolvedValue({ statusCode: 201 }),
    limiter: () => ({ allowed: true, remaining: 9, retryAfterMs: 0 }),
    ...overrides,
  };
}

describe("handleTestPush", () => {
  it("returns 404 and sends nothing when the spike is disabled", async () => {
    const deps = makeDeps({ env: { ...validEnv, ENABLE_PUSH_SPIKE: "false" } });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(404);
    expect(deps.sender).not.toHaveBeenCalled();
  });

  it("returns 404 when the spike variable is missing", async () => {
    const env = without(validEnv, "ENABLE_PUSH_SPIKE");
    const deps = makeDeps({ env });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(404);
  });

  it("refuses to run with a missing or weak token", async () => {
    const deps = makeDeps({ env: { ...validEnv, PUSH_SPIKE_TOKEN: "short" } });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(503);
    expect(deps.sender).not.toHaveBeenCalled();
  });

  it("rejects a missing token header", async () => {
    const deps = makeDeps();
    const response = await handleTestPush(makeRequest(validBody, {}), deps);
    expect(response.status).toBe(401);
    expect(deps.sender).not.toHaveBeenCalled();
  });

  it("rejects a wrong token", async () => {
    const deps = makeDeps();
    const response = await handleTestPush(
      makeRequest(validBody, { "x-spike-token": "wrong-token-0123456789" }),
      deps,
    );
    expect(response.status).toBe(401);
    expect(deps.sender).not.toHaveBeenCalled();
  });

  it("rate limits before checking the token", async () => {
    const deps = makeDeps({
      limiter: () => ({ allowed: false, remaining: 0, retryAfterMs: 2500 }),
    });
    const response = await handleTestPush(
      makeRequest(validBody, { "x-spike-token": "wrong-token-0123456789" }),
      deps,
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
  });

  it("keys the rate limit on the first forwarded address", async () => {
    const limiter = vi
      .fn()
      .mockReturnValue({ allowed: true, remaining: 9, retryAfterMs: 0 });
    const deps = makeDeps({ limiter });
    await handleTestPush(
      makeRequest(validBody, {
        "x-spike-token": TOKEN,
        "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      }),
      deps,
    );
    expect(limiter).toHaveBeenCalledWith("203.0.113.7");
  });

  it("rejects malformed JSON", async () => {
    const response = await handleTestPush(makeRequest("{not json"), makeDeps());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_json" });
  });

  it("rejects a body that does not match the schema", async () => {
    const response = await handleTestPush(
      makeRequest({
        subscription: { endpoint: "https://fcm.googleapis.com/x" },
      }),
      makeDeps(),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_body" });
  });

  it("rejects an oversized body", async () => {
    const response = await handleTestPush(
      makeRequest({ ...validBody, body: "x".repeat(5000) }),
      makeDeps(),
    );
    expect(response.status).toBe(413);
  });

  it("refuses endpoints that are not real push services", async () => {
    const deps = makeDeps();
    const response = await handleTestPush(
      makeRequest({
        subscription: {
          ...validBody.subscription,
          endpoint: "https://169.254.169.254/latest/meta-data",
        },
      }),
      deps,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "endpoint_not_allowed" });
    expect(deps.sender).not.toHaveBeenCalled();
  });

  it("reports missing VAPID configuration", async () => {
    const env = without(validEnv, "VAPID_PRIVATE_KEY");
    const deps = makeDeps({ env });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "vapid_not_configured" });
  });

  it("rejects a VAPID subject that is neither mailto: nor https:", async () => {
    const deps = makeDeps({
      env: { ...validEnv, VAPID_SUBJECT: "owner@example.com" },
    });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(503);
  });

  it("sends the push and reports the push service status", async () => {
    const deps = makeDeps();
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, statusCode: 201 });
    expect(deps.sender).toHaveBeenCalledTimes(1);
    const [subscription, payload, vapid] = vi.mocked(deps.sender).mock
      .calls[0]!;
    expect(subscription.endpoint).toBe(validBody.subscription.endpoint);
    expect(payload.url).toBe("/dev/push-spike");
    expect(vapid.subject).toBe("mailto:owner@example.com");
  });

  it("maps an expired subscription to HTTP 410", async () => {
    const deps = makeDeps({
      sender: vi.fn().mockRejectedValue({ statusCode: 410 }),
    });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(410);
    expect(await response.json()).toEqual({ ok: false, kind: "expired" });
  });

  it("maps other sender failures to HTTP 502 without leaking details", async () => {
    const deps = makeDeps({
      sender: vi
        .fn()
        .mockRejectedValue(
          new Error("secret internal detail VAPID_PRIVATE_KEY"),
        ),
    });
    const response = await handleTestPush(makeRequest(validBody), deps);
    expect(response.status).toBe(502);
    const text = await response.text();
    expect(text).not.toContain("secret internal detail");
    expect(text).not.toContain("VAPID_PRIVATE_KEY");
  });

  it("never echoes the private key or token in any response", async () => {
    const responses = [
      await handleTestPush(makeRequest(validBody), makeDeps()),
      await handleTestPush(
        makeRequest(validBody),
        makeDeps({ sender: vi.fn().mockRejectedValue({ statusCode: 500 }) }),
      ),
    ];
    for (const response of responses) {
      const text = await response.text();
      expect(text).not.toContain("private-key");
      expect(text).not.toContain(TOKEN);
    }
  });
});
