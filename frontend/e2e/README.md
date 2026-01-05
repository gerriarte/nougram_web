# E2E Tests

End-to-end tests using Playwright for the Nougram frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install --with-deps chromium
```

## Running Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive):
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

### Run specific test file:
```bash
npx playwright test e2e/auth.spec.ts
```

## Test Structure

- `auth.spec.ts` - Authentication flow tests
- `projects.spec.ts` - Project creation and management tests
- `quotes.spec.ts` - Quote editing tests
- `dashboard.spec.ts` - Dashboard and visualization tests
- `users.spec.ts` - User management tests

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browser: Chromium (default)
- Screenshots: On failure
- Traces: On first retry

## Notes

### Test Environment Setup

Many tests are currently skipped because they require:
1. **Backend server running** on `http://localhost:8000`
2. **Test database** with seed data
3. **Authentication** - Test user credentials
4. **Environment variables** configured

To enable full testing:
1. Set up test database with seed data
2. Configure test user credentials in `.env.local`
3. Uncomment and configure skipped tests
4. Set up test fixtures for authentication

### Authentication in Tests

Tests that require authentication need:
- Login helper function ✅ (implemented in `helpers/auth.ts`)
- Test user credentials (set via environment variables)
- Session management ✅ (handled by helper)

The authentication helper is available in `helpers/auth.ts`:
```typescript
import { login } from './helpers/auth';

// In your test:
await login(page, 'test@example.com', 'password123');
```
  await page.getByPlaceholder(/correo|email/i).fill(process.env.TEST_USER_EMAIL!);
  await page.getByPlaceholder(/contraseña|password/i).fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  await page.waitForURL(/\/dashboard/);
}
```

### CI/CD Integration

For CI/CD pipelines:
1. Set `CI=true` environment variable
2. Tests will retry 2 times on failure
3. Use `--workers=1` for sequential execution
4. Ensure backend is available in CI environment
