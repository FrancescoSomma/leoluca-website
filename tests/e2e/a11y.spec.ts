import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("/it/ non ha violazioni WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/it/");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});
