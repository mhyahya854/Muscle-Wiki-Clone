import { test, expect } from "@playwright/test";

test("smoke test - homepage loads and navigates", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LiftMap/);

  // Navigate to Body Map
  await page.click("text=Open the Body Map");
  await expect(page).toHaveURL(/body-map/);
  await expect(page.locator("text=Hover or click a muscle")).toBeVisible();

  // Navigate to Explore
  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: "Explore", level: 1 })).toBeVisible();

  // Navigate to Workout Generator
  await page.goto("/workout-generator");
  await expect(page.getByRole("heading", { name: "Build your profile" })).toBeVisible();
});
