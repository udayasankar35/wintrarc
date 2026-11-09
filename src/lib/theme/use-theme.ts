"use client";

import { useSyncExternalStore } from "react";
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  parseThemePreference,
  resolveTheme,
  type ThemePreference,
} from "./theme";

/*
 * The pre-paint script has already put the right attributes on <html>. This
 * module reads them back and keeps them in sync when the person changes the
 * preference or the system theme changes while "system" is selected.
 */

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  return parseThemePreference(document.documentElement.dataset.themePreference);
}

function systemPrefersLight(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  } catch {
    return false;
  }
}

function applyTheme(preference: ThemePreference) {
  const theme = resolveTheme(preference, systemPrefersLight());
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", THEME_COLORS[theme]);
  }
}

export function setThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be blocked. The choice still applies for this visit.
  }
  applyTheme(preference);
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  let query: MediaQueryList | null = null;
  const onSystemChange = () => {
    if (readPreference() === "system") {
      applyTheme("system");
      onChange();
    }
  };
  try {
    query = window.matchMedia("(prefers-color-scheme: light)");
    query.addEventListener("change", onSystemChange);
    // The device theme may have changed between the pre-paint script and now.
    if (readPreference() === "system") applyTheme("system");
  } catch {
    query = null;
  }
  return () => {
    listeners.delete(onChange);
    query?.removeEventListener("change", onSystemChange);
  };
}

/** The saved preference: "system", "light" or "dark". */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, readPreference, () => "system");
}
