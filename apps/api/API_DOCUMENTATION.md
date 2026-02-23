# API Documentation Index

## Overview

This document provides a comprehensive index of all API endpoints for the KN Biosciences platform.

**Base URL**: `https://api.knbiosciences.in`  
**Version**: 2.0.0  
**Last Updated**: 2026-02-23

---

## Quick Links

- [Swagger Documentation](https://api.knbiosciences.in/api)
- [Authentication Guide](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints require authentication via JWT Bearer token.

### Obtaining a Token

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "dealer",
    "portal": "b2b"
  }
}
```

### Using the Token

Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Endpoints by Module

### Auth Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/refresh` | Refresh token | Yes |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |

---

### Products Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | List products | No |
| GET | `/products/:id` | Get product by ID | No |
| GET | `/products/slug/:slug` | Get product by slug | No |
| GET | `/products/search` | Search products | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

**Query Parameters**:
- `category` - Filter by category slug
- `segment` - Filter by segment slug
- `crop` - Filter by crop
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

---

### Categories Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | List categories | No |
| GET | `/categories/:id` | Get category by ID | No |
| GET | `/categories/tree` | Get category tree | No |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

---

### Cart Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get current cart | Yes |
| POST | `/cart/items` | Add item to cart | Yes |
| PATCH | `/cart/items/:id` | Update cart item | Yes |
| DELETE | `/cart/items/:id` | Remove item | Yes |
| DELETE | `/cart/clear` | Clear cart | Yes |
| POST | `/cart/apply-coupon` | Apply coupon code | Yes |

**Example - Add to Cart**:
```bash
POST /cart/items
Content-Type: application/json

{
  "variantId": "variant-uuid",
  "quantity": 2
}
```

---

### Orders Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | List user orders | Yes |
| GET | `/orders/:id` | Get order details | Yes |
| POST | `/orders` | Create order | Yes |
| POST | `/orders/:id/cancel` | Cancel order | Yes |
| GET | `/orders/:id/tracking` | Track order | Yes |
| GET | `/orders/:id/invoice` | Download invoice | Yes |
| POST | `/orders/:id/approve` | Approve order | Admin |
| POST | `/orders/:id/reject` | Reject order | Admin |

**Order Status Values**:
- `pending_approval` - Awaiting admin approval (B2B)
- `approved` - Approved by admin
- `rejected` - Rejected by admin
- `processing` - Being prepared
- `shipped` - Shipped to customer
- `delivered` - Delivered successfully
- `cancelled` - Cancelled

---

### Payments Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/initiate` | Initiate payment | Yes |
| POST | `/payments/verify` | Verify payment | Yes |
| POST | `/payments/refund` | Process refund | Admin |
| GET | `/payments/:id` | Get payment details | Yes |

**Payment Gateway Integration**:
- Easebuzz
- PayU

---

### Shipping Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/shipping/rates` | Get shipping rates | Yes |
| POST | `/shipping/create` | Create shipment | Admin |
| GET | `/shipping/track/:awb` | Track shipment | Yes |
| POST | `/shipping/cancel` | Cancel shipment | Admin |

**Carrier Integrations**:
- Delhivery
- VRL Logistics

---

### Inventory Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/inventory` | List inventory | Admin |
| GET | `/inventory/:variantId` | Get variant stock | Yes |
| GET | `/inventory/low-stock` | Low stock alerts | Admin |
| POST | `/inventory/reserve` | Reserve stock | Yes |
| POST | `/inventory/fulfill` | Fulfill reservation | Admin |
| POST | `/inventory/adjust` | Adjust stock | Admin |
| POST | `/inventory/restock` | Create restock request | Admin |

---

### Pricing Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pricing/:variantId` | Get variant pricing | Yes |
| GET | `/pricing/bulk` | Get bulk pricing | Yes |
| POST | `/pricing/rules` | Create pricing rule | Admin |
| PUT | `/pricing/rules/:id` | Update pricing rule | Admin |

**Role-Based Pricing**:
| Role | Discount |
|------|----------|
| Customer/Retailer | 0% |
| Dealer | 40% off MRP |
| Distributor | 55% off MRP |

---

### Invoices Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/invoices/:orderId` | Get invoice | Yes |
| GET | `/invoices/:id/download` | Download PDF | Yes |
| POST | `/invoices/generate` | Generate invoice | Admin |
| GET | `/invoices/gstr1` | GSTR-1 report | Admin |

**GST Breakdown**:
- CGST (Intra-state)
- SGST (Intra-state)
- IGST (Inter-state)

---

### Loyalty Program Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/loyalty/profile` | Get loyalty profile | Yes |
| GET | `/loyalty/points` | Get points balance | Yes |
| GET | `/loyalty/tiers` | Get tier benefits | Yes |
| POST | `/loyalty/earn` | Earn points | Yes |
| POST | `/loyalty/redeem` | Redeem points | Yes |
| GET | `/loyalty/rewards` | Get available rewards | Yes |
| GET | `/loyalty/referral/code` | Get referral code | Yes |
| POST | `/loyalty/referral/claim` | Claim referral | Yes |

