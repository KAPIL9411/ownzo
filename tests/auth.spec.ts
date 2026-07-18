import { test, expect } from '@playwright/test';
import { loginUser } from './utils/auth';

test.describe('Authentication Flows', () => {
  test('should display login page successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the login page renders the correct branding and buttons
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

});
