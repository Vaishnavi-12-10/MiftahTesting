import { test, expect } from '@playwright/test';
import path from 'path';
import serviceData from '../../test-data/make-up-service.json';
import { logCreateApi, saveLogs } from '../../../utils/testLogger';

test('Create Makeup Artist Service - Miftah Master Portal', async ({ page }) => {
    test.setTimeout(180000);


    // ================= LOGIN =================
    await page.goto('https://crmdev.miftah.ai/login/');

    await page.getByPlaceholder(/email address/i).fill(serviceData.email);
    await page.getByPlaceholder(/password/i).fill(serviceData.password);

    // Click exact submit button
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

    // ================= SELECT CATEGORY =================
    const categoryModal = page
        .getByRole('heading', { name: /choose a category/i })
        .locator('xpath=ancestor::div[contains(@class,"fixed")]');

    await expect(categoryModal).toBeVisible();

    await categoryModal
        .getByRole('button', { name: /makeup artist/i })
        .click({ force: true });

    // ================= WAIT FOR FORM =================
    const serviceTitleInput = page.getByPlaceholder(/private tuscan/i);
    await expect(serviceTitleInput).toBeVisible();

    // ================= GENERAL INFORMATION =================

    // ===== Service Title =====
    await page
        .getByPlaceholder(/private tuscan/i)
        .fill(serviceData.title);

    // ===== Phone Number =====
    await page
        .getByText(/^phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill(serviceData.phone);

    // ===== Alternate Phone Number =====
    await page
        .getByText(/^alternate phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill(serviceData.altPhone);

    // ===== Languages Dropdown (Safe Handling) =====
    //  // Clicking "Select options..." which is the actual interactive part of the dropdown
    await page.getByText(/select options/i).click();
    const languageSearch = page.getByPlaceholder(/search languages/i);
    await expect(languageSearch).toBeVisible(); await languageSearch.fill('English');
    // The snapshot shows these are buttons, not options
    await page.getByRole('button', { name: /^English$/ }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('heading', { name: /general information/i }).click();
    // ===== Years of Experience =====
    await page
        .getByText(/^years of experience/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill(serviceData.yearsOfExperience);

    /// ===== Visible to Users =====
    // Clicking the text label or the checkbox with force as the role might not be perfectly mapped
    await page.getByText(/visible to users/i).click({ force: true });

    // ===== Description =====
    await page
        .getByPlaceholder(/briefly describe/i)
        .fill(serviceData.description);

    // ===== Experience Details =====
    await page
        .getByPlaceholder(/provide more details/i)
        .fill(serviceData.experienceDetails);

    // ================= PRICING (STABLE VERSION) =================

    // All pricing inputs are spinbuttons.
    // Based on DOM order from snapshot:

    const spinButtons = page.getByRole('spinbutton');

    // 0 → Base Price (already filled)
    // 1 → Lead Time (Mins)
    // 2 → Price per Session
    // 3 → Price per Hour
    // 4 → Bespoke Price
    // 5 → Service Radius (km)

    await spinButtons.nth(2).fill(serviceData.pricePerSession);
    await spinButtons.nth(3).fill(serviceData.pricePerHour);
    await spinButtons.nth(4).fill(serviceData.bespokePrice);
    await spinButtons.nth(1).fill(serviceData.leadTime);

    // ================= SERVICE SPECIFICS =================

    await page.getByPlaceholder(/enter styles/i)
        .fill(serviceData.styles);

    await page.getByPlaceholder(/enter brands/i)
        .fill(serviceData.brands);

    // Lashes Included?
    await page
        .getByText(/lashes included/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('radio', { name: serviceData.lashesIncluded ? 'Yes' : 'No' })
        .check();

    // Airbrush Available?
    await page
        .getByText(/airbrush available/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('radio', { name: serviceData.airbrushAvailable ? 'Yes' : 'No' })
        .check();

    // Hair Styling Included?
    await page
        .getByText(/hair styling included/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('radio', { name: serviceData.hairStylingIncluded ? 'Yes' : 'No' })
        .check();

    // ================= LOCATION =================

    await page
        .getByRole('combobox')
        .filter({ hasText: serviceData.locationType })
        .selectOption({ label: serviceData.locationType });

    // Cities
    await page.getByPlaceholder(/enter cities/i)
        .fill(serviceData.cities);

    // Service Radius (stable targeting)
    console.log('Filling Service Radius...');
    await spinButtons.nth(5).scrollIntoViewIfNeeded();
    // Service Radius (robust locator)
    const serviceRadiusInput = page
        .getByText(/^service radius/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton');

    await expect(serviceRadiusInput).toBeVisible();
    await serviceRadiusInput.fill(serviceData.serviceRadius);
    await serviceRadiusInput.press('Tab'); // trigger blur validation

    await spinButtons.nth(5).press('Tab');
    console.log('Service Radius filled and Tab pressed.');

    // ================= POLICIES =================
    console.log('Waiting for Policies section...');
    const cancellationInput = page.getByPlaceholder(/cancellation policy/i);
    await cancellationInput.scrollIntoViewIfNeeded();
    await expect(cancellationInput).toBeVisible({ timeout: 20000 });

    console.log('Filling Cancellation Policy...');
    await cancellationInput.fill(serviceData.cancellationPolicy);
    console.log('Cancellation Policy filled.');

    console.log('Filling Terms and Conditions...');
    const termsInput = page.getByPlaceholder(/terms and conditions/i);
    await termsInput.scrollIntoViewIfNeeded();
    await expect(termsInput).toBeVisible({ timeout: 20000 });
    await termsInput.fill(serviceData.terms);
    console.log('Terms and Conditions filled.');

    // ================= IMAGE UPLOAD =================

    const primaryImagePath = path.resolve(serviceData.imagePath);
    const galleryImagePath1 = path.resolve(serviceData.galleryImagePath);
    const galleryImagePath2 = path.resolve(serviceData.galleryImagePath1);

    // ---- PRIMARY IMAGE ----
    const primaryImageInput = page
        .getByText(/primary image/i)
        .locator('xpath=ancestor::div[1]')
        .locator('input[type="file"]');

    await primaryImageInput.setInputFiles(primaryImagePath);

    // ---- ADDITIONAL GALLERY IMAGES ----
    const galleryImageInput = page
        .getByText(/additional gallery images/i)
        .locator('xpath=ancestor::div[1]')
        .locator('input[type="file"]');

    // Upload multiple images at once
    await galleryImageInput.setInputFiles([
        galleryImagePath1,
        galleryImagePath2
    ]);

    console.log('Images uploaded.');

    // ================= SUBMIT =================
    console.log('Clicking Create Service Provider...');

    const createButton = page.getByRole('button', {
        name: /create service provider/i
    });

    await expect(createButton).toBeVisible();

    const [response] = await Promise.all([
        page.waitForResponse(res =>
            res.url().includes('/master-users') &&
            res.request().method() === 'POST'
        ),
        createButton.click()
    ]);

    expect(response.status()).toBe(201);

    // 🔥 Capture logs ONLY for this API
    const logs = await logCreateApi(response, serviceData);
    saveLogs(logs, 'create-make-up-service');

    console.log('Make-up service created and logged successfully.');


});

