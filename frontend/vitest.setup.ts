/**
 * Vitest setup file
 * Configures test environment for frontend tests
 */
import { vi } from 'vitest';

// Mock Next.js router (only needed for React component tests)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
