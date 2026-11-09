/*
 * Theme preference logic. Pure and shared by the inline pre-paint script, the
 * client hook and the tests. Nothing here touches the DOM.
 */

export const THEME_STORAGE_KEY = "wintrarc-theme";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "light" | "dark";

/** Browser chrome colour for each theme. Matches --bg in globals.css. */
export const THEME_COLORS: Readonly<Record<ResolvedTheme, string>> = {
  dark: "#09090D",
  light: "#F7F5F0",
};

/** Anything unrecognised, including a missing value, means follow the system. */
export function parseThemePreference(value: unknown): ThemePreference {
  return THEME_PREFERENCES.find((p) => p === value) ?? "system";
}

/**
 * Dark is the default. `systemPrefersLight` is true only when the device
 * explicitly asks for light, so an unknown or unsupported system stays dark.
 */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersLight: boolean,
): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemPrefersLight ? "light" : "dark";
}
