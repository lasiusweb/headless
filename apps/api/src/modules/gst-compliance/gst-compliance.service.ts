import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GstComplianceService {
  private readonly logger = new Logger(GstComplianceService.name);

  constructor(private supabaseService: SupabaseService) {}

  async calculateGstForOrder(orderId: string) {
    // Get order details with items
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        items:order_items(*, variant:product_variants(*, product:products(name, category_id)))
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    // Calculate GST based on shipping address and billing address
    // If both are in same state, apply CGST + SGST
    // If different states, apply IGST
    const isInterState = order.shipping_address.state !== order.billing_address.state;
    
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let taxableAmount = 0;

    // Calculate GST for each item
    for (const item of order.items) {
      // For simplicity, assuming 18% GST rate (9% CGST + 9% SGST or 18% IGST)
      // In a real implementation, GST rates would vary by product category
      const itemTaxableAmount = item.unit_price * item.quantity;
      taxableAmount += itemTaxableAmount;
      
      if (isInterState) {
        // Inter-state transaction: IGST
        const igstAmount = itemTaxableAmount * 0.18; // 18% IGST
        totalIgst += igstAmount;
      } else {
        // Intra-state transaction: CGST + SGST
        const cgstAmount = itemTaxableAmount * 0.09; // 9% CGST
        const sgstAmount = itemTaxableAmount * 0.09; // 9% SGST
        totalCgst += cgstAmount;
        totalSgst += sgstAmount;
      }
    }

    // Add shipping GST
    if (order.shipping_cost > 0) {
      if (isInterState) {
        totalIgst += order.shipping_cost * 0.18; // 18% IGST on shipping
      } else {
        totalCgst += order.shipping_cost * 0.09; // 9% CGST on shipping
        totalSgst += order.shipping_cost * 0.09; // 9% SGST on shipping
      }
      taxableAmount += order.shipping_cost;
    }

    const totalGst = totalCgst + totalSgst + totalIgst;
    const totalAmount = taxableAmount + totalGst;

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      isInterState,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      cgstAmount: parseFloat(totalCgst.toFixed(2)),
      sgstAmount: parseFloat(totalSgst.toFixed(2)),
      igstAmount: parseFloat(totalIgst.toFixed(2)),
      totalGstAmount: parseFloat(totalGst.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      items: order.items.map(item => ({
        id: item.id,
        name: item.variant.product.name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalAmount: item.total_price,
        taxableAmount: item.total_price,
        cgstAmount: isInterState ? 0 : parseFloat((item.total_price * 0.09).toFixed(2)),
        sgstAmount: isInterState ? 0 : parseFloat((item.total_price * 0.09).toFixed(2)),
        igstAmount: isInterState ? parseFloat((item.total_price * 0.18).toFixed(2)) : 0,
      })),
      shippingGst: {
        taxableAmount: order.shipping_cost,
        cgstAmount: isInterState ? 0 : parseFloat((order.shipping_cost * 0.09).toFixed(2)),
        sgstAmount: isInterState ? 0 : parseFloat((order.shipping_cost * 0.09).toFixed(2)),
        igstAmount: isInterState ? parseFloat((order.shipping_cost * 0.18).toFixed(2)) : 0,
      }
    };
  }

  async generateGstInvoice(orderId: string) {
    const gstCalculation = await this.calculateGstForOrder(orderId);

    // Get order details
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(*),
        shipping_address:addresses(*),
        billing_address:addresses(*),
        items:order_items(*, variant:product_variants(*, product:products(*)))
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    // Generate invoice number
    const invoiceNumber = `INV${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(order.id).substring(0, 6).toUpperCase()}`;

    // Create GST-compliant invoice data
    const gstInvoice = {
      invoiceNumber,
      orderNumber: order.order_number,
      date: new Date().toISOString(),
      customer: {
        name: order.user.first_name + ' ' + order.user.last_name,
        gstNumber: order.user.gst_number || 'Not Provided',
        address: order.billing_address,
      },
      supplier: {
        name: 'KN Biosciences Pvt Ltd',
        gstNumber: process.env.COMPANY_GST_NUMBER || 'YOUR_COMPANY_GST_NUMBER',
        address: {
          // Company address would come from config
          address_line1: process.env.COMPANY_ADDRESS_LINE1 || 'Company Address Line 1',
          city: process.env.COMPANY_CITY || 'City',
          state: process.env.COMPANY_STATE || 'State',
          pincode: process.env.COMPANY_PINCODE || 'Pincode',
          country: 'India',
        },
      },
      items: gstCalculation.items,
      taxSummary: {
        taxableAmount: gstCalculation.taxableAmount,
        cgstAmount: gstCalculation.cgstAmount,
        sgstAmount: gstCalculation.sgstAmount,
        igstAmount: gstCalculation.igstAmount,
        totalGstAmount: gstCalculation.totalGstAmount,
        totalAmount: gstCalculation.totalAmount,
      },
      isInterState: gstCalculation.isInterState,
      qrCode: `INVOICE_${invoiceNumber}_${order.user.id}`, // In a real implementation, this would be a proper GST QR code
    };

    // Save invoice to database
    const { data: savedInvoice, error: invoiceError } = await this.supabaseService.getClient()
      .from('invoices')
      .insert([
        {
          order_id: orderId,
          invoice_number: invoiceNumber,
          zoho_invoice_id: null, // Will be set when synced to Zoho
          cgst_amount: gstCalculation.cgstAmount,
          sgst_amount: gstCalculation.sgstAmount,
          igst_amount: gstCalculation.igstAmount,
          total_gst_amount: gstCalculation.totalGstAmount,
          total_amount: gstCalculation.totalAmount,
          status: 'generated',
          issued_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Error saving invoice: ${invoiceError.message}`);
    }

    return {
      ...gstInvoice,
      id: savedInvoice.id,
    };
  }

  async getGstReports(filters?: { 
    startDate?: string; 
    endDate?: string; 
    state?: string; 
    gstType?: 'cgst' | 'sgst' | 'igst' | 'all' 
  }) {
    // Build query based on filters
    let query = this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(*, 
          shipping_address:addresses(state),
          billing_address:addresses(state),
          user:profiles(gst_number)
        )
      `)
      .gte('issued_at', filters?.startDate || new Date(new Date().getFullYear(), 0, 1).toISOString())
      .lte('issued_at', filters?.endDate || new Date().toISOString());

    if (filters?.state) {
      query = query.or(
        `order.shipping_address->>state.eq.${filters.state},order.billing_address->>state.eq.${filters.state}`
      );
    }

    const { data: invoices, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculate aggregated GST amounts
    const report = {
      period: {
        from: filters?.startDate,
        to: filters?.endDate,
      },
      totalInvoices: invoices.length,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGstAmount: 0,
      totalAmount: 0,
      stateBreakdown: {},
      gstTypeBreakdown: {},
      invoices: invoices.map(inv => ({
        invoiceNumber: inv.invoice_number,
        orderNumber: inv.order.order_number,
        date: inv.issued_at,
        customerGst: inv.order.user.gst_number,
        isInterState: inv.order.shipping_address.state !== inv.order.billing_address.state,
        taxableAmount: inv.total_amount - inv.total_gst_amount,
        cgstAmount: inv.cgst_amount,
        sgstAmount: inv.sgst_amount,
        igstAmount: inv.igst_amount,
        totalGstAmount: inv.total_gst_amount,
        totalAmount: inv.total_amount,
      }))
    };

    // Aggregate amounts
    invoices.forEach(inv => {
      const isInterState = inv.order.shipping_address.state !== inv.order.billing_address.state;
      
      report.taxableAmount += (inv.total_amount - inv.total_gst_amount);
      report.cgstAmount += inv.cgst_amount;
      report.sgstAmount += inv.sgst_amount;
      report.igstAmount += inv.igst_amount;
      report.totalGstAmount += inv.total_gst_amount;
      report.totalAmount += inv.total_amount;
      
      // State breakdown
      const state = isInterState 
        ? inv.order.shipping_address.state 
        : inv.order.billing_address.state;
      
      if (!report.stateBreakdown[state]) {
        report.stateBreakdown[state] = {
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalGstAmount: 0,
          totalAmount: 0,
          invoiceCount: 0,
        };
      }
      
      report.stateBreakdown[state].taxableAmount += (inv.total_amount - inv.total_gst_amount);
      report.stateBreakdown[state].cgstAmount += inv.cgst_amount;
      report.stateBreakdown[state].sgstAmount += inv.sgst_amount;
      report.stateBreakdown[state].igstAmount += inv.igst_amount;
      report.stateBreakdown[state].totalGstAmount += inv.total_gst_amount;
      report.stateBreakdown[state].totalAmount += inv.total_amount;
      report.stateBreakdown[state].invoiceCount++;
    });

    return report;
  }

  async generateGstr1Report(month: number, year: number) {
    // Calculate the date range for the specified month/year
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Get all invoices for the period
    const { data: invoices, error } = await this.supabaseService.getClient()
      .from('invoices')
      .select(`
        *,
        order:orders(*, 
          shipping_address:addresses(state),
          billing_address:addresses(state),
          user:profiles(gst_number, first_name, last_name)
        )
      `)
      .gte('issued_at', startDate)
      .lte('issued_at', endDate);

    if (error) {
      throw new Error(error.message);
    }

    // Prepare GSTR-1 report data
    const gstr1Report = {
      period: `${String(month).padStart(2, '0')}${year}`,
      summary: {
        totalInvoices: invoices.length,
        totalTaxableValue: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        totalTax: 0,
        totalValue: 0,
      },
      b2bInvoices: [], // B2B invoices (with GST number)
      b2clInvoices: [], // B2C large invoices (value > 2.5L)
      b2csInvoices: [], // B2C small invoices (value <= 2.5L)
      nilRatedInvoices: [], // Nil rated invoices
    };

    invoices.forEach(inv => {
      const isInterState = inv.order.shipping_address.state !== inv.order.billing_address.state;
      const taxableValue = inv.total_amount - inv.total_gst_amount;
      const isB2B = !!inv.order.user.gst_number;
      
      // Add to appropriate category
      if (isB2B) {
        gstr1Report.b2bInvoices.push({
          invoiceNumber: inv.invoice_number,
          invoiceDate: inv.issued_at,
          customerGst: inv.order.user.gst_number,
          customerName: `${inv.order.user.first_name} ${inv.order.user.last_name}`,
          placeOfSupply: isInterState 
            ? inv.order.shipping_address.state 
            : inv.order.billing_address.state,
          taxableValue,
          cgst: inv.cgst_amount,
          sgst: inv.sgst_amount,
          igst: inv.igst_amount,
          totalGst: inv.total_gst_amount,
          totalValue: inv.total_amount,
          invoiceType: isInterState ? 'INTER' : 'INTRA',
        });
      } else {
        // For B2C, categorize based on amount
        if (inv.total_amount > 250000) { // 2.5L threshold
          gstr1Report.b2clInvoices.push({
            invoiceNumber: inv.invoice_number,
            invoiceDate: inv.issued_at,
            placeOfSupply: isInterState 
              ? inv.order.shipping_address.state 
              : inv.order.billing_address.state,
            taxableValue,
            cgst: inv.cgst_amount,
            sgst: inv.sgst_amount,
            igst: inv.igst_amount,
            totalGst: inv.total_gst_amount,
            totalValue: inv.total_amount,
            invoiceType: isInterState ? 'INTER' : 'INTRA',
          });
        } else {
          gstr1Report.b2csInvoices.push({
            placeOfSupply: isInterState 
              ? inv.order.shipping_address.state 
              : inv.order.billing_address.state,
            taxableValue,
            cgst: inv.cgst_amount,
            sgst: inv.sgst_amount,
            igst: inv.igst_amount,
            totalGst: inv.total_gst_amount,
            totalValue: inv.total_amount,
            invoiceType: isInterState ? 'INTER' : 'INTRA',
          });
        }
      }

      // Update summary
      gstr1Report.summary.totalTaxableValue += taxableValue;
      gstr1Report.summary.totalCgst += inv.cgst_amount;
      gstr1Report.summary.totalSgst += inv.sgst_amount;
      gstr1Report.summary.totalIgst += inv.igst_amount;
      gstr1Report.summary.totalTax += inv.total_gst_amount;
      gstr1Report.summary.totalValue += inv.total_amount;
    });

    return gstr1Report;
  }

  async validateGstNumber(gstNumber: string): Promise<boolean> {
    // In a real implementation, this would call the GST verification API
    // For now, we'll do a basic format validation
    
    // GST number format: 15 digits - first 2 for state code, next 10 for PAN, 1 for entity number, 1 for Z, 1 for checksum
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    return gstRegex.test(gstNumber);
  }

  async generateTaxInvoicePdf(invoiceId: string): Promise<string> {
    // In a real implementation, this would generate a proper GST-compliant PDF
    // using a library like puppeteer or similar
    
    // For now, return a placeholder
    return `/api/invoices/${invoiceId}/download`;
  }
}