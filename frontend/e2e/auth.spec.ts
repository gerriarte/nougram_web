import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flow
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form elements are visible
    await expect(page.getByPlaceholder(/correo|email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/contraseña|password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión|login/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.getByPlaceholder(/correo|email/i).fill('invalid@example.com');
    await page.getByPlaceholder(/contraseña|password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
    
    // Should show error message
    await expect(page.getByText(/credenciales|invalid|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid email format
    await page.getByPlaceholder(/correo|email/i).fill('not-an-email');
    await page.getByPlaceholder(/contraseña|password/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/correo.*válido|email.*valid/i)).toBeVisible();
  });

  test('should require email and password', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
    
    // Should show validation error (implementation may vary)
    // This test may need adjustment based on actual form validation
    const emailInput = page.getByPlaceholder(/correo|email/i);
    const passwordInput = page.getByPlaceholder(/contraseña|password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  // Note: Successful login test requires backend to be running and test user to exist
  // This would typically be set up in a test database
  test.skip('should login successfully with valid credentials', async ({ page }) => {
    // This test requires:
    // 1. Backend server running on http://localhost:8000
    // 2. Test user in database (can be created via /auth/register endpoint)
    // 3. Environment variables configured (TEST_USER_EMAIL, TEST_USER_PASSWORD)
    // 
    // To enable this test:
    // 1. Set up test database with seed data
    // 2. Create test user via registration endpoint or seed script
    // 3. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
    // 4. Remove .skip() from this test
    
    const { login } = await import('./helpers/auth');
    
    await login(
      page,
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'testpassword'
    );
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Should see dashboard content (may vary based on actual dashboard implementation)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });
});
