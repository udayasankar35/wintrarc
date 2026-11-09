/*
 * Every place in the app, in one list. The sidebar, rail, tab bar, command
 * palette, shortcut help and the tests all read from here, so a section can
 * never appear in one and be missing from another. Icons live with the shell
 * components so this file stays free of React.
 */

export type NavId =
  | "today"
  | "habits"
  | "tasks"
  | "goals"
  | "arcs"
  | "focus"
  | "analytics"
  | "insights"
  | "reports"
  | "settings";

export interface NavItem {
  id: NavId;
  href: string;
  label: string;
  /** One calm sentence about what lives here. Used by palette and empty states. */
  description: string;
  /** Second key of the "g then key" jump shortcut. */
  jumpKey: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: "today",
    href: "/",
    label: "Today",
    description: "What you planned for today, in one place.",
    jumpKey: "t",
  },
  {
    id: "habits",
    href: "/habits",
    label: "Habits",
    description: "The small things you repeat.",
    jumpKey: "h",
  },
  {
    id: "tasks",
    href: "/tasks",
    label: "Tasks",
    description: "One-off things to finish.",
    jumpKey: "a",
  },
  {
    id: "goals",
    href: "/goals",
    label: "Goals",
    description: "What you are working towards.",
    jumpKey: "g",
  },
  {
    id: "arcs",
    href: "/arcs",
    label: "Arcs",
    description: "Seasons of 30, 60 or 90 days with a theme.",
    jumpKey: "r",
  },
  {
    id: "focus",
    href: "/focus",
    label: "Focus",
    description: "Timed sessions for deep work.",
    jumpKey: "f",
  },
  {
    id: "analytics",
    href: "/analytics",
    label: "Analytics",
    description: "Your numbers, with the context to read them.",
    jumpKey: "n",
  },
  {
    id: "insights",
    href: "/insights",
    label: "Insights",
    description: "Patterns worth a closer look.",
    jumpKey: "i",
  },
  {
    id: "reports",
    href: "/reports",
    label: "Reports",
    description: "Export your progress as PDF, CSV or Excel.",
    jumpKey: "p",
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    description: "Appearance, install and keyboard shortcuts.",
    jumpKey: "s",
  },
];

/** The four sections that get a slot in the mobile tab bar. "More" is the fifth. */
export const TAB_BAR_IDS: readonly NavId[] = [
  "today",
  "habits",
  "tasks",
  "focus",
];

/** The "More" page lists everything that has no tab of its own. */
export const MORE_ITEMS: readonly NavItem[] = NAV_ITEMS.filter(
  (item) => !TAB_BAR_IDS.includes(item.id),
);

export const MORE_HREF = "/more";

/** Whether `pathname` belongs to `item`. Today only matches the exact root. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** The "More" tab is active for any section that has no tab of its own. */
export function isMoreActive(pathname: string): boolean {
  if (pathname === MORE_HREF) return true;
  return MORE_ITEMS.some((item) => isActive(item, pathname));
}

/** Paths for the PWA shortcut entries. They open the page for that job. */
export const QUICK_ACTION_PATHS = {
  addHabit: "/habits?new=1",
  addTask: "/tasks?new=1",
  startFocus: "/focus?start=1",
} as const;
