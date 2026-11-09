import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { APP_PAGES, THEMES, useTheme } from "./helpers";

const WIDTHS = [375, 1280] as const;

async function violations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
}

for (const width of WIDTHS) {
  for (const theme of THEMES) {
    test.describe(`accessibility at ${width}px in ${theme}`, () => {
      test.use({ viewport: { width, height: 900 } });

      for (const { path } of APP_PAGES) {
        test(`${path} has no axe violations`, async ({ page }) => {
          await useTheme(page, theme);
          await page.goto(path);
          // Wait for client content (the status card, the dates) to settle.
          await page.waitForLoadState("networkidle");
          expect(await violations(page)).toEqual([]);
        });
      }

      test("/offline has no axe violations", async ({ page }) => {
        await useTheme(page, theme);
        await page.goto("/offline");
        expect(await violations(page)).toEqual([]);
      });

      test("/dev/design has no axe violations", async ({ page }) => {
        await useTheme(page, theme);
        await page.goto("/dev/design");
        await page.waitForLoadState("networkidle");
        expect(await violations(page)).toEqual([]);
      });
    });
  }
}

test.describe("accessibility of open overlays", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const theme of THEMES) {
    test(`command palette in ${theme}`, async ({ page }) => {
      await useTheme(page, theme);
      await page.goto("/");
      await page.keyboard.press("Control+k");
      await expect(
        page.getByRole("dialog", { name: "Jump to a section" }),
      ).toBeVisible();
      expect(await violations(page)).toEqual([]);
    });

    test(`shortcut help in ${theme}`, async ({ page }) => {
      await useTheme(page, theme);
      await page.goto("/");
      await page.keyboard.press("?");
      await expect(
        page.getByRole("dialog", { name: "Keyboard shortcuts" }),
      ).toBeVisible();
      expect(await violations(page)).toEqual([]);
    });
  }

  test("tablet navigation drawer", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.getByRole("button", { name: "Show section names" }).click();
    await expect(page.getByRole("dialog", { name: "Sections" })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
});
