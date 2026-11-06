import { defineConfig, devices } from "@playwright/test";

// Local runs can point at a preinstalled Chromium with CHROMIUM_PATH.
// CI leaves it unset and uses the browser that `playwright install` fetches.
const executablePath = process.env.CHROMIUM_PATH || undefined;
const launchOptions = { executablePath };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "pixel",
      use: { ...devices["Pixel 7"], launchOptions },
    },
  ],
  // Expects `npm run build` to have run first.
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
