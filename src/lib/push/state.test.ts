import { describe, expect, it } from "vitest";
import {
  describePushState,
  detectIOS,
  getPushState,
  type PushEnvironment,
  type PushState,
} from "./state";

const capable: PushEnvironment = {
  hasServiceWorker: true,
  hasPushManager: true,
  hasNotification: true,
  isIOS: false,
  isStandalone: false,
  permission: "default",
  hasSubscription: false,
};

describe("getPushState", () => {
  it("is unsupported without a service worker, PushManager or Notification", () => {
    expect(getPushState({ ...capable, hasServiceWorker: false })).toBe(
      "unsupported",
    );
    expect(getPushState({ ...capable, hasPushManager: false })).toBe(
      "unsupported",
    );
    expect(getPushState({ ...capable, hasNotification: false })).toBe(
      "unsupported",
    );
  });

  it("asks iOS users to install before anything else", () => {
    // Safari hides PushManager outside the installed app, so support flags
    // must not hide the install instruction.
    expect(
      getPushState({
        ...capable,
        isIOS: true,
        hasPushManager: false,
        isStandalone: false,
      }),
    ).toBe("needs_install");
  });

  it("lets an installed iOS app continue to the permission states", () => {
    expect(getPushState({ ...capable, isIOS: true, isStandalone: true })).toBe(
      "ready_to_ask",
    );
  });

  it("reports denied permission without offering to ask again", () => {
    const state = getPushState({ ...capable, permission: "denied" });
    expect(state).toBe("permission_denied");
    expect(describePushState(state).canEnable).toBe(false);
  });

  it("offers to ask only while permission is still undecided", () => {
    const state = getPushState(capable);
    expect(state).toBe("ready_to_ask");
    expect(describePushState(state).canEnable).toBe(true);
  });

  it("never reports active from permission alone", () => {
    expect(
      getPushState({
        ...capable,
        permission: "granted",
        hasSubscription: false,
      }),
    ).toBe("granted_no_subscription");
  });

  it("reports active only with permission and a real subscription", () => {
    expect(
      getPushState({
        ...capable,
        permission: "granted",
        hasSubscription: true,
      }),
    ).toBe("active");
  });

  it("ignores a stale subscription when permission is not granted", () => {
    expect(
      getPushState({ ...capable, permission: "denied", hasSubscription: true }),
    ).toBe("permission_denied");
  });
});

describe("describePushState", () => {
  const states: PushState[] = [
    "unsupported",
    "needs_install",
    "permission_denied",
    "ready_to_ask",
    "granted_no_subscription",
    "active",
  ];

  it.each(states)("has user-facing copy for %s", (state) => {
    const copy = describePushState(state);
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.detail.length).toBeGreaterThan(0);
  });

  it("only offers to enable in the two states where it can work", () => {
    const enabling = states.filter((s) => describePushState(s).canEnable);
    expect(enabling).toEqual(["ready_to_ask", "granted_no_subscription"]);
  });
});

describe("detectIOS", () => {
  it("detects iPhone and iPad user agents", () => {
    expect(
      detectIOS("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)", "iPhone", 5),
    ).toBe(true);
    expect(detectIOS("Mozilla/5.0 (iPad; CPU OS 17_0)", "iPad", 5)).toBe(true);
  });

  it("detects iPadOS that reports a desktop Safari user agent", () => {
    expect(
      detectIOS("Mozilla/5.0 (Macintosh; Intel Mac OS X)", "MacIntel", 5),
    ).toBe(true);
  });

  it("does not treat a real Mac as iOS", () => {
    expect(
      detectIOS("Mozilla/5.0 (Macintosh; Intel Mac OS X)", "MacIntel", 0),
    ).toBe(false);
  });

  it("does not treat Android or Windows as iOS", () => {
    expect(
      detectIOS("Mozilla/5.0 (Linux; Android 14)", "Linux armv81", 5),
    ).toBe(false);
    expect(detectIOS("Mozilla/5.0 (Windows NT 10.0)", "Win32", 0)).toBe(false);
  });
});
