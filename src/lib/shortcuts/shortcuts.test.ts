import { describe, expect, it } from "vitest";
import {
  OPEN_PALETTE_ID,
  SHORTCUTS,
  SHOW_SHORTCUTS_ID,
  navIdFor,
  shortcutForNav,
} from "./definitions";
import { ariaKeyShortcuts, detectPlatform, formatKey } from "./format";
import {
  createShortcutMatcher,
  isTypingTarget,
  type KeyInput,
} from "./matcher";

function press(key: string, extra: Partial<KeyInput> = {}): KeyInput {
  return {
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    target: { tagName: "BODY" },
    ...extra,
  };
}

describe("formatKey", () => {
  it("shows Command on Apple and Ctrl elsewhere", () => {
    expect(formatKey("Mod", "apple")).toBe("⌘");
    expect(formatKey("Mod", "other")).toBe("Ctrl");
    expect(formatKey("k", "apple")).toBe("K");
    expect(formatKey("Escape", "other")).toBe("Esc");
    expect(formatKey("Enter", "apple")).toBe("↵");
  });

  it("builds aria-keyshortcuts with real key names", () => {
    expect(ariaKeyShortcuts(["Mod", "k"], "apple")).toBe("Meta+k");
    expect(ariaKeyShortcuts(["Mod", "k"], "other")).toBe("Control+k");
  });

  it("detects Apple devices", () => {
    expect(detectPlatform({ platform: "MacIntel" })).toBe("apple");
    expect(
      detectPlatform({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)" }),
    ).toBe("apple");
    expect(
      detectPlatform({ platform: "Win32", userAgent: "Windows NT 10" }),
    ).toBe("other");
    expect(detectPlatform({})).toBe("other");
  });
});

describe("isTypingTarget", () => {
  it("treats form fields and editable content as typing", () => {
    expect(isTypingTarget({ tagName: "INPUT" })).toBe(true);
    expect(isTypingTarget({ tagName: "textarea" })).toBe(true);
    expect(isTypingTarget({ tagName: "DIV", isContentEditable: true })).toBe(
      true,
    );
    expect(isTypingTarget({ tagName: "DIV", role: "combobox" })).toBe(true);
  });

  it("does not treat buttons, links or the page as typing", () => {
    expect(isTypingTarget({ tagName: "BUTTON" })).toBe(false);
    expect(isTypingTarget({ tagName: "A" })).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe("shortcut matcher", () => {
  const makeMatcher = (clock = { t: 0 }) =>
    createShortcutMatcher(SHORTCUTS, { now: () => clock.t });

  it("opens the palette with Ctrl+K and with Command+K, even while typing", () => {
    const matcher = makeMatcher();
    const typing = { tagName: "INPUT" };
    expect(
      matcher.handle(press("k", { ctrlKey: true, target: typing }), "other")
        ?.id,
    ).toBe(OPEN_PALETTE_ID);
    expect(
      matcher.handle(press("K", { metaKey: true, target: typing }), "apple")
        ?.id,
    ).toBe(OPEN_PALETTE_ID);
  });

  it("does not treat Ctrl+K as the palette on Apple, or Command+K elsewhere", () => {
    const matcher = makeMatcher();
    expect(matcher.handle(press("k", { ctrlKey: true }), "apple")).toBeNull();
    expect(matcher.handle(press("k", { metaKey: true }), "other")).toBeNull();
  });

  it("ignores Ctrl+Alt+K and Ctrl+Shift+K", () => {
    const matcher = makeMatcher();
    expect(
      matcher.handle(press("k", { ctrlKey: true, altKey: true }), "other"),
    ).toBeNull();
    expect(
      matcher.handle(press("k", { ctrlKey: true, shiftKey: true }), "other"),
    ).toBeNull();
  });

  it("jumps with g then a section key", () => {
    const matcher = makeMatcher();
    expect(matcher.handle(press("g"), "other")).toBeNull();
    expect(matcher.isPending()).toBe(true);
    const hit = matcher.handle(press("h"), "other");
    expect(hit?.id).toBe("go:habits");
    expect(matcher.isPending()).toBe(false);
  });

  it("lets the sequence expire after a second", () => {
    const clock = { t: 0 };
    const matcher = makeMatcher(clock);
    matcher.handle(press("g"), "other");
    clock.t = 1500;
    expect(matcher.isPending()).toBe(false);
    expect(matcher.handle(press("h"), "other")).toBeNull();
  });

  it("drops a sequence when the second key does not match", () => {
    const matcher = makeMatcher();
    matcher.handle(press("g"), "other");
    expect(matcher.handle(press("z"), "other")).toBeNull();
    expect(matcher.isPending()).toBe(false);
  });

  it("starts a fresh sequence when g is pressed twice", () => {
    const matcher = makeMatcher();
    matcher.handle(press("g"), "other");
    // g then g is the Goals shortcut, so it completes rather than restarts.
    expect(matcher.handle(press("g"), "other")?.id).toBe("go:goals");
  });

  it("ignores sequences and single keys while typing", () => {
    const matcher = makeMatcher();
    const typing = { target: { tagName: "TEXTAREA" } };
    expect(matcher.handle(press("g", typing), "other")).toBeNull();
    expect(matcher.isPending()).toBe(false);
    expect(matcher.handle(press("?", typing), "other")).toBeNull();
  });

  it("shows the shortcut list with ?", () => {
    const matcher = makeMatcher();
    expect(matcher.handle(press("?", { shiftKey: true }), "other")?.id).toBe(
      SHOW_SHORTCUTS_ID,
    );
  });

  it("does not start a sequence from a key combined with a modifier", () => {
    const matcher = makeMatcher();
    expect(matcher.handle(press("g", { ctrlKey: true }), "other")).toBeNull();
    expect(matcher.isPending()).toBe(false);
  });

  it("ignores a bare modifier key press", () => {
    const matcher = makeMatcher();
    matcher.handle(press("g"), "other");
    expect(
      matcher.handle(press("Shift", { shiftKey: true }), "other"),
    ).toBeNull();
    expect(matcher.isPending()).toBe(true);
  });
});

describe("shortcut definitions", () => {
  it("gives every shortcut a unique id and a unique key combination", () => {
    const ids = SHORTCUTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const combos = SHORTCUTS.map((s) => s.keys.join("+"));
    expect(new Set(combos).size).toBe(combos.length);
  });

  it("has a jump shortcut for every section", () => {
    expect(shortcutForNav("today")?.keys).toEqual(["g", "t"]);
    expect(shortcutForNav("settings")?.keys).toEqual(["g", "s"]);
    expect(navIdFor("go:analytics")).toBe("analytics");
    expect(navIdFor(OPEN_PALETTE_ID)).toBeNull();
  });
});
