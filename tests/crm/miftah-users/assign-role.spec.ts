import { test, expect, Page } from '@playwright/test';
import { attachMiftahUserLogs, saveLogs } from '../../../utils/testLogger';

test('Change user role to CRM', async ({ page }) => {

    const logs = attachMiftahUserLogs(page);

    const userEmail = 'test1770033326953@mail.com'; // MUST exist
    const newRole = 'CRM';

    await page.goto('https://crmdev.miftah.ai/dashboard/users');
    await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

    // 🔎 Search user
    await page.getByPlaceholder(/search/i).fill(userEmail);
    await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

    // 🚨 Fail early if no user
    const noUsersText = page.getByText(/no users found/i);
    if (await noUsersText.isVisible().catch(() => false)) {
        throw new Error(`User with email ${userEmail} not found`);
    }

    // ✅ Locate row safely (DIV structure, not role=row)
    const userRow = page.locator('main')
        .locator('div')
        .filter({ hasText: userEmail })
        .first();

    await expect(userRow).toBeVisible();

    // 👉 Click Change Role (gear/service icon)
    const changeRoleBtn = userRow.getByRole('button', { name: /change role/i });
    await changeRoleBtn.click();

    // 🎯 Locate Assign Role modal container properly
    const roleModal = page.locator('div')
        .filter({ has: page.getByRole('heading', { name: /assign role/i }) })
        .first();

    await expect(roleModal).toBeVisible();

    // ✅ Target ONLY main CRM (not Realty CRM, Dining CRM etc.)
    const crmButton = roleModal.getByRole('button', {
        name: /^CRM\s/i
    });

    await expect(crmButton).toBeVisible();

    // 🚀 Wait for PUT API + click
    await Promise.all([
        page.waitForResponse(resp =>
            resp.url().includes('/users') &&
            resp.request().method() === 'PUT'
        ),
        crmButton.click()
    ]);

    // ⏳ Wait table reload
    await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

    // 🔁 Re-fetch updated row after reload
    const updatedRow = page.locator('main')
        .locator('div')
        .filter({ hasText: userEmail })
        .first();

    await expect(updatedRow).toBeVisible();

    // ✅ Validate role changed to CRM
    await expect(updatedRow.getByText(new RegExp(newRole, 'i'))).toBeVisible();

    // 💾 Save logs
    saveLogs('change-role-crm', logs);
});
