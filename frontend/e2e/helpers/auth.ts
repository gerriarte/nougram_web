/**
 * Authentication helper for E2E tests
 * 
 * This helper provides functions to authenticate users in tests.
 * Note: This requires a test backend server and test user to be configured.
 */

import { Page } from '@playwright/test';

/**
 * Authenticate a user in the test
 * 
 * @param page - Playwright page object
 * @param email - User email (defaults to env var or test user)
 * @param password - User password (defaults to env var or test password)
 */
export async function login(
  page: Page,
  email: string = process.env.TEST_USER_EMAIL || 'test@example.com',
  password: string = process.env.TEST_USER_PASSWORD || 'testpassword'
): Promise<void> {
  await page.goto('/login');
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"], input[placeholder*="correo" i], input[placeholder*="email" i]', { timeout: 5000 });
  
  // Fill in credentials
  const emailInput = page.locator('input[type="email"], input[placeholder*="correo" i], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"], input[placeholder*="contraseña" i], input[placeholder*="password" i]').first();
  const submitButton = page.getByRole('button', { name: /iniciar sesión|login/i });
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();
  
  // Wait for redirect after successful login
  await page.waitForURL(/\/dashboard|\/projects/, { timeout: 10000 });
}

/**
 * Check if user is authenticated
 * 
 * @param page - Playwright page object
 * @returns true if authenticated (has auth token in localStorage)
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const authToken = await page.evaluate(() => {
    return localStorage.getItem('auth_token');
  });
  return !!authToken;
}

/**
 * Logout user
 * 
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  // Clear auth token
  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
  });
  
  // Navigate to login page
  await page.goto('/login');
}

/**
 * Setup authenticated state (using localStorage token directly)
 * 
 * This is useful for tests that need to be authenticated but don't need
 * to go through the full login flow.
 * 
 * @param page - Playwright page object
 * @param token - Auth token (optional, for custom tokens)
 */
export async function setAuthToken(page: Page, token?: string): Promise<void> {
  const authToken = token || process.env.TEST_AUTH_TOKEN || 'test-token';
  
  await page.context().addCookies([
    {
      name: 'auth_token',
      value: authToken,
      domain: 'localhost',
      path: '/',
    },
  ]);
  
  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token);
  }, authToken);
  
  // Navigate to a protected page to verify auth
  await page.goto('/dashboard');
}
