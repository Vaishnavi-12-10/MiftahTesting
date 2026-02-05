import { test, expect, Page } from '@playwright/test';
import path from 'path';
import validFull from '../../../test-data/consultant/positive/valid-full.json';
import validMinimal from '../../../test-data/consultant/positive/valid-minimal.json';
import { attachCreateApiLogger, saveLogs } from '../../../../utils/testLogger';

interface ConsultantData {
    email: string;
    password: string;
    title: string;
    phone: string;
    yearsOfExperience: string;
    description: string;
    basePrice: string;
    leadTime: string;
    cities?: string;
    cancellationPolicy?: string;
    terms?: string;
    imagePath: string;
}

async function createConsultant(page: Page, serviceData: ConsultantData) {

    // LOGIN
    await page.goto('https://crmdev.miftah.ai/login/');
    await page.getByPlaceholder(/email address/i).fill(serviceData.email);
    await page.getByPlaceholder(/password/i).fill(serviceData.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // NAVIGATION
    await page.getByRole('button', { name: /miftah masters/i }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Service Provider' }).click();

    const categoryModal = page
        .getByRole('heading', { name: /choose a category/i })
        .locator('xpath=ancestor::div[contains(@class,"fixed")]');

    await expect(categoryModal).toBeVisible();
    await categoryModal.getByRole('button', { name: /consultant/i }).click();

    await expect(page.getByPlaceholder(/private tuscan/i)).toBeVisible();

    // ===== FILL FORM =====
    await page.getByPlaceholder(/private tuscan/i).fill(serviceData.title);

    await page
        .getByText(/^phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill('112345678');

    await page.getByText(/^years of experience/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill(serviceData.yearsOfExperience);

    await page.getByPlaceholder(/briefly describe/i)
        .fill(serviceData.description);

    await page.getByText(/^base price/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill(serviceData.basePrice);

    await page
        .getByText(/^lead time/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill(serviceData.leadTime);


    if (serviceData.cities) {
        await page.getByPlaceholder(/enter cities/i)
            .fill(serviceData.cities);
    }
    await page
        .getByText(/^service radius/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill('10');


    if (serviceData.cancellationPolicy) {
        await page.getByPlaceholder(/cancellation policy/i)
            .fill(serviceData.cancellationPolicy);
    }

    if (serviceData.terms) {
        await page.getByPlaceholder(/terms and conditions/i)
            .fill(serviceData.terms);
    }

    const primaryImagePath = path.resolve(serviceData.imagePath);
    await page
        .getByText(/primary image/i)
        .locator('xpath=ancestor::div[1]')
        .locator('input[type="file"]')
        .setInputFiles(primaryImagePath);

    // Submit
    await page.getByRole('button', { name: /create service provider/i }).click();

    // Wait for listing page
    await expect(page.getByText(serviceData.title)).toBeVisible();
}
test.describe('Consultant Positive Scenarios', () => {

    test('Create Consultant - Full Valid Data', async ({ page }, testInfo) => {

        const logs = attachCreateApiLogger(page, '/master-users');


        try {
            await createConsultant(page, validFull);
        } finally {
            await page.waitForTimeout(1000); // Wait for logs to be pushed
            await saveLogs(
                `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-${testInfo.project.name}-retry${testInfo.retry}`,
                logs
            );
        }
    });


    test('Create Consultant - Minimal Valid Data', async ({ page }, testInfo) => {
        const logs = attachCreateApiLogger(page, '/master-users');

        try {
            await createConsultant(page, validMinimal);
        } finally {
            await page.waitForTimeout(1000); // Wait for logs to be pushed
            await saveLogs(
                testInfo.title.replace(/\s+/g, '-').toLowerCase(),
                logs
            );
        }
    });


});
