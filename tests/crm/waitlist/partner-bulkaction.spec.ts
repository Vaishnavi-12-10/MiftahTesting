import { test, expect } from '@playwright/test';

test('Partners - Bulk select and unselect', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  const headerCheckbox = page.locator('thead button').first();
  const rowCheckboxes = page.locator('tbody tr td:first-child button');
  const selectedBanner = page.getByText(/selected/i);

  // Ensure rows exist
  await expect(rowCheckboxes.first()).toBeVisible();

  // Select all
  await headerCheckbox.click();
  await expect(selectedBanner).toBeVisible();

  // Unselect all
  await headerCheckbox.click();
  await expect(selectedBanner).not.toBeVisible();
});
