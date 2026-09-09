import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync("/opt/brave-bin/brave") ? "/opt/brave-bin/brave" : undefined);

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    headless: true,
    launchOptions: { executablePath },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "next", use: { baseURL: "http://127.0.0.1:3000" } },
    { name: "preview", testIgnore: /.*\.next\.spec\.ts/, use: { baseURL: "http://127.0.0.1:8080" } },
  ],
  webServer: [
    {
      command: "npm run start -- --hostname 127.0.0.1",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "python3 -m http.server 8080 --bind 127.0.0.1 -d preview",
      url: "http://127.0.0.1:8080/home.html",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
