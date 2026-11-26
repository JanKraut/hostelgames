import { defineConfig, devices } from "@playwright/test";
import site from "./src/_data/site.js";

// Important, because a server already running on the port is reused (outside CI).
const PORT = Number(process.env.PORT ?? 8080);

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
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
  // Tests run against the built site (npm run build), served under its path prefix
  // like GitHub Pages (server from @hostelgames/core).
  webServer: {
    command: `hostelgames-serve _site ${site.pathPrefix}`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}${site.pathPrefix}`,
    reuseExistingServer: !process.env.CI,
  },
});
