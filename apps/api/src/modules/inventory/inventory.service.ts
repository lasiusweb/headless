import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InventoryItem,
  InventoryBatch,
  InventoryTransaction,
  InventoryTransfer,
  ExpiryAlert,
  InventoryAudit,
  ReorderPoint,
  StockReservation
} from './interfaces/inventory.interface';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateInventoryBatchDto,
  UpdateInventoryBatchDto,
  CreateInventoryTransactionDto,
  CreateInventoryTransferDto,
  UpdateInventoryTransferDto,
  ConductInventoryAuditDto,
  CreateReorderPointDto,
  UpdateReorderPointDto,
  CreateStockReservationDto
} from './dto/inventory.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private inventoryItems: InventoryItem[] = [];
  private inventoryBatches: InventoryBatch[] = [];
  private inventoryTransactions: InventoryTransaction[] = [];
  private inventoryTransfers: InventoryTransfer[] = [];
  private expiryAlerts: ExpiryAlert[] = [];
  private inventoryAudits: InventoryAudit[] = [];
  private reorderPoints: ReorderPoint[] = [];
  private stockReservations: StockReservation[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  async createInventoryItem(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const inventoryItem: InventoryItem = {
      id: Math.random().toString(36).substring(7),
      ...createInventoryItemDto,
      status: createInventoryItemDto.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inventoryItems.push(inventoryItem);

    // Create reorder point if stock is at or below reorder level
    if (inventoryItem.availableStock <= inventoryItem.reorderLevel) {
      await this.createReorderPoint({
        inventoryItemId: inventoryItem.id,
        productId: inventoryItem.productId,
        productName: inventoryItem.productName,
        reorderLevel: inventoryItem.reorderLevel,
        reorderQuantity: inventoryItem.maxStockLevel || inventoryItem.reorderLevel * 2,
        supplierId: inventoryItem.supplierId || '',
        supplierName: inventoryItem.supplierName || '',
        leadTime: 7, // Default 7 days
        safetyStock: Math.floor(inventoryItem.reorderLevel / 2),
      });
    }

    this.logger.log(`Inventory item created: ${inventoryItem.id} - ${inventoryItem.productName}`);

    return inventoryItem;
  }

  async updateInventoryItem(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const index = this.inventoryItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Inventory item with ID ${id} not found`);
    }

    const oldItem = { ...this.inventoryItems[index] };
    this.inventoryItems[index] = {
      ...this.inventoryItems[index],
      ...updateInventoryItemDto,
      updatedAt: new Date(),
    };

    // Check if stock is at or below reorder level
    if (this.inventoryItems[index].availableStock <= this.inventoryItems[index].reorderLevel) {
      const existingReorderPoint = this.reorderPoints.find(rp => rp.inventoryItemId === id);
      if (!existingReorderPoint) {
        await this.createReorderPoint({
          inventoryItemId: this.inventoryItems[index].id,
          productId: this.inventoryItems[index].productId,
          productName: this.inventoryItems[index].productName,
          reorderLevel: this.inventoryItems[index].reorderLevel,
          reorderQuantity: this.inventoryItems[index].maxStockLevel || this.inventoryItems[index].reorderLevel * 2,
          supplierId: this.inventoryItems[index].supplierId || '',
          supplierName: this.inventoryItems[index].supplierName || '',
          leadTime: 7,
          safetyStock: Math.floor(this.inventoryItems[index].reorderLevel / 2),
        });
      }
    }

    this.logger.log(`Inventory item updated: ${id} - ${this.inventoryItems[index].productName}`);

    return this.inventoryItems[index];
  }

  async getInventoryItemById(id: string): Promise<InventoryItem> {
    const item = this.inventoryItems.find(i => i.id === id);
    if (!item) {
      throw new Error(`Inventory item with ID ${id} not found`);
    }
    return item;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return [...this.inventoryItems];
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryItems.filter(item => item.availableStock <= item.reorderLevel);
  }

  async createInventoryBatch(createInventoryBatchDto: CreateInventoryBatchDto): Promise<InventoryBatch> {
    const batch: InventoryBatch = {
      id: Math.random().toString(36).substring(7),
      ...createInventoryBatchDto,
      manufacturingDate: createInventoryBatchDto.manufacturingDate ? new Date(createInventoryBatchDto.manufacturingDate) : undefined,
      expiryDate: createInventoryBatchDto.expiryDate ? new Date(createInventoryBatchDto.expiryDate) : undefined,
      receivedDate: new Date(createInventoryBatchDto.receivedDate),
      status: createInventoryBatchDto.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inventoryBatches.push(batch);

    // Update inventory item stock
    const itemIndex = this.inventoryItems.findIndex(item => item.id === createInventoryBatchDto.inventoryItemId);
    if (itemIndex !== -1) {
      this.inventoryItems[itemIndex] = {
        ...this.inventoryItems[itemIndex],
        totalStock: this.inventoryItems[itemIndex].totalStock + batch.quantity,
        availableStock: this.inventoryItems[itemIndex].availableStock + batch.quantity,
        lastRestockedAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Create receipt transaction
    await this.createInventoryTransaction({
      inventoryItemId: batch.inventoryItemId,
      batchId: batch.id,
      transactionType: 'receipt',
      quantity: batch.quantity,
      unitCost: batch.costPerUnit,
      totalValue: batch.costPerUnit * batch.quantity,
      notes: `Batch ${batch.batchNumber} received`,
      processedBy: 'system',
    });

    // Check for expiry alerts
    if (batch.expiryDate) {
      await this.checkExpiryAndCreateAlert(batch);
    }

    this.logger.log(`Inventory batch created: ${batch.id} - Batch ${batch.batchNumber}`);

    return batch;
  }

  async updateInventoryBatch(id: string, updateInventoryBatchDto: UpdateInventoryBatchDto): Promise<InventoryBatch> {
    const index = this.inventoryBatches.findIndex(batch => batch.id === id);
    if (index === -1) {
      throw new Error(`Inventory batch with ID ${id} not found`);
    }

    const oldBatch = { ...this.inventoryBatches[index] };
    this.inventoryBatches[index] = {
      ...this.inventoryBatches[index],
      ...updateInventoryBatchDto,
      manufacturingDate: updateInventoryBatchDto.manufacturingDate ? new Date(updateInventoryBatchDto.manufacturingDate) : this.inventoryBatches[index].manufacturingDate,
      expiryDate: updateInventoryBatchDto.expiryDate ? new Date(updateInventoryBatchDto.expiryDate) : this.inventoryBatches[index].expiryDate,
      updatedAt: new Date(),
    };

    // Check for expiry alerts if expiry date changed
    if (updateInventoryBatchDto.expiryDate && this.inventoryBatches[index].expiryDate) {
      await this.checkExpiryAndCreateAlert(this.inventoryBatches[index]);
    }

    this.logger.log(`Inventory batch updated: ${id} - Batch ${this.inventoryBatches[index].batchNumber}`);

    return this.inventoryBatches[index];
  }

  async getInventoryBatchesByItem(inventoryItemId: string): Promise<InventoryBatch[]> {
    return this.inventoryBatches.filter(batch => batch.inventoryItemId === inventoryItemId);
  }

  async getExpiringBatches(daysThreshold: number = 30): Promise<InventoryBatch[]> {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
    
    return this.inventoryBatches.filter(batch => 
      batch.expiryDate && 
      batch.expiryDate <= thresholdDate && 
      batch.status === 'active'
    );
  }

  async createInventoryTransaction(createInventoryTransactionDto: CreateInventoryTransactionDto): Promise<InventoryTransaction> {
    const transaction: InventoryTransaction = {
      id: Math.random().toString(36).substring(7),
      ...createInventoryTransactionDto,
      totalValue: createInventoryTransactionDto.unitCost && createInventoryTransactionDto.quantity 
        ? createInventoryTransactionDto.unitCost * createInventoryTransactionDto.quantity 
        : undefined,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inventoryTransactions.push(transaction);

    // Update inventory item stock based on transaction type
    const itemIndex = this.inventoryItems.findIndex(item => item.id === createInventoryTransactionDto.inventoryItemId);
    if (itemIndex !== -1) {
      const item = this.inventoryItems[itemIndex];
      let quantityChange = 0;
      let availableChange = 0;

      switch (createInventoryTransactionDto.transactionType) {
        case 'receipt':
          quantityChange = createInventoryTransactionDto.quantity;
          availableChange = createInventoryTransactionDto.quantity;
          break;
        case 'issue':
        case 'transfer':
          quantityChange = -createInventoryTransactionDto.quantity;
          availableChange = -createInventoryTransactionDto.quantity;
          break;
        case 'damage':
        case 'theft':
        case 'expiry':
          quantityChange = -createInventoryTransactionDto.quantity;
          availableChange = -createInventoryTransactionDto.quantity;
          break;
        case 'adjustment':
          // For adjustments, the quantity can be positive or negative
          quantityChange = createInventoryTransactionDto.quantity;
          availableChange = createInventoryTransactionDto.quantity;
          break;
      }

      this.inventoryItems[itemIndex] = {
        ...item,
        totalStock: item.totalStock + quantityChange,
        availableStock: Math.max(0, item.availableStock + availableChange),
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Inventory transaction created: ${transaction.id} - Type: ${transaction.transactionType}`);

    return transaction;
  }

  async getInventoryTransactionsByItem(inventoryItemId: string): Promise<InventoryTransaction[]> {
    return this.inventoryTransactions.filter(transaction => transaction.inventoryItemId === inventoryItemId);
  }

  async createInventoryTransfer(createInventoryTransferDto: CreateInventoryTransferDto): Promise<InventoryTransfer> {
    const transfer: InventoryTransfer = {
      id: Math.random().toString(36).substring(7),
      ...createInventoryTransferDto,
      status: 'requested',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inventoryTransfers.push(transfer);

    this.logger.log(`Inventory transfer created: ${transfer.id} - From: ${transfer.fromLocation} To: ${transfer.toLocation}`);

    return transfer;
  }

  async updateInventoryTransfer(id: string, updateInventoryTransferDto: UpdateInventoryTransferDto): Promise<InventoryTransfer> {
    const index = this.inventoryTransfers.findIndex(transfer => transfer.id === id);
    if (index === -1) {
      throw new Error(`Inventory transfer with ID ${id} not found`);
    }

    this.inventoryTransfers[index] = {
      ...this.inventoryTransfers[index],
      ...updateInventoryTransferDto,
      shippedAt: updateInventoryTransferDto.shippedAt ? new Date(updateInventoryTransferDto.shippedAt) : this.inventoryTransfers[index].shippedAt,
      deliveredAt: updateInventoryTransferDto.deliveredAt ? new Date(updateInventoryTransferDto.deliveredAt) : this.inventoryTransfers[index].deliveredAt,
      receivedAt: updateInventoryTransferDto.receivedAt ? new Date(updateInventoryTransferDto.receivedAt) : this.inventoryTransfers[index].receivedAt,
      updatedAt: new Date(),
    };

    this.logger.log(`Inventory transfer updated: ${id} - Status: ${this.inventoryTransfers[index].status}`);

    return this.inventoryTransfers[index];
  }

  async getInventoryTransfersByStatus(status: string): Promise<InventoryTransfer[]> {
    return this.inventoryTransfers.filter(transfer => transfer.status === status);
  }

  async checkExpiryAndCreateAlert(batch: InventoryBatch): Promise<void> {
    if (!batch.expiryDate) return;

    const now = new Date();
    const daysUntilExpiry = Math.ceil((batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Create alert if expiry is within 60 days
    if (daysUntilExpiry <= 60 && batch.status === 'active') {
      const existingAlert = this.expiryAlerts.find(
        alert => alert.batchId === batch.id && alert.status === 'active'
      );

      if (!existingAlert) {
        const alert: ExpiryAlert = {
          id: Math.random().toString(36).substring(7),
          inventoryItemId: batch.inventoryItemId,
          batchId: batch.id,
          productName: this.inventoryItems.find(item => item.id === batch.inventoryItemId)?.productName || 'Unknown',
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate,
          daysUntilExpiry,
          alertLevel: daysUntilExpiry < 30 ? 'critical' : 'warning',
          status: 'active',
          createdAt: new Date(),
        };

        this.expiryAlerts.push(alert);
        this.logger.log(`Expiry alert created: ${alert.id} - Product: ${alert.productName} - Days until expiry: ${daysUntilExpiry}`);
      }
    }
  }

  async getExpiryAlerts(status?: string): Promise<ExpiryAlert[]> {
    if (status) {
      return this.expiryAlerts.filter(alert => alert.status === status);
    }
    return [...this.expiryAlerts];
  }

  async resolveExpiryAlert(alertId: string, resolvedBy: string): Promise<ExpiryAlert> {
    const index = this.expiryAlerts.findIndex(alert => alert.id === alertId);
    if (index === -1) {
      throw new Error(`Expiry alert with ID ${alertId} not found`);
    }

    this.expiryAlerts[index] = {
      ...this.expiryAlerts[index],
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy,
    };

    this.logger.log(`Expiry alert resolved: ${alertId}`);

    return this.expiryAlerts[index];
  }

  async conductInventoryAudit(conductInventoryAuditDto: ConductInventoryAuditDto): Promise<InventoryAudit> {
    const audit: InventoryAudit = {
      id: Math.random().toString(36).substring(7),
      ...conductInventoryAuditDto,
      systemCount: this.inventoryItems.find(item => item.id === conductInventoryAuditDto.inventoryItemId)?.totalStock || 0,
      variance: conductInventoryAuditDto.physicalCount - (this.inventoryItems.find(item => item.id === conductInventoryAuditDto.inventoryItemId)?.totalStock || 0),
      status: 'completed',
      conductedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inventoryAudits.push(audit);

    // If there's a variance, create an adjustment transaction
    if (audit.variance !== 0) {
      await this.createInventoryTransaction({
        inventoryItemId: conductInventoryAuditDto.inventoryItemId,
        batchId: conductInventoryAuditDto.batchId,
        transactionType: 'adjustment',
        quantity: audit.variance,
        notes: `Inventory audit adjustment: ${conductInventoryAuditDto.notes || ''}`,
        processedBy: conductInventoryAuditDto.auditorId,
      });
    }

    this.logger.log(`Inventory audit conducted: ${audit.id} - Variance: ${audit.variance}`);

    return audit;
  }

  async getInventoryAuditsByItem(inventoryItemId: string): Promise<InventoryAudit[]> {
    return this.inventoryAudits.filter(audit => audit.inventoryItemId === inventoryItemId);
  }

  async createReorderPoint(createReorderPointDto: CreateReorderPointDto): Promise<ReorderPoint> {
    const existingReorderPoint = this.reorderPoints.find(rp => rp.inventoryItemId === createReorderPointDto.inventoryItemId);
    if (existingReorderPoint) {
      // Update existing reorder point
      return this.updateReorderPoint(existingReorderPoint.id, createReorderPointDto);
    }

    const reorderPoint: ReorderPoint = {
      id: Math.random().toString(36).substring(7),
      ...createReorderPointDto,
      status: 'normal',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reorderPoints.push(reorderPoint);

    this.logger.log(`Reorder point created: ${reorderPoint.id} - Product: ${reorderPoint.productName}`);

    return reorderPoint;
  }

  async updateReorderPoint(id: string, updateReorderPointDto: UpdateReorderPointDto): Promise<ReorderPoint> {
    const index = this.reorderPoints.findIndex(rp => rp.id === id);
    if (index === -1) {
      throw new Error(`Reorder point with ID ${id} not found`);
    }

    this.reorderPoints[index] = {
      ...this.reorderPoints[index],
      ...updateReorderPointDto,
      updatedAt: new Date(),
    };

    this.logger.log(`Reorder point updated: ${id}`);

    return this.reorderPoints[index];
  }

  async getReorderPoints(status?: string): Promise<ReorderPoint[]> {
    if (status) {
      return this.reorderPoints.filter(rp => rp.status === status);
    }
    return [...this.reorderPoints];
  }

  async getLowStockReorderPoints(): Promise<ReorderPoint[]> {
    return this.reorderPoints.filter(rp => {
      const item = this.inventoryItems.find(i => i.id === rp.inventoryItemId);
      return item && item.availableStock <= rp.reorderLevel;
    });
  }

  async createStockReservation(createStockReservationDto: CreateStockReservationDto): Promise<StockReservation> {
    const item = this.inventoryItems.find(i => i.id === createStockReservationDto.inventoryItemId);
    
    if (!item) {
      throw new Error(`Inventory item with ID ${createStockReservationDto.inventoryItemId} not found`);
    }

    if (item.availableStock < createStockReservationDto.quantity) {
      throw new Error(`Insufficient stock available. Requested: ${createStockReservationDto.quantity}, Available: ${item.availableStock}`);
    }

    const expiresAfterHours = createStockReservationDto.expiresAfterHours || 24;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresAfterHours * 60 * 60 * 1000));

    const reservation: StockReservation = {
      id: Math.random().toString(36).substring(7),
      inventoryItemId: createStockReservationDto.inventoryItemId,
      orderId: createStockReservationDto.orderId,
      customerId: createStockReservationDto.customerId,
      quantity: createStockReservationDto.quantity,
      reservedAt: now,
      expiresAt,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.stockReservations.push(reservation);

    // Update inventory item's reserved stock
    const itemIndex = this.inventoryItems.findIndex(i => i.id === createStockReservationDto.inventoryItemId);
    if (itemIndex !== -1) {
      this.inventoryItems[itemIndex] = {
        ...this.inventoryItems[itemIndex],
        reservedStock: (this.inventoryItems[itemIndex].reservedStock || 0) + createStockReservationDto.quantity,
        availableStock: this.inventoryItems[itemIndex].availableStock - createStockReservationDto.quantity,
        updatedAt: now,
      };
    }

    this.logger.log(`Stock reservation created: ${reservation.id} - Order: ${createStockReservationDto.orderId} - Quantity: ${createStockReservationDto.quantity}`);

    return reservation;
  }

  async fulfillStockReservation(reservationId: string): Promise<StockReservation> {
    const index = this.stockReservations.findIndex(r => r.id === reservationId);
    if (index === -1) {
      throw new Error(`Stock reservation with ID ${reservationId} not found`);
    }

    const reservation = this.stockReservations[index];
    
    if (reservation.status !== 'active') {
      throw new Error(`Stock reservation is not active. Status: ${reservation.status}`);
    }

    this.stockReservations[index] = {
      ...reservation,
      status: 'fulfilled',
      updatedAt: new Date(),
    };

    this.logger.log(`Stock reservation fulfilled: ${reservationId}`);

    return this.stockReservations[index];
  }

  async cancelStockReservation(reservationId: string): Promise<StockReservation> {
    const index = this.stockReservations.findIndex(r => r.id === reservationId);
    if (index === -1) {
      throw new Error(`Stock reservation with ID ${reservationId} not found`);
    }

    const reservation = this.stockReservations[index];
    
    if (reservation.status !== 'active') {
      throw new Error(`Stock reservation is not active. Status: ${reservation.status}`);
    }

    // Release the reserved stock back to available stock
    const itemIndex = this.inventoryItems.findIndex(i => i.id === reservation.inventoryItemId);
    if (itemIndex !== -1) {
      this.inventoryItems[itemIndex] = {
        ...this.inventoryItems[itemIndex],
        reservedStock: (this.inventoryItems[itemIndex].reservedStock || 0) - reservation.quantity,
        availableStock: this.inventoryItems[itemIndex].availableStock + reservation.quantity,
        updatedAt: new Date(),
      };
    }

    this.stockReservations[index] = {
      ...reservation,
      status: 'cancelled',
      updatedAt: new Date(),
    };

    this.logger.log(`Stock reservation cancelled: ${reservationId}`);

    return this.stockReservations[index];
  }

  async getStockReservationsByOrder(orderId: string): Promise<StockReservation[]> {
    return this.stockReservations.filter(r => r.orderId === orderId);
  }

  async getExpiredReservations(): Promise<StockReservation[]> {
    const now = new Date();
    return this.stockReservations.filter(r => 
      r.status === 'active' && r.expiresAt < now
    );
  }

  async expireStockReservation(reservationId: string): Promise<StockReservation> {
    const index = this.stockReservations.findIndex(r => r.id === reservationId);
    if (index === -1) {
      throw new Error(`Stock reservation with ID ${reservationId} not found`);
    }

    const reservation = this.stockReservations[index];
    
    if (reservation.status !== 'active') {
      throw new Error(`Stock reservation is not active. Status: ${reservation.status}`);
    }

    // Release the reserved stock back to available stock
    const itemIndex = this.inventoryItems.findIndex(i => i.id === reservation.inventoryItemId);
    if (itemIndex !== -1) {
      this.inventoryItems[itemIndex] = {
        ...this.inventoryItems[itemIndex],
        reservedStock: (this.inventoryItems[itemIndex].reservedStock || 0) - reservation.quantity,
        availableStock: this.inventoryItems[itemIndex].availableStock + reservation.quantity,
        updatedAt: new Date(),
      };
    }

    this.stockReservations[index] = {
      ...reservation,
      status: 'expired',
      updatedAt: new Date(),
    };

    this.logger.log(`Stock reservation expired: ${reservationId}`);

    return this.stockReservations[index];
  }
}