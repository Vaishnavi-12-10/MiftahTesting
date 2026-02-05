import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Revoke and Restore access for specific user', async ({ page }) => {

    const logs = attachMiftahUserLogs(page); // ✅ Attach logger

    const userEmail = 'vaishu2001@gmail.com';

    await page.goto('https://crmdev.miftah.ai/dashboard/users');
    await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

    // 🔎 Search to avoid pagination
    await page.getByPlaceholder(/search/i).fill(userEmail);
    await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

    const userRow = page.locator('main')
        .locator('div')
        .filter({ hasText: userEmail })
        .first();

    await expect(userRow).toBeVisible();

    // =====================
    // 🔴 REVOKE ACCESS
    // =====================
    const revokeToggle = userRow.getByRole('button', { name: /revoke user access/i });
    await revokeToggle.click();

    const revokeConfirm = page.getByRole('button', { name: /revoke access/i });
    await expect(revokeConfirm).toBeVisible();
    await revokeConfirm.click();

    await page.waitForLoadState('networkidle'); // wait API

    // =====================
    // 🟢 RESTORE ACCESS
    // =====================
    const updatedRow = page.locator('main')
        .locator('div')
        .filter({ hasText: userEmail })
        .first();

    const restoreToggle = updatedRow.getByRole('button', { name: /restore user access/i });
    await expect(restoreToggle).toBeVisible();
    await restoreToggle.click();

    const restoreConfirm = page.getByRole('button', { name: /restore access/i });
    await expect(restoreConfirm).toBeVisible();
    await restoreConfirm.click();

    await page.waitForLoadState('networkidle');

    // ✅ Save logs at end
    saveLogs('toggle-revoke-restore', logs);
});


// 🔹 Attach Logs Listener
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
            try {
                body = await response.text();
            } catch { }

            logs.push({
                type: 'RESPONSE',
                url: response.url(),
                status: response.status(),
                headers: response.headers(),
                body: body,
                time: new Date().toISOString()
            });
        }
    });

    return logs;
}


// 🔹 Save as .log file
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
