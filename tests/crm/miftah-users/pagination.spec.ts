import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Miftah Users - Pagination', () => {

    test('Pagination - Page navigation works', async ({ page }) => {

        const logs = attachMiftahUserLogs(page); // ✅ attach logger

        await page.goto('https://crmdev.miftah.ai/dashboard/users');
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        const nextBtn = page.getByRole('button', { name: /next page/i });
        await nextBtn.scrollIntoViewIfNeeded();
        await nextBtn.click();

        await page.waitForLoadState('networkidle');

        await expect(page.getByText(/showing/i)).toBeVisible();

        saveLogs('pagination-next-page', logs);
    });


    test('Pagination - Change items per page', async ({ page }) => {

        const logs = attachMiftahUserLogs(page); // ✅ attach logger

        await page.goto('https://crmdev.miftah.ai/dashboard/users');
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        const itemsDropdown = page.getByRole('combobox');
        await itemsDropdown.scrollIntoViewIfNeeded();

        await itemsDropdown.selectOption('30');

        await page.waitForLoadState('networkidle');

        await expect(page.getByText(/showing 1 to 30/i)).toBeVisible();

        saveLogs('pagination-items-per-page', logs);
    });

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


// 🔹 Save Logs as .log file
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
