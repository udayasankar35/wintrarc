import type { ConsoleMessage, Page } from "@playwright/test";

/** Every signed-in page, with the heading its h1 must show. */
export const APP_PAGES = [
  { path: "/", heading: "Today" },
  { path: "/habits", heading: "Habits" },
  { path: "/tasks", heading: "Tasks" },
  { path: "/goals", heading: "Goals" },
  { path: "/arcs", heading: "Arcs" },
  { path: "/focus", heading: "Focus" },
  { path: "/analytics", heading: "Analytics" },
  { path: "/insights", heading: "Insights" },
  { path: "/reports", heading: "Reports" },
  { path: "/more", heading: "More" },
  { path: "/settings", heading: "Settings" },
] as const;

export const VIEWPORTS = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_KEY = "wintrarc-theme";

/** Picks the theme before any page script runs, as a returning visitor has it. */
export async function useTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // storage unavailable: the page falls back to its default
      }
    },
    [THEME_KEY, theme] as const,
  );
}

/** Collects console errors and uncaught exceptions for the rest of the test. */
export function watchProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

/** Pixels the page is wider than the window. Zero or less means no overflow. */
export function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}
