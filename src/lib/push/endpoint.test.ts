import { describe, expect, it } from "vitest";
import { isAllowedPushEndpoint } from "./endpoint";

describe("isAllowedPushEndpoint", () => {
  it.each([
    "https://fcm.googleapis.com/fcm/send/abc123",
    "https://updates.push.services.mozilla.com/wpush/v2/abc",
    "https://web.push.apple.com/QabC123",
    "https://db5p.notify.windows.com/w/?token=abc",
    "https://FCM.GOOGLEAPIS.COM/fcm/send/abc123",
    "https://fcm.googleapis.com:443/fcm/send/abc123",
  ])("accepts the real push service %s", (endpoint) => {
    expect(isAllowedPushEndpoint(endpoint)).toBe(true);
  });

  it.each([
    ["plain http", "http://fcm.googleapis.com/fcm/send/abc"],
    ["lookalike suffix domain", "https://fcm.googleapis.com.evil.com/x"],
    ["lookalike prefix without dot", "https://evilfcm.googleapis.com/x"],
    ["credentials trick", "https://fcm.googleapis.com@evil.com/x"],
    ["embedded credentials", "https://user:pw@fcm.googleapis.com/x"],
    ["non-standard port", "https://fcm.googleapis.com:8443/x"],
    ["internal address", "https://127.0.0.1/x"],
    ["cloud metadata address", "https://169.254.169.254/latest/meta-data"],
    ["localhost", "https://localhost/x"],
    ["unrelated host", "https://example.com/push"],
    ["not a url", "not a url"],
    ["empty string", ""],
  ])("rejects %s", (_name, endpoint) => {
    expect(isAllowedPushEndpoint(endpoint)).toBe(false);
  });
});
