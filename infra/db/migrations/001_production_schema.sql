-- ===========================================
-- KN Biosciences Production Database Setup
-- ===========================================
-- This script creates the complete database schema for production deployment
-- Run this on your Supabase project's SQL editor

-- ===========================================
-- 1. Enable Required Extensions
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ===========================================
-- 2. Create Enums
-- ===========================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'retailer',
  'dealer',
  'distributor',
  'customer',
  'farmer',
  'admin'
);

-- Order status
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'initiated',
  'completed',
  'failed',
  'refunded',
  'partial_refunded'
);

-- Dealer application status
CREATE TYPE application_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'under_review'
);

-- ===========================================
-- 3. Create Base Tables
-- ===========================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'customer',
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crops
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segments
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  crop_ids UUID[] REFERENCES crops(id),
  problem_ids UUID[] REFERENCES problems(id),
  mrp DECIMAL(10, 2) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  gst_rate DECIMAL(5, 2) DEFAULT 18.00,
  hsn_code VARCHAR(20),
  images VARCHAR(500)[],
  specifications JSONB,
  usage_instructions TEXT,
  warnings TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  size VARCHAR(50),
  pack_size VARCHAR(50),
  mrp DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Batches (FIFO tracking)
CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  reserved_quantity INTEGER DEFAULT 0,
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  manufacture_date DATE,
  expiry_date DATE,
  warehouse_location VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  total_amount DECIMAL(12, 2) DEFAULT 0,
  gst_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  grand_total DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  gst_rate DECIMAL(5, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(500) NOT NULL,
  address_line2 VARCHAR(500),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  landmark VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  address_type VARCHAR(20) DEFAULT 'shipping',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(12, 2) NOT NULL,
  gst_amount DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  grand_total DECIMAL(12, 2) NOT NULL,
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  billing_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_transaction_id VARCHAR(255),
  notes TEXT,
  dealer_approval_status application_status DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  gst_rate DECIMAL(5, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  batch_id UUID REFERENCES inventory_batches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,
  failure_reason TEXT,
  refunded_amount DECIMAL(12, 2) DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  carrier VARCHAR(100),
  tracking_number VARCHAR(255),
  awb_number VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  shipped_from VARCHAR(255),
  shipped_to TEXT,
  estimated_delivery DATE,
  actual_delivery DATE,
  shipping_label_url VARCHAR(500),
  manifest_url VARCHAR(500),
  tracking_events JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE DEFAULT NOW(),
  invoice_type VARCHAR(50) DEFAULT 'tax',
  gst_details JSONB,
  invoice_url VARCHAR(500),
  is_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer Applications
CREATE TABLE IF NOT EXISTS dealer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  business_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  expected_monthly_volume DECIMAL(12, 2),
  documents VARCHAR(500)[],
  status application_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Program
CREATE TABLE IF NOT EXISTS loyalty_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  points_balance INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze',
  tier_benefits JSONB,
  referral_code VARCHAR(50) UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES loyalty_profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Returns
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  return_reason TEXT NOT NULL,
  return_status VARCHAR(50) DEFAULT 'pending',
  refund_amount DECIMAL(12, 2),
  refund_status payment_status DEFAULT 'pending',
  pickup_scheduled BOOLEAN DEFAULT false,
  pickup_date DATE,
  received_at TIMESTAMP WITH TIME ZONE,
  inspected_at TIMESTAMP WITH TIME ZONE,
  inspection_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  channel VARCHAR(50) DEFAULT 'in_app',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 4. Create Indexes
-- ===========================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);

-- Product Variants
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- Inventory
CREATE INDEX idx_inventory_variant ON inventory_batches(variant_id);
CREATE INDEX idx_inventory_batch ON inventory_batches(batch_number);
CREATE INDEX idx_inventory_status ON inventory_batches(status);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Payments
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Shipments
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Analytics
CREATE INDEX idx_analytics_event ON analytics_events(event_name);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- ===========================================
-- 5. Create Functions and Triggers
-- ===========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_order
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_invoice
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- Create loyalty profile on user creation
CREATE OR REPLACE FUNCTION create_loyalty_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO loyalty_profiles (user_id, referral_code)
  VALUES (NEW.id, 'REF-' || UPPER(SUBSTRING(NEW.email FROM 1 FOR 6)) || '-' || NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_user
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_loyalty_profile();

-- ===========================================
-- 6. Row Level Security (RLS) Policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY users_view_own ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = auth_id);

-- Products are public (read-only)
CREATE POLICY products_view_all ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Users can view their own orders
CREATE POLICY orders_view_own ON orders
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Users can create their own orders
CREATE POLICY orders_create_own ON orders
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Users can view their own notifications
CREATE POLICY notifications_view_own ON notifications
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ===========================================
-- 7. Create Views
-- ===========================================

-- Product catalog view
CREATE OR REPLACE VIEW product_catalog AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  s.name as segment_name,
  ARRAY_AGG(DISTINCT pv.sku) as variant_skus,
  MIN(pv.price) as min_price,
  MAX(pv.price) as max_price,
  SUM(pv.stock_quantity) as total_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN segments s ON p.segment_id = s.id
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.is_active = true
GROUP BY p.id, c.name, c.slug, s.name;

-- Order summary view
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.*,
  u.name as user_name,
  u.email as user_email,
  u.phone as user_phone,
  COUNT(oi.id) as item_count,
  p.status as payment_status,
  s.tracking_number as shipment_tracking
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN payments p ON o.id = p.order_id
LEFT JOIN shipments s ON o.id = s.order_id
GROUP BY o.id, u.name, u.email, u.phone, p.status, s.tracking_number;

-- Inventory status view
CREATE OR REPLACE VIEW inventory_status AS
SELECT 
  pv.id as variant_id,
  pv.sku,
  p.name as product_name,
  SUM(ib.available_quantity) as available_stock,
  SUM(ib.reserved_quantity) as reserved_stock,
  SUM(ib.quantity) as total_stock,
  MIN(ib.expiry_date) as earliest_expiry,
  COUNT(ib.id) as batch_count
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
LEFT JOIN inventory_batches ib ON pv.id = ib.variant_id AND ib.status = 'active'
GROUP BY pv.id, pv.sku, p.name;

-- ===========================================
-- 8. Insert Seed Data
-- ===========================================

-- Default admin user (update with real email after deployment)
INSERT INTO users (email, name, role, is_verified, is_active)
VALUES ('admin@knbiosciences.in', 'System Admin', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Default categories
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
  ('Insecticides', 'insecticides', 'Crop protection from insects', 1, true),
  ('Fungicides', 'fungicides', 'Disease control for crops', 2, true),
  ('Herbicides', 'herbicides', 'Weed control solutions', 3, true),
  ('Plant Growth Regulators', 'plant-growth-regulators', 'Growth enhancement products', 4, true),
  ('Biopesticides', 'biopesticides', 'Organic pest control', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Default segments
INSERT INTO segments (name, slug, description, is_active) VALUES
  ('Field Crops', 'field-crops', 'Products for field crop cultivation', true),
  ('Horticulture', 'horticulture', 'Products for fruits and vegetables', true),
  ('Plantation Crops', 'plantation-crops', 'Products for plantation crops', true)
ON CONFLICT (slug) DO NOTHING;

-- Default crops
INSERT INTO crops (name, slug, description, is_active) VALUES
  ('Cotton', 'cotton', 'Cotton crop', true),
  ('Rice', 'rice', 'Rice/paddy crop', true),
  ('Wheat', 'wheat', 'Wheat crop', true),
  ('Sugarcane', 'sugarcane', 'Sugarcane crop', true),
  ('Tomato', 'tomato', 'Tomato crop', true),
  ('Chilli', 'chilli', 'Chilli crop', true)
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- 9. Grant Permissions
-- ===========================================

-- Grant permissions to authenticated users
GRANT SELECT ON products, categories, crops, segments, problems TO authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;

-- ===========================================
-- End of Schema
-- ===========================================
