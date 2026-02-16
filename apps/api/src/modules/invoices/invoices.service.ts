import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  Invoice, 
  GstTaxBreakup,
  GstComplianceReport 
} from './interfaces/invoice.interface';
import { 
  CreateInvoiceDto, 
  UpdateInvoiceDto, 
  GenerateGstReportDto 
} from './dto/invoice.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private invoices: Invoice[] = [];
  private gstReports: GstComplianceReport[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Get the order to calculate invoice details
    const order = await this.ordersService.getOrderById(createInvoiceDto.orderId);

    // Calculate invoice details
    const invoiceItems = createInvoiceDto.items.map(item => {
      const taxableValue = item.unitPrice * item.quantity * (1 - item.discountPercentage / 100);
      const gstAmount = taxableValue * (item.gstRate / 100);
      const total = taxableValue + gstAmount;

      return {
        id: Math.random().toString(36).substring(7),
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        taxableValue,
        gstRate: item.gstRate,
        gstAmount,
        total,
      };
    });

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.taxableValue, 0);
    const taxAmount = invoiceItems.reduce((sum, item) => sum + item.gstAmount, 0);
    const total = subtotal + taxAmount + createInvoiceDto.shippingCost - createInvoiceDto.discount;

    // Calculate GST breakup based on supply place
    const gstBreakup = this.calculateGstBreakup(
      subtotal,
      createInvoiceDto.supplyPlace,
      this.configService.get<string>('COMPANY_STATE_CODE') || 'KA' // Default to Karnataka
    );

    // Generate invoice number
    const invoiceNumber = `INV${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create the invoice
    const invoice: Invoice = {
      id: Math.random().toString(36).substring(7),
      invoiceNumber,
      ...createInvoiceDto,
      items: invoiceItems,
      subtotal,
      cgst: gstBreakup.cgstAmount,
      sgst: gstBreakup.sgstAmount,
      igst: gstBreakup.igstAmount,
      taxAmount: gstBreakup.totalGstAmount,
      total,
      invoiceDate: new Date(createInvoiceDto.invoiceDate),
      dueDate: new Date(createInvoiceDto.dueDate),
      status: 'generated',
      generatedBy: 'system', // In a real app, this would be the user ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.push(invoice);

    // Update the order status to indicate invoice has been generated
    await this.ordersService.updateOrder(createInvoiceDto.orderId, {
      status: 'processing', // Or whatever is appropriate after invoice generation
    });

    this.logger.log(`Invoice created: ${invoice.invoiceNumber} for order ${createInvoiceDto.orderId}`);

    return invoice;
  }

  private calculateGstBreakup(taxableValue: number, supplyPlace: string, companyState: string): GstTaxBreakup {
    // Determine if it's an intra-state or inter-state supply
    const isInterState = supplyPlace !== companyState;

    // For simplicity, using a single GST rate for the entire invoice
    // In a real implementation, this would be calculated per item
    const gstRate = 18; // Using 18% as an example

    if (isInterState) {
      // For inter-state supplies, IGST is charged
      const igstAmount = taxableValue * (gstRate / 100);
      return {
        taxableValue,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: gstRate,
        igstAmount,
        totalGstAmount: igstAmount,
      };
    } else {
      // For intra-state supplies, CGST and SGST are charged equally
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      const cgstAmount = taxableValue * (cgstRate / 100);
      const sgstAmount = taxableValue * (sgstRate / 100);

      return {
        taxableValue,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate: 0,
        igstAmount: 0,
        totalGstAmount: cgstAmount + sgstAmount,
      };
    }
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error(`Invoice with ID ${id} not found`);
    }

    const oldStatus = this.invoices[index].status;
    const newStatus = updateInvoiceDto.status || oldStatus;

    // If status is changing to paid, update the associated order
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      await this.ordersService.updateOrder(this.invoices[index].orderId, {
        paymentStatus: 'paid',
      });
    }

    this.invoices[index] = {
      ...this.invoices[index],
      ...updateInvoiceDto,
      updatedAt: new Date(),
    };

    return this.invoices[index];
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = this.invoices.find(i => i.id === id);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = this.invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice with number ${invoiceNumber} not found`);
    }
    return invoice;
  }

  async getInvoicesByOrder(orderId: string): Promise<Invoice[]> {
    return this.invoices.filter(i => i.orderId === orderId);
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    return this.invoices.filter(i => i.customerId === customerId);
  }

  async getInvoicesByStatus(status: string): Promise<Invoice[]> {
    return this.invoices.filter(i => i.status === status);
  }

  async getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    return this.invoices.filter(i => 
      i.invoiceDate >= startDate && i.invoiceDate <= endDate
    );
  }

  async generateGstReport(generateGstReportDto: GenerateGstReportDto): Promise<GstComplianceReport> {
    const startDate = new Date(generateGstReportDto.startDate);
    const endDate = new Date(generateGstReportDto.endDate);

    // Get invoices for the specified period and state
    const invoices = this.invoices.filter(i => 
      i.invoiceDate >= startDate && 
      i.invoiceDate <= endDate && 
      i.supplyPlace === generateGstReportDto.stateCode
    );

    // Calculate totals
    const totalInvoices = invoices.length;
    const totalTaxableValue = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalCgst = invoices.reduce((sum, inv) => sum + inv.cgst, 0);
    const totalSgst = invoices.reduce((sum, inv) => sum + inv.sgst, 0);
    const totalIgst = invoices.reduce((sum, inv) => sum + inv.igst, 0);
    const totalGst = totalCgst + totalSgst + totalIgst;

    // Create the GST compliance report
    const report: GstComplianceReport = {
      id: Math.random().toString(36).substring(7),
      period: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
      totalInvoices,
      totalTaxableValue,
      totalCgst,
      totalSgst,
      totalIgst,
      totalGst,
      filingStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.gstReports.push(report);

    this.logger.log(`GST Report generated for period ${report.period}, state: ${generateGstReportDto.stateCode}`);

    return report;
  }

  async getGstReportById(id: string): Promise<GstComplianceReport> {
    const report = this.gstReports.find(r => r.id === id);
    if (!report) {
      throw new Error(`GST Report with ID ${id} not found`);
    }
    return report;
  }

  async getGstReportsByPeriod(period: string): Promise<GstComplianceReport[]> {
    return this.gstReports.filter(r => r.period === period);
  }

  async updateGstReportStatus(reportId: string, filingStatus: 'pending' | 'submitted' | 'verified'): Promise<GstComplianceReport> {
    const index = this.gstReports.findIndex(r => r.id === reportId);
    if (index === -1) {
      throw new Error(`GST Report with ID ${reportId} not found`);
    }

    this.gstReports[index] = {
      ...this.gstReports[index],
      filingStatus,
      ...(filingStatus === 'submitted' && { submittedAt: new Date() }),
      ...(filingStatus === 'verified' && { verifiedAt: new Date() }),
      updatedAt: new Date(),
    };

    return this.gstReports[index];
  }
}