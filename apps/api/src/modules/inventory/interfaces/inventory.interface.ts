export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  hsnCode: string;
  category: string;
  brand?: string;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  committedStock: number;
  reorderLevel: number;
  maxStockLevel?: number;
  location: string;
  binLocation?: string;
  supplierId?: string;
  supplierName?: string;
  lastRestockedAt?: Date;
  nextReorderDate?: Date;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface InventoryBatch {
  id: string;
  inventoryItemId: string;
  batchNumber: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  receivedDate: Date;
  quantity: number;
  costPerUnit: number;
  sellingPricePerUnit: number;
  status: 'active' | 'expired' | 'disposed' | 'quarantined';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  batchId?: string;
  transactionType: 'receipt' | 'issue' | 'adjustment' | 'transfer' | 'damage' | 'theft' | 'expiry';
  quantity: number;
  unitCost?: number;
  totalValue?: number;
  referenceId?: string; // Order ID, Transfer ID, etc.
  notes?: string;
  processedBy: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  items: InventoryTransferItem[];
  status: 'requested' | 'approved' | 'in-transit' | 'delivered' | 'received';
  requestedBy: string;
  approvedBy?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  receivedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransferItem {
  id: string;
  inventoryItemId: string;
  batchId?: string;
  quantity: number;
  unitCost?: number;
  totalValue?: number;
}

export interface ExpiryAlert {
  id: string;
  inventoryItemId: string;
  batchId: string;
  productName: string;
  batchNumber: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  alertLevel: 'warning' | 'critical'; // Warning: 30+ days, Critical: <30 days
  status: 'active' | 'resolved' | 'expired';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface InventoryAudit {
  id: string;
  inventoryItemId: string;
  batchId?: string;
  auditorId: string;
  auditorName: string;
  physicalCount: number;
  systemCount: number;
  variance: number; // physicalCount - systemCount
  notes?: string;
  status: 'pending' | 'completed';
  conductedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReorderPoint {
  id: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  reorderLevel: number;
  reorderQuantity: number;
  supplierId: string;
  supplierName: string;
  leadTime: number; // in days
  safetyStock: number;
  status: 'normal' | 'low-stock' | 'critical';
  lastOrderedAt?: Date;
  nextOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockReservation {
  id: string;
  inventoryItemId: string;
  orderId: string;
  customerId: string;
  quantity: number;
  reservedAt: Date;
  expiresAt: Date;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}