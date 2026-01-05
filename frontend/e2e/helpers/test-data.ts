/**
 * Test data helpers for E2E tests
 * 
 * This file contains test data constants and helpers that can be used
 * across multiple test files.
 */

/**
 * Test user credentials
 * These should be set in environment variables for real test runs
 */
export const TEST_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword',
  // Admin user (if different from regular test user)
  adminEmail: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.TEST_ADMIN_PASSWORD || 'adminpassword',
};

/**
 * Sample project data for tests
 */
export const SAMPLE_PROJECT = {
  name: 'Test Project E2E',
  clientName: 'Test Client',
  clientEmail: 'client@example.com',
  currency: 'USD',
  status: 'Draft' as const,
};

/**
 * Sample service data for tests
 */
export const SAMPLE_SERVICE = {
  name: 'Test Service E2E',
  description: 'A test service for E2E tests',
  defaultMarginTarget: 40,
  pricingType: 'hourly' as const,
};

/**
 * Sample fixed cost data for tests
 */
export const SAMPLE_FIXED_COST = {
  name: 'Test Fixed Cost E2E',
  amountMonthly: 1000,
  currency: 'USD',
};

/**
 * Generate unique test data
 * Useful for avoiding conflicts when running tests multiple times
 */
export function generateUniqueTestData(prefix: string = 'test') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    projectName: `${prefix}-project-${timestamp}-${random}`,
    clientName: `${prefix}-client-${timestamp}-${random}`,
    serviceName: `${prefix}-service-${timestamp}-${random}`,
    costName: `${prefix}-cost-${timestamp}-${random}`,
  };
}
