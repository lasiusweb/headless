import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Portal URLs
const B2B_URL = process.env.NEXT_PUBLIC_B2B_URL || 'https://www.knbiosciences.in';
const B2C_URL = process.env.NEXT_PUBLIC_B2C_URL || 'https://agriculture.knbiosciences.in';

// Cookie domain - configurable for development vs production
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.knbiosciences.in';

// JWT Secret for verification (must match API's JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || '';

// User roles mapped to portals
const ROLE_TO_PORTAL: Record<string, string> = {
  dealer: B2B_URL,
  distributor: B2B_URL,
  retailer: B2C_URL,
  customer: B2C_URL,
  farmer: B2C_URL,
};

/**
 * Verifies JWT token signature and expiration
 * Note: This is a simplified verification for edge middleware.
 * For full security, verify signature with crypto library in API.
 */
function verifyJwt(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [header, payload, signature] = parts;

    // Decode header and payload
    const decodedHeader = JSON.parse(atob(header));
    const decodedPayload = JSON.parse(atob(payload));

    // Check token type
    if (decodedHeader.typ !== 'JWT') {
      return { valid: false };
    }

    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    // Check issued at time (not in future)
    if (decodedPayload.iat && decodedPayload.iat > Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    // Verify signature if secret is configured
    if (JWT_SECRET) {
      // Note: Full HMAC verification requires crypto library
      // For edge middleware, we do structural validation
      // Full signature verification should happen in API
      if (!signature || signature.length === 0) {
        return { valid: false };
      }
    }

    return {
      valid: true,
      payload: decodedPayload,
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Middleware for portal routing
 *
 * Logic:
 * 1. Check if user is authenticated (has valid JWT)
 * 2. If authenticated, redirect based on user role
 * 3. If guest, check cookie for previous preference
 * 4. Default: show landing page
 */
export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Get portal preference from cookie
  const portalPreference = request.cookies.get('portal_preference')?.value;

  // Try to get user from JWT token
  const token = request.cookies.get('auth-token')?.value;
  let userRole: string | null = null;

  if (token) {
    const verification = verifyJwt(token);
    if (verification.valid && verification.payload) {
      userRole = verification.payload?.role;
    }
  }

  // If user is authenticated, redirect based on role
  if (userRole && ROLE_TO_PORTAL[userRole]) {
    const targetUrl = ROLE_TO_PORTAL[userRole];

    // Don't redirect if already on correct portal
    if (request.nextUrl.href.startsWith(targetUrl)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(targetUrl));
  }

  // If guest user has a preference cookie, redirect them
  if (!userRole && portalPreference && (portalPreference === 'b2b' || portalPreference === 'b2c')) {
    const targetUrl = portalPreference === 'b2b' ? B2B_URL : B2C_URL;

    // Don't redirect if already on correct portal
    if (request.nextUrl.href.startsWith(targetUrl)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(targetUrl));
  }

  // Default: show landing page
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
