export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  customerType: 'retailer' | 'dealer' | 'distributor';
  customerInfo: CustomerInfo;
  billingAddress: Address;
  shippingAddress: Address;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  discount: number;
  shippingCost: number;
  total: number;
  currency: string;
  gstin: string; // Customer's GSTIN
  supplyPlace: string; // State code for GST calculation
  invoiceDate: Date;
  dueDate: Date;
  status: 'draft' | 'generated' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  termsAndConditions?: string;
  qrCodeData?: string; // For QR code containing invoice info
  generatedBy: string;
  sentAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  gstin?: string; // Customer's GSTIN
  pan?: string; // Customer's PAN
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  hsnCode: string; // Harmonized System Nomenclature code for GST
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxableValue: number;
  gstRate: number; // GST rate percentage (e.g., 5, 12, 18, 28)
  gstAmount: number;
  total: number;
}

export interface GstTaxBreakup {
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGstAmount: number;
}

export interface GstComplianceReport {
  id: string;
  period: string; // Format: YYYY-MM
  totalInvoices: number;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  filingStatus: 'pending' | 'submitted' | 'verified';
  submittedAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}