import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    // Integration test files share one Postgres DB and each resets it in
    // beforeEach — running files in parallel races resetDb() across files.
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
    },
    testTimeout: 15000,
    hookTimeout: 20000,
  },
});
