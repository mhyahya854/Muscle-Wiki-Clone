import { test, expect } from "@playwright/test";

test("workout generator - full flow test", async ({ page }) => {
  await page.goto("/workout-generator");
  await expect(page.getByRole("heading", { name: /Build your profile/i })).toBeVisible();

  // Step 1: Sex
  await page.getByRole("button", { name: "male", exact: true }).click();
  await page.getByRole("button", { name: /Pick Muscles/i }).click();

  // Step 2: Muscles
  await expect(page.getByRole("heading", { name: /Target Muscles/i })).toBeVisible();
  const upperChestBtn = page.getByRole("button", { name: /Upper Chest/i });
  await expect(upperChestBtn).toBeVisible();
  await upperChestBtn.click();

  const chestBtn = page.getByRole("button", { name: /^Chest/i });
  await expect(chestBtn).toBeVisible();
  await chestBtn.click();

  await page.getByRole("button", { name: /Next: Equipment/i }).click();

  // Step 3: Equipment
  await expect(page.getByRole("heading", { name: /What handles are available/i })).toBeVisible();
  await page.getByRole("button", { name: /Dumbbells/i }).click();
  await page.getByRole("button", { name: /Barbell/i }).click();
  await page.getByRole("button", { name: /Next: Conditions/i }).click();

  // Step 4: Conditions
  await expect(page.getByRole("heading", { name: /Any health considerations/i })).toBeVisible();
  await page.getByRole("button", { name: /Next: Duration/i }).click();

  // Step 5: Duration
  await expect(page.getByRole("heading", { name: /How much time do you have/i })).toBeVisible();
  await page.getByRole("button", { name: "35" }).click();
  await page.getByRole("button", { name: /Generate My Session/i }).click();

  // Results
  await expect(page.getByRole("heading", { name: /Workout/i, level: 2 })).toBeVisible();
  await expect(page.getByText(/working sets/i)).toBeVisible();

  // Verify exercise cards appear
  const cards = page.locator("a[href*='/exercise/']");
  await expect(cards.first()).toBeVisible();
});
