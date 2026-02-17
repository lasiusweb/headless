# KN Biosciences Headless E-Commerce Platform

## Deployment Guide

### Prerequisites

- Node.js v18+
- pnpm v8.15+
- Supabase account
- GCP account (for Cloud Run deployment)
- Docker (optional, for containerized deployment)

### Environment Variables

Create `.env` files in the following locations:

#### API (`apps/api/.env`)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Payment Gateway
EASEBUZZ_SALT=your-easebuzz-salt
EASEBUZZ_ENVIRONMENT=test

# Shipping
DELHIVERY_API_KEY=your-delhivery-api-key

# Zoho
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_ACCESS_TOKEN=your-zoho-access-token
ZOHO_ORGANIZATION_ID=your-zoho-org-id

# Notifications
SENDGRID_API_KEY=your-sendgrid-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=+14155238886

# CORS
CORS_ORIGIN=https://www.knbiosciences.in,https://agriculture.knbiosciences.in

# Server
PORT=3000
NODE_ENV=production
```

#### Web (`apps/web/.env`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.knbiosciences.in
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start all services
pnpm run dev

# Access services
# API: http://localhost:3000
# API Docs: http://localhost:3000/api
# WWW (B2B): http://localhost:3001
# Agriculture (B2C): http://localhost:3002
# Admin: http://localhost:3003
```

### Docker Deployment

```bash
# Build API container
docker build -t kn-biosciences-api ./apps/api

# Run API container
docker run -p 3000:3000 --env-file apps/api/.env kn-biosciences-api
```

### GCP Cloud Run Deployment

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/kn-biosciences-api

# Deploy to Cloud Run
gcloud run deploy kn-biosciences-api \
  --image gcr.io/PROJECT_ID/kn-biosciences-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Database Setup

1. Create a Supabase project
2. Run the schema migration:
```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f infra/db/schema.sql
```

3. Set up Row Level Security (RLS) policies:
```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f infra/db/rls_policies.md
```

### Monitoring

- **Logs**: GCP Cloud Logging
- **Metrics**: GCP Cloud Monitoring
- **Errors**: Sentry (configure SENTRY_DSN in .env)
- **Uptime**: UptimeRobot or similar

### Backup Strategy

- **Database**: Supabase automatic backups (daily)
- **Files**: GCP Cloud Storage versioning
- **Config**: Git version control

---

## API Documentation

### Base URL
- Production: `https://api.knbiosciences.in`
- Development: `http://localhost:3000`

### Authentication

All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

#### Products
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `GET /products/:slug` - Get product by slug
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)

#### Cart
- `GET /cart` - Get current cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove item
- `DELETE /cart/clear` - Clear cart

#### Orders
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `POST /orders/:id/approve` - Approve order (admin)
- `POST /orders/:id/reject` - Reject order (admin)

#### Payments
- `POST /payments/initiate` - Initiate payment
- `POST /payments/verify` - Verify payment
- `POST /payments/refund` - Process refund

#### Shipping
- `GET /shipping/rates` - Get shipping rates
- `POST /shipping/create` - Create shipment
- `GET /shipping/track/:awb` - Track shipment

#### Loyalty
- `GET /loyalty/profile` - Get loyalty profile
- `GET /loyalty/rewards` - Get available rewards
- `POST /loyalty/earn` - Earn points
- `POST /loyalty/redeem` - Redeem points
- `GET /loyalty/referral/code` - Get referral code

#### Inventory
- `GET /inventory` - List inventory
- `GET /inventory/low-stock` - Low stock alerts
- `POST /inventory/restock` - Restock inventory

#### Suppliers
- `GET /suppliers` - List suppliers
- `POST /suppliers/orders` - Create purchase order
- `POST /suppliers/orders/:id/receive` - Receive PO

#### Analytics
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/sales` - Sales analytics
- `GET /analytics/customers` - Customer analytics

### Response Format

```json
{
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   B2B Web    │   B2C Web    │   Admin      │   Mobile POS   │
│   (Next.js)  │   (Next.js)  │   (Next.js)  │   (Flutter)    │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       └──────────────┴──────┬───────┴───────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
│  Supabase   │      │    Zoho     │      │   Payment   │
│  (PostgreSQL│      │    (CRM/    │      │   Gateways  │
│   + Auth)   │      │    Books)   │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Module Structure

```
apps/api/src/modules/
├── auth/           # Authentication & JWT
├── products/       # Product catalog
├── cart/           # Shopping cart
├── orders/         # Order management
├── payments/       # Payment processing
├── shipping/       # Shipping integration
├── inventory/      # Inventory management
├── pricing/        # Role-based pricing
├── loyalty-program/# Loyalty & referrals
├── notifications/  # Email, SMS, WhatsApp
├── supplier-management/ # Procurement
├── forecasting/    # Demand forecasting
└── analytics/      # Business analytics
```

---

## Feature Checklist

### Phase 1: Foundation ✅
- [x] Monorepo setup (pnpm + Turborepo)
- [x] NestJS API scaffolding
- [x] Supabase integration
- [x] JWT authentication

### Phase 2: Catalog API ✅
- [x] Product CRUD
- [x] Category management
- [x] Swagger documentation

### Phase 3: Cart & Orders ✅
- [x] Shopping cart with GST
- [x] B2B approval workflow
- [x] Stock reservation

### Phase 4: Payments & Invoicing ✅
- [x] Payment gateway integration
- [x] GST-compliant invoices
- [x] Payment reconciliation

### Phase 5: Frontend Storefront ✅
- [x] B2B portal (www)
- [x] B2C portal (agriculture)
- [x] Shared component library

### Phase 6: Mobile POS ✅
- [x] Offline sync
- [x] Barcode scanning
- [x] Dealer dashboard

### Phase 7: Zoho & Analytics ✅
- [x] Zoho CRM/Books sync
- [x] Webhook handlers
- [x] Analytics dashboard

### Phase 8: B2C & Shipping ✅
- [x] Crop-based filtering
- [x] Carrier integration
- [x] Shipment tracking

### Phase 9: Loyalty & Notifications ✅
- [x] Points system
- [x] Referral program
- [x] Multi-channel notifications

### Phase 10: Returns & Suppliers ✅
- [x] Returns workflow
- [x] Refund processing
- [x] Purchase orders

### Phase 11: Forecasting & Dashboard ✅
- [x] Demand forecasting
- [x] Inventory recommendations
- [x] Admin dashboard

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/knbiosciences/store/issues
- Email: tech@knbiosciences.in

## License

Proprietary - KN Biosciences Pvt Ltd
