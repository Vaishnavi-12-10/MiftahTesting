import { test, expect } from '@playwright/test';

test('Verify table columns', async ({ page }) => {
    await page.goto('https://crmdev.miftah.ai/dashboard/users');

    // Wait for table to load
    await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

    // Scope only inside main content (table area)
    const table = page.locator('main');

    await expect(table.getByText(/^User$/)).toBeVisible();
    await expect(table.getByText('Contact Info', { exact: true })).toBeVisible();
    await expect(table.getByText(/^Role$/)).toBeVisible();
    await expect(table.getByText(/^Tier$/)).toBeVisible();
    await expect(table.getByText(/^Join Date$/)).toBeVisible();
    await expect(table.getByText(/^Actions$/)).toBeVisible();
});
