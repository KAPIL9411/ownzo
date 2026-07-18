import { test, expect } from '@playwright/test';
import { mockListings } from './utils/mockData';
import { loginUser } from './utils/auth';

test.describe('Marketplace Listings', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept listings API to return mock data
    await page.route('**/api/listings*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            data: mockListings,
            total: 2,
            page: 1,
            limit: 20,
            hasMore: false,
          }
        }),
      });
    });

    // ALL pages in (main) layout are protected, so we MUST inject mock auth
    await loginUser(page);
  });

  test('should display listings on the marketplace page', async ({ page }) => {
    // 1. Setup listener
    const responsePromise = page.waitForResponse('**/api/listings*');
    
    await page.goto('/listings');
    
    // 2. Wait for data
    await responsePromise;
    
    // 3. Check if the mock listings are rendered (case insensitive)
    await expect(page.locator('text=/Test MacBook Pro M2/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/IKEA Desk/i').first()).toBeVisible();
    
    // Check if price is rendered properly
    await expect(page.locator('text=/₹1,200/i').first()).toBeVisible();
  });
});
