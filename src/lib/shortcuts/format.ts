/*
 * Turns abstract keys into what a person sees on their keyboard.
 * "Mod" is Command on Apple devices and Control everywhere else.
 */

export type Platform = "apple" | "other";

const APPLE_LABELS: Record<string, string> = {
  Mod: "⌘",
  Shift: "⇧",
  Alt: "⌥",
  Enter: "↵",
};

const OTHER_LABELS: Record<string, string> = {
  Mod: "Ctrl",
  Shift: "Shift",
  Alt: "Alt",
  Enter: "Enter",
};

export function formatKey(key: string, platform: Platform): string {
  const labels = platform === "apple" ? APPLE_LABELS : OTHER_LABELS;
  const known = labels[key];
  if (known) return known;
  if (key === "Escape") return "Esc";
  return key.length === 1 ? key.toUpperCase() : key;
}

/** Text for the aria-keyshortcuts attribute, for example "Control+K". */
export function ariaKeyShortcuts(
  keys: readonly string[],
  platform: Platform,
): string {
  const names: Record<string, string> = {
    Mod: platform === "apple" ? "Meta" : "Control",
  };
  return keys.map((key) => names[key] ?? key).join("+");
}

/** Reads a browser's platform string. Used only on the client. */
export function detectPlatform(navigatorLike: {
  platform?: string;
  userAgent?: string;
}): Platform {
  const source = `${navigatorLike.platform ?? ""} ${navigatorLike.userAgent ?? ""}`;
  return /Mac|iPhone|iPad|iPod/i.test(source) ? "apple" : "other";
}
