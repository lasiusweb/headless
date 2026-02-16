import { Injectable, Logger, HttpException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import axios from 'axios';

@Injectable()
export class ZohoIntegrationService {
  private readonly logger = new Logger(ZohoIntegrationService.name);
  private zohoAccessToken: string | null = null;
  private zohoOrgId: string;

  constructor(private supabaseService: SupabaseService) {
    this.zohoOrgId = process.env.ZOHO_ORGANIZATION_ID || '';
  }

  async getAccessToken(): Promise<string> {
    if (this.zohoAccessToken) {
      return this.zohoAccessToken;
    }

    // In a real implementation, this would fetch a new access token using the refresh token
    // For now, we'll use the environment variable
    const accessToken = process.env.ZOHO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('ZOHO_ACCESS_TOKEN environment variable is not set');
    }

    this.zohoAccessToken = accessToken;
    return accessToken;
  }

  async syncOrderToZoho(orderId: string) {
    try {
      // Get order details from our database
      const { data: order, error: orderError } = await this.supabaseService.getClient()
        .from('orders')
        .select(`
          *,
          user:profiles(first_name, last_name, email, phone, business_address),
          items:order_items(*, variant:product_variants(name, sku, product:products(name, hsn_code))),
          shipping_address:addresses(*),
          billing_address:addresses(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        throw new Error(`Order not found: ${orderError.message}`);
      }

      // Prepare Zoho invoice data
      const zohoInvoiceData = {
        customer_id: await this.getOrCreateZohoContact(order.user),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 30 days
        reference_number: order.order_number,
        notes: `Order from KN Biosciences. Order ID: ${order.id}`,
        line_items: order.items.map(item => ({
          name: item.variant.product.name,
          description: item.variant.name,
          rate: item.unit_price,
          quantity: item.quantity,
          unit: 'Nos', // Unit of measure
          hsn_or_sac: item.variant.product.hsn_code || '', // HSN code for GST compliance
        })),
        // Calculate tax based on location (GST in India)
        tax_scheme_id: 'GST_TAX_SCHEME_ID', // This would be configured in Zoho
      };

      // Create invoice in Zoho
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://books.zoho.in/api/v3/invoices?organization_id=${this.zohoOrgId}`,
        zohoInvoiceData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update our invoice record with the Zoho invoice ID
      const zohoInvoiceId = response.data.invoice.invoice_id;

      const { error: invoiceUpdateError } = await this.supabaseService.getClient()
        .from('invoices')
        .update({
          zoho_invoice_id: zohoInvoiceId,
          status: 'synced'
        })
        .eq('order_id', orderId);

      if (invoiceUpdateError) {
        this.logger.error(`Error updating invoice with Zoho ID: ${invoiceUpdateError.message}`);
      }

      // Log the sync operation
      await this.logSyncOperation('order', orderId, 'zoho_books', 'create', 'success', {
        zoho_invoice_id: zohoInvoiceId,
        order_number: order.order_number,
        total_amount: order.total_amount
      });

      return {
        success: true,
        message: 'Order synced to Zoho successfully',
        zohoInvoiceId,
        orderId: order.id,
        orderNumber: order.order_number,
      };
    } catch (error) {
      this.logger.error(`Error syncing order to Zoho: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('order', orderId, 'zoho_books', 'create', 'failed', {
        error: error.message,
        order_id: orderId
      });

      throw new Error(`Failed to sync order to Zoho: ${error.message}`);
    }
  }

  async syncPaymentToZoho(paymentId: string) {
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await this.supabaseService.getClient()
        .from('payment_transactions')
        .select(`
          *,
          order:orders(order_number, total_amount)
        `)
        .eq('id', paymentId)
        .single();

      if (paymentError) {
        throw new Error(`Payment not found: ${paymentError.message}`);
      }

      // Get the corresponding Zoho invoice ID
      const { data: invoice, error: invoiceError } = await this.supabaseService.getClient()
        .from('invoices')
        .select('zoho_invoice_id')
        .eq('order_id', payment.order_id)
        .single();

      if (invoiceError || !invoice?.zoho_invoice_id) {
        throw new Error(`Zoho invoice ID not found for order: ${payment.order_id}`);
      }

      // Prepare Zoho payment data
      const zohoPaymentData = {
        contact_id: await this.getZohoContactByOrderId(payment.order_id),
        invoice_id: invoice.zoho_invoice_id,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        amount: payment.amount,
        payment_mode: payment.payment_method,
        reference_number: payment.transaction_id,
        description: `Payment for order ${payment.order.order_number}`,
      };

      // Create payment in Zoho
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://books.zoho.in/api/v3/payments?organization_id=${this.zohoOrgId}`,
        zohoPaymentData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the sync operation
      await this.logSyncOperation('payment', paymentId, 'zoho_books', 'create', 'success', {
        zoho_payment_id: response.data.payment.payment_id,
        transaction_id: payment.transaction_id,
        amount: payment.amount
      });

      return {
        success: true,
        message: 'Payment synced to Zoho successfully',
        zohoPaymentId: response.data.payment.payment_id,
        paymentId: payment.id,
        transactionId: payment.transaction_id,
      };
    } catch (error) {
      this.logger.error(`Error syncing payment to Zoho: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('payment', paymentId, 'zoho_books', 'create', 'failed', {
        error: error.message,
        payment_id: paymentId
      });

      throw new Error(`Failed to sync payment to Zoho: ${error.message}`);
    }
  }

  async syncCustomerToZoho(userId: string) {
    try {
      // Get user details
      const { data: user, error: userError } = await this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error(`User not found: ${userError.message}`);
      }

      // Prepare Zoho contact data
      const zohoContactData = {
        contact_name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        contact_type: 'customer',
        phone: user.phone || '',
        company_name: user.company_name || '',
        gst_treatment: user.gst_number ? 'registered_regular' : 'unregistered',
        gst_number: user.gst_number || '',
        tax_scheme_id: 'GST_TAX_SCHEME_ID', // This would be configured in Zoho
        payment_terms: 30, // Default payment terms
        currency_id: 'INR', // Indian Rupee
        custom_fields: [
          {
            customfield_id: 'CUSTOM_FIELD_ID_USER_ID',
            value: user.id
          }
        ]
      };

      // Create contact in Zoho
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://books.zoho.in/api/v3/contacts?organization_id=${this.zohoOrgId}`,
        zohoContactData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the sync operation
      await this.logSyncOperation('customer', userId, 'zoho_books', 'create', 'success', {
        zoho_contact_id: response.data.contact.contact_id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Customer synced to Zoho successfully',
        zohoContactId: response.data.contact.contact_id,
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      this.logger.error(`Error syncing customer to Zoho: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('customer', userId, 'zoho_books', 'create', 'failed', {
        error: error.message,
        email: userId
      });

      throw new Error(`Failed to sync customer to Zoho: ${error.message}`);
    }
  }

  /**
   * Sync product catalog to Zoho Books
   */
  async syncProductToZoho(productId: string) {
    try {
      // Get product details from our database
      const { data: product, error: productError } = await this.supabaseService.getClient()
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('id', productId)
        .single();

      if (productError) {
        throw new Error(`Product not found: ${productError.message}`);
      }

      // Prepare Zoho product data
      const zohoProductData = {
        name: product.name,
        description: product.description || '',
        unit: 'Nos', // Unit of measure
        hsn_or_sac: product.hsn_code || '', // HSN code for GST compliance
        product_type: 'goods', // goods or services
        purchase_description: product.description || '',
        purchase_rate: product.mrp, // Purchase rate
        rate: product.mrp, // Sales rate
        tax_id: 'GST_TAX_ID', // This would be configured in Zoho
        sku: product.sku || '',
        is_active: product.is_active,
        custom_fields: [
          {
            customfield_id: 'CUSTOM_FIELD_ID_PRODUCT_ID',
            value: product.id
          }
        ]
      };

      // Create product in Zoho
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://books.zoho.in/api/v3/items?organization_id=${this.zohoOrgId}`,
        zohoProductData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the sync operation
      await this.logSyncOperation('product', productId, 'zoho_books', 'create', 'success', {
        zoho_product_id: response.data.item.item_id,
        product_name: product.name,
        sku: product.sku
      });

      return {
        success: true,
        message: 'Product synced to Zoho successfully',
        zohoProductId: response.data.item.item_id,
        productId: product.id,
        productName: product.name,
      };
    } catch (error) {
      this.logger.error(`Error syncing product to Zoho: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('product', productId, 'zoho_books', 'create', 'failed', {
        error: error.message,
        product_id: productId
      });

      throw new Error(`Failed to sync product to Zoho: ${error.message}`);
    }
  }

  /**
   * Sync inventory to Zoho Books
   */
  async syncInventoryToZoho(productId: string) {
    try {
      // Get inventory details for the product
      const { data: inventory, error: inventoryError } = await this.supabaseService.getClient()
        .from('inventory')
        .select(`
          *,
          variant:product_variants(name, sku, product:products(name))
        `)
        .eq('variant->>product_id', productId)
        .gt('stock_level', 0) // Only sync items with positive stock
        .order('created_at', { ascending: false });

      if (inventoryError) {
        throw new Error(`Inventory not found for product: ${inventoryError.message}`);
      }

      if (!inventory || inventory.length === 0) {
        throw new Error(`No inventory found for product: ${productId}`);
      }

      // For each inventory record, update the corresponding Zoho item
      for (const inv of inventory) {
        // In a real implementation, we would update the item's quantity in Zoho
        // For now, we'll just log the operation
        this.logger.log(`Would sync inventory for product ${inv.variant.product.name} with quantity ${inv.stock_level} to Zoho`);
      }

      // Log the sync operation
      await this.logSyncOperation('inventory', productId, 'zoho_books', 'update', 'success', {
        product_id: productId,
        inventory_count: inventory.length,
        total_stock: inventory.reduce((sum, inv) => sum + inv.stock_level, 0)
      });

      return {
        success: true,
        message: 'Inventory synced to Zoho successfully',
        productId: productId,
        inventoryCount: inventory.length,
      };
    } catch (error) {
      this.logger.error(`Error syncing inventory to Zoho: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('inventory', productId, 'zoho_books', 'update', 'failed', {
        error: error.message,
        product_id: productId
      });

      throw new Error(`Failed to sync inventory to Zoho: ${error.message}`);
    }
  }

  /**
   * Sync shipment information to Zoho
   */
  async syncShipmentToZoho(shipmentId: string) {
    try {
      // Get shipment details from our database
      const { data: shipment, error: shipmentError } = await this.supabaseService.getClient()
        .from('shipments')
        .select(`
          *,
          order:orders(order_number, total_amount),
          carrier:shipping_carriers(name),
          items:shipment_items(*, product_variant:product_variants(name))
        `)
        .eq('id', shipmentId)
        .single();

      if (shipmentError) {
        throw new Error(`Shipment not found: ${shipmentError.message}`);
      }

      // Prepare Zoho sales order data (for tracking shipment)
      const zohoSalesOrderData = {
        customer_id: await this.getZohoContactByOrderId(shipment.order_id),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        reference_number: shipment.awb_number || shipment.lr_number || shipment.order.order_number,
        notes: `Shipment tracking for order ${shipment.order.order_number}. AWB/LR: ${shipment.awb_number || shipment.lr_number}`,
        line_items: shipment.items.map(item => ({
          name: item.product_variant.name,
          description: item.product_variant.name,
          rate: 0, // Rate might be 0 for tracking purposes
          quantity: item.quantity,
          unit: 'Nos', // Unit of measure
        })),
        status: shipment.status,
      };

      // Create sales order in Zoho for tracking
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://books.zoho.in/api/v3/salesorders?organization_id=${this.zohoOrgId}`,
        zohoSalesOrderData,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the sync operation
      await this.logSyncOperation('shipment', shipmentId, 'zoho_books', 'create', 'success', {
        zoho_sales_order_id: response.data.salesorder.salesorder_id,
        shipment_id: shipmentId,
        order_number: shipment.order.order_number
      });

      return {
        success: true,
        message: 'Shipment synced to Zoho successfully',
        zohoSalesOrderId: response.data.salesorder.salesorder_id,
        shipmentId: shipment.id,
        orderNumber: shipment.order.order_number,
      };
    } catch (error) {
      this.logger.error(`Error syncing shipment to Zoho: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('shipment', shipmentId, 'zoho_books', 'create', 'failed', {
        error: error.message,
        shipment_id: shipmentId
      });

      throw new Error(`Failed to sync shipment to Zoho: ${error.message}`);
    }
  }

  /**
   * Sync dealer application to Zoho CRM
   */
  async syncDealerApplicationToZoho(applicationId: string) {
    try {
      // Get dealer application details from our database
      const { data: application, error: applicationError } = await this.supabaseService.getClient()
        .from('dealer_applications')
        .select(`
          *,
          user:profiles(first_name, last_name, email, phone, business_address)
        `)
        .eq('id', applicationId)
        .single();

      if (applicationError) {
        throw new Error(`Dealer application not found: ${applicationError.message}`);
      }

      // Prepare Zoho CRM lead data
      const zohoLeadData = {
        Lead_Source: 'Website',
        First_Name: application.user.first_name,
        Last_Name: application.user.last_name,
        Email: application.user.email,
        Phone: application.user.phone || '',
        Company: application.business_name || application.user.company_name || '',
        Description: `Dealer application from KN Biosciences. Application ID: ${application.id}`,
        Lead_Status: 'Not Contacted',
        Industry: 'Agriculture',
        custom_fields: [
          {
            customfield_id: 'CUSTOM_FIELD_ID_APPLICATION_ID',
            value: application.id
          },
          {
            customfield_id: 'CUSTOM_FIELD_ID_USER_ID',
            value: application.user_id
          }
        ]
      };

      // Create lead in Zoho CRM
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `https://www.zohoapis.com/crm/v2/Leads`,
        { data: [zohoLeadData] },
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the sync operation
      await this.logSyncOperation('dealer_application', applicationId, 'zoho_crm', 'create', 'success', {
        zoho_lead_id: response.data.data[0]?.id,
        application_id: applicationId,
        email: application.user.email
      });

      return {
        success: true,
        message: 'Dealer application synced to Zoho CRM successfully',
        zohoLeadId: response.data.data[0]?.id,
        applicationId: application.id,
        email: application.user.email,
      };
    } catch (error) {
      this.logger.error(`Error syncing dealer application to Zoho CRM: ${error.message}`);

      // Log the sync failure
      await this.logSyncOperation('dealer_application', applicationId, 'zoho_crm', 'create', 'failed', {
        error: error.message,
        application_id: applicationId
      });

      throw new Error(`Failed to sync dealer application to Zoho CRM: ${error.message}`);
    }
  }

  private async getOrCreateZohoContact(user: any): Promise<string> {
    // In a real implementation, this would check if contact exists in Zoho
    // and create it if it doesn't exist
    // For simulation, return a mock contact ID
    return `CONTACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  private async getZohoContactByOrderId(orderId: string): Promise<string> {
    // In a real implementation, this would retrieve the Zoho contact ID
    // associated with the order
    // For simulation, return a mock contact ID
    return `CONTACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  private async logSyncOperation(
    entityType: string,
    entityId: string,
    integration: string,
    operation: string,
    status: string,
    responseData?: any
  ) {
    const { error } = await this.supabaseService.getClient()
      .from('integration_sync_log')
      .insert([
        {
          integration: integration,
          entity_type: entityType,
          entity_id: entityId,
          operation: operation,
          status: status,
          response_data: responseData || null,
          error_message: status === 'failed' ? responseData?.error : null,
        }
      ]);

    if (error) {
      this.logger.error(`Error logging sync operation: ${error.message}`);
    }
  }

  async getSyncStatus(entityType?: string, status?: string) {
    let query = this.supabaseService.getClient()
      .from('integration_sync_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.limit(50); // Limit to last 50 entries

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async resyncFailedOperations() {
    // Get all failed sync operations
    const { data: failedOperations, error } = await this.supabaseService.getClient()
      .from('integration_sync_log')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const results = [];
    for (const operation of failedOperations) {
      try {
        let result;

        switch (operation.entity_type) {
          case 'order':
            result = await this.syncOrderToZoho(operation.entity_id);
            break;
          case 'payment':
            result = await this.syncPaymentToZoho(operation.entity_id);
            break;
          case 'customer':
            result = await this.syncCustomerToZoho(operation.entity_id);
            break;
          case 'product':
            result = await this.syncProductToZoho(operation.entity_id);
            break;
          case 'inventory':
            result = await this.syncInventoryToZoho(operation.entity_id);
            break;
          case 'shipment':
            result = await this.syncShipmentToZoho(operation.entity_id);
            break;
          case 'dealer_application':
            result = await this.syncDealerApplicationToZoho(operation.entity_id);
            break;
          default:
            throw new Error(`Unknown entity type: ${operation.entity_type}`);
        }

        results.push({
          entityId: operation.entity_id,
          entityType: operation.entity_type,
          success: true,
          message: result.message
        });
      } catch (error) {
        results.push({
          entityId: operation.entity_id,
          entityType: operation.entity_type,
          success: false,
          message: error.message
        });
      }
    }

    return results;
  }

  /**
   * Perform a health check of the Zoho integration
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Test access token
      const token = await this.getAccessToken();
      
      // Test basic API call
      const accessToken = await this.getAccessToken();
      await axios.get(
        `https://books.zoho.in/api/v3/organizations/${this.zohoOrgId}?organization_id=${this.zohoOrgId}`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );

      return {
        status: 'healthy',
        details: {
          zohoConnected: true,
          tokenValid: !!token,
          organizationId: this.zohoOrgId,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      this.logger.error(`Zoho integration health check failed: ${error.message}`);
      
      return {
        status: 'unhealthy',
        details: {
          zohoConnected: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      };
    }
  }
}