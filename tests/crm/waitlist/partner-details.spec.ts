import { test, expect } from '@playwright/test';

test('Partner details popup opens on row click', async ({ page }) => {
    await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

    // Open Partners tab
    await page.getByRole('button', { name: 'Partners', exact: true }).click();

    const rows = page.locator('tbody tr');

    // Wait until table loads (important)
    await expect(rows.first()).toBeVisible();

    // Click first row (not checkbox)
    await rows.first().click();

    // Validate popup appears
    await expect(
        page.getByRole('heading', { name: /partner details/i })
    ).toBeVisible();
});
