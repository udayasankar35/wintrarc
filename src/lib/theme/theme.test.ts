import { describe, expect, it } from "vitest";
import { themeInitScript } from "./script";
import {
  THEME_COLORS,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  parseThemePreference,
  resolveTheme,
  type ThemePreference,
} from "./theme";

describe("parseThemePreference", () => {
  it("accepts the three known values", () => {
    for (const value of THEME_PREFERENCES) {
      expect(parseThemePreference(value)).toBe(value);
    }
  });

  it.each([null, undefined, "", "Dark", "blue", 3, {}])(
    "treats %j as system",
    (value) => {
      expect(parseThemePreference(value)).toBe("system");
    },
  );
});

describe("resolveTheme", () => {
  it("honours an explicit choice whatever the system says", () => {
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("light", false)).toBe("light");
  });

  it("follows the system for the system preference, dark by default", () => {
    expect(resolveTheme("system", true)).toBe("light");
    expect(resolveTheme("system", false)).toBe("dark");
  });
});

/** Runs the inline script against a minimal fake browser. */
function runScript(options: {
  stored?: string | null;
  storageThrows?: boolean;
  systemLight?: boolean;
  matchMediaThrows?: boolean;
}) {
  const attributes: Record<string, string> = {};
  const metaContent: string[] = ["", ""];
  const root = {
    setAttribute: (name: string, value: string) => {
      attributes[name] = value;
    },
    style: { colorScheme: "" },
  };
  const metas = metaContent.map((_, index) => ({
    setAttribute: (_name: string, value: string) => {
      metaContent[index] = value;
    },
  }));
  const fakeWindow = {
    matchMedia: () => {
      if (options.matchMediaThrows) throw new Error("unsupported");
      return { matches: Boolean(options.systemLight) };
    },
  };
  const fakeDocument = {
    documentElement: root,
    querySelectorAll: () => metas,
  };
  const fakeStorage = {
    getItem: (key: string) => {
      if (options.storageThrows) throw new Error("blocked");
      expect(key).toBe(THEME_STORAGE_KEY);
      return options.stored ?? null;
    },
  };
  new Function("document", "window", "localStorage", themeInitScript)(
    fakeDocument,
    fakeWindow,
    fakeStorage,
  );
  return { attributes, metaContent, colorScheme: root.style.colorScheme };
}

describe("pre-paint theme script", () => {
  it("agrees with resolveTheme for every preference and system setting", () => {
    for (const preference of THEME_PREFERENCES) {
      for (const systemLight of [true, false]) {
        const result = runScript({ stored: preference, systemLight });
        const expected = resolveTheme(
          preference as ThemePreference,
          systemLight,
        );
        expect(result.attributes["data-theme"]).toBe(expected);
        expect(result.attributes["data-theme-preference"]).toBe(preference);
        expect(result.colorScheme).toBe(expected);
        expect(result.metaContent).toEqual([
          THEME_COLORS[expected],
          THEME_COLORS[expected],
        ]);
      }
    }
  });

  it("defaults to the system preference when nothing is saved", () => {
    expect(runScript({ stored: null, systemLight: false }).attributes).toEqual({
      "data-theme": "dark",
      "data-theme-preference": "system",
    });
    expect(runScript({ stored: null, systemLight: true }).attributes).toEqual({
      "data-theme": "light",
      "data-theme-preference": "system",
    });
  });

  it("ignores a corrupted saved value", () => {
    const result = runScript({ stored: "purple", systemLight: false });
    expect(result.attributes["data-theme-preference"]).toBe("system");
    expect(result.attributes["data-theme"]).toBe("dark");
  });

  it("stays dark when storage is blocked", () => {
    const result = runScript({ storageThrows: true, systemLight: false });
    expect(result.attributes["data-theme"]).toBe("dark");
  });

  it("stays dark when matchMedia is unavailable", () => {
    const result = runScript({ stored: "system", matchMediaThrows: true });
    expect(result.attributes["data-theme"]).toBe("dark");
  });
});
