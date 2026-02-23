# Portal Routing Deployment Checklist

## Pre-Deployment Verification

### 1. Environment Variables

Ensure all required environment variables are set in **both** API and Web applications:

#### API Environment (`apps/api/.env`)
```bash
# JWT Configuration (CRITICAL)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# CORS Configuration (include all subdomains)
CORS_ORIGIN=https://knbiosciences.in,https://www.knbiosciences.in,https://agriculture.knbiosciences.in,https://admin.knbiosciences.in
```

#### Landing Page Environment (`apps/web/apps/landing/.env`)
```bash
# Portal URLs
NEXT_PUBLIC_B2B_URL=https://www.knbiosciences.in
NEXT_PUBLIC_B2C_URL=https://agriculture.knbiosciences.in
NEXT_PUBLIC_LANDING_URL=https://knbiosciences.in

# Cookie Domain (CRITICAL - must match production domain)
NEXT_PUBLIC_COOKIE_DOMAIN=.knbiosciences.in

# JWT Secret (must match API)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### B2B Portal Environment (`apps/web/apps/www/.env`)
```bash
NEXT_PUBLIC_B2B_URL=https://www.knbiosciences.in
NEXT_PUBLIC_B2C_URL=https://agriculture.knbiosciences.in
NEXT_PUBLIC_LANDING_URL=https://knbiosciences.in
NEXT_PUBLIC_COOKIE_DOMAIN=.knbiosciences.in
```

#### B2C Portal Environment (`apps/web/apps/agriculture/.env`)
```bash
NEXT_PUBLIC_B2B_URL=https://www.knbiosciences.in
NEXT_PUBLIC_B2C_URL=https://agriculture.knbiosciences.in
NEXT_PUBLIC_LANDING_URL=https://knbiosciences.in
NEXT_PUBLIC_COOKIE_DOMAIN=.knbiosciences.in
```

### 2. DNS Configuration

Verify DNS records are properly configured:

```
# Root domain (Landing Page)
@ (root)     → Cloud Run (Landing Page)

# B2B Portal
www          → Cloud Run (B2B Portal)

# B2C Portal
agriculture  → Cloud Run (B2C Portal)

# Admin Portal
admin        → Cloud Run (Admin Dashboard)

# API Subdomain
api          → Cloud Run (API)
```

### 3. SSL/TLS Certificates

- [ ] SSL certificates provisioned for all subdomains
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Certificate validity checked (not expired)

### 4. Build Verification

```bash
# Build all packages
pnpm build

# Verify no TypeScript errors in critical files:
# - apps/web/apps/landing/middleware.ts
# - apps/web/apps/landing/app/page.tsx
# - apps/web/packages/lib/src/auth.ts
# - apps/web/packages/lib/src/hooks/use-portal-preference.ts
```

### 5. Test Suite

```bash
# Run middleware tests
cd apps/web/apps/landing
pnpm test middleware.test.ts

# Run API E2E tests for portal routing
cd apps/api
pnpm test:e2e portal-routing.e2e-spec.ts
```

---

## Deployment Steps

### Step 1: Deploy API

```bash
# Navigate to API directory
cd apps/api

# Build API
pnpm build

# Deploy to Cloud Run
gcloud run deploy kn-api \
  --image gcr.io/PROJECT_ID/kn-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars JWT_SECRET=$JWT_SECRET,CORS_ORIGIN=$CORS_ORIGIN
```

### Step 2: Deploy Landing Page

```bash
# Navigate to landing page directory
cd apps/web/apps/landing

# Build landing page
pnpm build

# Deploy to Cloud Run
gcloud run deploy kn-landing \
  --image gcr.io/PROJECT_ID/kn-landing:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_B2B_URL=$NEXT_PUBLIC_B2B_URL,NEXT_PUBLIC_B2C_URL=$NEXT_PUBLIC_B2C_URL,NEXT_PUBLIC_COOKIE_DOMAIN=$NEXT_PUBLIC_COOKIE_DOMAIN
```

### Step 3: Deploy B2B Portal

```bash
# Navigate to B2B portal directory
cd apps/web/apps/www

# Build B2B portal
pnpm build

# Deploy to Cloud Run
gcloud run deploy kn-b2b \
  --image gcr.io/PROJECT_ID/kn-b2b:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Step 4: Deploy B2C Portal

```bash
# Navigate to B2C portal directory
cd apps/web/apps/agriculture

# Build B2C portal
pnpm build

# Deploy to Cloud Run
gcloud run deploy kn-b2c \
  --image gcr.io/PROJECT_ID/kn-b2c:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Post-Deployment Verification

### 1. Functional Testing

#### Guest User Flow
- [ ] Visit `https://knbiosciences.in` (landing page loads)
- [ ] Click "I'm a Dealer" card
- [ ] Verify redirect to `https://www.knbiosciences.in`
- [ ] Verify `portal_preference=b2b` cookie is set
- [ ] Visit `https://knbiosciences.in` again
- [ ] Verify auto-redirect to B2B portal (no landing page shown)
- [ ] Clear cookies
- [ ] Click "I'm a Farmer" card
- [ ] Verify redirect to `https://agriculture.knbiosciences.in`
- [ ] Verify `portal_preference=b2c` cookie is set

#### Authenticated User Flow
- [ ] Register new dealer account
- [ ] Verify JWT token contains `role: dealer` and `portal: b2b`
- [ ] Visit `https://knbiosciences.in`
- [ ] Verify auto-redirect to B2B portal
- [ ] Register new farmer account
- [ ] Verify JWT token contains `role: farmer` and `portal: b2c`
- [ ] Visit `https://knbiosciences.in`
- [ ] Verify auto-redirect to B2C portal

