# Database Schema Documentation

## Overview

This document provides comprehensive documentation for the KN Biosciences database schema hosted on Supabase (PostgreSQL).

**Database**: Supabase PostgreSQL 15  
**Version**: 2.0.0  
**Last Updated**: 2026-02-23

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │    segments     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │
│ first_name      │       │ slug            │
│ last_name       │       │ description     │
│ role            │       └────────┬────────┘
│ company_name    │                │
│ gst_number      │                │
└────────┬────────┘                │
         │                         │
         │        ┌────────────────▼────────┐
         │        │      categories         │
         │        ├─────────────────────────┤
         │        │ id (PK)                 │
         │        │ name                    │
         │        │ slug                    │
         │        │ parent_id (FK)          │
         │        └────────────┬────────────┘
         │                     │
         │        ┌────────────▼────────────┐
         │        │       products          │
         │        ├─────────────────────────┤
         │        │ id (PK)                 │
         │        │ name                    │
         │        │ slug                    │
         │        │ segment_id (FK)         │
         │        │ category_id (FK)        │
         │        └────────────┬────────────┘
         │                     │
         │    ┌────────────────┼────────────────┐
         │    │                │                │
         │    │    ┌───────────▼──────┐         │
         │    │    │ product_crops    │         │
         │    │    ├──────────────────┤         │
         │    │    │ product_id (FK)  │         │
         │    │    │ crop_id (FK)     │         │
         │    │    └──────────────────┘         │
         │    │                                 │
         │    │    ┌───────────▼──────┐         │
         │    │    │product_variants  │         │
         │    │    ├──────────────────┤         │
         │    │    │ id (PK)          │         │
         │    │    │ product_id (FK)  │         │
         │    │    │ sku              │         │
         │    │    │ mrp              │         │
         │    │    │ price            │         │
         │    │    └────────┬─────────┘         │
         │    │              │                  │
         │    │    ┌─────────▼──────────┐       │
         │    │    │  inventory         │       │
         │    │    ├────────────────────┤       │
         │    │    │ id (PK)            │       │
         │    │    │ variant_id (FK)    │       │
         │    │    │ warehouse_id (FK)  │       │
         │    │    │ quantity           │       │
         │    │    └────────────────────┘       │
         │    │                                 │
         │    │                                 │
┌────────▼────┴────────┐                       │
│   cart_items         │                       │
├──────────────────────┤                       │
│ id (PK)              │                       │
│ user_id (FK)         │                       │
│ variant_id (FK)      │                       │
│ quantity             │                       │
└──────────────────────┘                       │
         │                                     │
         │                                     │
┌────────▼─────────────┐      ┌────────────────▼────────┐
│      orders          │      │    order_items          │
├──────────────────────┤      ├─────────────────────────┤
│ id (PK)              │      │ id (PK)                 │
│ user_id (FK)         │      │ order_id (FK)           │
│ order_number         │      │ variant_id (FK)         │
│ status               │      │ quantity                │
│ total_amount         │      │ price                   │
│ payment_status       │      │ gst_rate                │
│ shipping_address     │      └─────────────────────────┘
└──────────────────────┘
         │
         │
┌────────▼─────────────┐      ┌────────────────┐
│     payments         │      │   invoices     │
├──────────────────────┤      ├────────────────┤
│ id (PK)              │      │ id (PK)        │
│ order_id (FK)        │      │ order_id (FK)  │
│ amount               │      │ invoice_number │
│ status               │      │ gst_breakdown  │
│ transaction_id       │      │ pdf_url        │
└──────────────────────┘      └────────────────┘
```

---

## Core Tables

### 1. profiles

User profile information extending Supabase auth.users

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'dealer', 'distributor', 'admin', 'pos_user')),
    company_name TEXT,
    gst_number TEXT,
    pan_number TEXT,
    gst_certificate_url TEXT,
    business_pan_url TEXT,
    business_address JSONB,
    annual_turnover TEXT,
    credit_limit DECIMAL(10, 2) DEFAULT 0.00,
    credit_used DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| email | TEXT | User email (unique) |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| phone | TEXT | Contact number |
| role | TEXT | User role (customer/dealer/distributor/admin/pos_user) |
| company_name | TEXT | Business name (for dealers) |
| gst_number | TEXT | GST identification number |
| credit_limit | DECIMAL | Maximum credit allowed |
| status | TEXT | Account status |

**RLS Policies**:
- Users can view their own profile
- Admins can view all profiles
- Dealers can view distributor profiles

---

### 2. segments

Product segments (e.g., Fertilizers, Pesticides, Growth Enhancers)

```sql
CREATE TABLE segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. categories

Product categories with hierarchical support

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Hierarchy Example**:
```
Fertilizers (parent_id: NULL)
├── NPK Fertilizers (parent_id: Fertilizers.id)
├── Micronutrients (parent_id: Fertilizers.id)
└── Organic Fertilizers (parent_id: Fertilizers.id)
```

