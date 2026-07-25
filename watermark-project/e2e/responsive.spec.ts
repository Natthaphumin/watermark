import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photoPath = path.join(__dirname, "fixtures/photo.png");
const logoPath = path.join(__dirname, "fixtures/logo.png");

const viewports = {
  mobile: { width: 375, height: 800 },
  tablet: { width: 768, height: 900 },
  desktop: { width: 1280, height: 900 },
} as const;

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page, label: string) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `${label}: scrollWidth should not exceed clientWidth`).toBeLessThanOrEqual(
    clientWidth,
  );
}

for (const colorScheme of ["dark", "light"] as const) {
  for (const [vpName, viewport] of Object.entries(viewports)) {
    test(`no horizontal overflow — ${colorScheme}/${vpName}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport, colorScheme });
      const page = await context.newPage();

      await page.goto("/");
      await expectNoHorizontalOverflow(page, "home");

      await page.goto("/login");
      await expectNoHorizontalOverflow(page, "login");

      await page.goto("/editor");
      await page.locator('input[type=file][accept="image/*"]').setInputFiles(photoPath);
      await expect(page.locator("canvas")).toBeVisible();
      await expectNoHorizontalOverflow(page, "editor-empty-watermarks");

      await page.getByLabel("Text watermark").check();
      await page.getByLabel("Logo watermark").check();
      await page.locator('input[type=file][accept="image/png"]').setInputFiles(logoPath);
      await page.waitForTimeout(200);
      await expectNoHorizontalOverflow(page, "editor-both-watermarks");

      await context.close();
    });
  }
}
