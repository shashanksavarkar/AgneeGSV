import { test, expect } from '@playwright/test';

test.describe('Agnee 2026 Core Suite', () => {

  test('Page loads cleanly with zero console errors and valid metadata', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Check title and brand wordmark
    await expect(page).toHaveTitle(/Agnee 2026/);
    const wordmark = page.locator('.hero-wordmark-img');
    await expect(wordmark).toBeVisible();

    // Check meta tags
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('Gati Shakti Vishwavidyalaya');

    // Verify zero fatal console errors
    const fatalErrors = consoleErrors.filter(err => !err.includes('favicon'));
    expect(fatalErrors).toHaveLength(0);
  });

  test('Navigation links route smoothly across festival landmarks', async ({ page }) => {
    await page.goto('/');

    // Check section visibility
    await expect(page.locator('#about')).toBeAttached();
    await expect(page.locator('#events')).toBeAttached();
    await expect(page.locator('#schedule')).toBeAttached();
    await expect(page.locator('#map')).toBeAttached();
  });

  test('Events discovery: search, category chips, and detail modal', async ({ page }) => {
    await page.goto('/#events');

    // Verify cards are rendered
    const eventCards = page.locator('.event-card');
    await expect(eventCards.first()).toBeVisible();

    // Test search filter
    const searchInput = page.locator('#eventSearchInput');
    await searchInput.fill('Battle');
    await page.waitForTimeout(300); // debounce

    await expect(page.locator('.event-card-title').filter({ hasText: 'Battle of Wits' })).toBeVisible();

    // Clear search
    await page.locator('#eventSearchClear').click();
    await page.waitForTimeout(300);
  });

  test('Schedule: single Performances card', async ({ page }) => {
    await page.goto('/#schedule');
    await expect(page.locator('.phase-card')).toHaveCount(1);
    await expect(page.locator('.phase-events li').first()).toBeVisible();
  });

  test('3D Campus Map: launch button and directions drawer', async ({ page }) => {
    await page.goto('/#map');

    // Activate 3D map
    const activateBtn = page.locator('#btnActivate3D');
    if (await activateBtn.isVisible()) {
      await activateBtn.click();
    }

    // Directions drawer test
    const dirBtn = page.locator('#btnMapDirections');
    await expect(dirBtn).toBeVisible();
    await dirBtn.click();

    const dirDrawer = page.locator('#mapDirectionsDrawer');
    await expect(dirDrawer).toBeVisible();

    // Select Oval Ground and verify directions preview
    const destSelect = page.locator('#directionsDestinationSelect');
    await destSelect.selectOption('oval-ground');
    await expect(page.locator('#directionsResult')).toContainText('approx');
  });

  test('Offline and 404 pages render without errors', async ({ page }) => {
    // 404 page
    await page.goto('/404.html');
    await expect(page.locator('.notfound-code')).toContainText('404');

    // Offline page
    await page.goto('/offline.html');
    await expect(page.locator('.offline-title')).toContainText('offline');
  });

  test('Accessibility: keyboard tab navigation and focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab through skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
  });
});
