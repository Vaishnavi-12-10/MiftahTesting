import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Change Role Scenarios', () => {

    test('Change user role to CRM', async ({ page }) => {

        const logs = attachMiftahUserLogs(page);

        const userEmail = 'test1770033326953@mail.com'; // must exist
        const newRole = 'CRM';

        // ===== Navigate =====
        await page.goto('https://crmdev.miftah.ai/dashboard/users');
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        // ===== Search User =====
        await page.getByPlaceholder(/search/i).fill(userEmail);
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        // ===== Fail early if no user =====
        const noUsersText = page.getByText(/no users found/i);
        if (await noUsersText.isVisible().catch(() => false)) {
            throw new Error(`User with email ${userEmail} not found`);
        }

        // ===== Locate User Row (DIV structure safe) =====
        const userRow = page.locator('main')
            .locator('div')
            .filter({ hasText: userEmail })
            .first();

        await expect(userRow).toBeVisible();

        // ===== Click Change Role Button =====
        const changeRoleBtn = userRow.getByRole('button', { name: /change role/i });
        await changeRoleBtn.click();

        // ===== Wait Assign Role Modal =====
        const roleModal = page.locator('div')
            .filter({ has: page.getByRole('heading', { name: /assign role/i }) })
            .first();

        await expect(roleModal).toBeVisible();

        // ===== Select ONLY Main CRM Role =====
        const crmButton = roleModal.getByRole('button', {
            name: /^CRM\s/i
        });

        await expect(crmButton).toBeVisible();

        // ===== Wait for PUT API =====
        await Promise.all([
            page.waitForResponse(resp =>
                resp.url().includes('/users') &&
                resp.request().method() === 'PUT'
            ),
            crmButton.click()
        ]);

        // ===== Wait Table Reload =====
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        // ===== Re-fetch Updated Row =====
        const updatedRow = page.locator('main')
            .locator('div')
            .filter({ hasText: userEmail })
            .first();

        await expect(updatedRow.getByText(new RegExp(newRole, 'i'))).toBeVisible();

        // ===== Save Logs =====
        saveLogs('change-role-crm', logs);

    });

});


// ================= LOG ATTACHER =================

function attachMiftahUserLogs(page: Page) {
    const logs: any[] = [];

    page.on('request', request => {
        if (request.url().includes('/api/')) {
            logs.push({
                type: 'REQUEST',
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                payload: request.postData(),
                time: new Date().toISOString()
            });
        }
    });

    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            let body = '';
            try { body = await response.text(); } catch { }

            logs.push({
                type: 'RESPONSE',
                url: response.url(),
                status: response.status(),
                headers: response.headers(),
                body,
                time: new Date().toISOString()
            });
        }
    });

    return logs;
}


// ================= LOG WRITER =================

function saveLogs(testName: string, logs: any[]) {

    const logsDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const logFilePath = path.join(logsDir, `miftah-users-${testName}.log`);

    const formattedLogs = logs.map(log => `
==================================================
TIME: ${log.time}
TYPE: ${log.type}
URL: ${log.url}
METHOD/STATUS: ${log.method || log.status}

HEADERS:
${JSON.stringify(log.headers, null, 2)}

PAYLOAD:
${log.payload || 'N/A'}

RESPONSE BODY:
${log.body || 'N/A'}
==================================================
`).join('\n');

    fs.writeFileSync(logFilePath, formattedLogs);
}
