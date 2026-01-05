import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * E2E tests for dashboard and visualizations
 * 
 * Note: These tests require authentication and backend to be running.
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Navigate to dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test.skip('should display dashboard KPIs', async ({ page }) => {
    // This test requires:
    // 1. Backend server running
    // 2. Authentication (test user)
    // 3. Test data (projects, quotes) in database
    // 
    // To enable this test:
    // 1. Set up test database with seed data
    // 2. Create test user and sample data
    // 3. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
    // 4. Remove .skip() from this test
    
    // Authenticate first
    await login(page);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Verify KPI cards are visible (adjust selectors based on actual implementation)
    // Common KPIs: Total Projects, Revenue, Margin, etc.
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    
    // Look for common KPI labels (adjust based on actual labels)
    // await expect(page.getByText(/proyectos|projects/i)).toBeVisible();
    // await expect(page.getByText(/ingresos|revenue/i)).toBeVisible();
  });

  test.skip('should display charts and visualizations', async ({ page }) => {
    // This test requires authentication and data
    // 
    // Example flow:
    // 1. Navigate to dashboard
    // 2. Verify charts are rendered (Recharts components)
    // 3. Verify chart data is displayed
    // 4. Test chart interactions (if any)
  });

  test.skip('should filter dashboard data by date', async ({ page }) => {
    // This test requires authentication and data
    // 
    // Example flow:
    // 1. Navigate to dashboard
    // 2. Select date filter
    // 3. Verify dashboard data updates
    // 4. Verify KPIs reflect filtered data
  });

  test.skip('should filter dashboard data by currency', async ({ page }) => {
    // This test requires authentication and multi-currency data
    // 
    // Example flow:
    // 1. Navigate to dashboard
    // 2. Select currency filter
    // 3. Verify dashboard data updates
    // 4. Verify currency is displayed correctly
  });
});
