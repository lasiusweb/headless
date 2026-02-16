import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoiceService {
  constructor(private supabaseService: SupabaseService) {}

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
    
    for (const item of order.items) {
      // In a real implementation, GST rates would be determined by HSN codes
      // For this example, we'll use a standard 18% rate
      const gstRate = 0.18; // 18% GST
      const taxableAmount = item.unit_price * item.quantity;
      totalTaxableAmount += taxableAmount;
      
      if (isInterState) {
        // For inter-state transactions, IGST is charged
        const igstAmount = taxableAmount * gstRate;
        totalIgstAmount += igstAmount;
      } else {
        // For intra-state transactions, CGST and SGST are charged
        const cgstAmount = taxableAmount * (gstRate / 2); // 9% CGST
        const sgstAmount = taxableAmount * (gstRate / 2); // 9% SGST
        totalCgstAmount += cgstAmount;
        totalSgstAmount += sgstAmount;
      }
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

    // Create invoice items records
    for (const item of order.items) {
      await this.supabaseService.getClient()
        .from('invoice_items')
        .insert([
          {
            invoice_id: invoice.id,
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            hsn_code: item.variant.product.hsn_code,
            gst_rate: 18, // Using 18% as example
            cgst_rate: isInterState ? 0 : 9, // 9% if intra-state
            sgst_rate: isInterState ? 0 : 9, // 9% if intra-state
            igst_rate: isInterState ? 18 : 0, // 18% if inter-state
            cgst_amount: isInterState ? 0 : (item.total_price * 0.09), // 9% CGST
            sgst_amount: isInterState ? 0 : (item.total_price * 0.09), // 9% SGST
            igst_amount: isInterState ? (item.total_price * 0.18) : 0, // 18% IGST
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

    // Return the complete invoice with details
    return this.findOne(invoice.id);
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