#### Portal Switcher
- [ ] Visit B2B portal (`https://www.knbiosciences.in`)
- [ ] Verify "Switch to Farmer Portal" link in header
- [ ] Click link and verify redirect to B2C portal
- [ ] Visit B2C portal (`https://agriculture.knbiosciences.in`)
- [ ] Verify "Switch to Dealer Portal" link in header
- [ ] Click link and verify redirect to B2B portal

#### Help Modal
- [ ] Visit `https://knbiosciences.in`
- [ ] Click "Which Portal?" link in navigation
- [ ] Verify modal opens with comparison table
- [ ] Verify FAQ section is visible
- [ ] Click "Go to B2B Dealer Portal" button
- [ ] Verify redirect to B2B portal

### 2. Accessibility Testing

- [ ] Run Lighthouse accessibility audit (target: 90+)
- [ ] Test keyboard navigation on portal cards (Tab, Enter, Space)
- [ ] Test screen reader announcements (NVDA/JAWS)
- [ ] Verify focus states are visible
- [ ] Check color contrast ratios

### 3. Performance Testing

- [ ] Run Lighthouse performance audit (target: 90+)
- [ ] Check Time to First Byte (TTFB < 200ms)
- [ ] Verify middleware execution time (< 50ms)
- [ ] Check Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### 4. Security Testing

- [ ] Verify JWT tokens are properly signed
- [ ] Test expired token rejection
- [ ] Verify cookie security attributes (SameSite, Secure, HttpOnly)
- [ ] Check CORS configuration (only allowed origins)
- [ ] Run OWASP ZAP security scan

### 5. Analytics Verification

- [ ] Open Google Analytics Debug View
- [ ] Trigger `portal_selection` event
- [ ] Verify event data includes:
  - `portal` (b2b/b2c)
  - `user_type` (authenticated/guest)
  - `user_role` (dealer/distributor/retailer/farmer/customer)
- [ ] Trigger `auto_redirect` event
- [ ] Verify event data includes:
  - `from_role`
  - `to_portal`

---

## Rollback Plan

If issues are detected post-deployment:

### Immediate Rollback (5 minutes)
```bash
# Revert to previous deployment
gcloud run services update-traffic kn-landing \
  --to-revisions=previous-revision-id=100 \
  --region us-central1
```

### DNS Rollback (if needed)
1. Update DNS records to point to previous deployment
2. Wait for DNS propagation (up to 48 hours)
3. Monitor for error reports

### Disable Middleware (Emergency)
If middleware causes issues:
1. Comment out middleware in `next.config.js`:
```javascript
// export { middleware } from './middleware'
```
2. Redeploy landing page
3. Users will see landing page without auto-redirect

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Middleware Performance**
   - Average execution time
   - Error rate
   - Cold start frequency

2. **User Experience**
   - Portal selection conversion rate
   - Auto-redirect success rate
   - Help modal open rate

3. **Security**
   - Invalid token attempts
   - Expired token rejections
   - CORS violations

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Middleware Error Rate | > 1% | > 5% |
| P95 Latency | > 100ms | > 500ms |
| Invalid Token Rate | > 10/hour | > 100/hour |
| 5xx Errors | > 0.1% | > 1% |

### Monitoring Tools

- **GCP Cloud Monitoring**: Infrastructure metrics
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking
- **Lighthouse CI**: Performance monitoring

---

## Troubleshooting Guide

### Issue: Users not being redirected

**Symptoms**: Users stay on landing page after clicking portal card

**Possible Causes**:
1. Cookie domain mismatch
2. JavaScript errors in browser console
3. Environment variables not set

**Resolution**:
```bash
# Check browser console for errors
# Verify cookie is set with correct domain
document.cookie

# Check environment variables
echo $NEXT_PUBLIC_COOKIE_DOMAIN
```

### Issue: Wrong portal redirect

**Symptoms**: Dealer redirected to B2C or vice versa

**Possible Causes**:
1. JWT token missing role claim
2. Role mapping incorrect in middleware
3. User registered with wrong role

**Resolution**:
```bash
# Decode JWT token to check claims
jwt decode <token>

# Verify role in database
SELECT role FROM profiles WHERE id = '<user_id>';
```

### Issue: Cookie not persisting

**Symptoms**: User has to select portal every visit

**Possible Causes**:
1. Cookie domain doesn't match current domain
2. SameSite attribute blocking cookie
3. Browser privacy settings

**Resolution**:
```bash
# Check cookie attributes in browser DevTools
# Application > Cookies > portal_preference

# Verify domain matches (should be .knbiosciences.in)
# Verify SameSite=Lax (not Strict or None)
```

### Issue: Help modal not opening

**Symptoms**: Clicking "Which Portal?" does nothing

**Possible Causes**:
1. React state not updating
2. Event handler not attached
3. JavaScript error

**Resolution**:
```bash
# Check browser console for errors
# Verify button has onClick handler (inspect element)
# Test in incognito mode (clear cache)
```

---

## Support Contacts

- **Technical Lead**: tech-lead@knbiosciences.in
- **DevOps**: devops@knbiosciences.in
- **Emergency Hotline**: +91-XXX-XXX-XXXX

---

**Last Updated**: 2026-02-23
**Version**: 2.0.0
**Document Owner**: Engineering Team
