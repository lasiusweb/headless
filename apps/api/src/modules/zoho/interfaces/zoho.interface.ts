export interface ZohoConnection {
  id: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes: string[];
  connectedAt: Date;
  updatedAt: Date;
}

export interface ZohoContact {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  gst_treatment: 'business_gst' | 'business_ugst' | 'consumer';
  gst_no: string;
  tax_preference: string;
  payment_terms: number;
  payment_terms_label: string;
  currency_id: string;
  price_precision: number;
  outstanding_receivable_amount: number;
  outstanding_payable_amount: number;
  created_time: Date;
  last_modified_time: Date;
}

export interface ZohoItem {
  id: string;
  name: string;
  description: string;
  unit: string;
  rate: number;
  purchase_rate: number;
  sku: string;
  hsn_or_sac: string;
  tax_id: string;
  tax_percentage: number;
  stock_on_hand: number;
  created_time: Date;
  last_modified_time: Date;
}

export interface ZohoInvoice {
  id: string;
  invoice_number: string;
  reference_number: string;
  customer_id: string;
  contact_name: string;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid';
  date: Date;
  due_date: Date;
  payment_terms: number;
  payment_terms_label: string;
  discount: number;
  discount_type: 'item_level' | 'document_level';
  is_discount_before_tax: boolean;
  discount_scheme_id: string;
  markup_tax: boolean;
  salesperson_name: string;
  template_id: string;
  template_name: string;
  exchange_rate: number;
  is_inclusive_tax: boolean;
  recurring_invoice_id: string;
  notes: string;
  terms: string;
  custom_fields: Array<{
    id: string;
    index: number;
    value: string;
  }>;
  line_items: ZohoLineItem[];
  tax_total: number;
  sub_total: number;
  total: number;
  credits_applied: number;
  tax_amount_withheld: number;
  amount_paid: number;
  amount_due: number;
  is_emailed: boolean;
  last_emailed_time: Date;
  billing_address: ZohoAddress;
  shipping_address: ZohoAddress;
  created_time: Date;
  last_modified_time: Date;
}

export interface ZohoLineItem {
  item_id: string;
  name: string;
  description: string;
  item_order: number;
  rate: number;
  unit: string;
  quantity: number;
  discount_amount: number;
  discount_percentage: number;
  tax_id: string;
  tax_name: string;
  tax_percentage: number;
  tax_type: string;
  tax_on_amount: number;
  line_total: number;
  hsn_or_sac: string;
  tax_id: string;
}

export interface ZohoAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  fax: string;
}

export interface ZohoSyncLog {
  id: string;
  entity: 'contact' | 'item' | 'invoice' | 'order';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  status: 'pending' | 'synced' | 'failed';
  errorMessage?: string;
  syncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  organizationId: string;
  scopes: string[];
}