import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
    // e2e/ holds Playwright specs (also *.spec.ts) — Vitest's default glob
    // would otherwise try to collect and run them as unit tests.
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
