// services/invoiceService.ts
import { Invoice, GstComplianceReport } from '../api/src/modules/invoices/interfaces/invoice.interface';
import { CreateInvoiceDto, UpdateInvoiceDto, GenerateGstReportDto } from '../api/src/modules/invoices/dto/invoice.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the invoice API
 */
export class InvoiceService {
  /**
   * Creates a new invoice
   */
  static async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create invoice: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates an invoice
   */
  static async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update invoice: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets an invoice by ID
   */
  static async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets an invoice by number
   */
  static async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/number/${invoiceNumber}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets invoices by order ID
   */
  static async getInvoicesByOrder(orderId: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/order/${orderId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices for order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets invoices by customer ID
   */
  static async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/customer/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices for customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets invoices by status
   */
  static async getInvoicesByStatus(status: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/status/${status}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices with status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets invoices by date range
   */
  static async getInvoicesByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/date-range?startDate=${startDate}&endDate=${endDate}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices by date range: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generates a GST report
   */
  static async generateGstReport(data: GenerateGstReportDto): Promise<GstComplianceReport> {
    const response = await fetch(`${API_BASE_URL}/invoices/gst-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate GST report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a GST report by ID
   */
  static async getGstReportById(id: string): Promise<GstComplianceReport> {
    const response = await fetch(`${API_BASE_URL}/invoices/gst-report/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch GST report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets GST reports by period
   */
  static async getGstReportsByPeriod(period: string): Promise<GstComplianceReport[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/gst-report/period/${period}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch GST reports for period: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates GST report status
   */
  static async updateGstReportStatus(reportId: string, status: 'pending' | 'submitted' | 'verified'): Promise<GstComplianceReport> {
    const response = await fetch(`${API_BASE_URL}/invoices/gst-report/${reportId}/status?status=${status}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`Failed to update GST report status: ${response.statusText}`);
    }

    return response.json();
  }
}