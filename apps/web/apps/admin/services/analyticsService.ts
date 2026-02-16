// services/analyticsService.ts
import { 
  SalesAnalytics, 
  CustomerAnalytics, 
  InventoryAnalytics, 
  FinancialAnalytics, 
  Report,
  DashboardWidget
} from '../api/src/modules/analytics/interfaces/analytics.interface';
import { 
  CreateReportDto, 
  UpdateReportDto, 
  GenerateReportDto, 
  GetAnalyticsDto 
} from '../api/src/modules/analytics/dto/analytics.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the analytics API
 */
export class AnalyticsService {
  /**
   * Gets sales analytics
   */
  static async getSalesAnalytics(getAnalyticsDto: GetAnalyticsDto): Promise<SalesAnalytics> {
    const params = new URLSearchParams({
      startDate: getAnalyticsDto.startDate,
      endDate: getAnalyticsDto.endDate,
    });

    if (getAnalyticsDto.regions) params.append('regions', getAnalyticsDto.regions.join(','));
    if (getAnalyticsDto.categories) params.append('categories', getAnalyticsDto.categories.join(','));
    if (getAnalyticsDto.products) params.append('products', getAnalyticsDto.products.join(','));
    if (getAnalyticsDto.customerTypes) params.append('customerTypes', getAnalyticsDto.customerTypes.join(','));

    const response = await fetch(`${API_BASE_URL}/analytics/sales?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch sales analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets customer analytics
   */
  static async getCustomerAnalytics(getAnalyticsDto: GetAnalyticsDto): Promise<CustomerAnalytics> {
    const params = new URLSearchParams({
      startDate: getAnalyticsDto.startDate,
      endDate: getAnalyticsDto.endDate,
    });

    if (getAnalyticsDto.regions) params.append('regions', getAnalyticsDto.regions.join(','));
    if (getAnalyticsDto.categories) params.append('categories', getAnalyticsDto.categories.join(','));
    if (getAnalyticsDto.products) params.append('products', getAnalyticsDto.products.join(','));
    if (getAnalyticsDto.customerTypes) params.append('customerTypes', getAnalyticsDto.customerTypes.join(','));

    const response = await fetch(`${API_BASE_URL}/analytics/customers?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets inventory analytics
   */
  static async getInventoryAnalytics(getAnalyticsDto: GetAnalyticsDto): Promise<InventoryAnalytics> {
    const params = new URLSearchParams({
      startDate: getAnalyticsDto.startDate,
      endDate: getAnalyticsDto.endDate,
    });

    if (getAnalyticsDto.regions) params.append('regions', getAnalyticsDto.regions.join(','));
    if (getAnalyticsDto.categories) params.append('categories', getAnalyticsDto.categories.join(','));
    if (getAnalyticsDto.products) params.append('products', getAnalyticsDto.products.join(','));
    if (getAnalyticsDto.customerTypes) params.append('customerTypes', getAnalyticsDto.customerTypes.join(','));

    const response = await fetch(`${API_BASE_URL}/analytics/inventory?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets financial analytics
   */
  static async getFinancialAnalytics(getAnalyticsDto: GetAnalyticsDto): Promise<FinancialAnalytics> {
    const params = new URLSearchParams({
      startDate: getAnalyticsDto.startDate,
      endDate: getAnalyticsDto.endDate,
    });

    if (getAnalyticsDto.regions) params.append('regions', getAnalyticsDto.regions.join(','));
    if (getAnalyticsDto.categories) params.append('categories', getAnalyticsDto.categories.join(','));
    if (getAnalyticsDto.products) params.append('products', getAnalyticsDto.products.join(','));
    if (getAnalyticsDto.customerTypes) params.append('customerTypes', getAnalyticsDto.customerTypes.join(','));

    const response = await fetch(`${API_BASE_URL}/analytics/financial?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch financial analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a new report
   */
  static async createReport(data: CreateReportDto): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a report
   */
  static async updateReport(id: string, data: UpdateReportDto): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a report by ID
   */
  static async getReportById(id: string): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets all reports
   */
  static async getAllReports(): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports`);

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Deletes a report
   */
  static async deleteReport(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generates a report
   */
  static async generateReport(data: GenerateReportDto): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets scheduled reports
   */
  static async getScheduledReports(): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/scheduled`);

    if (!response.ok) {
      throw new Error(`Failed to fetch scheduled reports: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Adds a dashboard widget
   */
  static async addDashboardWidget(widget: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardWidget> {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard-widgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(widget),
    });

    if (!response.ok) {
      throw new Error(`Failed to add dashboard widget: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets dashboard widgets
   */
  static async getDashboardWidgets(): Promise<DashboardWidget[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard-widgets`);

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard widgets: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a dashboard widget
   */
  static async updateDashboardWidget(id: string, widget: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard-widgets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(widget),
    });

    if (!response.ok) {
      throw new Error(`Failed to update dashboard widget: ${response.statusText}`);
    }

    return response.json();
  }
}