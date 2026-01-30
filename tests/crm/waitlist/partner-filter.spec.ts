import { test, expect } from '@playwright/test';
test('Combined filters - smart coverage', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  const status = page.getByRole('combobox').nth(0);
  const partnership = page.getByRole('combobox').nth(1);
  const industry = page.getByRole('combobox').nth(2);

  const rows = page.locator('tbody tr');
  const empty = page.getByText(/no waitlist partners/i);

  const combinations = [
    ['Approved', 'Technology', 'Healthcare'],
    ['Pending', 'Marketing', 'Finance'],
    ['Rejected', 'Reseller', 'Real Estate'],
    ['Onboarded', 'Service', 'Hospitality']
  ];

  for (const [s, p, i] of combinations) {
    await status.selectOption({ label: s });
    await partnership.selectOption({ label: p });
    await industry.selectOption({ label: i });

    await expect(rows.first().or(empty)).toBeVisible();
  }
});

