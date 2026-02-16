// Shared TypeScript interfaces for KN Biosciences
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'dealer' | 'distributor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  segmentId: string;
  categoryId: string;
  cropIds: string[];
  problemIds: string[];
  mrp: number;
  dealerPrice: number;
  distributorPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  mrp: number;
  dealerPrice: number;
  distributorPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  id: string;
  variantId: string;
  warehouseId: string;
  stockLevel: number;
  reservedQuantity: number;
  availableQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBatch {
  id: string;
  variantId: string;
  batchNumber: string;
  manufacturedDate: Date;
  expiryDate: Date;
  quantity: number;
  costPerUnit: number;
  status: 'active' | 'expired' | 'disposed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Segment {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Crop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Problem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}