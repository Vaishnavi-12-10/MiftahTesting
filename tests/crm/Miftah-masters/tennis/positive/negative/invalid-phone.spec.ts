import { test, expect } from '@playwright/test';
import serviceData from '../../../../test-data/tennis/negative/invalid-phone.json';

test('Create Tennis Service - Invalid Phone (Negative)', async ({ page }) => {
    await page.goto('https://crmdev.miftah.ai/login/');
    await page.getByPlaceholder(/email address/i).fill(serviceData.email);
    await page.getByPlaceholder(/password/i).fill(serviceData.password);
    await page.locator('button[type="submit"]').click();

    await page.getByRole('button', { name: /miftah masters/i }).click();
    await page.getByRole('button', { name: 'Add Service Provider' }).click();
    await page.getByRole('button', { name: /Tennis Coach/i }).click();

    await page.getByPlaceholder(/private tuscan/i).fill(serviceData.title);
    await page.getByText(/^phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill(serviceData.phone); // invalid phone

    await page.getByRole('button', {
        name: /create service provider/i
    }).click();

    await expect(
        page.getByText(/invalid phone/i)
    ).toBeVisible();
});
