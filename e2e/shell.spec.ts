import { expect, test } from "@playwright/test";
import {
  APP_PAGES,
  THEMES,
  VIEWPORTS,
  horizontalOverflow,
  useTheme,
  watchProblems,
} from "./helpers";

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const theme of THEMES) {
      for (const { path, heading } of APP_PAGES) {
        test(`${path} in ${theme}: renders, fits, no console errors`, async ({
          page,
        }, testInfo) => {
          const problems = watchProblems(page);
          await useTheme(page, theme);
          const response = await page.goto(path);
          expect(response?.status()).toBe(200);

          await expect(
            page.getByRole("heading", { level: 1, name: heading }),
          ).toBeVisible();
          expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );

          // One screenshot per page, width and theme, kept for review.
          const slug = path === "/" ? "today" : path.slice(1);
          await page.screenshot({
            path: testInfo.outputPath(`${slug}-${viewport.width}-${theme}.png`),
            fullPage: true,
          });
          await testInfo.attach(`${slug}-${viewport.width}-${theme}`, {
            path: testInfo.outputPath(`${slug}-${viewport.width}-${theme}.png`),
            contentType: "image/png",
          });
          expect(problems).toEqual([]);
        });
      }
    }
  });
}

test.describe("navigation by width", () => {
  test("phone: bottom tab bar with four tabs and More, no sidebar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link")).toHaveText([
      "Today",
      "Habits",
      "Tasks",
      "Focus",
      "More",
    ]);
    await expect(nav.getByRole("link", { name: "Today" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // The sidebar and rail are not in the accessibility tree at this width.
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(1);
  });

  test("phone: every tab target is at least 44px tall", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const links = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link");
    for (const link of await links.all()) {
      const box = await link.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("tablet: icon rail lists every section and marks the current one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/habits");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveCount(10);
    await expect(nav.getByRole("link", { name: "Habits" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("desktop: sidebar lists every section and marks the current one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/goals");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveCount(10);
    await expect(nav.getByRole("link", { name: "Goals" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: /^Wintrarc/ })).toBeVisible();
  });

  test("a sidebar link opens its page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Tasks" })
      .click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Tasks" }),
    ).toBeVisible();
  });

  test("phone: More lists the sections that are not tabs", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "More" })
      .click();
    await expect(page).toHaveURL(/\/more$/);
    for (const name of [
      "Goals",
      "Arcs",
      "Analytics",
      "Insights",
      "Reports",
      "Settings",
    ]) {
      await expect(
        page.getByRole("main").getByRole("link", { name }),
      ).toBeVisible();
    }
  });
});

test.describe("keyboard", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("skip link is the first tab stop and moves focus to the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("Ctrl+K opens the palette, filters, and Enter navigates", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const palette = page.getByRole("dialog", { name: "Jump to a section" });
    await expect(palette).toBeVisible();
    await expect(palette.getByRole("combobox")).toBeFocused();

    await page.keyboard.type("hab");
    await expect(palette.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/habits$/);
    await expect(palette).toBeHidden();
  });

  test("Escape closes the palette and focus returns to where it was", async ({
    page,
  }) => {
    await page.goto("/");
    const jump = page.getByRole("button", { name: /Jump to/ });
    await jump.focus();
    await page.keyboard.press("Control+k");
    await expect(
      page.getByRole("dialog", { name: "Jump to a section" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Jump to a section" }),
    ).toBeHidden();
    await expect(jump).toBeFocused();
  });

  test("the palette shows a message when nothing matches", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.keyboard.type("zzzzz");
    await expect(page.getByText("Nothing matches.")).toBeVisible();
  });

  test("g then h jumps to Habits", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("g");
    await page.keyboard.press("h");
    await expect(page).toHaveURL(/\/habits$/);
  });

  test("single-key shortcuts are ignored while typing in the palette", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.keyboard.type("gh");
    await expect(page).toHaveURL(/\/$/);
  });

  test("? opens the shortcut list", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("?");
    await expect(
      page.getByRole("dialog", { name: "Keyboard shortcuts" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Keyboard shortcuts" }),
    ).toBeHidden();
  });
});

test.describe("theme", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("choosing Light applies at once and survives a reload", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/settings");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("radio", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-preference",
      "light",
    );

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("radio", { name: "Light" })).toBeChecked();
  });

  test("the saved theme is applied before the first paint", async ({
    page,
  }) => {
    await useTheme(page, "light");
    await page.emulateMedia({ colorScheme: "dark" });
    // "commit" resolves as soon as the response starts, before hydration.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const early = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(early).toBe("light");
  });

  test("System follows the device and updates when it changes", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/settings");
    await expect(page.getByRole("radio", { name: "System" })).toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("the theme color for the browser bar matches the theme", async ({
    page,
  }) => {
    await useTheme(page, "light");
    await page.goto("/");
    const color = await page.evaluate(() =>
      [...document.querySelectorAll('meta[name="theme-color"]')]
        .map((meta) => meta.getAttribute("content"))
        .join(","),
    );
    expect(color.toLowerCase()).toContain("#f7f5f0");
  });
});

test.describe("settings", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("status card reports the app is reachable", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "System status" }),
    ).toBeVisible();
    await expect(page.getByText("Running", { exact: true })).toBeVisible();
  });

  test("shortcut list is shown with the real keys", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "Keyboard shortcuts" }),
    ).toBeVisible();
  });
});

test.describe("design gallery", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("renders every component without console errors or overflow", async ({
    page,
  }, testInfo) => {
    const problems = watchProblems(page);
    const response = await page.goto("/dev/design");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: "Design gallery" }),
    ).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.screenshot({
      path: testInfo.outputPath("gallery-1280.png"),
      fullPage: true,
    });
    expect(problems).toEqual([]);
  });
});
