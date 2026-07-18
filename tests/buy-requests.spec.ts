import { test, expect } from '@playwright/test';
import { mockBuyRequests } from './utils/mockData';
import { loginUser } from './utils/auth';

test.describe('Buy Requests Board', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept buy-requests API
    await page.route('**/api/buy-request*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            data: mockBuyRequests,
            total: 1,
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

  test('should display buy requests on the board', async ({ page }) => {
    // 1. Setup a listener to ensure our mock is actually consumed by the page
    const responsePromise = page.waitForResponse('**/api/buy-request*');
    
    await page.goto('/buy-requests');
    
    // 2. Wait for the page to actually receive the mocked data
    await responsePromise;
    
    // 3. Relax the locator to be case-insensitive to bypass CSS text-transforms
    await expect(page.locator('text=/Looking for an iPad Pro/i').first()).toBeVisible({ timeout: 10000 });
    
    // Check if budget is rendered
    await expect(page.locator('text=/₹600/i').first()).toBeVisible();
  });

});
