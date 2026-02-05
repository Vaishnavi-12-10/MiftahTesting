import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// =============================
// 🔹 FULL LOG ATTACHER
// =============================
function attachFullLogs(page: Page) {
    const logs: string[] = [];

    // 🌐 NETWORK REQUESTS
    page.on('request', request => {
        if (request.url().includes('/users')) {
            logs.push(`
[REQUEST]
URL: ${request.url()}
METHOD: ${request.method()}
HEADERS: ${JSON.stringify(request.headers(), null, 2)}
PAYLOAD: ${request.postData() || 'N/A'}
TIME: ${new Date().toISOString()}
----------------------------------------
`);
        }
    });

    // 🌐 NETWORK RESPONSES
    page.on('response', async response => {
        if (response.url().includes('/users')) {
            let body = '';
            try {
                body = await response.text();
            } catch { }

            logs.push(`
[RESPONSE]
URL: ${response.url()}
STATUS: ${response.status()}
HEADERS: ${JSON.stringify(response.headers(), null, 2)}
BODY: ${body}
TIME: ${new Date().toISOString()}
----------------------------------------
`);
        }
    });

    // 🖥 CONSOLE LOGS
    page.on('console', msg => {
        logs.push(`
[CONSOLE ${msg.type().toUpperCase()}]
${msg.text()}
TIME: ${new Date().toISOString()}
----------------------------------------
`);
    });

    // ❌ PAGE ERRORS
    page.on('pageerror', error => {
        logs.push(`
[PAGE ERROR]
MESSAGE: ${error.message}
STACK: ${error.stack}
TIME: ${new Date().toISOString()}
----------------------------------------
`);
    });

    return logs;
}

// =============================
// 🔹 LOG WRITER (.log FILE)
// =============================
function saveLogs(testName: string, logs: string[]) {
    const logsDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const filePath = path.join(logsDir, `miftah-users-${testName}.log`);

    fs.writeFileSync(filePath, logs.join('\n'), {
        encoding: 'utf-8'
    });
}

// =============================
// 🔹 TESTS
// =============================
test.describe('User Management - Search', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://crmdev.miftah.ai/dashboard/users');
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });
    });

    test('Search by name', async ({ page }) => {

        const logs = attachFullLogs(page);

        await page.getByPlaceholder(/search/i).fill('Vaishu');
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        const results = page.locator('main').getByText('Vaishu', { exact: false });
        const emptyState = page.getByText(/no users found/i);

        await expect(results.first().or(emptyState)).toBeVisible();

        saveLogs('search-by-name', logs);
    });

    test('Search by email', async ({ page }) => {

        const logs = attachFullLogs(page);

        const firstEmail = await page
            .locator('main')
            .getByText(/@/, { exact: false })
            .first()
            .textContent();

        await page.getByPlaceholder(/search/i).fill(firstEmail!.trim());
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        await expect(page.getByText(firstEmail!.trim())).toBeVisible();

        saveLogs('search-by-email', logs);
    });

    test('Search by phone', async ({ page }) => {

        const logs = attachFullLogs(page);

        await page.getByPlaceholder(/search/i).fill('1231231233');
        await page.getByText(/loading users/i).waitFor({ state: 'hidden' });

        const result = page.locator('main').getByText('1231231233', { exact: false });
        const emptyState = page.getByText(/no users found/i);

        await expect(result.first().or(emptyState)).toBeVisible();

        saveLogs('search-by-phone', logs);
    });

});
