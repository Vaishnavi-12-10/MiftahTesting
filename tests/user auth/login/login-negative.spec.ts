import { test, expect } from '@playwright/test';


test('Invalid password shows error', async ({ page }) => {
  await page.goto('https://dev.miftah.ai/login');
  await page.fill('input[type="email"]', 'valid@gmail.com');
  await page.fill('input[type="password"]', 'Wrong@123');
  await page.click('button:has-text("Login")');
  await expect(page.locator('text=Invalid email or password')) .toBeVisible();
});

test('Empty fields block login submission', async ({ page }) => {
  await page.goto('https://dev.miftah.ai/login');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/login/);
});

