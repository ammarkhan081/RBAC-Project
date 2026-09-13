import { test, expect } from "@playwright/test";

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("http://localhost:3000/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Sign In to Workspace/i }).click();
  await page.waitForURL("http://localhost:3000/");
}

test.describe("FinSight 2.0 RBAC & Navigation Suite", () => {
  test("Unknown email cannot log in until an account is created", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.locator('input[type="email"]').fill("unknown@enterprise.finsolve.io");
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.getByRole("button", { name: /Sign In to Workspace/i }).click();
    await expect(page.locator("body")).toContainText("No account found");
  });

  test("Finance user is blocked from viewing Admin Knowledge Ingestion", async ({ page }) => {
    await loginAs(page, "sam@enterprise.finsolve.io", "fin123");
    await page.goto("http://localhost:3000/admin");

    await expect(page.locator("h1")).toContainText("Access Restricted");
    await expect(page.locator("body")).toContainText(
      "Document ingestion and vector indexing require C-Level administrative privileges."
    );
  });

  test("C-Level login unlocks Admin view", async ({ page }) => {
    await loginAs(page, "admin@enterprise.finsolve.io", "admin123");
    await page.click("a[href='/admin']");
    await expect(page.locator("h1")).toContainText("Enterprise Knowledge Ingestion");
  });
});
