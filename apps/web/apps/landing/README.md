# KN Biosciences Landing Page

Unified landing page that routes users to the appropriate portal (B2B or B2C) based on their role and preferences.

## Features

- **Smart Routing**: Automatically redirects users based on authentication status and user role
- **Guest Preference**: Remembers guest user preferences via localStorage and cookies
- **Role-Based Access**: 
  - Dealers & Distributors → B2B Portal (`www.knbiosciences.in`)
  - Farmers & Retail Customers → B2C Portal (`agriculture.knbiosciences.in`)
- **Responsive Design**: Mobile-optimized landing page with clear CTAs
- **SEO Optimized**: Comprehensive metadata and structured data for search engines

## Architecture

```
┌─────────────────────────────────────────┐
│         User Visits Landing Page        │
└─────────────────┬───────────────────────┘
                  │
         ┌────────▼────────┐
         │  Check Auth     │
         │  (JWT Token)    │
         └────────┬────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌─────────┐              ┌──────────┐
│ Logged  │              │  Guest   │
│   In    │              │  User    │
└────┬────┘              └────┬─────┘
     │                        │
     ▼                        ▼
┌─────────────────┐   ┌───────────────────┐
│ Check Role      │   │ Check Cookie      │
│ → Redirect      │   │ → Redirect        │
└─────────────────┘   └─────────┬─────────┘
                                │
                                ▼
                       ┌───────────────────┐
                       │ Show Landing Page │
                       │ with Portal Cards │
                       └───────────────────┘
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Portal URLs
NEXT_PUBLIC_B2B_URL=http://localhost:3001
NEXT_PUBLIC_B2C_URL=http://localhost:3002
NEXT_PUBLIC_LANDING_URL=http://localhost:3000

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
# Navigate to landing page directory
cd apps/web/apps/landing

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Access at `http://localhost:3000`

## User Roles & Routing

| Role | Portal | URL |
|------|--------|-----|
| `dealer` | B2B | www.knbiosciences.in |
| `distributor` | B2B | www.knbiosciences.in |
| `retailer` | B2C | agriculture.knbiosciences.in |
| `customer` | B2C | agriculture.knbiosciences.in |
| `farmer` | B2C | agriculture.knbiosciences.in |
| `admin` | Admin | admin.knbiosciences.in |

## Middleware Logic

The middleware (`middleware.ts`) runs on the edge and handles routing:

1. **Authenticated Users**: Checks JWT token for role claim
2. **Guest Users**: Checks `portal_preference` cookie
3. **New Users**: Shows landing page with portal selection

### Cookie Format

```
portal_preference=b2b|b2c; Max-Age=2592000; Path=/; Domain=.knbiosciences.in
```

## Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

## File Structure

```
landing/
├── app/
│   ├── globals.css
│   ├── layout.tsx      # Root layout with SEO
│   └── page.tsx        # Landing page component
├── middleware.ts       # Edge routing logic
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── middleware.test.ts  # Unit tests
```

## Integration with Other Portals

### B2B Portal (www)

The B2B portal should check for authenticated dealer/distributor users:

```typescript
// In www app middleware or layout
if (user?.role === 'dealer' || user?.role === 'distributor') {
  // Allow access
} else {
  // Redirect to landing or B2C
}
```

### B2C Portal (agriculture)

The B2C portal should check for retailer/customer users:

```typescript
// In agriculture app middleware or layout
if (user?.role === 'retailer' || user?.role === 'customer') {
  // Allow access
} else {
  // Redirect to landing or B2B
}
```

## Analytics Integration

Track portal selection events:

```typescript
// In page.tsx handlePortalSelect
const handlePortalSelect = (portal: 'b2b' | 'b2c') => {
  // Track event
  gtag('event', 'portal_selection', {
    portal,
    user_type: isAuthenticated ? 'authenticated' : 'guest',
    user_role: user?.role || 'none',
  });
  
  // ... rest of selection logic
};
```

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast color scheme
- Mobile-friendly touch targets

## Performance

- Edge middleware for fast routing
- Static generation for landing page
- Lazy loading for non-critical assets
- Optimized images and icons

## Security

- JWT token validation
- Secure cookie attributes (SameSite, HttpOnly)
- CORS configuration for subdomains
- Rate limiting on API endpoints

## Troubleshooting

### Users not being redirected

1. Check JWT token has `role` claim
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure cookies are being set properly

### Landing page shows for authenticated users

1. Verify auth token is being sent in cookies
2. Check token expiration
3. Ensure role mapping is correct in middleware

## Support

For issues or questions:
- GitHub Issues: https://github.com/knbiosciences/store/issues
- Email: tech@knbiosciences.in
