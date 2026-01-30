import { test, expect } from '@playwright/test';


test('Partners tabs navigation works correctly', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
  const partners = page.getByRole('button', { name: 'Partners', exact: true });

  await partners.click();
  await expect(partners).toHaveClass(/bg-custom-accent|text-white|shadow-sm/);

  // Tabs
  const partnersTab = page.getByRole('button', { name: 'Waitlist Partners' });
  const mastersTab = page.getByRole('button', { name: 'Waitlist Masters' });
  const allTab = page.getByRole('button', { name: 'All',exact:true });

  // Table rows (content validation)
  const rows = page.locator('tbody tr');

  // 1️⃣ Default tab → Waitlist Partners
  await expect(partnersTab).toHaveClass(/active|bg|selected/i);
  await expect(rows.first()).toBeVisible();

  // 2️⃣ Switch to Waitlist Masters
  await mastersTab.click();
  await expect(mastersTab).toHaveClass(/active|bg|selected/i);
  await expect(partnersTab).not.toHaveClass(/active|bg|selected/i);
  await expect(rows.first()).toBeVisible();

  // 3️⃣ Switch to All
  await allTab.click();
  await expect(allTab).toHaveClass(/active|bg|selected/i);
  await expect(mastersTab).not.toHaveClass(/active|bg|selected/i);
  await expect(rows.first()).toBeVisible();

  // 4️⃣ Back to Waitlist Partners
  await partnersTab.click();
  await expect(partnersTab).toHaveClass(/active|bg|selected/i);
  await expect(rows.first()).toBeVisible();
  
});
test('Partners search works', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
   
  // Tabs
  const partnersTab = page.getByRole('button', { name: 'Waitlist Partners' });

  // Switch to Partners tab
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  // Locate search input
  const searchInput = page.getByPlaceholder(
    'Search by name, email, company, phone, or partnership type...'
  );

  await expect(searchInput).toBeVisible();

  // Type search text
  await searchInput.fill('vaishnavi');

  // Results or empty state
  const rows = page.locator('tbody tr');
  const emptyState = page.getByText(/no .* found/i);

  // Assert either results OR empty message
  await expect(rows.first().or(emptyState)).toBeVisible();
});
test('Partners filters work correctly', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
 /* ---------- ALL PARTNERS TYPE FILTER ----------*/

  // Go to Partners page
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  // First dropdown = Status filter
  const statusFilter = page.getByRole('combobox').first();

  const rows = page.locator('tbody tr');
  const emptyState = page.getByText(/no waitlist partners/i);

  const statusOptions = [
    'All Partners',
    'Approved',
    'Pending',
    'Rejected',
    'Onboarded'
  ];

  for (const status of statusOptions) {

    await test.step(`Filter: ${status}`, async () => {

      // Select filter
      await statusFilter.selectOption({ label: status });

      // Wait for table update
      await expect(rows.first().or(emptyState)).toBeVisible();

      // Optional validation per status
      if (status !== 'All Partners') {
        const statusCells = page.locator('tbody tr td').filter({ hasText: status });
        await expect(statusCells.first().or(emptyState)).toBeVisible();
      }
    });
  }
});
  /* ---------- PARTNERSHIP TYPE FILTER ---------- */
  test('Partnership Type Filter - All Options', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  // Open Partners page
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  // Second dropdown = Partnership Type
  const partnershipFilter = page.getByRole('combobox').nth(1);

  const rows = page.locator('tbody tr');
  const emptyState = page.getByText(/no waitlist partners/i);

  const partnershipOptions = [
    'Technology',
    'Marketing',
    'Integration',
    'Strategic',
    'Channel',
    'Reseller',
    'Service',
    'Distribution',
    'Investment',
    'Affiliate',
    'Business'
  ];

  for (const type of partnershipOptions) {

    await test.step(`Filter Partnership Type: ${type}`, async () => {

      await partnershipFilter.selectOption({ label: type });

      // Wait for table update
      await expect(rows.first().or(emptyState)).toBeVisible();

    });
  }
});


  /* ---------- INDUSTRY TYPE FILTER ---------- */
  test('Industry Type Filter - All Options', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  // Open Partners page
  await page.getByRole('button', { name: 'Partners', exact: true }).click();

  // Third dropdown = Industry Type
  const industryFilter = page.getByRole('combobox').nth(2);

  const rows = page.locator('tbody tr');
  const emptyState = page.getByText(/no waitlist partners/i);

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Real Estate',
    'Hospitality',
    'Travel & Tourism',
    'Luxury Retail',
    'Automotive',
    'Aviation',
    'Maritime',
    'Energy',
    'Consulting',
    'Legal Services',
    'Marketing & Advertising',
    'Education',
    'Government',
    'Non-Profit',
    'Manufacturing',
    'Agriculture',
    'Media & Entertainment',
    'Sports & Recreation'
  ];

  for (const industry of industryOptions) {

    await test.step(`Filter Industry Type: ${industry}`, async () => {

      await industryFilter.selectOption({ label: industry });

      // Wait for table update
      await expect(rows.first().or(emptyState)).toBeVisible();

    });
  }
});

