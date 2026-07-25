import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photoPath = path.join(__dirname, "fixtures/photo.png");
const logoPath = path.join(__dirname, "fixtures/logo.png");

test("upload, add text + logo watermark, drag both, and download", async ({ page }) => {
  await page.goto("/editor");
  await expect(page.getByText("Drag & drop a photo here")).toBeVisible();

  await page.locator('input[type=file][accept="image/*"]').setInputFiles(photoPath);
  await expect(page.locator("canvas")).toBeVisible();

  await page.getByLabel("Text watermark").check();
  await page.locator('input[type=text]').first().fill("E2E watermark");

  await page.getByLabel("Logo watermark").check();
  await page.getByRole("button", { name: "Choose file" }).click();
  await page.locator('input[type=file][accept="image/png"]').setInputFiles(logoPath);
  await page.waitForTimeout(200);

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas has no bounding box");

  // drag the text watermark from its default center position toward the top-left
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2, { steps: 8 });
  await page.mouse.up();

  // drag the logo watermark from its default bottom-right position toward the center-top
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.85);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3, { steps: 8 });
  await page.mouse.up();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download" }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("watermarked.png");
});
