# KN Biosciences - Supabase Setup

This document provides a comprehensive guide to the Supabase setup for the KN Biosciences e-commerce platform.

## Architecture Overview

The KN Biosciences platform uses Supabase as the primary database and authentication provider. The architecture includes:

- **Database**: PostgreSQL 15 with Row Level Security (RLS)
- **Authentication**: Supabase Auth with custom roles
- **Realtime**: For live updates (optional)
- **Storage**: For file uploads (optional)
- **Edge Functions**: For serverless functions (optional)

## Database Schema

The database schema includes all necessary tables for the e-commerce platform:

### Core Tables
- `profiles` - User information and roles
- `products` - Product catalog
- `product_variants` - Product variants with pricing
- `orders` - Order management
- `order_items` - Individual order items
- `carts` - Shopping carts
- `cart_items` - Cart contents
- `addresses` - User addresses
- `inventory` - Stock management
- `warehouses` - Warehouse information
- `shipping_carriers` - Shipping providers
- `shipments` - Order shipments
- `invoices` - GST-compliant invoices
- `payment_transactions` - Payment records
- `coupons` - Discount codes
- `dealer_applications` - Dealer registration
- `segments`, `categories`, `crops`, `problems` - Product classification

### Supporting Tables
- `product_batches` - Production batches
- `product_crops`, `product_problems` - Junction tables
- `pricing_tiers` - Tiered pricing
- `customer_pricing` - Custom pricing
- `pincode_serviceability` - Shipping availability
- `integration_sync_log` - Sync logs for Zoho
- `audit_log` - System audit trail

## Row Level Security (RLS)

Comprehensive RLS policies are implemented to ensure data security:

- Users can only access their own data (orders, addresses, cart, etc.)
- Business users have access to their business-specific data
- Admin users have elevated privileges
- Anonymous users have read-only access to public data (products)
- All sensitive operations require proper authentication

## Authentication & Authorization

### User Roles
- `customer` - Regular shoppers
- `dealer` - Business customers with wholesale pricing
- `distributor` - Higher-tier business customers
- `admin` - Platform administrators
- `pos_user` - POS application users

### Authentication Flow
1. User signs up/signs in via Supabase Auth
2. JWT token is issued with role information
3. Backend validates tokens and enforces role-based access
4. Frontend uses tokens to access protected resources

## API Integration

The NestJS backend connects to Supabase using the SupabaseService:

```typescript
@Injectable()
export class SomeService {
  constructor(private supabaseService: SupabaseService) {}

  async getData() {
    const { data, error } = await this.supabaseService.getClient()
      .from('some_table')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }
}
```

## Configuration

Environment variables required:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Seeding Data

The database includes seed data for:
- Product segments and categories
- Warehouses
- Pricing tiers
- Shipping carriers
- Sample coupons

## Migrations

Database migrations are handled through Supabase CLI:
1. Create migration files in `infra/db/migrations/`
2. Use `supabase db push` to apply to local database
3. Use `supabase db remote commit` to create migration for remote database

## Security Best Practices

- All database operations go through RLS policies
- Sensitive data is protected by row-level security
- JWT tokens are validated on every request
- Input validation is performed at the application level
- Audit logging tracks important operations
- Regular security reviews of RLS policies

## Performance Optimization

- Proper indexing on frequently queried columns
- Efficient queries with proper select statements
- Connection pooling through Supabase
- Caching strategies for frequently accessed data
- Pagination for large datasets

## Monitoring & Maintenance

- Regular monitoring of database performance
- Audit log reviews for security incidents
- Backup and disaster recovery procedures
- Schema evolution and migration management
- Performance tuning based on usage patterns