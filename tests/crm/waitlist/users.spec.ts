import { test, expect } from '@playwright/test';
test('Users tab', async ({ page }) => {
await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  const usersTab = page.getByRole('button', { name: 'Users', exact: true });
  
  await usersTab.click();
  await expect(usersTab).toHaveClass(/bg-custom-accent|text-white|shadow-sm/);
});
test('search tab', async ({ page }) => {
    await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
// search user
  const searchInput = page.getByPlaceholder('Search by name, email, phone...');
  await searchInput.fill('vaishnavi');

  // Validate results displayed
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
});
test('All user filter', async ({ page }) => {
    await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
     const statusFilter = page.locator('select', {
    has: page.locator('option', { hasText: 'Approved' }),
  });
  const rows = page.locator('table tbody tr');
  const empty = page.getByText(/no .* found/i);

  const filters = ['All Users', 'Approved', 'Pending', 'Rejected','Onboarded'];

  for (const filter of filters) {
    await statusFilter.selectOption({ label: filter });

    // Wait for either results or empty state
    await expect(rows.first().or(empty)).toBeVisible();
 }
});
test('Export',async({page})=>{
    await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');
    const statusFilter = page.locator('select', {
    has: page.locator('option', { hasText: 'Approved' }),
  });

  const filters = ['All Users', 'Approved', 'Pending', 'Rejected', 'Onboarded'];

  for (const filter of filters) {
    await statusFilter.selectOption({ label: filter });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;

    // ✅ Validate file name exists
    const fileName = download.suggestedFilename();
    expect(fileName).toBeTruthy();

    // (Optional but recommended) Save file
    await download.saveAs(`downloads/${filter}.xlsx`);
  }
});
test('Bulk select action', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  // Header bulk select button
  const bulkCheckbox = page.locator('thead button').first();

  // Row checkbox buttons (inside first cell)
  const rowCheckboxButtons = page.locator('tbody tr td:first-child button');

  // Selection summary
  const selectedBanner = page.getByText(/user\(s\) selected/i);

  // Ensure rows exist
  await expect(rowCheckboxButtons.first()).toBeVisible();

  /* 1️⃣ BULK SELECT */
  await bulkCheckbox.click();

  // Assert selection banner appears
  await expect(selectedBanner).toBeVisible();

  /* 2️⃣ BULK UNSELECT */
  await bulkCheckbox.click();

  // Assert banner disappears
  await expect(selectedBanner).not.toBeVisible();

  /* 3️⃣ INDIVIDUAL SELECTION */
  await rowCheckboxButtons.nth(0).click();
  await rowCheckboxButtons.nth(2).click();

  // Assert count updates to 2
  await expect(selectedBanner).toContainText('2');
});
test('User details popup', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  // Ensure at least one user row exists
  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible();

  // Click any user row (not checkbox)
  await rows.first().click();

  // Assert popup by heading
  await expect(
    page.getByRole('heading', { name: 'User Details' })
  ).toBeVisible();
});
test('Items per page dropdown works correctly', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  const itemsPerPage = page.locator('select').last();
  const rows = page.locator('tbody tr');
  const summaryText = page.getByText(/showing/i);

  // Default should be 10
  await expect(itemsPerPage).toHaveValue('10');
  await expect(rows.first()).toBeVisible();

  // Change to 5
  await itemsPerPage.selectOption('5');
  await expect(rows.first()).toBeVisible();
  await expect(summaryText).toContainText('5');

  // Change to 25
  await itemsPerPage.selectOption('25');
  await expect(rows.first()).toBeVisible();

  // Change to 50
  await itemsPerPage.selectOption('50');
  await expect(rows.first()).toBeVisible();
});

test('Pagination navigation works', async ({ page }) => {
  await page.goto('https://crmdev.miftah.ai/dashboard/waitlist');

  const summary = page.getByText(/showing/i);
  const page2 = page.getByRole('button', { name: '2', exact: true });
  const page3 = page.getByRole('button', { name: '3', exact: true });

  // Initial page
  await expect(summary).toContainText('Showing 1 to 10');

  // Go to page 2
  await page2.scrollIntoViewIfNeeded();
  await page2.click();
  await expect(summary).toContainText('Showing 11 to 20');

  // Go to page 3
  await page3.scrollIntoViewIfNeeded();
  await page3.click();
  await expect(summary).toContainText('Showing 21 to 22');
});

