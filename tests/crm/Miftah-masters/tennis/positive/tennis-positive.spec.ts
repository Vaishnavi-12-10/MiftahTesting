import { test, expect } from '@playwright/test';
import scenarios from '../../../../test-data/tennis/positive/valid-tennis.json';
import { logCreateApi, saveLogs } from '../../../../../utils/testLogger';

test.describe('Create Tennis Service - Positive Variations', () => {

  for (const data of scenarios) {

    test(data.scenario, async ({ page }) => {

      await page.goto('https://crmdev.miftah.ai/login/');
      await page.getByPlaceholder(/email address/i).fill('masters.tennis@gmail.com');
      await page.getByPlaceholder(/password/i).fill('Masters@1122');
      await page.locator('button[type="submit"]').click();

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
        .getByRole('button', { name: /Tennis Coach/i })
        .click({ force: true });
      // ===== Service Title =====
      await page.getByPlaceholder(/private tuscan/i)
        .fill(data.title);

      // ===== Phone Number =====
      await page.getByText(/^phone number/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('textbox')
        .fill(data.phone);

      // ===== Years of Experience =====
      await page.getByText(/years of experience/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill("5");

      // ===== Description =====
      await page.getByPlaceholder(/briefly describe/i)
        .fill("Professional tennis coaching service");

      // ===== Base Price =====
      await page.getByText(/base price/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill("1500");

      // ===== Currency =====
      await page.getByText(/currency/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('combobox')
        .selectOption({ label: "AED" });

      // ===== Lead Time =====
      await page.getByText(/lead time/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('spinbutton')
        .fill("15");

      // ===== Location Type =====
      await page.getByText(/location type/i)
        .locator('xpath=ancestor::div[1]')
        .getByRole('combobox')
        .selectOption({ label: data.locationType });

      // ===== Primary Image =====
      const primaryImageInput = page
        .getByText(/primary image/i)
        .locator('xpath=ancestor::div[1]')
        .locator('input[type="file"]');

      await primaryImageInput.setInputFiles(data.primaryImage);


      /// ================= SUBMIT =================
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
      const logs = await logCreateApi(response, data);
      const fileName = data.scenario
        .replace(/\s+/g, '-')
        .toLowerCase();

      saveLogs(logs, fileName);


      console.log('Tennis service created and logged successfully.');

    });
  }
});