**Tier Structure**:
| Tier | Multiplier | Benefits |
|------|------------|----------|
| Bronze | 1.0x | Base points |
| Silver | 1.2x | +20% points |
| Gold | 1.5x | +50% points, free shipping |
| Platinum | 2.0x | +100% points, priority support |

---

### Notifications Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | List notifications | Yes |
| POST | `/notifications/read` | Mark as read | Yes |
| POST | `/notifications/email` | Send email | Admin |
| POST | `/notifications/sms` | Send SMS | Admin |
| POST | `/notifications/whatsapp` | Send WhatsApp | Admin |

---

### Analytics Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/dashboard` | Dashboard metrics | Admin |
| GET | `/analytics/sales` | Sales analytics | Admin |
| GET | `/analytics/customers` | Customer analytics | Admin |
| GET | `/analytics/products` | Product analytics | Admin |
| GET | `/analytics/inventory` | Inventory analytics | Admin |

---

### Users Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | List users | Admin |
| GET | `/users/:id` | Get user details | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |
| PUT | `/users/:id/status` | Update user status | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

---

### Dealer Applications Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/dealer-applications` | Submit application | Yes |
| GET | `/dealer-applications/my-application` | Get application status | Yes |
| GET | `/dealer-applications` | List applications | Admin |
| POST | `/dealer-applications/:id/approve` | Approve application | Admin |
| POST | `/dealer-applications/:id/reject` | Reject application | Admin |

---

### Returns Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/returns` | Create return request | Yes |
| GET | `/returns/:id` | Get return details | Yes |
| POST | `/returns/:id/approve` | Approve return | Admin |
| POST | `/returns/:id/reject` | Reject return | Admin |
| POST | `/returns/:id/refund` | Process refund | Admin |

---

### Suppliers Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/suppliers` | List suppliers | Admin |
| POST | `/suppliers` | Create supplier | Admin |
| PUT | `/suppliers/:id` | Update supplier | Admin |
| POST | `/suppliers/orders` | Create purchase order | Admin |
| GET | `/suppliers/orders` | List purchase orders | Admin |
| POST | `/suppliers/orders/:id/receive` | Receive goods | Admin |

---

### Forecasting Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/forecasting/demand/:productId` | Demand forecast | Admin |
| GET | `/forecasting/recommendations` | Restock recommendations | Admin |
| GET | `/forecasting/stockout-risk` | Stockout risk analysis | Admin |

---

### Zoho Integration Module

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/zoho/sync/customers` | Sync customers to Zoho | Admin |
| POST | `/zoho/sync/invoices` | Sync invoices to Zoho Books | Admin |
| POST | `/zoho/webhooks/books` | Zoho Books webhook | Internal |
| POST | `/zoho/webhooks/crm` | Zoho CRM webhook | Internal |

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2026-02-23T10:00:00.000Z",
  "path": "/api/orders"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

| Tier | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Anonymous | 60 | 1,000 |
| Authenticated | 300 | 10,000 |
| Admin | 1,000 | 50,000 |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1645603200
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response Format**:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Filtering & Sorting

**Filter Parameters**:
- Use field names for exact match
- Use `field_gt`, `field_lt` for comparisons
- Use `field_in` for multiple values

**Sort Parameters**:
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`

**Example**:
```
GET /products?category=fertilizers&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc
```

---

## Webhooks

### Available Webhooks

| Event | Payload | Description |
|-------|---------|-------------|
| `order.created` | Order details | Triggered when order is created |
| `order.approved` | Order details | Triggered when order is approved |
| `payment.completed` | Payment details | Triggered when payment succeeds |
| `payment.failed` | Payment details | Triggered when payment fails |
| `invoice.generated` | Invoice details | Triggered when invoice is generated |

### Webhook Signature

Verify webhook signatures using the `X-Webhook-Signature` header:

```javascript
const signature = req.headers['x-webhook-signature'];
const expected = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expected) {
  throw new Error('Invalid signature');
}
```

---

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @kn/biosciences-api
```

```typescript
import { KNApi } from '@kn/biosciences-api';

const api = new KNApi({
  baseUrl: 'https://api.knbiosciences.in',
  token: 'your-jwt-token',
});

const products = await api.products.list();
```

### Python

```bash
pip install kn-biosciences-api
```

```python
from kn_biosciences import KNApi

api = KNApi(
    base_url='https://api.knbiosciences.in',
    token='your-jwt-token'
)

products = api.products.list()
```

---

## Support

- **API Documentation**: https://api.knbiosciences.in/api
- **GitHub Issues**: https://github.com/knbiosciences/store/issues
- **Email**: api-support@knbiosciences.in

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-23
