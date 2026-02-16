-- KN Biosciences Database Schema for Supabase
-- Complete schema with RLS, policies, and functions

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable RLS on auth tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.user_secrets ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
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
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create segments table
CREATE TABLE IF NOT EXISTS segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
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

-- Junction table for products and crops
CREATE TABLE IF NOT EXISTS product_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, crop_id)
);

-- Junction table for products and problems
CREATE TABLE IF NOT EXISTS product_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, problem_id)
);

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name TEXT,
    barcode TEXT,
    weight DECIMAL(8, 3), -- in grams
    dimensions JSONB, -- {length: number, width: number, height: number}
    mrp DECIMAL(10, 2) NOT NULL,
    dealer_price DECIMAL(10, 2) NOT NULL,
    distributor_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product batches table (production batches)
CREATE TABLE IF NOT EXISTS product_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    manufactured_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    cost_per_unit DECIMAL(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disposed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table (warehouse stock levels)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    stock_level INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (stock_level - reserved_quantity) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(variant_id, warehouse_id)
);

-- Create pricing tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('dealer', 'distributor')),
    min_quantity INTEGER NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer-specific pricing table
CREATE TABLE IF NOT EXISTS customer_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, variant_id)
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'confirmed', 'processing', 'packed', 'shipped', 'delivered')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    shipping_address_id UUID REFERENCES addresses(id),
    billing_address_id UUID REFERENCES addresses(id),
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    shipping_cost DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dealer applications table
CREATE TABLE IF NOT EXISTS dealer_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    gst_number TEXT NOT NULL,
    pan_number TEXT,
    gst_certificate_url TEXT,
    business_pan_url TEXT,
    business_address JSONB,
    annual_turnover TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,           -- 'order.status_change', 'inventory.adjustment', etc.
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create shipping carriers table
CREATE TABLE IF NOT EXISTS shipping_carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,      -- 'delhivery', 'vrl', 'tci'
    carrier_type TEXT NOT NULL CHECK (carrier_type IN ('api', 'manual_lr')),
    api_base_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES shipping_carriers(id),
    awb_number TEXT,
    lr_number TEXT,                  -- Lorry Receipt for manual transport
    tracking_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'rto')),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pincode serviceability table
CREATE TABLE IF NOT EXISTS pincode_serviceability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode TEXT NOT NULL,
    carrier_id UUID NOT NULL REFERENCES shipping_carriers(id),
    is_serviceable BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(pincode, carrier_id)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    zoho_invoice_id TEXT, -- Reference to Zoho Books invoice ID
    cgst_amount DECIMAL(12, 2) DEFAULT 0.00,
    sgst_amount DECIMAL(12, 2) DEFAULT 0.00,
    igst_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_gst_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    due_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL, -- 'easebuzz', 'payu', 'razorpay', 'stripe', 'cod'
    transaction_id TEXT UNIQUE, -- Gateway's transaction ID
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'completed', 'failed', 'refunded', 'cancelled')),
    gateway_response JSONB, -- Response from payment gateway
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(12, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(12, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create coupon usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT now()
);

-- Create integration sync log table
CREATE TABLE IF NOT EXISTS integration_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration TEXT NOT NULL, -- 'zoho_books', 'zoho_crm', etc.
    entity_type TEXT NOT NULL, -- 'order', 'invoice', 'customer', etc.
    entity_id UUID NOT NULL,
    operation TEXT NOT NULL, -- 'create', 'update', 'delete'
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT TO authenticated, anon
    USING (is_active = true);

-- Product variants policies
CREATE POLICY "Enable read access for all users" ON product_variants
    FOR SELECT TO authenticated, anon
    USING (is_active = true AND EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = product_variants.product_id 
        AND products.is_active = true
    ));

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Addresses policies
CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Carts policies
CREATE POLICY "Users can view own cart" ON carts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own cart" ON carts
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM carts 
        WHERE carts.id = cart_items.cart_id 
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM carts 
        WHERE carts.id = cart_items.cart_id 
        AND carts.user_id = auth.uid()
    ));

-- Dealer applications policies
CREATE POLICY "Users can view own dealer application" ON dealer_applications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own dealer application" ON dealer_applications
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Admin policies for full access
CREATE POLICY "Admin full access" ON profiles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin full access to products" ON products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Functions for generating order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'ORD';
    date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
    sequence_num INTEGER;
    order_number TEXT;
