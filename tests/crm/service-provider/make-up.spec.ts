import { test, expect } from '@playwright/test';

test('Add Service Provider - Miftah Master Makeup Artist', async ({ page }) => {

    const providerData = {
        partnershipType: 'Miftah Master',
        industryType: 'Makeup Artist',
        fullName: 'makeup_name',
        email: `makeup.artist@gmail.com`, // ✅ UNIQUE
        phone: '1234567890',
        companyName: 'makeup_company',
        jobTitle: 'makeup_job',
        tier: 'Standard',
        password: 'Makeup@12'
    };

    await page.goto('https://crmdev.miftah.ai/dashboard/service-providers');
    await page.getByText(/loading/i).waitFor({ state: 'hidden' });

    await page.getByRole('button', { name: /add new service provider/i }).click();

    const modalHeading = page.getByRole('heading', { name: /add new service provider/i });
    await expect(modalHeading).toBeVisible();

    const form = modalHeading.locator('xpath=ancestor::div[contains(@class,"fixed")]');

    // Fill form
    await form.locator('select').nth(0)
        .selectOption({ label: providerData.partnershipType });

    const industryDropdown = form.locator('select').nth(1);
    await expect(industryDropdown).toBeEnabled();
    await industryDropdown.selectOption({ label: providerData.industryType });

    await form.getByPlaceholder(/enter full name/i).fill(providerData.fullName);
    await form.getByPlaceholder(/enter email/i).fill(providerData.email);
    // ===== Phone Number (FIXED) =====
    const phoneInput = form.locator('input[type="tel"]');

    await phoneInput.click();          // focus
    await phoneInput.press('Control+A'); // select all
    await phoneInput.press('Backspace'); // clear

    // Type full number including country code
    await phoneInput.type(`+971${providerData.phone}`);
    await form.getByPlaceholder(/enter company name/i).fill(providerData.companyName);
    await form.getByPlaceholder(/enter job title/i).fill(providerData.jobTitle);
    await form.locator('select').nth(2).selectOption({ label: providerData.tier });
    await form.getByPlaceholder(/enter password/i).fill(providerData.password);

    // ✅ Proper API wait
    const responsePromise = page.waitForResponse(resp =>
        resp.url().includes('/service-providers') &&
        resp.request().method() === 'POST'
    );

    await form.getByRole('button', { name: /add provider/i }).click();

    const response = await responsePromise;

    // 🔎 Debug if backend failed
    expect(response.status(), 'Service provider creation failed').toBe(201);

    // ✅ Now modal should close
    await expect(modalHeading).toBeHidden({ timeout: 10000 });

    // Switch tab
    await page.getByRole('button', { name: /miftah master/i }).click();
    await page.getByText(/loading/i).waitFor({ state: 'hidden' });

    // Validate
    await expect(page.getByText(providerData.email)).toBeVisible();
});