---

### 4. crops

Crops supported by products

```sql
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. problems

Agricultural problems addressed by products

```sql
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. products

Main product catalog

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    segment_id UUID NOT NULL REFERENCES segments(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7. product_crops

Junction table for products and crops (many-to-many)

```sql
CREATE TABLE product_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, crop_id)
);
```

---

### 8. product_variants

Product variants with pricing

```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name TEXT,
    mrp DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    dealer_price DECIMAL(10, 2),
    distributor_price DECIMAL(10, 2),
    size TEXT,
    unit TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Pricing Hierarchy**:
| Role | Price Field | Discount |
|------|-------------|----------|
| Retail/Customer | price | 0% |
| Dealer | dealer_price | 40% off MRP |
| Distributor | distributor_price | 55% off MRP |

---

### 9. inventory

Stock levels by warehouse

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    batch_number TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(variant_id, warehouse_id, batch_number)
);
```

---

### 10. warehouses

Warehouse locations

```sql
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address JSONB NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 11. cart_items

Shopping cart items

```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);
```

---

### 12. orders

Order header

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    gst_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping_charges DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Order Status Flow**:
```
pending_approval → approved → processing → shipped → delivered
                      ↓
                  rejected / cancelled
```

---

### 13. order_items

Order line items

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    gst_rate DECIMAL(5, 2) NOT NULL,
    cgst_amount DECIMAL(10, 2) NOT NULL,
    sgst_amount DECIMAL(10, 2) NOT NULL,
    igst_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 14. payments

Payment transactions

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 15. invoices

GST-compliant invoices

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date TIMESTAMPTZ DEFAULT NOW(),
    gst_breakdown JSONB NOT NULL,
    cgst_total DECIMAL(10, 2) NOT NULL,
    sgst_total DECIMAL(10, 2) NOT NULL,
    igst_total DECIMAL(10, 2) DEFAULT 0,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 16. loyalty_profiles

Loyalty program membership

```sql
CREATE TABLE loyalty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    redeemed_points INTEGER NOT NULL DEFAULT 0,
    referral_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 17. stock_reservations

Inventory reservations for orders

```sql
CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    order_id UUID REFERENCES orders(id),
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Product search
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_segment ON products(segment_id);
CREATE INDEX idx_products_active ON products(is_active);

-- Variant lookups
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Inventory
CREATE INDEX idx_inventory_variant ON inventory(variant_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);

-- Payments
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Cart
CREATE INDEX idx_cart_user ON cart_items(user_id);

-- Loyalty
CREATE INDEX idx_loyalty_user ON loyalty_profiles(user_id);
CREATE INDEX idx_loyalty_referral ON loyalty_profiles(referral_code);

-- Reservations
CREATE INDEX idx_reservations_variant ON stock_reservations(variant_id);
CREATE INDEX idx_reservations_expires ON stock_reservations(expires_at);
CREATE INDEX idx_reservations_status ON stock_reservations(status);
```

---

## Triggers

### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS)

### Example RLS Policies

```sql
-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Products: Anyone can view active products
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Cart: Users can only manage their own cart
CREATE POLICY "Users can manage own cart"
    ON cart_items FOR ALL
    USING (auth.uid() = user_id);

-- Inventory: Only admins can modify inventory
CREATE POLICY "Admins can modify inventory"
    ON inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

---

## Functions

### Generate Order Number

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('orders_sequence')::TEXT, 4, '0')
    INTO order_num;
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;
```

### Calculate Loyalty Points

```sql
CREATE OR REPLACE FUNCTION calculate_loyalty_points(order_amount DECIMAL, user_tier TEXT)
RETURNS INTEGER AS $$
DECLARE
    base_points INTEGER;
    multiplier DECIMAL;
BEGIN
    base_points := FLOOR(order_amount * 0.01); -- 1% of order amount
    
    CASE user_tier
        WHEN 'bronze' THEN multiplier := 1.0;
        WHEN 'silver' THEN multiplier := 1.2;
        WHEN 'gold' THEN multiplier := 1.5;
        WHEN 'platinum' THEN multiplier := 2.0;
        ELSE multiplier := 1.0;
    END CASE;
    
    RETURN FLOOR(base_points * multiplier);
END;
$$ LANGUAGE plpgsql;
```

---

## Seed Data

See `seed.sql` for initial data population including:
- Sample segments, categories, crops, problems
- Demo products and variants
- Test users with different roles
- Sample warehouses

---

## Migrations

Migrations are managed using Flyway. See `migrations/` directory:

```
migrations/
├── V1__initial_schema.sql
├── V2__add_loyalty_program.sql
├── V3__add_stock_reservations.sql
└── V4__add_portal_preferences.sql
```

---

## Support

For schema questions or changes:
- Database Team: db-team@knbiosciences.in
- GitHub Issues: https://github.com/knbiosciences/store/issues

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-23
