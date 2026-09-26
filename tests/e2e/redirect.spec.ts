import { test, expect } from "@playwright/test";

test("/ reindirizza a /it/", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/it\/$/);
});
