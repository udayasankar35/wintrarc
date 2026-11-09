import { NAV_ITEMS } from "../navigation";
import type { ShortcutDef } from "./matcher";

export const OPEN_PALETTE_ID = "open-palette";
export const SHOW_SHORTCUTS_ID = "show-shortcuts";
const GO_PREFIX = "go:";

export interface DescribedShortcut extends ShortcutDef {
  label: string;
  group: "General" | "Go to";
}

/** Navigation actions only. Create and complete actions arrive with their pages. */
export const SHORTCUTS: readonly DescribedShortcut[] = [
  {
    id: OPEN_PALETTE_ID,
    keys: ["Mod", "k"],
    label: "Open the command palette",
    group: "General",
  },
  {
    id: SHOW_SHORTCUTS_ID,
    keys: ["?"],
    label: "Show keyboard shortcuts",
    group: "General",
  },
  ...NAV_ITEMS.map((item): DescribedShortcut => ({
    id: `${GO_PREFIX}${item.id}`,
    keys: ["g", item.jumpKey],
    label: item.label,
    group: "Go to",
  })),
];

/** The nav item id behind a "go to" shortcut, or null for any other shortcut. */
export function navIdFor(shortcutId: string): string | null {
  return shortcutId.startsWith(GO_PREFIX)
    ? shortcutId.slice(GO_PREFIX.length)
    : null;
}

export function shortcutForNav(navId: string): DescribedShortcut | undefined {
  return SHORTCUTS.find((s) => s.id === `${GO_PREFIX}${navId}`);
}
