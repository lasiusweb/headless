import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { 
  ZohoConnection, 
  ZohoContact, 
  ZohoItem, 
  ZohoInvoice,
  ZohoSyncLog 
} from './interfaces/zoho.interface';
import { 
  ZohoAuthDto, 
  ZohoRefreshTokenDto, 
  SyncEntityDto,
  ZohoConfigDto,
  SyncAllEntitiesDto 
} from './dto/zoho.dto';
import { OrdersService } from '../orders/orders.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);
  private connection: ZohoConnection | null = null;
  private syncLogs: ZohoSyncLog[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private invoicesService: InvoicesService,
  ) {}

  async authenticate(authDto: ZohoAuthDto): Promise<ZohoConnection> {
    try {
      // Exchange authorization code for access and refresh tokens
      const tokenResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
        params: {
          code: authDto.code,
          client_id: this.configService.get<string>('ZOHO_CLIENT_ID'),
          client_secret: this.configService.get<string>('ZOHO_CLIENT_SECRET'),
          redirect_uri: authDto.redirectUri,
          grant_type: 'authorization_code',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token, expires_in, api_domain } = tokenResponse.data;

      // Create or update the connection
      this.connection = {
        id: 'zoho_connection_1', // In a real app, this would be a proper ID
        clientId: this.configService.get<string>('ZOHO_CLIENT_ID'),
        clientSecret: this.configService.get<string>('ZOHO_CLIENT_SECRET'),
        redirectUri: authDto.redirectUri,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        scopes: ['ZohoBooks.fullaccess.all', 'ZohoCRM.modules.ALL'],
        connectedAt: new Date(),
        updatedAt: new Date(),
      };

      this.logger.log('Successfully authenticated with Zoho');

      return this.connection;
    } catch (error) {
      this.logger.error('Error authenticating with Zoho', error);
      throw new Error(`Zoho authentication failed: ${error.message}`);
    }
  }

  async refreshToken(refreshTokenDto: ZohoRefreshTokenDto): Promise<ZohoConnection> {
    try {
      const tokenResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
        params: {
          refresh_token: refreshTokenDto.refreshToken,
          client_id: this.configService.get<string>('ZOHO_CLIENT_ID'),
          client_secret: this.configService.get<string>('ZOHO_CLIENT_SECRET'),
          grant_type: 'refresh_token',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, expires_in } = tokenResponse.data;

      if (this.connection) {
        this.connection.accessToken = access_token;
        this.connection.expiresIn = expires_in;
        this.connection.updatedAt = new Date();
      }

      this.logger.log('Successfully refreshed Zoho access token');

      return this.connection;
    } catch (error) {
      this.logger.error('Error refreshing Zoho token', error);
      throw new Error(`Zoho token refresh failed: ${error.message}`);
    }
  }

  async syncEntity(syncEntityDto: SyncEntityDto): Promise<ZohoSyncLog> {
    try {
      if (!this.connection) {
        throw new Error('Zoho not connected. Please authenticate first.');
      }

      // Create a sync log entry
      const syncLog: ZohoSyncLog = {
        id: Math.random().toString(36).substring(7),
        entity: syncEntityDto.entity,
        entityId: syncEntityDto.entityId,
        action: syncEntityDto.action,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.syncLogs.push(syncLog);

      // Perform the sync based on entity type
      let result;
      switch (syncEntityDto.entity) {
        case 'contact':
          result = await this.syncContact(syncEntityDto.entityId, syncEntityDto.action);
          break;
        case 'item':
          result = await this.syncItem(syncEntityDto.entityId, syncEntityDto.action);
          break;
        case 'invoice':
          result = await this.syncInvoice(syncEntityDto.entityId, syncEntityDto.action);
          break;
        case 'order':
          result = await this.syncOrder(syncEntityDto.entityId, syncEntityDto.action);
          break;
        default:
          throw new Error(`Unsupported entity type: ${syncEntityDto.entity}`);
      }

      // Update the sync log with the result
      const logIndex = this.syncLogs.findIndex(log => log.id === syncLog.id);
      if (logIndex !== -1) {
        this.syncLogs[logIndex] = {
          ...this.syncLogs[logIndex],
          status: 'synced',
          syncedAt: new Date(),
          updatedAt: new Date(),
        };
      }

      this.logger.log(`Successfully synced ${syncEntityDto.entity} ${syncEntityDto.entityId}`);

      return this.syncLogs[logIndex];
    } catch (error) {
      this.logger.error(`Error syncing ${syncEntityDto.entity} ${syncEntityDto.entityId}`, error);

      // Update the sync log with the error
      const logIndex = this.syncLogs.findIndex(log => log.entityId === syncEntityDto.entityId && log.entity === syncEntityDto.entity);
      if (logIndex !== -1) {
        this.syncLogs[logIndex] = {
          ...this.syncLogs[logIndex],
          status: 'failed',
          errorMessage: error.message,
          updatedAt: new Date(),
        };
      }

      throw new Error(`Zoho sync failed: ${error.message}`);
    }
  }

  private async syncContact(contactId: string, action: 'created' | 'updated' | 'deleted'): Promise<any> {
    // In a real implementation, this would fetch contact details from our system
    // and then sync with Zoho CRM
    if (action === 'deleted') {
      // Delete contact from Zoho CRM
      return await this.deleteContactFromZoho(contactId);
    } else {
      // Create or update contact in Zoho CRM
      const contactDetails = await this.getContactDetails(contactId);
      return await this.upsertContactToZoho(contactDetails);
    }
  }

  private async syncItem(itemId: string, action: 'created' | 'updated' | 'deleted'): Promise<any> {
    // In a real implementation, this would fetch item details from our system
    // and then sync with Zoho Books
    if (action === 'deleted') {
      // Delete item from Zoho Books
      return await this.deleteItemFromZoho(itemId);
    } else {
      // Create or update item in Zoho Books
      const itemDetails = await this.getItemDetails(itemId);
      return await this.upsertItemToZoho(itemDetails);
    }
  }

  private async syncInvoice(invoiceId: string, action: 'created' | 'updated' | 'deleted'): Promise<any> {
    // In a real implementation, this would fetch invoice details from our system
    // and then sync with Zoho Books
    if (action === 'deleted') {
      // Delete invoice from Zoho Books
      return await this.deleteInvoiceFromZoho(invoiceId);
    } else {
      // Create or update invoice in Zoho Books
      const invoiceDetails = await this.getInvoiceDetails(invoiceId);
      return await this.upsertInvoiceToZoho(invoiceDetails);
    }
  }

  private async syncOrder(orderId: string, action: 'created' | 'updated' | 'deleted'): Promise<any> {
    // In a real implementation, this would fetch order details from our system
    // and then sync with Zoho Books as an invoice
    if (action === 'deleted') {
      // For orders, we might not delete the invoice in Zoho, but mark it as cancelled
      return await this.cancelInvoiceInZoho(orderId);
    } else {
      // Create or update invoice in Zoho Books based on the order
      const orderDetails = await this.getOrderDetails(orderId);
      return await this.createInvoiceFromOrder(orderDetails);
    }
  }

  // Placeholder methods for actual Zoho API calls
  private async getContactDetails(contactId: string): Promise<any> {
    // In a real implementation, this would fetch contact details from our database
    return {
      id: contactId,
      contact_name: 'Sample Contact',
      company_name: 'Sample Company',
      email: 'contact@example.com',
      gst_no: '12ABCDE1234PZ',
    };
  }

  private async getItemDetails(itemId: string): Promise<any> {
    // In a real implementation, this would fetch item details from our database
    return {
      id: itemId,
      name: 'Sample Product',
      description: 'Sample product description',
      rate: 100,
      hsn_or_sac: '1234',
      tax_percentage: 18,
    };
  }

  private async getInvoiceDetails(invoiceId: string): Promise<any> {
    // In a real implementation, this would fetch invoice details from our database
    return {
      id: invoiceId,
      invoice_number: 'INV-001',
      customer_id: 'customer-123',
      date: new Date(),
      line_items: [
        {
          item_id: 'item-123',
          name: 'Sample Product',
          quantity: 1,
          rate: 100,
        }
      ],
      total: 118, // Including tax
    };
  }

  private async getOrderDetails(orderId: string): Promise<any> {
    // In a real implementation, this would fetch order details from our database
    return {
      id: orderId,
      order_number: 'ORD-001',
      customer_id: 'customer-123',
      items: [
        {
          product_id: 'product-123',
          name: 'Sample Product',
          quantity: 1,
          unit_price: 100,
        }
      ],
      total: 118, // Including tax
    };
  }

  private async upsertContactToZoho(contactDetails: any): Promise<any> {
    // In a real implementation, this would make an API call to Zoho CRM
    // to create or update a contact
    this.logger.log(`Upserting contact to Zoho: ${contactDetails.id}`);
    return { success: true, contactId: contactDetails.id };
  }

  private async deleteContactFromZoho(contactId: string): Promise<any> {
    // In a real implementation, this would make an API call to Zoho CRM
    // to delete a contact
    this.logger.log(`Deleting contact from Zoho: ${contactId}`);
    return { success: true, contactId };
  }

  private async upsertItemToZoho(itemDetails: any): Promise<any> {
    // In a real implementation, this would make an API call to Zoho Books
    // to create or update an item
    this.logger.log(`Upserting item to Zoho: ${itemDetails.id}`);
    return { success: true, itemId: itemDetails.id };
  }

  private async deleteItemFromZoho(itemId: string): Promise<any> {
    // In a real implementation, this would make an API call to Zoho Books
    // to delete an item
    this.logger.log(`Deleting item from Zoho: ${itemId}`);
    return { success: true, itemId };
  }

  private async upsertInvoiceToZoho(invoiceDetails: any): Promise<any> {
    // In a real implementation, this would make an API call to Zoho Books
    // to create or update an invoice
    this.logger.log(`Upserting invoice to Zoho: ${invoiceDetails.id}`);
    return { success: true, invoiceId: invoiceDetails.id };
  }

  private async deleteInvoiceFromZoho(invoiceId: string): Promise<any> {
    // In a real implementation, this would make an API call to Zoho Books
    // to delete an invoice
    this.logger.log(`Deleting invoice from Zoho: ${invoiceId}`);
    return { success: true, invoiceId };
  }

  private async createInvoiceFromOrder(orderDetails: any): Promise<any> {
    // In a real implementation, this would make an API call to Zoho Books
    // to create an invoice from an order
    this.logger.log(`Creating invoice from order in Zoho: ${orderDetails.id}`);
    return { success: true, orderId: orderDetails.id };
  }

  private async cancelInvoiceInZoho(orderId: string): Promise<any> {
    // In a real implementation, this would make an API call to Zoho Books
    // to cancel an invoice
    this.logger.log(`Cancelling invoice in Zoho for order: ${orderId}`);
    return { success: true, orderId };
  }

  async syncAllEntities(syncAllDto: SyncAllEntitiesDto): Promise<ZohoSyncLog[]> {
    try {
      if (!this.connection) {
        throw new Error('Zoho not connected. Please authenticate first.');
      }

      // This would fetch all entities of the specified type from our system
      // and sync them with Zoho
      let entities: any[] = [];
      
      switch (syncAllDto.entityType) {
        case 'contacts':
          entities = await this.getAllContacts();
          break;
        case 'items':
          entities = await this.getAllItems();
          break;
        case 'invoices':
          entities = await this.getAllInvoices();
          break;
        case 'orders':
          entities = await this.getAllOrders();
          break;
        default:
          throw new Error(`Unsupported entity type: ${syncAllDto.entityType}`);
      }

      // Sync each entity
      const results: ZohoSyncLog[] = [];
      for (const entity of entities) {
        const syncResult = await this.syncEntity({
          entity: syncAllDto.entityType.slice(0, -1) as any, // Remove 's' to get singular
          entityId: entity.id,
          action: 'updated', // Assuming all are updates for sync all
        });
        results.push(syncResult);
      }

      this.logger.log(`Successfully synced all ${syncAllDto.entityType}`);

      return results;
    } catch (error) {
      this.logger.error(`Error syncing all ${syncAllDto.entityType}`, error);
      throw new Error(`Zoho sync all failed: ${error.message}`);
    }
  }

  private async getAllContacts(): Promise<any[]> {
    // In a real implementation, this would fetch all contacts from our database
    return [
      { id: 'contact-1', name: 'Contact 1' },
      { id: 'contact-2', name: 'Contact 2' },
    ];
  }

  private async getAllItems(): Promise<any[]> {
    // In a real implementation, this would fetch all items from our database
    return [
      { id: 'item-1', name: 'Item 1' },
      { id: 'item-2', name: 'Item 2' },
    ];
  }

  private async getAllInvoices(): Promise<any[]> {
    // In a real implementation, this would fetch all invoices from our database
    return [
      { id: 'invoice-1', number: 'INV-001' },
      { id: 'invoice-2', number: 'INV-002' },
    ];
  }

  private async getAllOrders(): Promise<any[]> {
    // In a real implementation, this would fetch all orders from our database
    return [
      { id: 'order-1', number: 'ORD-001' },
      { id: 'order-2', number: 'ORD-002' },
    ];
  }

  async getConnectionStatus(): Promise<{ isConnected: boolean; connection?: ZohoConnection }> {
    if (this.connection) {
      return { isConnected: true, connection: this.connection };
    }
    return { isConnected: false };
  }

  async getSyncLogs(): Promise<ZohoSyncLog[]> {
    return this.syncLogs;
  }

  async configure(configDto: ZohoConfigDto): Promise<void> {
    // In a real implementation, this would store the configuration securely
    this.logger.log('Zoho configuration updated');
  }
}