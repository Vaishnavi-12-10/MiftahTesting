import fs from 'fs';
import path from 'path';
import { Request, Response } from '@playwright/test';

export async function logCreateApi(
    response: Response,
    submittedData: any
) {
    const logs: string[] = [];
    const request: Request = response.request();

    // ===== GENERAL =====
    logs.push('=== General ===');
    logs.push(`Request URL: ${request.url()}`);
    logs.push(`Request Method: ${request.method()}`);
    logs.push(`Status Code: ${response.status()} ${response.statusText()}`);
    logs.push(`Remote Address: (Not available in Playwright)`);
    logs.push(`Referrer Policy: strict-origin-when-cross-origin`);
    logs.push('');

    // ===== PAYLOAD (FROM SUBMITTED DATA) =====
    logs.push('=== Payload ===');
    logs.push('Form Data:');

    Object.entries(submittedData).forEach(([key, value]) => {
        if (key.toLowerCase().includes('image')) {
            logs.push(`${key}    (binary)`);
        } else {
            logs.push(`${key}    ${value}`);
        }
    });

    logs.push('');

    // ===== RESPONSE =====
    logs.push('=== Response ===');

    try {
        const json = await response.json();
        logs.push(JSON.stringify(json, null, 2));
    } catch {
        logs.push('(Non-JSON response)');
    }

    logs.push('\n====================================================\n');

    return logs;
}

export function saveLogs(logs: string[], fileName: string) {
    const logDir = path.join(process.cwd(), 'test-logs');

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const filePath = path.join(logDir, `${fileName}.log`);
    fs.writeFileSync(filePath, logs.join('\n'), 'utf-8');

    console.log(`Log saved at: ${filePath}`);
}
