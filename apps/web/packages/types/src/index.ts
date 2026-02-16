// User types
export type UserRole = 'retailer' | 'dealer' | 'distributor' | 'admin' | 'regional_manager' | 'sales_head';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  business_name?: string;
  gst_number?: string;
  created_at: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  mrp: number;
  dealer_price: number;
  distributor_price: number;
  gst_rate: number;
  sku: string;
  hsn_code?: string;
  image_urls?: string[];
  is_active: boolean;
  category_id?: string;
  segment_id?: string;
  crop_ids?: string[];
  problem_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  mrp: number;
  dealer_price: number;
  distributor_price: number;
  stock_quantity: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  created_at: string;
}

export interface Segment {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Crop {
  id: string;
  name: string;
  slug: string;
  category: 'food' | 'cash' | 'plantation' | 'vegetable' | 'fruit';
  created_at: string;
}

export interface Problem {
  id: string;
  name: string;
  slug: string;
  category: 'pest' | 'disease' | 'nutrient' | 'weed';
  created_at: string;
}

// Cart types
export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  variant: ProductVariant & {
    product: Product;
  };
  created_at: string;
  updated_at: string;
}

export interface CartPricing {
  subtotal: number;
  discount: number;
  mrpTotal: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  itemCount: number;
}

// Order types
export type OrderStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_type: UserRole;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  shipping_cost: number;
  total: number;
  currency: string;
  billing_address: Address;
  shipping_address: Address;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_rate: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Invoice types
export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_name: string;
  customer_gst_number?: string;
  billing_address: Address;
  shipping_address: Address;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_taxable_amount: number;
  total_gst_amount: number;
  total_amount: number;
  issued_at: string;
  due_at: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  is_inter_state: boolean;
  created_at: string;
  updated_at: string;
}

// Payment types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  status: 'initiated' | 'completed' | 'failed' | 'refunded' | 'disputed';
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

// Inventory types
export interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  reorder_level: number;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface InventoryBatch {
  id: string;
  inventory_item_id: string;
  batch_number: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity: number;
  status: 'active' | 'expired' | 'disposed' | 'quarantined';
  created_at: string;
}

// Dealer types
export interface DealerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'proprietorship' | 'partnership' | 'private_limited' | 'llp';
  gst_number: string;
  license_number: string;
  address: Address;
  expected_turnover: number;
  credit_limit_required: boolean;
  credit_limit_amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  rejected_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
