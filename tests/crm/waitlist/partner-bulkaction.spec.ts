import { test, expect } from '@playwright/test';

test('Bulk selection with random rows', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  const rows = page.locator('tbody tr');
  const headerCheckbox = page.locator('thead button').first();
  const selectionBanner = page.getByText(/selected/i);
  const loadingText = page.getByText(/loading waitlist partners/i);

  // ✅ Wait for loading to disappear
  await expect(loadingText).not.toBeVisible();

  // ✅ Wait until at least one row is visible
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  // 1️⃣ Select all
  await headerCheckbox.click();
  await expect(selectionBanner).toBeVisible();

  // 2️⃣ Unselect all
  await headerCheckbox.click();
  await expect(selectionBanner).not.toBeVisible();

  // 3️⃣ Random selection
  const randomIndexes = new Set<number>();

  while (randomIndexes.size < Math.min(2, rowCount)) {
    randomIndexes.add(Math.floor(Math.random() * rowCount));
  }

  for (const index of randomIndexes) {
    await rows.nth(index).locator('td:first-child button').click();
  }

  await expect(selectionBanner).toContainText(`${randomIndexes.size}`);
});
