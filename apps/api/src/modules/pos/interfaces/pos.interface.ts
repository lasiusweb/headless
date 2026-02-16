export interface PosDevice {
  id: string;
  name: string;
  deviceId: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastSyncAt?: Date;
  batteryLevel?: number;
  storageUsed?: number;
  storageTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PosSession {
  id: string;
  userId: string;
  deviceId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'paused' | 'closed';
  totalSales?: number;
  totalTransactions?: number;
}

export interface PosTransaction {
  id: string;
  sessionId: string;
  transactionType: 'sale' | 'return' | 'refund';
  items: PosTransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  paymentStatus: 'pending' | 'completed' | 'failed';
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date; // When the transaction was synced to the main system
  isOffline: boolean; // Whether the transaction was created offline
}

export interface PosTransactionItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  total: number;
}

export interface PosProduct {
  id: string;
  name: string;
  sku: string;
  hsnCode: string;
  category: string;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  barcode?: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface PosCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  creditLimit?: number;
  currentBalance?: number;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface PosInventoryAdjustment {
  id: string;
  productId: string;
  adjustmentType: 'addition' | 'reduction' | 'damage' | 'theft';
  quantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: Date;
  notes?: string;
}

export interface PosSyncLog {
  id: string;
  entityType: 'transaction' | 'product' | 'customer' | 'inventory-adjustment';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  status: 'pending' | 'synced' | 'failed';
  errorMessage?: string;
  syncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}