import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photoPath = path.join(__dirname, "fixtures/photo.png");
const logoPath = path.join(__dirname, "fixtures/logo.png");

function uniqueEmail(prefix: string) {
  return `${prefix}+${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("save a preset + logo in the editor, see them in the dashboard, load and delete", async ({
  page,
}) => {
  const email = uniqueEmail("e2e-dashboard");

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/dashboard");

  // dashboard starts empty
  await expect(page.getByText("No presets yet")).toBeVisible();

  await page.goto("/editor");
  await page.locator('input[type=file][accept="image/*"]').setInputFiles(photoPath);
  await expect(page.locator("canvas")).toBeVisible();

  await page.getByLabel("Text watermark").check();
  await page.locator('input[type=text]').first().fill("Dashboard e2e");
  await page.getByLabel("Logo watermark").check();
  await page.getByRole("button", { name: "Choose file" }).click();
  await page.locator('input[type=file][accept="image/png"]').setInputFiles(logoPath);
  await page.waitForTimeout(200);

  await page.getByRole("button", { name: "Save this logo to your library" }).click();
  await expect(page.getByText("Logo saved to your library")).toBeVisible();

  await page.locator('input[placeholder="Preset name"]').fill("E2E Preset");
  await page.getByRole("button", { name: "Save preset" }).click();
  await expect(page.getByText('Saved preset "E2E Preset"')).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByText("E2E Preset")).toBeVisible();
  await expect(page.getByText('text: "Dashboard e2e" + logo')).toBeVisible();

  await page.getByRole("button", { name: "Logos" }).click();
  await expect(page.getByText("logo.png")).toBeVisible();

  // loading the preset navigates to the editor and applies it once a photo is present
  await page.getByRole("button", { name: "Presets" }).click();
  await page.getByRole("button", { name: "Load" }).click();
  await page.waitForURL("/editor");
  await expect(page.getByText('Loaded preset "E2E Preset"')).toBeVisible();

  await page.locator('input[type=file][accept="image/*"]').setInputFiles(photoPath);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator('input[type=text]').first()).toHaveValue("Dashboard e2e");
  await expect(page.getByLabel("Text watermark")).toBeChecked();

  // delete the preset and confirm the dashboard returns to its empty state
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("No presets yet")).toBeVisible();
});
