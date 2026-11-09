import { expect, test } from "@playwright/test";

const spikeEnabled = process.env.ENABLE_PUSH_SPIKE === "true";

test.describe("smoke", () => {
  test("home page renders without console errors", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: "Today" }),
    ).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("home page has no horizontal scroll at this viewport", async ({
    page,
  }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("health route runs per request and is never cached", async ({
    request,
  }) => {
    const first = await request.get("/api/health");
    expect(first.status()).toBe(200);
    expect(first.headers()["cache-control"]).toContain("no-store");
    const firstBody = await first.json();
    expect(firstBody.status).toBe("ok");
    expect(["ok", "not_configured"]).toContain(firstBody.database);

    await new Promise((resolve) => setTimeout(resolve, 25));

    // A prerendered route would return the same frozen timestamp twice.
    const second = await (await request.get("/api/health")).json();
    expect(second.checkedAt).not.toBe(firstBody.checkedAt);
  });

  test("security headers are present", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test.describe("push spike is off by default", () => {
    test.skip(spikeEnabled, "ENABLE_PUSH_SPIKE is set in this environment");

    test("test route behaves as if it does not exist", async ({ request }) => {
      const response = await request.post("/api/dev/push-test", {
        data: {},
      });
      expect(response.status()).toBe(404);
    });

    test("test page shows not found instead of the tool", async ({ page }) => {
      await page.goto("/dev/push-spike");
      await expect(
        page.getByRole("heading", { name: "Push spike" }),
      ).toHaveCount(0);
      await expect(
        page.getByText("This page could not be found."),
      ).toBeVisible();
    });
  });
});
