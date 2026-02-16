import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  PosSession, 
  PosTransaction, 
  PosProduct, 
  PosCustomer, 
  PosInventoryAdjustment,
  PosSyncLog,
  PosTransactionItem,
  PosDevice
} from './interfaces/pos.interface';
import { 
  CreatePosTransactionDto, 
  UpdatePosTransactionDto, 
  CreatePosProductDto, 
  UpdatePosProductDto, 
  CreatePosCustomerDto, 
  UpdatePosCustomerDto, 
  PosInventoryAdjustmentDto,
  StartPosSessionDto,
  ClosePosSessionDto,
  RegisterPosDeviceDto
} from './dto/pos.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);
  
  private posSessions: PosSession[] = [];
  private posTransactions: PosTransaction[] = [];
  private posProducts: PosProduct[] = [];
  private posCustomers: PosCustomer[] = [];
  private posInventoryAdjustments: PosInventoryAdjustment[] = [];
  private posSyncLogs: PosSyncLog[] = [];
  private posDevices: PosDevice[] = [];

  constructor(
    private configService: ConfigService,
    private inventoryService: InventoryService,
  ) {}

  async startSession(startPosSessionDto: StartPosSessionDto): Promise<PosSession> {
    const session: PosSession = {
      id: Math.random().toString(36).substring(7),
      ...startPosSessionDto,
      startedAt: new Date(),
      status: 'active',
    };

    this.posSessions.push(session);

    this.logger.log(`POS session started: ${session.id} for user ${startPosSessionDto.userId}`);

    return session;
  }

  async closeSession(closePosSessionDto: ClosePosSessionDto): Promise<PosSession> {
    const sessionIndex = this.posSessions.findIndex(s => s.id === closePosSessionDto.sessionId);
    if (sessionIndex === -1) {
      throw new Error(`POS session with ID ${closePosSessionDto.sessionId} not found`);
    }

    this.posSessions[sessionIndex] = {
      ...this.posSessions[sessionIndex],
      status: 'closed',
      endedAt: new Date(),
    };

    this.logger.log(`POS session closed: ${closePosSessionDto.sessionId}`);

    return this.posSessions[sessionIndex];
  }

  async createTransaction(createPosTransactionDto: CreatePosTransactionDto): Promise<PosTransaction> {
    // Calculate transaction details
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    const transactionItems: PosTransactionItem[] = [];

    for (const item of createPosTransactionDto.items) {
      // Find the product
      const product = this.posProducts.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      // Calculate item totals
      const itemSubtotal = product.sellingPrice * item.quantity;
      const itemDiscount = itemSubtotal * (item.discountPercentage / 100);
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = itemTaxable * (item.taxRate / 100);
      const itemTotal = itemTaxable + itemTax;

      // Create transaction item
      const transactionItem: PosTransactionItem = {
        id: Math.random().toString(36).substring(7),
        productId: item.productId,
        productName: product.name,
        sku: product.sku,
        hsnCode: product.hsnCode,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        discountPercentage: item.discountPercentage,
        taxRate: item.taxRate,
        total: itemTotal,
      };

      transactionItems.push(transactionItem);

      // Add to totals
      subtotal += itemSubtotal;
      tax += itemTax;
      discount += itemDiscount;
    }

    const total = subtotal - discount + tax;

    // Create the transaction
    const transaction: PosTransaction = {
      id: Math.random().toString(36).substring(7),
      ...createPosTransactionDto,
      items: transactionItems,
      subtotal,
      tax,
      discount,
      total,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      isOffline: true, // Initially marked as offline
    };

    this.posTransactions.push(transaction);

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('transaction', transaction.id, 'created');

    this.logger.log(`POS transaction created: ${transaction.id} in session ${createPosTransactionDto.sessionId}`);

    return transaction;
  }

  async updateTransaction(id: string, updatePosTransactionDto: UpdatePosTransactionDto): Promise<PosTransaction> {
    const transactionIndex = this.posTransactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      throw new Error(`POS transaction with ID ${id} not found`);
    }

    this.posTransactions[transactionIndex] = {
      ...this.posTransactions[transactionIndex],
      ...updatePosTransactionDto,
      updatedAt: new Date(),
    };

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('transaction', id, 'updated');

    return this.posTransactions[transactionIndex];
  }

  async createProduct(createPosProductDto: CreatePosProductDto): Promise<PosProduct> {
    const product: PosProduct = {
      id: Math.random().toString(36).substring(7),
      ...createPosProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.posProducts.push(product);

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('product', product.id, 'created');

    this.logger.log(`POS product created: ${product.id} - ${product.name}`);

    return product;
  }

  async updateProduct(id: string, updatePosProductDto: UpdatePosProductDto): Promise<PosProduct> {
    const productIndex = this.posProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`POS product with ID ${id} not found`);
    }

    this.posProducts[productIndex] = {
      ...this.posProducts[productIndex],
      ...updatePosProductDto,
      updatedAt: new Date(),
    };

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('product', id, 'updated');

    this.logger.log(`POS product updated: ${id} - ${this.posProducts[productIndex].name}`);

    return this.posProducts[productIndex];
  }

  async createCustomer(createPosCustomerDto: CreatePosCustomerDto): Promise<PosCustomer> {
    const customer: PosCustomer = {
      id: Math.random().toString(36).substring(7),
      ...createPosCustomerDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.posCustomers.push(customer);

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('customer', customer.id, 'created');

    this.logger.log(`POS customer created: ${customer.id} - ${customer.name}`);

    return customer;
  }

  async updateCustomer(id: string, updatePosCustomerDto: UpdatePosCustomerDto): Promise<PosCustomer> {
    const customerIndex = this.posCustomers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      throw new Error(`POS customer with ID ${id} not found`);
    }

    this.posCustomers[customerIndex] = {
      ...this.posCustomers[customerIndex],
      ...updatePosCustomerDto,
      updatedAt: new Date(),
    };

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('customer', id, 'updated');

    this.logger.log(`POS customer updated: ${id} - ${this.posCustomers[customerIndex].name}`);

    return this.posCustomers[customerIndex];
  }

  async createInventoryAdjustment(posInventoryAdjustmentDto: PosInventoryAdjustmentDto): Promise<PosInventoryAdjustment> {
    const adjustment: PosInventoryAdjustment = {
      id: Math.random().toString(36).substring(7),
      ...posInventoryAdjustmentDto,
      adjustedBy: 'system', // In a real app, this would be the user ID
      adjustedAt: new Date(),
    };

    this.posInventoryAdjustments.push(adjustment);

    // Add to sync queue for later synchronization
    await this.addToSyncQueue('inventory-adjustment', adjustment.id, 'created');

    this.logger.log(`POS inventory adjustment created: ${adjustment.id} for product ${posInventoryAdjustmentDto.productId}`);

    return adjustment;
  }

  async getTransactionById(id: string): Promise<PosTransaction> {
    const transaction = this.posTransactions.find(t => t.id === id);
    if (!transaction) {
      throw new Error(`POS transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async getTransactionsBySession(sessionId: string): Promise<PosTransaction[]> {
    return this.posTransactions.filter(t => t.sessionId === sessionId);
  }

  async getProductById(id: string): Promise<PosProduct> {
    const product = this.posProducts.find(p => p.id === id);
    if (!product) {
      throw new Error(`POS product with ID ${id} not found`);
    }
    return product;
  }

  async getCustomerById(id: string): Promise<PosCustomer> {
    const customer = this.posCustomers.find(c => c.id === id);
    if (!customer) {
      throw new Error(`POS customer with ID ${id} not found`);
    }
    return customer;
  }

  async getSyncQueue(): Promise<PosSyncLog[]> {
    return this.posSyncLogs.filter(log => log.status === 'pending');
  }

  async processSyncQueue(): Promise<void> {
    // Get all pending sync operations
    const pendingSyncs = this.posSyncLogs.filter(log => log.status === 'pending');

    for (const syncLog of pendingSyncs) {
      try {
        // In a real implementation, this would sync with the main system
        // For now, we'll just mark it as synced
        const index = this.posSyncLogs.findIndex(log => log.id === syncLog.id);
        if (index !== -1) {
          this.posSyncLogs[index] = {
            ...this.posSyncLogs[index],
            status: 'synced',
            syncedAt: new Date(),
            updatedAt: new Date(),
          };

          // Update the syncedAt field for the actual entity
          await this.markAsSynced(syncLog.entityType, syncLog.entityId);
        }

        this.logger.log(`Synced ${syncLog.entityType} ${syncLog.entityId} to main system`);
      } catch (error) {
        // Mark as failed if there was an error
        const index = this.posSyncLogs.findIndex(log => log.id === syncLog.id);
        if (index !== -1) {
          this.posSyncLogs[index] = {
            ...this.posSyncLogs[index],
            status: 'failed',
            errorMessage: error.message,
            updatedAt: new Date(),
          };
        }

        this.logger.error(`Failed to sync ${syncLog.entityType} ${syncLog.entityId}: ${error.message}`);
      }
    }
  }

  private async addToSyncQueue(entityType: 'transaction' | 'product' | 'customer' | 'inventory-adjustment', entityId: string, action: 'created' | 'updated' | 'deleted'): Promise<void> {
    const syncLog: PosSyncLog = {
      id: Math.random().toString(36).substring(7),
      entityType,
      entityId,
      action,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.posSyncLogs.push(syncLog);
  }

  private async markAsSynced(entityType: 'transaction' | 'product' | 'customer' | 'inventory-adjustment', entityId: string): Promise<void> {
    switch (entityType) {
      case 'transaction':
        const transactionIndex = this.posTransactions.findIndex(t => t.id === entityId);
        if (transactionIndex !== -1) {
          this.posTransactions[transactionIndex] = {
            ...this.posTransactions[transactionIndex],
            isOffline: false,
            syncedAt: new Date(),
          };
        }
        break;
      case 'product':
        const productIndex = this.posProducts.findIndex(p => p.id === entityId);
        if (productIndex !== -1) {
          this.posProducts[productIndex] = {
            ...this.posProducts[productIndex],
            syncedAt: new Date(),
          };
        }
        break;
      case 'customer':
        const customerIndex = this.posCustomers.findIndex(c => c.id === entityId);
        if (customerIndex !== -1) {
          this.posCustomers[customerIndex] = {
            ...this.posCustomers[customerIndex],
            syncedAt: new Date(),
          };
        }
        break;
      case 'inventory-adjustment':
        // For inventory adjustments, we might need to update the inventory service
        break;
    }
  }

  async getActiveSessions(): Promise<PosSession[]> {
    return this.posSessions.filter(session => session.status === 'active');
  }

  async getSyncLogs(): Promise<PosSyncLog[]> {
    return this.posSyncLogs;
  }

  async registerDevice(registerPosDeviceDto: RegisterPosDeviceDto): Promise<PosDevice> {
    const device: PosDevice = {
      id: Math.random().toString(36).substring(7),
      ...registerPosDeviceDto,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.posDevices.push(device);

    this.logger.log(`POS device registered: ${device.id} - ${device.name}`);

    return device;
  }

  async getDeviceById(id: string): Promise<PosDevice> {
    const device = this.posDevices.find(d => d.id === id);
    if (!device) {
      throw new Error(`POS device with ID ${id} not found`);
    }
    return device;
  }
}