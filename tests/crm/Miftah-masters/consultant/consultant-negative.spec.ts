import { test, expect, Page } from '@playwright/test';
import path from 'path';
import missingTitle from '../../../test-data/consultant/negative/missing-title.json';
import invalidPhone from '../../../test-data/consultant/negative/invalid-phone.json';
import negativeExperience from '../../../test-data/consultant/negative/negative-experience.json';
import missingImage from '../../../test-data/consultant/negative/missing-image.json';
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
    imagePath?: string;
}

async function createConsultantNegative(page: Page, serviceData: ConsultantData) {

    // LOGIN
    await page.goto('https://crmdev.miftah.ai/login/');
    await page.getByPlaceholder(/email address/i).fill(serviceData.email);
    await page.getByPlaceholder(/password/i).fill(serviceData.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // NAVIGATION
    await page.getByRole('button', { name: /miftah masters/i }).click();
    await page.getByRole('button', { name: 'Add Service Provider' }).click();

    const categoryModal = page
        .getByRole('heading', { name: /choose a category/i })
        .locator('xpath=ancestor::div[contains(@class,"fixed")]');

    await expect(categoryModal).toBeVisible();
    await categoryModal.getByRole('button', { name: /consultant/i }).click();

    await expect(page.getByPlaceholder(/private tuscan/i)).toBeVisible();

    // ===== FILL FORM SAFELY =====

    if (serviceData.title !== undefined)
        await page.getByPlaceholder(/private tuscan/i).fill(serviceData.title);

    if (serviceData.phone !== undefined)
        await page.getByText(/^phone number/i)
            .locator('xpath=ancestor::div[1]')
            .getByRole('textbox')
            .fill(serviceData.phone);

    if (serviceData.yearsOfExperience !== undefined)
        await page.getByText(/^years of experience/i)
            .locator('xpath=ancestor::div[1]')
            .getByRole('spinbutton')
            .fill(serviceData.yearsOfExperience);

    if (serviceData.description !== undefined)
        await page.getByPlaceholder(/briefly describe/i)
            .fill(serviceData.description);

    if (serviceData.basePrice !== undefined)
        await page.getByText(/^base price/i)
            .locator('xpath=ancestor::div[1]')
            .getByRole('spinbutton')
            .fill(serviceData.basePrice);

    if (serviceData.leadTime !== undefined)
        await page.getByText(/^lead time/i)
            .locator('xpath=ancestor::div[1]')
            .getByRole('spinbutton')
            .fill(serviceData.leadTime);

    if (serviceData.imagePath) {
        const primaryImagePath = path.resolve(serviceData.imagePath);
        await page
            .getByText(/primary image/i)
            .locator('xpath=ancestor::div[1]')
            .locator('input[type="file"]')
            .setInputFiles(primaryImagePath);
    }

    //await page.getByRole('button', { name: /create service provider/i }).click();
}
test.describe('Consultant Negative Scenarios', () => {

    test('Missing Title', async ({ page }, testInfo) => {



        const logs = attachCreateApiLogger(page, '/master-users');

        await page.getByRole('button', { name: /create service provider/i }).click();

        await expect(
            page.getByText('Title is required')
        ).toBeVisible();

        await saveLogs(
            `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-${testInfo.project.name}-retry${testInfo.retry}`,
            logs
        );
    });


    test('Invalid Phone', async ({ page }, testInfo) => {



        const logs = attachCreateApiLogger(page, '/master-users');

        await page.getByRole('button', { name: /create service provider/i }).click();

        await expect(
            page.getByText('Invalid phone number')
        ).toBeVisible();

        await saveLogs(
            `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-${testInfo.project.name}-retry${testInfo.retry}`,
            logs
        );
    });


    test('Negative Experience', async ({ page }, testInfo) => {



        const logs = attachCreateApiLogger(page, '/master-users');

        await page.getByRole('button', { name: /create service provider/i }).click();

        await expect(
            page.getByText('Experience must be greater than 0')
        ).toBeVisible();

        await saveLogs(
            `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-${testInfo.project.name}-retry${testInfo.retry}`,
            logs
        );
    });


    test('Missing Primary Image', async ({ page }, testInfo) => {



        const logs = attachCreateApiLogger(page, '/master-users');

        await page.getByRole('button', { name: /create service provider/i }).click();

        await expect(
            page.getByText('Primary image is required')
        ).toBeVisible();

        await saveLogs(
            `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-${testInfo.project.name}-retry${testInfo.retry}`,
            logs
        );
    });

});

