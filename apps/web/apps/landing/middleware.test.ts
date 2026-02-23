import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock NextRequest
function createMockRequest(overrides?: Partial<NextRequest>): NextRequest {
  const url = overrides?.nextUrl?.href || 'http://localhost:3000/';
  const cookiesMap = new Map();

  // Extract cookies from overrides if provided
  if (overrides?.cookies) {
    const mockCookies = overrides.cookies as any;
    if (mockCookies.get) {
      // If it's already a mock cookies object, use it
      return {
        nextUrl: new URL(url),
        cookies: mockCookies,
        ...overrides,
      } as NextRequest;
    }
  }

  return {
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) => {
        const value = cookiesMap.get(name);
        return value ? { name, value } : undefined;
      },
    } as any,
    ...overrides,
  } as NextRequest;
}

// Helper function to create mock cookies
function createMockCookies(entries: [string, string][]): NextRequest['cookies'] {
  const map = new Map(entries);
  return {
    get: (name: string) => {
      const value = map.get(name);
      return value ? { name, value } : undefined;
    },
  } as NextRequest['cookies'];
}

describe('Portal Routing Middleware', () => {
  const B2B_URL = 'https://www.knbiosciences.in';
  const B2C_URL = 'https://agriculture.knbiosciences.in';

  beforeEach(() => {
    // Set environment variables for tests
    process.env.NEXT_PUBLIC_B2B_URL = B2B_URL;
    process.env.NEXT_PUBLIC_B2C_URL = B2C_URL;
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_B2B_URL;
    delete process.env.NEXT_PUBLIC_B2C_URL;
    delete process.env.JWT_SECRET;
  });

  describe('Authenticated User Routing', () => {
    it('should redirect dealer to B2B portal', () => {
      const dealerToken = createMockJwt({ role: 'dealer' });
      const cookies = createMockCookies([['auth-token', dealerToken]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2B_URL);
    });

    it('should redirect distributor to B2B portal', () => {
      const distributorToken = createMockJwt({ role: 'distributor' });
      const cookies = createMockCookies([['auth-token', distributorToken]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2B_URL);
    });

    it('should redirect retailer to B2C portal', () => {
      const retailerToken = createMockJwt({ role: 'retailer' });
      const cookies = createMockCookies([['auth-token', retailerToken]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2C_URL);
    });

    it('should redirect customer to B2C portal', () => {
      const customerToken = createMockJwt({ role: 'customer' });
      const cookies = createMockCookies([['auth-token', customerToken]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2C_URL);
    });

    it('should redirect farmer to B2C portal', () => {
      const farmerToken = createMockJwt({ role: 'farmer' });
      const cookies = createMockCookies([['auth-token', farmerToken]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2C_URL);
    });
  });

  describe('Guest User Routing', () => {
    it('should redirect guest with B2B preference to B2B portal', () => {
      const cookies = createMockCookies([['portal_preference', 'b2b']]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2B_URL);
    });

    it('should redirect guest with B2C preference to B2C portal', () => {
      const cookies = createMockCookies([['portal_preference', 'b2c']]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2C_URL);
    });

    it('should show landing page for guest without preference', () => {
      const cookies = createMockCookies([]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      // Should return next() response (no redirect)
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should not redirect if user is already on correct portal', () => {
      const dealerToken = createMockJwt({ role: 'dealer' });
      const cookies = createMockCookies([['auth-token', dealerToken]]);
      const request = createMockRequest({
        nextUrl: new URL(B2B_URL),
        cookies,
      });

      const response = middleware(request);

      // Should return next() response (no redirect)
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('should handle invalid JWT tokens gracefully', () => {
      const cookies = createMockCookies([['auth-token', 'invalid.token.here']]);
      const request = createMockRequest({ cookies });

      // Should not throw, should fall back to guest logic (no preference = landing page)
      expect(() => middleware(request)).not.toThrow();

      const response = middleware(request);
      expect(response.status).toBe(200);
    });

    it('should handle expired JWT tokens gracefully', () => {
      // Create token with expired exp
      const expiredPayload = {
        role: 'dealer',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const expiredToken = createMockJwt(expiredPayload, true);
      const cookies = createMockCookies([['auth-token', expiredToken]]);
      const request = createMockRequest({ cookies });

      // Should fall back to guest logic (no preference = landing page)
      const response = middleware(request);
      expect(response.status).toBe(200);
    });

    it('should prioritize auth token over cookie preference', () => {
      // User has dealer role but cookie says b2c
      const dealerToken = createMockJwt({ role: 'dealer' });
      const cookies = createMockCookies([
        ['auth-token', dealerToken],
        ['portal_preference', 'b2c'],
      ]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      // Should redirect to B2B based on role, not cookie
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(B2B_URL);
    });

    it('should handle malformed JWT tokens', () => {
      const cookies = createMockCookies([['auth-token', 'not-a-valid-jwt']]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      // Should not throw, should fall back to landing page
      expect(response.status).toBe(200);
    });

    it('should handle JWT with missing role', () => {
      const tokenWithoutRole = createMockJwt({ role: undefined as any });
      const cookies = createMockCookies([['auth-token', tokenWithoutRole]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      // Should fall back to landing page (no role = no redirect)
      expect(response.status).toBe(200);
    });
  });

  describe('Unknown Role Handling', () => {
    it('should not redirect users with unknown roles', () => {
      const unknownRoleToken = createMockJwt({ role: 'unknown_role' });
      const cookies = createMockCookies([['auth-token', unknownRoleToken]]);
      const request = createMockRequest({ cookies });

      const response = middleware(request);

      // Unknown role should not redirect
      expect(response.status).toBe(200);
    });
  });
});

/**
 * Helper function to create a mock JWT token
 */
function createMockJwt(payload: { role?: string; email?: string; sub?: string; exp?: number; iat?: number }, expired = false): string {
  const defaultPayload = {
    role: payload.role || 'retailer',
    email: payload.email || 'test@example.com',
    sub: payload.sub || 'user-123',
    iat: payload.iat || Math.floor(Date.now() / 1000),
    exp: payload.exp || (expired ? Math.floor(Date.now() / 1000) - 3600 : Math.floor(Date.now() / 1000) + 3600),
  };

  // Create a simple base64 encoded payload (not a real JWT, just for testing)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
  const signature = 'fake-signature';

  return `${header}.${body}.${signature}`;
}
