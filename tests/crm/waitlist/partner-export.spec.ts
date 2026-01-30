import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Export works for all filter combinations', async ({ page }) => {
  test.setTimeout(120000); // increase timeout safely

  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  const statusFilter = page.getByRole('combobox').nth(0);
  const partnershipFilter = page.getByRole('combobox').nth(1);
  const industryFilter = page.getByRole('combobox').nth(2);

  const rows = page.locator('tbody tr');
  const emptyState = page.getByText(/no waitlist partners/i);

  const statuses = ['All Partners', 'Approved', 'Pending', 'Rejected', 'Onboarded'];
  const partnerships = ['Technology', 'Marketing', 'Reseller']; // sample few
  const industries = ['Healthcare', 'Finance', 'Real Estate']; // sample few

  for (const status of statuses) {
    for (const partnership of partnerships) {
      for (const industry of industries) {

        await test.step(
          `Status: ${status} | Partnership: ${partnership} | Industry: ${industry}`,
          async () => {

            await statusFilter.selectOption({ label: status });
            await partnershipFilter.selectOption({ label: partnership });
            await industryFilter.selectOption({ label: industry });

            await page.waitForLoadState('networkidle');

            // Validate table OR empty state
            await expect(rows.first().or(emptyState)).toBeVisible();

            // Export validation
            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: 'Export' }).click();
            const download = await downloadPromise;

            const fileName = download.suggestedFilename();
            expect(fileName).toBeTruthy();

            // Save uniquely
            const path = `downloads/${status}-${partnership}-${industry}.xlsx`;
            await download.saveAs(path);

            expect(fs.existsSync(path)).toBeTruthy();
          }
        );
      }
    }
  }
});
