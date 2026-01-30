import { test, expect } from '@playwright/test';

test('Waitlist has Users and Partners tabs', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

 await expect(
  page.getByRole('button', { name: 'Users',exact: true })
).toBeVisible();

await expect(
  page.getByRole('button', { name: 'Partners',exact: true })
).toBeVisible();
});

test('Switch between Users and Partners tabs', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  const usersTab = page.getByRole('button', { name: 'Users', exact: true });
  const partnersTab = page.getByRole('button', { name: 'Partners', exact: true });

  await usersTab.click();
  await expect(usersTab).toHaveClass(/bg-custom-accent|text-white|shadow-sm/);

  await partnersTab.click();
  await expect(partnersTab).toHaveClass(/bg-custom-accent|text-white|shadow-sm/);
});
