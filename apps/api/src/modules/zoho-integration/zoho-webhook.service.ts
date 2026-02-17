import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class ZohoWebhookService {
  private readonly logger = new Logger(ZohoWebhookService.name);
  private readonly webhookSecret: string;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.webhookSecret = this.configService.get<string>('ZOHO_WEBHOOK_SECRET') || '';
  }

  /**
   * Verify Zoho webhook signature
   */
  async verifyWebhookSignature(payload: any, signature: string, source: 'books' | 'crm'): Promise<boolean> {
    if (!this.webhookSecret) {
      this.logger.warn('ZOHO_WEBHOOK_SECRET not configured, skipping signature verification');
      return true;
    }

    // Generate expected signature
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  }

  /**
   * Process Zoho Books webhook
   */
  async processBooksWebhook(payload: any): Promise<any> {
    const eventType = payload.event_type;
    const data = payload.data;

    this.logger.log(`Processing Zoho Books webhook: ${eventType}`);

    switch (eventType) {
      case 'invoices_created':
        return this.handleInvoiceCreated(data);
      case 'invoices_updated':
        return this.handleInvoiceUpdated(data);
      case 'payments_created':
        return this.handlePaymentCreated(data);
      case 'payments_updated':
        return this.handlePaymentUpdated(data);
      case 'contacts_created':
        return this.handleContactCreated(data);
      case 'contacts_updated':
        return this.handleContactUpdated(data);
      default:
        this.logger.warn(`Unhandled Zoho Books webhook event: ${eventType}`);
        return { handled: false, eventType };
    }
  }

  /**
   * Process Zoho CRM webhook
   */
  async processCrmWebhook(payload: any): Promise<any> {
    const eventType = payload.event_type;
    const data = payload.data;

    this.logger.log(`Processing Zoho CRM webhook: ${eventType}`);

    switch (eventType) {
      case 'leads_created':
        return this.handleLeadCreated(data);
      case 'leads_updated':
        return this.handleLeadUpdated(data);
      case 'contacts_created':
        return this.handleCrmContactCreated(data);
      case 'contacts_updated':
        return this.handleCrmContactUpdated(data);
      case 'deals_created':
        return this.handleDealCreated(data);
      case 'deals_updated':
        return this.handleDealUpdated(data);
      default:
        this.logger.warn(`Unhandled Zoho CRM webhook event: ${eventType}`);
        return { handled: false, eventType };
    }
  }

  /**
   * Handle invoice created in Zoho Books
   */
  private async handleInvoiceCreated(data: any): Promise<any> {
    const zohoInvoiceId = data.invoice_id;
    const invoiceNumber = data.invoice_number;

    // Find corresponding order in our system
    const { data: order } = await this.supabaseService.getClient()
      .from('orders')
      .select('id')
      .eq('order_number', invoiceNumber)
      .single();

    if (order) {
      // Update invoice with Zoho invoice ID
      await this.supabaseService.getClient()
        .from('invoices')
        .update({
          zoho_invoice_id: zohoInvoiceId,
          zoho_synced_at: new Date().toISOString(),
        })
        .eq('order_id', order.id);

      this.logger.log(`Linked invoice ${order.id} to Zoho invoice ${zohoInvoiceId}`);
    }

    return { handled: true, entityType: 'invoice', zohoInvoiceId };
  }

  /**
   * Handle invoice updated in Zoho Books
   */
  private async handleInvoiceUpdated(data: any): Promise<any> {
    const zohoInvoiceId = data.invoice_id;
    const status = data.status;

    // Update invoice status in our system
    const { data: invoice } = await this.supabaseService.getClient()
      .from('invoices')
      .select('order_id')
      .eq('zoho_invoice_id', zohoInvoiceId)
      .single();

    if (invoice) {
      const ourStatus = this.mapZohoInvoiceStatusToOurStatus(status);
      await this.supabaseService.getClient()
        .from('orders')
        .update({ status: ourStatus })
        .eq('id', invoice.order_id);

      this.logger.log(`Updated order ${invoice.order_id} status to ${ourStatus}`);
    }

    return { handled: true, entityType: 'invoice', zohoInvoiceId };
  }

  /**
   * Handle payment created in Zoho Books
   */
  private async handlePaymentCreated(data: any): Promise<any> {
    const zohoPaymentId = data.payment_id;
    const invoiceId = data.invoice_id;
    const amount = data.amount;

    // Find corresponding payment in our system
    const { data: invoice } = await this.supabaseService.getClient()
      .from('invoices')
      .select('order_id')
      .eq('zoho_invoice_id', invoiceId)
      .single();

    if (invoice) {
      // Create or update payment record
      await this.supabaseService.getClient()
        .from('payment_transactions')
        .upsert({
          order_id: invoice.order_id,
          amount: amount,
          status: 'completed',
          payment_method: 'zoho_books',
          transaction_id: zohoPaymentId,
          zoho_payment_id: zohoPaymentId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'transaction_id',
        });

      // Update order payment status
      await this.supabaseService.getClient()
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', invoice.order_id);

      this.logger.log(`Recorded payment ${zohoPaymentId} for order ${invoice.order_id}`);
    }

    return { handled: true, entityType: 'payment', zohoPaymentId };
  }

  /**
   * Handle payment updated in Zoho Books
   */
  private async handlePaymentUpdated(data: any): Promise<any> {
    const zohoPaymentId = data.payment_id;
    const status = data.status;

    // Update payment status in our system
    await this.supabaseService.getClient()
      .from('payment_transactions')
      .update({
        status: status === 'paid' ? 'completed' : status,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', zohoPaymentId);

    return { handled: true, entityType: 'payment', zohoPaymentId };
  }

  /**
   * Handle contact created in Zoho Books
   */
  private async handleContactCreated(data: any): Promise<any> {
    const zohoContactId = data.contact_id;
    const email = data.email;

    // Find corresponding user in our system
    const { data: user } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (user) {
      await this.supabaseService.getClient()
        .from('profiles')
        .update({
          zoho_contact_id: zohoContactId,
          zoho_synced_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      this.logger.log(`Linked user ${user.id} to Zoho contact ${zohoContactId}`);
    }

    return { handled: true, entityType: 'contact', zohoContactId };
  }

  /**
   * Handle contact updated in Zoho Books
   */
  private async handleContactUpdated(data: any): Promise<any> {
    const zohoContactId = data.contact_id;

    // Sync contact details from Zoho to our system
    // This would typically fetch updated contact details from Zoho API
    this.logger.log(`Contact ${zohoContactId} updated in Zoho Books`);

    return { handled: true, entityType: 'contact', zohoContactId };
  }

  /**
   * Handle lead created in Zoho CRM
   */
  private async handleLeadCreated(data: any): Promise<any> {
    const zohoLeadId = data.id;
    const email = data.email;

    // Check if this lead corresponds to a dealer application
    const { data: application } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select('id')
      .eq('email', email)
      .single();

    if (application) {
      await this.supabaseService.getClient()
        .from('dealer_applications')
        .update({
          zoho_lead_id: zohoLeadId,
          zoho_synced_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      this.logger.log(`Linked dealer application ${application.id} to Zoho lead ${zohoLeadId}`);
    }

    return { handled: true, entityType: 'lead', zohoLeadId };
  }

  /**
   * Handle lead updated in Zoho CRM
   */
  private async handleLeadUpdated(data: any): Promise<any> {
    const zohoLeadId = data.id;
    const leadStatus = data.lead_status;

    // Map Zoho lead status to our dealer application status
    const ourStatus = this.mapZohoLeadStatusToOurStatus(leadStatus);

    if (ourStatus) {
      await this.supabaseService.getClient()
        .from('dealer_applications')
        .update({
          status: ourStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('zoho_lead_id', zohoLeadId);

      this.logger.log(`Updated dealer application status to ${ourStatus}`);
    }

    return { handled: true, entityType: 'lead', zohoLeadId };
  }

  /**
   * Handle CRM contact created
   */
  private async handleCrmContactCreated(data: any): Promise<any> {
    const zohoContactId = data.id;
    const email = data.email;

    // Link to existing user if found
    const { data: user } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (user) {
      await this.supabaseService.getClient()
        .from('profiles')
        .update({
          zoho_crm_contact_id: zohoContactId,
          zoho_synced_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return { handled: true, entityType: 'crm_contact', zohoContactId };
  }

  /**
   * Handle CRM contact updated
   */
  private async handleCrmContactUpdated(data: any): Promise<any> {
    // Sync contact details from Zoho CRM
    this.logger.log(`CRM contact ${data.id} updated`);
    return { handled: true, entityType: 'crm_contact', zohoContactId: data.id };
  }

  /**
   * Handle deal created in Zoho CRM
   */
  private async handleDealCreated(data: any): Promise<any> {
    const zohoDealId = data.id;
    const dealName = data.deal_name;

    // This could be linked to a large order or B2B deal
    this.logger.log(`New Zoho CRM deal created: ${dealName}`);

    return { handled: true, entityType: 'deal', zohoDealId };
  }

  /**
   * Handle deal updated in Zoho CRM
   */
  private async handleDealUpdated(data: any): Promise<any> {
    const zohoDealId = data.id;
    const stage = data.stage;

    // Update deal stage in our system if linked
    this.logger.log(`Zoho CRM deal ${zohoDealId} updated to stage: ${stage}`);

    return { handled: true, entityType: 'deal', zohoDealId };
  }

  /**
   * Map Zoho invoice status to our order status
   */
  private mapZohoInvoiceStatusToOurStatus(zohoStatus: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'draft',
      'sent': 'invoiced',
      'viewed': 'invoiced',
      'paid': 'delivered',
      'overdue': 'pending_approval',
      'cancelled': 'cancelled',
    };
    return statusMap[zohoStatus] || 'pending_approval';
  }

  /**
   * Map Zoho lead status to our dealer application status
   */
  private mapZohoLeadStatusToOurStatus(zohoStatus: string): string | null {
    const statusMap: Record<string, string> = {
      'Not Contacted': 'pending',
      'Contacted': 'pending',
      'Qualified': 'approved',
      'Pre Qualified': 'pending',
      'Not Qualified': 'rejected',
    };
    return statusMap[zohoStatus] || null;
  }
}
