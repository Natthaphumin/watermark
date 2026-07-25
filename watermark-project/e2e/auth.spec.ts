import { expect, test } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}+${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("register, session persists across reload, logout, protected route redirects", async ({
  page,
}) => {
  const email = uniqueEmail("e2e-auth");

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/dashboard");

  await expect(page.locator("header")).toContainText(email);

  await page.reload();
  await expect(page.locator("header")).toContainText(email);

  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL("/");

  await page.goto("/dashboard");
  await page.waitForURL("/login");
});
