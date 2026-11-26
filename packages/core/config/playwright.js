// Playwright config of every game. A game's playwright.config.js is one line:
//
//   export { default } from "@hostelgames/core/config/playwright";
//
// Tests run against the built site (npm run build) in Desktop Chrome and on a phone (Pixel 7),
// served under its path prefix like GitHub Pages (hostelgames-serve).
import { defineConfig, devices } from "@playwright/test";
import { site } from "../lib/game.js";

// Important, because a server already running on the port is reused (outside CI).
const PORT = Number(process.env.PORT ?? 8080);

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI runners are small and only run tests: use every core (default is half).
  workers: process.env.CI ? "100%" : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}${site.pathPrefix}`,
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `hostelgames-serve _site ${site.pathPrefix}`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}${site.pathPrefix}`,
    reuseExistingServer: !process.env.CI,
  },
});
