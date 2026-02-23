# B2B/D2C Portal Routing Implementation Summary

## Overview

This document summarizes the implementation of the unified landing page and smart routing system for KN Biosciences' B2B and B2C portals.

## What Was Implemented

### 1. Landing Page Application (`apps/web/apps/landing`)

A new Next.js application that serves as the entry point for all users:

- **Dual-path hero section** with clear CTAs for dealers and farmers
- **Responsive design** optimized for mobile and desktop
- **Trust indicators** and feature highlights
- **SEO-optimized** with comprehensive metadata

### 2. Smart Routing Middleware

Edge middleware that automatically routes users based on:

- **Authentication status** (JWT token validation)
- **User role** (dealer, distributor, retailer, customer)
- **Stored preferences** (localStorage + cookies)

### 3. User Preference Hook

A React hook (`usePortalPreference`) for managing portal preferences:

- Persists to localStorage and cookies
- Server-side compatible cookie parsing
- Clear/clear functionality

### 4. Enhanced JWT Claims

Updated auth module to include portal information in JWT tokens:

- `role` claim for user type
- `portal` claim for target portal (b2b/b2c)
- Backward compatible with existing tokens

### 5. Environment Configuration

Updated environment files across all applications:

- Portal URLs (B2B, B2C, Landing)
- CORS configuration for all subdomains
- Consistent variable naming

## File Changes

### New Files Created

```
apps/web/apps/landing/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── middleware.ts
├── middleware.test.ts
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md

apps/web/packages/lib/src/hooks/
├── use-portal-preference.ts
└── use-portal-preference.test.ts
```

### Modified Files

```
apps/api/src/modules/auth/
├── auth.service.ts (added portal claim)
└── strategies/jwt.strategy.ts (added portal validation)

apps/web/packages/lib/src/hooks/index.ts (exported new hook)

apps/web/apps/www/next.config.js (added portal URLs)
apps/web/apps/agriculture/next.config.js (added portal URLs)
apps/web/.env.example (added portal URLs)
apps/api/.env.example (updated CORS)
```

## User Flow

### First-Time Visitor (Guest)

1. Visits `knbiosciences.in`
2. Sees landing page with two portal cards
3. Clicks "I'm a Dealer" or "I'm a Farmer"
4. Preference stored in localStorage + cookie
5. Redirected to appropriate portal
6. Future visits auto-redirect based on cookie

### Returning Visitor (Guest)

1. Visits `knbiosciences.in`
2. Middleware detects cookie preference
3. Auto-redirected to chosen portal
4. Landing page briefly shown during redirect

### Authenticated User

1. Visits any portal
2. Middleware validates JWT token
3. Extracts user role from token
4. Auto-redirects based on role:
   - Dealer/Distributor → B2B
   - Retailer/Customer → B2C
5. No landing page shown (seamless experience)

## Role Mapping

| Role | Portal | Subdomain | Discount |
|------|--------|-----------|----------|
| `dealer` | B2B | www | 40% off MRP |
| `distributor` | B2B | www | 55% off MRP |
| `retailer` | B2C | agriculture | Retail pricing |
| `customer` | B2C | agriculture | Retail pricing |
| `farmer` | B2C | agriculture | Retail pricing |
| `admin` | Admin | admin | N/A |

## Testing

### Unit Tests

```bash
# Test middleware logic
cd apps/web/apps/landing
pnpm test middleware.test.ts

# Test hook
cd apps/web/packages/lib
pnpm test use-portal-preference.test.ts
```

### Manual Testing Checklist

- [ ] Guest user sees landing page
- [ ] Guest can select B2B portal
- [ ] Guest can select B2C portal
- [ ] Guest preference persists across sessions
- [ ] Dealer auto-redirects to B2B
- [ ] Farmer auto-redirects to B2C
- [ ] Clear preference functionality works
- [ ] Mobile responsive design works
- [ ] SEO metadata is correct

## Deployment

### Environment Setup

Production environment variables required:

```bash
# Landing Page
NEXT_PUBLIC_B2B_URL=https://www.knbiosciences.in
NEXT_PUBLIC_B2C_URL=https://agriculture.knbiosciences.in
NEXT_PUBLIC_LANDING_URL=https://knbiosciences.in

# API CORS
CORS_ORIGIN=https://knbiosciences.in,https://www.knbiosciences.in,https://agriculture.knbiosciences.in,https://admin.knbiosciences.in
```

### DNS Configuration

Required DNS records:

```
@ (root)     → Landing Page (Cloud Run)
www          → B2B Portal (Cloud Run)
agriculture  → B2C Portal (Cloud Run)
admin        → Admin Dashboard (Cloud Run)
```

### Build Commands

```bash
# Build all applications
pnpm run build

# Build landing page only
cd apps/web/apps/landing
pnpm run build

# Deploy to Cloud Run
gcloud run deploy kn-landing \
  --image gcr.io/PROJECT_ID/landing \
  --region us-central1 \
  --allow-unauthenticated
```

## Security Considerations

1. **JWT Validation**: Middleware validates token structure
2. **Cookie Security**: SameSite=Lax, domain-scoped
3. **CORS**: Explicit subdomain whitelist
4. **Rate Limiting**: API-level protection
5. **HTTPS**: Required for production

## Performance Optimizations

1. **Edge Middleware**: Runs at CDN edge for low latency
2. **Static Generation**: Landing page is pre-rendered
3. **Cookie Caching**: Preference cached in browser
4. **Minimal Dependencies**: Lightweight landing page

## Monitoring & Analytics

Recommended tracking events:

```javascript
// Portal selection
gtag('event', 'portal_selection', {
  portal: 'b2b' | 'b2c',
  user_type: 'authenticated' | 'guest',
  user_role: 'dealer' | 'distributor' | 'retailer' | 'customer',
});

// Auto-redirect
gtag('event', 'auto_redirect', {
  from_role: 'dealer',
  to_portal: 'b2b',
});
```

## Troubleshooting

### Common Issues

**Issue**: Users stuck on landing page
- **Solution**: Check JWT token has `role` claim

**Issue**: Cookie not persisting
- **Solution**: Verify domain configuration matches

**Issue**: CORS errors
- **Solution**: Add subdomain to `CORS_ORIGIN`

**Issue**: Wrong portal redirect
- **Solution**: Check role mapping in auth service

## Future Enhancements

1. **A/B Testing**: Test different landing page copy
2. **Geo-routing**: Route based on user location
3. **Language Selection**: Hindi/English toggle
4. **Progressive Web App**: Offline landing page
5. **Chat Widget**: Pre-sales support

## Rollback Plan

If issues occur:

1. Revert DNS to previous configuration
2. Deploy previous landing page version
3. Disable middleware in Next.js config
4. Fall back to separate domain entry points

## Support & Documentation

- Landing Page README: `apps/web/apps/landing/README.md`
- API Documentation: `apps/api/README.md`
- Main README: `README.md`
- Issues: GitHub Issues

---

**Implementation Date**: 2026-02-18
**Version**: 1.0.0
**Status**: ✅ Complete
