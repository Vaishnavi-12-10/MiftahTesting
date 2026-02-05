import { test } from '@playwright/test';
import fs from 'fs';

test('Capture Miftah Users API logs', async ({ page }) => {

    const logs: any[] = [];

    // Capture ALL requests
    page.on('request', request => {
        logs.push({
            type: 'request',
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            payload: request.postData(),
            time: new Date().toISOString()
        });
    });

    // Capture ALL responses
    page.on('response', async response => {
        let body = '';
        try {
            body = await response.text();
        } catch { }

        logs.push({
            type: 'response',
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            body,
            time: new Date().toISOString()
        });
    });

    // Open page
    await page.goto('https://crmdev.miftah.ai/dashboard/users');

    // Wait until all network calls finish
    await page.waitForLoadState('networkidle');

    // Small delay to ensure API calls complete
    await page.waitForTimeout(3000);

    // Save logs AFTER everything finishes
    fs.writeFileSync(
        `logs/miftah-users-${Date.now()}.json`,
        JSON.stringify(logs, null, 2)
    );
});
