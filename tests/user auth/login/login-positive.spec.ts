import { test, expect } from '@playwright/test';

test('Valid login', async ({ page }) => {
  await page.goto('https://dev.miftah.ai/login');
  await page.fill('input[type="email"]', 'vaishnavithota1210@gmail.com');
  await page.fill('input[type="password"]', 'Vaishu@12');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/dashboard/);
});


test('Password eye icon toggles visibility', async ({ page }) => {
  await page.goto('https://dev.miftah.ai/login');

  // ✅ Stable locator for password input (NOT by type)
  const passwordInput = page.locator('input[placeholder="Password"]');

  const passwordField = page.locator('input[placeholder="Password"]').locator('..');
  const eyeIcon = passwordField.locator('button');

  await page.fill('input[type="email"]', 'vaishnavithota1210@gmail.com');
  await passwordInput.fill('Vaishu@12');

  // Step 1: Password hidden
  await expect(passwordInput).toHaveAttribute('type', 'password');

  // Step 2: Click eye → visible
  await eyeIcon.first().click();
  await expect(passwordInput).toHaveAttribute('type', 'text');

  // Step 3: Click eye again → hidden
  await eyeIcon.first().click();
  await expect(passwordInput).toHaveAttribute('type', 'password');
});
