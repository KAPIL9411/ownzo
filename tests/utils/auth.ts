import { Page } from '@playwright/test';
import { mockUser } from './mockData';

/**
 * Mocks the authenticated state in the browser.
 * Because we don't want to rely on the actual Firebase backend or real tokens
 * in UI tests, we intercept the profile request and inject the Zustand store state.
 */
export async function loginUser(page: Page) {
  // 1. Intercept the profile endpoint
  await page.route('**/api/auth/profile', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockUser }),
    });
  });

  // 2. Intercept Firebase identitytoolkit to prevent real auth calls
  await page.route('**/identitytoolkit.googleapis.com/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: '3600',
        localId: mockUser.uid,
      }),
    });
  });

  // 3. Inject script to override the store if needed or set the auth cookie
  await page.addInitScript((user) => {
    (window as any).PLAYWRIGHT_TESTING = true;
    window.localStorage.setItem('auth-token', 'mock-id-token');
    
    // Seed Zustand store directly to bypass initial loading state
    window.localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: user,
        token: 'mock-id-token',
        isAuthenticated: true,
        isLoading: false
      },
      version: 0
    }));
    
    document.cookie = 'auth-token=mock-id-token; path=/';
  }, mockUser);
}
