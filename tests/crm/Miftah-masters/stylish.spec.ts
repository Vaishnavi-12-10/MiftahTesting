import { test, expect } from '@playwright/test';
import path from 'path';
import serviceData from '../../test-data/stylish.json';
import { logCreateApi, saveLogs } from '../../../utils/testLogger'; // 👈 ADD THIS

test('Create Hair Stylist Service - Miftah Master Portal', async ({ page }) => {
    test.setTimeout(180000);

    // ================= LOGIN =================
    await page.goto('https://crmdev.miftah.ai/login/');

    await page.getByPlaceholder(/email address/i).fill(serviceData.email);
    await page.getByPlaceholder(/password/i).fill(serviceData.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // ================= GO TO MIFTAH MASTERS =================
    await page.getByRole('button', { name: /miftah masters/i }).click();
    await page.waitForLoadState('networkidle');

    // ================= CLICK ADD SERVICE =================
    await page.locator('main')
        .getByRole('button', { name: 'Add Service Provider', exact: true })
        .first()
        .click();

    const categoryModal = page
        .getByRole('heading', { name: /choose a category/i })
        .locator('xpath=ancestor::div[contains(@class,"fixed")]');

    await expect(categoryModal).toBeVisible();

    await categoryModal
        .getByRole('button', { name: /Hair Stylist/i })
        .click({ force: true });

    await expect(page.getByPlaceholder(/private tuscan/i)).toBeVisible();

    // ================= FILL FORM =================
    await page.getByPlaceholder(/private tuscan/i).fill(serviceData.title);

    await page.getByText(/^phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill(serviceData.phone);

    await page.getByText(/^alternate phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill(serviceData.altPhone);

    await page.getByText(/select options/i).click();
    await page.getByPlaceholder(/search languages/i).fill('English');
    await page.getByRole('button', { name: /^English$/ }).click();
    await page.keyboard.press('Escape');

    await page.getByText(/^years of experience/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill(serviceData.yearsOfExperience);

    await page.getByText(/visible to users/i).click({ force: true });

    await page.getByPlaceholder(/briefly describe/i).fill(serviceData.description);
    await page.getByPlaceholder(/provide more details/i).fill(serviceData.experienceDetails);

    await page.getByText(/^base price \*/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill(serviceData.basePrice);

    const spinButtons = page.getByRole('spinbutton');
    await spinButtons.nth(2).fill(serviceData.pricePerSession);
    await spinButtons.nth(3).fill(serviceData.pricePerHour);
    await spinButtons.nth(4).fill(serviceData.bespokePrice);
    await spinButtons.nth(1).fill(serviceData.leadTime);

    await page.getByPlaceholder(/enter specialties/i)
        .fill(serviceData.stylespecialties);

    await page.getByText(/wardrobe audit included/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('radio', { name: serviceData.wardrobeaudit })
        .check();

    await page.getByText(/shopping assistance/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('radio', { name: serviceData.shoppingassistance })
        .check();

    await page.getByText(/lookbook delivery/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('radio', { name: serviceData.lookbookdelivery })
        .check();

    await page.getByRole('combobox')
        .filter({ hasText: serviceData.locationType })
        .selectOption({ label: serviceData.locationType });

    await page.getByPlaceholder(/enter cities/i).fill(serviceData.cities);

    const serviceRadiusInput = page
        .getByText(/^service radius/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton');

    await serviceRadiusInput.fill(serviceData.serviceRadius);

    await page.getByPlaceholder(/cancellation policy/i)
        .fill(serviceData.cancellationPolicy);

    await page.getByPlaceholder(/terms and conditions/i)
        .fill(serviceData.terms);

    // ================= IMAGE UPLOAD =================
    const primaryImagePath = path.resolve(serviceData.imagePath);
    const galleryImagePath1 = path.resolve(serviceData.galleryImagePath);
    const galleryImagePath2 = path.resolve(serviceData.galleryImagePath1);

    await page.getByText(/primary image/i)
        .locator('xpath=ancestor::div[1]')
        .locator('input[type="file"]')
        .setInputFiles(primaryImagePath);

    await page.getByText(/additional gallery images/i)
        .locator('xpath=ancestor::div[1]')
        .locator('input[type="file"]')
        .setInputFiles([galleryImagePath1, galleryImagePath2]);

    // ================= SUBMIT =================
    const [response] = await Promise.all([
        page.waitForResponse(res =>
            res.url().includes('/master-users') &&
            res.request().method() === 'POST'
        ),
        page.getByRole('button', { name: /create service provider/i }).click()
    ]);

    expect(response.status()).toBe(201);

    // 🔥 Pass your test JSON (serviceData)
    const logs = await logCreateApi(response, serviceData);
    saveLogs(logs, 'create-stylist-service');

});
