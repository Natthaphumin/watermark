import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Specs share the real backend DB (unique emails per test give some isolation,
  // but running spec files concurrently is unnecessary risk for this suite's size).
  fullyParallel: false,
  workers: 1,
  globalSetup: "./e2e/global-setup.ts",
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /pwa\.spec\.ts/,
    },
    {
      name: "pwa",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:4173" },
      testMatch: /pwa\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --port 5173 --strictPort",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: "npm run build && npm run preview -- --port 4173 --strictPort",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
