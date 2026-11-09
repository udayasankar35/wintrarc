import { expect, test, type Page } from "@playwright/test";

/** Width and height from a PNG's header, so icon sizes are checked for real. */
function pngSize(buffer: Buffer): { width: number; height: number } {
  const signature = buffer.subarray(0, 8).toString("hex");
  expect(signature).toBe("89504e470d0a1a0a");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

async function waitForControl(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // clientsClaim lets the first load become controlled; wait for it.
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
    {
      timeout: 15_000,
    },
  );
}

test.describe("manifest", () => {
  test("describes an installable standalone app", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.id).toBe("/");
    expect(manifest.name).toBe("Wintrarc");
    expect(manifest.short_name).toBe("Wintrarc");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("icons exist at their declared sizes, with a maskable one", async ({
    request,
  }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    const icons = manifest.icons as ManifestIcon[];

    expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    expect(icons.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(icons.some((icon) => icon.sizes === "512x512")).toBe(true);

    for (const icon of icons) {
      const response = await request.get(icon.src);
      expect(response.status(), icon.src).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
      const { width, height } = pngSize(await response.body());
      expect(`${width}x${height}`, icon.src).toBe(icon.sizes);
    }
  });

  test("shortcuts open real pages", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    const shortcuts = manifest.shortcuts as { name: string; url: string }[];
    expect(shortcuts.length).toBeGreaterThanOrEqual(3);
    for (const shortcut of shortcuts) {
      const response = await request.get(shortcut.url);
      expect(response.status(), shortcut.url).toBe(200);
    }
  });

  test("the page links the manifest and the Apple icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"]').first()).toHaveCount(1);
  });
});

test.describe("installability", () => {
  test("Chrome reports no installability errors", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP is Chromium only");
    await page.goto("/");
    await waitForControl(page);

    const client = await page.context().newCDPSession(page);
    const { installabilityErrors } = await client.send(
      "Page.getInstallabilityErrors",
    );
    // Playwright runs each test in a fresh, incognito-like profile, and Chrome
    // never offers installs there. That one reason is the test's own doing.
    const real = installabilityErrors.filter(
      (error) => error.errorId !== "in-incognito",
    );
    expect(real).toEqual([]);
  });
});

test.describe("service worker", () => {
  test("is served as JavaScript, never cached, and allowed to control the whole app", async ({
    request,
  }) => {
    const response = await request.get("/serwist/sw.js");
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["content-type"]).toContain("javascript");
    expect(headers["cache-control"]).toContain("no-store");
    expect(headers["service-worker-allowed"]).toBe("/");
    const source = await response.text();
    expect(source).toContain('addEventListener("push"');
    expect(source).toContain('addEventListener("notificationclick"');
  });

  test("the old Stage 0 worker address is gone", async ({ request }) => {
    expect((await request.get("/sw.js")).status()).toBe(404);
  });

  test("other files under the worker route are not found", async ({
    request,
  }) => {
    expect((await request.get("/serwist/other.js")).status()).toBe(404);
  });

  test("registers, takes control, and precaches the offline page", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForControl(page);

    const registration = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration("/");
      return {
        scope: reg?.scope,
        script: reg?.active?.scriptURL,
        state: reg?.active?.state,
      };
    });
    expect(registration.scope).toMatch(/\/$/);
    expect(registration.script).toContain("/serwist/sw.js");
    expect(registration.state).toBe("activated");

    const precached = await page.evaluate(async () => {
      const urls: string[] = [];
      for (const name of await caches.keys()) {
        if (!name.includes("precache")) continue;
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          urls.push(new URL(request.url).pathname);
        }
      }
      return urls;
    });
    expect(precached).toContain("/offline");
    expect(precached.some((url) => url.endsWith(".woff2"))).toBe(true);
    expect(precached).toContain("/icon-192.png");
  });

  test("never stores pages or API responses", async ({ page }) => {
    await page.goto("/");
    await waitForControl(page);
    for (const path of ["/habits", "/settings", "/api/health"]) {
      await page.goto(path);
    }
    // Let the status card's /api/health request finish.
    await page.waitForLoadState("networkidle");

    const stored = await page.evaluate(async () => {
      const urls: string[] = [];
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          urls.push(new URL(request.url).pathname);
        }
      }
      return urls;
    });
    for (const personal of ["/habits", "/settings", "/api/health", "/tasks"]) {
      expect(stored, personal).not.toContain(personal);
    }
  });

  test("offline: a page request shows the offline page, and recovery works", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await waitForControl(page);

    await context.setOffline(true);
    await page.goto("/habits").catch(() => {
      // Chromium may report the navigation as failed while the worker answers.
    });
    await expect(
      page.getByRole("heading", { level: 1, name: "You are offline" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

    await context.setOffline(false);
    await page.goto("/habits");
    await expect(
      page.getByRole("heading", { level: 1, name: "Habits" }),
    ).toBeVisible();
  });

  test("offline: the offline page uses the app's own fonts and styles", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await waitForControl(page);
    await context.setOffline(true);
    await page.goto("/tasks").catch(() => {});
    await expect(
      page.getByRole("heading", { name: "You are offline" }),
    ).toBeVisible();
    const family = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(family.toLowerCase()).toContain("textfont");
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((font) => font.status === "loaded")
        .length;
    });
    expect(loaded).toBeGreaterThan(0);
    await context.setOffline(false);
  });
});
