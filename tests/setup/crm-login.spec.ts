import { test, expect } from '@playwright/test';

test('CRM login setup', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/login');

  await page.fill('input[type="email"]', 'nice2cvaishu@gmail.com');
  await page.fill('input[type="password"]', 'Vaishu@12');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/dashboard\/analytics/, { timeout: 60000 });

  // 🔐 SAVE LOGIN SESSION
  await page.context().storageState({
    path: 'storage/crm-auth.json',
  });
});
