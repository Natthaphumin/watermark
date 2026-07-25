import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photoPath = path.join(__dirname, "fixtures/photo.png");

test("manifest is valid, service worker activates, and the editor works offline", async ({
  page,
  context,
  baseURL,
}) => {
  await page.goto("/editor");

  const manifestHref = await page.locator("link[rel=manifest]").getAttribute("href");
  expect(manifestHref).toBeTruthy();
  const manifestRes = await page.request.get(`${baseURL}${manifestHref}`);
  const manifest = await manifestRes.json();
  expect(manifest.name).toBe("Watermark");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.length).toBeGreaterThan(0);

  await page.waitForFunction(
    () => navigator.serviceWorker.getRegistration().then((r) => !!r?.active),
    { timeout: 15000 },
  );
  await page.waitForTimeout(1000); // let precaching settle

  await context.setOffline(true);
  try {
    await page.goto("/editor", { waitUntil: "load" });
    await page.locator('input[type=file][accept="image/*"]').setInputFiles(photoPath);
    await expect(page.locator("canvas")).toBeVisible();
    await page.getByLabel("Text watermark").check();
    await page.locator('input[type=text]').first().fill("Offline e2e");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("watermarked.png");
  } finally {
    await context.setOffline(false);
  }
});