BEGIN
    -- Get the next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(prefix||date_part||'-')+1) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE SUBSTRING(order_number FROM 1 FOR LENGTH(prefix||date_part||'-')) = prefix||date_part||'-';

    order_number := prefix||date_part||'-'||LPAD(sequence_num::TEXT, 4, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Functions for generating invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'INV';
    date_part TEXT := TO_CHAR(NOW(), 'YYYYMM');
    sequence_num INTEGER;
    invoice_number TEXT;
BEGIN
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM LENGTH(prefix||date_part||'-')+1) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM invoices
    WHERE SUBSTRING(invoice_number FROM 1 FOR LENGTH(prefix||date_part||'-')) = prefix||date_part||'-';

    invoice_number := prefix||date_part||'-'||LPAD(sequence_num::TEXT, 4, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables that need updated_at tracking
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at 
    BEFORE UPDATE ON product_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
    BEFORE UPDATE ON addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_applications_updated_at 
    BEFORE UPDATE ON dealer_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON coupons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data
-- Segments
INSERT INTO segments (name, slug, description) VALUES
('Agriculture', 'agriculture', 'Products for farming and crop cultivation'),
('Aquaculture', 'aquaculture', 'Products for fish and aquatic farming'),
('Animal Husbandry', 'animal-husbandry', 'Products for livestock care'),
('Horticulture', 'horticulture', 'Products for garden and ornamental plants'),
('Plant Protection', 'plant-protection', 'Pesticides and protective solutions'),
('Soil Health', 'soil-health', 'Soil enhancement and nutrition products'),
('Seeds & Planting Material', 'seeds-planting', 'Quality seeds and planting materials'),
('Biofertilizers', 'biofertilizers', 'Organic and bio-based fertilizers'),
('Micro Nutrients', 'micro-nutrients', 'Trace elements and micro nutrients'),
('Growth Regulators', 'growth-regulators', 'Plant growth regulators and hormones')
ON CONFLICT (slug) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug, description) VALUES
('Fertilizers', 'fertilizers', 'Nutrient supplements for plants'),
('Pesticides', 'pesticides', 'Crop protection chemicals'),
('Herbicides', 'herbicides', 'Weed control solutions'),
('Seeds', 'seeds', 'Quality seeds for various crops'),
('Bio Products', 'bio-products', 'Biological pest control and organic solutions'),
('Growth Enhancers', 'growth-enhancers', 'Products to boost plant growth'),
('Soil Conditioners', 'soil-conditioners', 'Products to improve soil health'),
('Irrigation Equipment', 'irrigation-equipment', 'Equipment for water management')
ON CONFLICT (slug) DO NOTHING;

-- Warehouses
INSERT INTO warehouses (name, code, address, is_active) VALUES
('Main Warehouse Mumbai', 'MUM001', '{"address_line1": "123 Industrial Estate", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "country": "India"}', true),
('Regional Warehouse Bangalore', 'BLR001', '{"address_line1": "456 Tech Park", "city": "Bangalore", "state": "Karnataka", "pincode": "560001", "country": "India"}', true),
('Branch Warehouse Chennai', 'CHE001', '{"address_line1": "789 Manufacturing Hub", "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001", "country": "India"}', true)
ON CONFLICT (code) DO NOTHING;

-- Pricing tiers
INSERT INTO pricing_tiers (role, min_quantity, discount_percent, is_active) VALUES
('dealer', 10, 40.00, true),  -- 40% off for dealers with 10+ units
('distributor', 50, 45.00, true)  -- 45% off for distributors with 50+ units
ON CONFLICT (role, min_quantity) DO NOTHING;

-- Shipping carriers
INSERT INTO shipping_carriers (name, code, carrier_type, api_base_url, is_active) VALUES
('Delhivery', 'delhivery', 'api', 'https://track.delhivery.com', true),
('VRL Logistics', 'vrl', 'manual_lr', NULL, true),
('TCI Express', 'tci', 'api', 'https://api.tciexpress.com', true)
ON CONFLICT (code) DO NOTHING;

-- Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, expires_at, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 1000.00, 100, '2026-12-31', true),
('SEASON20', 'Seasonal discount', 'percentage', 20.00, 2000.00, 50, '2026-06-30', true),
('FREESHIP500', 'Free shipping on orders above ₹500', 'fixed_amount', 100.00, 500.00, 200, '2026-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_products_segment_id ON products(segment_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant_id ON cart_items(variant_id);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_carrier_id ON shipments(carrier_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);