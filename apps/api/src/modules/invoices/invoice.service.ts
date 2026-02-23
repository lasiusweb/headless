import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  // GST rates by HSN code category (as per Indian tax law)
  private readonly gstRatesByHsn: Record<string, number> = {
    '3008': 12, // Ayurvedic medicines
    '3101': 5,  // Organic fertilizers
    '3104': 18, // Potassic fertilizers
    '3105': 18, // Mineral/chemical fertilizers
    '3808': 18, // Pesticides/insecticides
    '2307': 18, // Wine lees, argal
    '0511': 18, // Animal products
    '1211': 12, // Medicinal plants
    '1302': 18, // Vegetable extracts
    '2106': 18, // Food preparations
    '3507': 18, // Enzymes
    '3824': 18, // Chemical products
  };

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get GST rate for a product based on HSN code
   */
  private getGstRateForHsn(hsnCode: string): number {
    // Extract first 4 digits of HSN code
    const hsnPrefix = hsnCode?.substring(0, 4) || '3824';
    return this.gstRatesByHsn[hsnPrefix] || 18; // Default 18%
  }

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id, status),
        user:profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id, status),
        user:profiles(first_name, last_name, email, gst_number, business_address),
        items:invoice_items(*, product_variant:product_variants(name, sku, product:products(name, hsn_code)))
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Invoice not found');
    }

    return data;
  }

  async findByOrder(orderId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id),
        user:profiles(first_name, last_name, email),
        items:invoice_items(*, product_variant:product_variants(name, sku))
      `)
      .eq('order_id', orderId)
      .single();

    if (error) {
      throw new NotFoundException('Invoice not found for order');
    }

    return data;
  }

  async create(orderId: string) {
    // Get order details
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(first_name, last_name, email, gst_number, business_address),
        shipping_address:addresses(*),
        billing_address:addresses(*),
        items:order_items(*, variant:product_variants(name, sku, product:products(name, hsn_code, category_id)))
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    // Validate that the order is eligible for invoice generation
    if (order.status !== 'confirmed' && order.status !== 'processing') {
      throw new BadRequestException('Invoice can only be generated for confirmed or processing orders');
    }

    // Calculate GST amounts based on Indian tax rules
    // Determine if this is an inter-state or intra-state transaction
    const isInterState = order.shipping_address?.state !== order.billing_address?.state;

    // Calculate tax amounts for each item based on HSN codes and applicable GST rates
    let totalTaxableAmount = 0;
    let totalCgstAmount = 0;
    let totalSgstAmount = 0;
    let totalIgstAmount = 0;
    const itemTaxDetails = [];

    for (const item of order.items) {
      // Get GST rate based on HSN code
      const hsnCode = item.variant.product.hsn_code || '3824';
      const gstRate = this.getGstRateForHsn(hsnCode) / 100;
      const taxableAmount = item.unit_price * item.quantity;
      totalTaxableAmount += taxableAmount;

      const itemTax = {
        productId: item.variant.product.id,
        productName: item.variant.product.name,
        hsnCode,
        gstRate: gstRate * 100,
        taxableAmount,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
      };

      if (isInterState) {
        // For inter-state transactions, IGST is charged
        const igstAmount = taxableAmount * gstRate;
        totalIgstAmount += igstAmount;
        itemTax.igstAmount = igstAmount;
      } else {
        // For intra-state transactions, CGST and SGST are charged
        const cgstAmount = taxableAmount * (gstRate / 2); // 9% CGST
        const sgstAmount = taxableAmount * (gstRate / 2); // 9% SGST
        totalCgstAmount += cgstAmount;
        totalSgstAmount += sgstAmount;
        itemTax.cgstAmount = cgstAmount;
        itemTax.sgstAmount = sgstAmount;
      }

      itemTaxDetails.push(itemTax);
    }

    const totalGstAmount = totalCgstAmount + totalSgstAmount + totalIgstAmount;
    const totalAmount = totalTaxableAmount + totalGstAmount;

    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber();

    // Create the invoice
    const { data: invoice, error: invoiceError } = await this.supabaseService.getClient()
      .from('invoices')
      .insert([
        {
          order_id: orderId,
          invoice_number: invoiceNumber,
          customer_name: `${order.user.first_name} ${order.user.last_name}`,
          customer_gst_number: order.user.gst_number,
          billing_address: order.billing_address,
          shipping_address: order.shipping_address,
          cgst_amount: parseFloat(totalCgstAmount.toFixed(2)),
          sgst_amount: parseFloat(totalSgstAmount.toFixed(2)),
          igst_amount: parseFloat(totalIgstAmount.toFixed(2)),
          total_taxable_amount: parseFloat(totalTaxableAmount.toFixed(2)),
          total_gst_amount: parseFloat(totalGstAmount.toFixed(2)),
          total_amount: parseFloat(totalAmount.toFixed(2)),
          issued_at: new Date().toISOString(),
          due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Due in 30 days
          status: 'draft',
          is_inter_state: isInterState,
        }
      ])
      .select()
      .single();

    if (invoiceError) {
      throw new Error(invoiceError.message);
    }

    // Create invoice items records with proper GST rates
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const itemTax = itemTaxDetails[i];
      const hsnCode = item.variant.product.hsn_code || '3824';
      const gstRate = this.getGstRateForHsn(hsnCode);

      await this.supabaseService.getClient()
        .from('invoice_items')
        .insert([
          {
            invoice_id: invoice.id,
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            hsn_code: hsnCode,
            gst_rate: gstRate,
            cgst_rate: isInterState ? 0 : gstRate / 2,
            sgst_rate: isInterState ? 0 : gstRate / 2,
            igst_rate: isInterState ? gstRate : 0,
            cgst_amount: parseFloat((isInterState ? 0 : itemTax.cgstAmount).toFixed(2)),
            sgst_amount: parseFloat((isInterState ? 0 : itemTax.sgstAmount).toFixed(2)),
            igst_amount: parseFloat((isInterState ? itemTax.igstAmount : 0).toFixed(2)),
            taxable_amount: parseFloat(itemTax.taxableAmount.toFixed(2)),
          }
        ]);
    }

    // Update order to link to invoice and change status
    await this.supabaseService.getClient()
      .from('orders')
      .update({
        status: 'invoiced',
        invoice_id: invoice.id
      })
      .eq('id', orderId);

    // Return the complete invoice with details including tax breakdown
    const completeInvoice = await this.findOne(invoice.id);
    return {
      ...completeInvoice,
      taxBreakdown: itemTaxDetails,
    };
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .update({
        ...updateInvoiceDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Invoice deleted successfully' };
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new Error('Invalid invoice status');
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async generatePdf(invoiceId: string) {
    // In a real implementation, this would generate a PDF using a library like Puppeteer
    // For now, we'll return a placeholder
    const invoice = await this.findOne(invoiceId);

    // This would normally generate a PDF with GST-compliant format
    // including proper tax breakdowns, company details, etc.
    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      downloadUrl: `/api/invoices/${invoice.id}/download`,
      message: 'PDF generation would happen here in a real implementation'
    };
  }

  /**
   * Generate a credit note for an invoice
   */
  async generateCreditNote(invoiceId: string, reason: string, adjustmentAmount: number) {
    const originalInvoice = await this.findOne(invoiceId);
    
    if (!originalInvoice) {
      throw new NotFoundException('Original invoice not found');
    }

    // Generate credit note number
    const creditNoteNumber = `CRN${this.generateInvoiceNumber().substring(3)}`; // Replace INV with CRN

    // Create credit note record
    const { data: creditNote, error: creditNoteError } = await this.supabaseService.getClient()
      .from('credit_notes')
      .insert([
        {
          original_invoice_id: invoiceId,
          credit_note_number: creditNoteNumber,
          reason: reason,
          adjustment_amount: adjustmentAmount,
          issued_at: new Date().toISOString(),
          status: 'issued',
        }
      ])
      .select()
      .single();

    if (creditNoteError) {
      throw new Error(creditNoteError.message);
    }

    return creditNote;
  }

  /**
   * Generate a debit note for an invoice
   */
  async generateDebitNote(invoiceId: string, reason: string, adjustmentAmount: number) {
    const originalInvoice = await this.findOne(invoiceId);
    
    if (!originalInvoice) {
      throw new NotFoundException('Original invoice not found');
    }

    // Generate debit note number
    const debitNoteNumber = `DBN${this.generateInvoiceNumber().substring(3)}`; // Replace INV with DBN

    // Create debit note record
    const { data: debitNote, error: debitNoteError } = await this.supabaseService.getClient()
      .from('debit_notes')
      .insert([
        {
          original_invoice_id: invoiceId,
          debit_note_number: debitNoteNumber,
          reason: reason,
          adjustment_amount: adjustmentAmount,
          issued_at: new Date().toISOString(),
          status: 'issued',
        }
      ])
      .select()
      .single();

    if (debitNoteError) {
      throw new Error(debitNoteError.message);
    }

    return debitNote;
  }

  /**
   * Get all invoices for a specific customer
   */
  async getInvoicesByCustomer(customerId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, total_amount, status),
        items:invoice_items(*, product_variant:product_variants(name, sku))
      `)
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get invoices by date range
   */
  async getInvoicesByDateRange(startDate: string, endDate: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id),
        user:profiles(first_name, last_name, email)
      `)
      .gte('issued_at', startDate)
      .lte('issued_at', endDate)
      .order('issued_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Generate GST compliance report for a given period
   * This report is used for GST filing (GSTR-1, GSTR-3B)
   */
  async generateGstReport(startDate: string, endDate: string, reportType: 'outward' | 'inward' = 'outward') {
    const invoices = await this.getInvoicesByDateRange(startDate, endDate);

    // Group by GST rate and calculate totals
    const gstRateSummary = {};
    const hsnWiseSummary = {};

    for (const invoice of invoices) {
      // Skip non-GST invoices (e.g., exports, SEZ)
      if (invoice.is_export || invoice.is_sez) continue;

      // Aggregate by GST rate
      const cgstKey = `CGST_${invoice.cgst_rate || 0}`;
      const sgstKey = `SGST_${invoice.sgst_rate || 0}`;
      const igstKey = `IGST_${invoice.igst_rate || 0}`;

      if (!gstRateSummary[cgstKey]) {
        gstRateSummary[cgstKey] = { taxableAmount: 0, taxAmount: 0, invoiceCount: 0 };
      }
      if (!gstRateSummary[sgstKey]) {
        gstRateSummary[sgstKey] = { taxableAmount: 0, taxAmount: 0, invoiceCount: 0 };
      }
      if (!gstRateSummary[igstKey]) {
        gstRateSummary[igstKey] = { taxableAmount: 0, taxAmount: 0, invoiceCount: 0 };
      }

      gstRateSummary[cgstKey].taxableAmount += invoice.total_taxable_amount || 0;
      gstRateSummary[cgstKey].taxAmount += invoice.cgst_amount || 0;
      gstRateSummary[cgstKey].invoiceCount += 1;

      gstRateSummary[sgstKey].taxableAmount += invoice.total_taxable_amount || 0;
      gstRateSummary[sgstKey].taxAmount += invoice.sgst_amount || 0;
      gstRateSummary[sgstKey].invoiceCount += 1;

      gstRateSummary[igstKey].taxableAmount += invoice.total_taxable_amount || 0;
      gstRateSummary[igstKey].taxAmount += invoice.igst_amount || 0;
      gstRateSummary[igstKey].invoiceCount += 1;

      // Aggregate by HSN code (for HSN-wise summary in GSTR-1)
      const items = invoice.items || [];
      for (const item of items) {
        const hsnCode = item.hsn_code || 'UNKNOWN';
        if (!hsnWiseSummary[hsnCode]) {
          hsnWiseSummary[hsnCode] = {
            hsnCode,
            description: '',
            totalQuantity: 0,
            totalValue: 0,
            taxRate: item.gst_rate || 18,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
          };
        }
        hsnWiseSummary[hsnCode].totalQuantity += item.quantity || 0;
        hsnWiseSummary[hsnCode].totalValue += item.total_price || 0;
        hsnWiseSummary[hsnCode].cgstAmount += item.cgst_amount || 0;
        hsnWiseSummary[hsnCode].sgstAmount += item.sgst_amount || 0;
        hsnWiseSummary[hsnCode].igstAmount += item.igst_amount || 0;
      }
    }

    // Calculate totals
    const totalTaxableAmount = Object.values(gstRateSummary).reduce((sum, item: any) => sum + item.taxableAmount, 0);
    const totalCgst = Object.entries(gstRateSummary)
      .filter(([key]) => key.startsWith('CGST'))
      .reduce((sum, item: any) => sum + item.taxAmount, 0);
    const totalSgst = Object.entries(gstRateSummary)
      .filter(([key]) => key.startsWith('SGST'))
      .reduce((sum, item: any) => sum + item.taxAmount, 0);
    const totalIgst = Object.entries(gstRateSummary)
      .filter(([key]) => key.startsWith('IGST'))
      .reduce((sum, item: any) => sum + item.taxAmount, 0);

    return {
      reportType,
      period: { startDate, endDate },
      summary: {
        totalInvoices: invoices.length,
        totalTaxableAmount: parseFloat(totalTaxableAmount.toFixed(2)),
        totalCgst: parseFloat(totalCgst.toFixed(2)),
        totalSgst: parseFloat(totalSgst.toFixed(2)),
        totalIgst: parseFloat(totalIgst.toFixed(2)),
        totalGst: parseFloat((totalCgst + totalSgst + totalIgst).toFixed(2)),
      },
      rateWiseSummary: Object.entries(gstRateSummary).map(([rate, data]: [string, any]) => ({
        rate: rate.split('_')[1],
        ...data,
        taxableAmount: parseFloat(data.taxableAmount.toFixed(2)),
        taxAmount: parseFloat(data.taxAmount.toFixed(2)),
      })),
      hsnWiseSummary: Object.values(hsnWiseSummary).map((item: any) => ({
        ...item,
        totalQuantity: parseFloat(item.totalQuantity.toFixed(2)),
        totalValue: parseFloat(item.totalValue.toFixed(2)),
        cgstAmount: parseFloat(item.cgstAmount.toFixed(2)),
        sgstAmount: parseFloat(item.sgstAmount.toFixed(2)),
        igstAmount: parseFloat(item.igstAmount.toFixed(2)),
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  private generateInvoiceNumber(): string {
    // Generate invoice number in format INVYYYYMM-XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const datePart = `${year}${month}`;

    // Generate random 4-digit number
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return `INV${datePart}-${randomNumber}`;
  }
}