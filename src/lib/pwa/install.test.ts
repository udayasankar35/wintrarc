import { describe, expect, it } from "vitest";
import {
  describeInstall,
  getInstallKind,
  type InstallEnvironment,
  type InstallKind,
} from "./install";

const base: InstallEnvironment = {
  isStandalone: false,
  hasPrompt: false,
  isIOS: false,
  serviceWorkerSupported: true,
};

describe("getInstallKind", () => {
  it("says installed when running standalone, whatever else is true", () => {
    expect(
      getInstallKind({
        ...base,
        isStandalone: true,
        hasPrompt: true,
        isIOS: true,
      }),
    ).toBe("installed");
  });

  it("offers the install button when the browser gave us a prompt", () => {
    expect(getInstallKind({ ...base, hasPrompt: true })).toBe("can_prompt");
  });

  it("gives iPhone and iPad manual steps", () => {
    expect(getInstallKind({ ...base, isIOS: true })).toBe("ios_manual");
  });

  it("points other browsers at their own menu", () => {
    expect(getInstallKind(base)).toBe("browser_menu");
  });

  it("is honest when the browser cannot install at all", () => {
    expect(getInstallKind({ ...base, serviceWorkerSupported: false })).toBe(
      "unsupported",
    );
  });

  it("still guides an iPhone whose service worker support is not reported", () => {
    expect(
      getInstallKind({ ...base, isIOS: true, serviceWorkerSupported: false }),
    ).toBe("ios_manual");
  });
});

describe("describeInstall", () => {
  const kinds: InstallKind[] = [
    "installed",
    "can_prompt",
    "ios_manual",
    "browser_menu",
    "unsupported",
  ];

  it("has a title and a sentence for every state", () => {
    for (const kind of kinds) {
      const copy = describeInstall(kind);
      expect(copy.title.length, kind).toBeGreaterThan(0);
      expect(copy.body.length, kind).toBeGreaterThan(0);
    }
  });

  it("only offers an install button where one can work", () => {
    for (const kind of kinds) {
      const hasAction = describeInstall(kind).actionLabel !== undefined;
      expect(hasAction, kind).toBe(kind === "can_prompt");
    }
  });

  it("explains the iPhone requirement and gives ordered steps", () => {
    const copy = describeInstall("ios_manual");
    expect(copy.body).toMatch(/notifications/i);
    expect(copy.steps.length).toBeGreaterThanOrEqual(3);
    expect(copy.steps[1]).toMatch(/Add to Home Screen/);
  });

  it("never blames the person", () => {
    for (const kind of kinds) {
      const copy = describeInstall(kind);
      const text = `${copy.title} ${copy.body} ${copy.steps.join(" ")}`;
      expect(text).not.toMatch(/\byou (failed|forgot|must have)\b/i);
    }
  });
});
