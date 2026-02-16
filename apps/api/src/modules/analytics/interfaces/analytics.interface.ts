export interface SalesAnalytics {
  id: string;
  period: string; // Format: YYYY-MM
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  topSellingProducts: TopSellingProduct[];
  revenueByCategory: RevenueByCategory[];
  revenueByRegion: RevenueByRegion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  percentageOfTotal: number;
}

export interface RevenueByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  percentageOfTotal: number;
}

export interface RevenueByRegion {
  region: string;
  revenue: number;
  percentageOfTotal: number;
}

export interface CustomerAnalytics {
  id: string;
  period: string; // Format: YYYY-MM
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerRetentionRate: number;
  avgOrderFrequency: number;
  topCustomerSegments: CustomerSegment[];
  customerLifetimeValue: number;
  churnRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  avgOrderValue: number;
  totalRevenue: number;
}

export interface InventoryAnalytics {
  id: string;
  period: string; // Format: YYYY-MM
  totalInventoryValue: number;
  outOfStockItems: number;
  lowStockItems: number;
  fastMovingItems: FastMovingItem[];
  slowMovingItems: SlowMovingItem[];
  inventoryTurnoverRate: number;
  deadStockValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FastMovingItem {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: number;
  turnoverRate: number;
}

export interface SlowMovingItem {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: number;
  daysInStock: number;
}

export interface FinancialAnalytics {
  id: string;
  period: string; // Format: YYYY-MM
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  grossProfitMargin: number;
  netProfitMargin: number;
  operationalExpenses: number;
  taxExpenses: number;
  cashFlow: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'customer' | 'inventory' | 'financial' | 'custom';
  description: string;
  filters: ReportFilter;
  schedule: ReportSchedule;
  recipients: string[]; // Email addresses
  status: 'active' | 'inactive' | 'scheduled';
  lastGeneratedAt?: Date;
  nextScheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilter {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  regions?: string[];
  categories?: string[];
  products?: string[];
  customerTypes?: ('retailer' | 'dealer' | 'distributor')[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfMonth?: number; // For monthly reports
  dayOfWeek?: number; // For weekly reports
  time: string; // In HH:MM format
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'kpi';
  data: any;
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
  refreshInterval: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}