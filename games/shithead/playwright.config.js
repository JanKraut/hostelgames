import { defineConfig, devices } from "@playwright/test";
import site from "./src/_data/site.js";

const PORT = 8080;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}${site.pathPrefix}`,
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // The engine tests need no browser, so they run only once.
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: /engine\.spec/ },
  ],
  // Tests run against the built site (npm run build), served under its path prefix
  // like GitHub Pages (server from @hostelgames/core).
  webServer: {
    command: `hostelgames-serve _site ${site.pathPrefix}`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}${site.pathPrefix}`,
    reuseExistingServer: !process.env.CI,
  },
});
