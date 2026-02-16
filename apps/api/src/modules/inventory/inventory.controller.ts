import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
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
  UpdateReorderPointDto
} from './dto/inventory.dto';
import { 
  InventoryItem, 
  InventoryBatch, 
  InventoryTransaction, 
  InventoryTransfer,
  ExpiryAlert,
  InventoryAudit,
  ReorderPoint
} from './interfaces/inventory.interface';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  createInventoryItem(@Body() createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    return this.inventoryService.createInventoryItem(createInventoryItemDto);
  }

  @Put('items/:id')
  updateInventoryItem(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto
  ): Promise<InventoryItem> {
    return this.inventoryService.updateInventoryItem(id, updateInventoryItemDto);
  }

  @Get('items/:id')
  getInventoryItemById(@Param('id') id: string): Promise<InventoryItem> {
    return this.inventoryService.getInventoryItemById(id);
  }

  @Get('items')
  getAllInventoryItems(): Promise<InventoryItem[]> {
    return this.inventoryService.getAllInventoryItems();
  }

  @Get('items/low-stock')
  getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryService.getLowStockItems();
  }

  @Post('batches')
  createInventoryBatch(@Body() createInventoryBatchDto: CreateInventoryBatchDto): Promise<InventoryBatch> {
    return this.inventoryService.createInventoryBatch(createInventoryBatchDto);
  }

  @Put('batches/:id')
  updateInventoryBatch(
    @Param('id') id: string,
    @Body() updateInventoryBatchDto: UpdateInventoryBatchDto
  ): Promise<InventoryBatch> {
    return this.inventoryService.updateInventoryBatch(id, updateInventoryBatchDto);
  }

  @Get('batches/item/:inventoryItemId')
  getInventoryBatchesByItem(@Param('inventoryItemId') inventoryItemId: string): Promise<InventoryBatch[]> {
    return this.inventoryService.getInventoryBatchesByItem(inventoryItemId);
  }

  @Get('batches/expiring')
  getExpiringBatches(@Query('days') daysThreshold: number = 30): Promise<InventoryBatch[]> {
    return this.inventoryService.getExpiringBatches(daysThreshold);
  }

  @Post('transactions')
  createInventoryTransaction(@Body() createInventoryTransactionDto: CreateInventoryTransactionDto): Promise<InventoryTransaction> {
    return this.inventoryService.createInventoryTransaction(createInventoryTransactionDto);
  }

  @Get('transactions/item/:inventoryItemId')
  getInventoryTransactionsByItem(@Param('inventoryItemId') inventoryItemId: string): Promise<InventoryTransaction[]> {
    return this.inventoryService.getInventoryTransactionsByItem(inventoryItemId);
  }

  @Post('transfers')
  createInventoryTransfer(@Body() createInventoryTransferDto: CreateInventoryTransferDto): Promise<InventoryTransfer> {
    return this.inventoryService.createInventoryTransfer(createInventoryTransferDto);
  }

  @Put('transfers/:id')
  updateInventoryTransfer(
    @Param('id') id: string,
    @Body() updateInventoryTransferDto: UpdateInventoryTransferDto
  ): Promise<InventoryTransfer> {
    return this.inventoryService.updateInventoryTransfer(id, updateInventoryTransferDto);
  }

  @Get('transfers/status/:status')
  getInventoryTransfersByStatus(@Param('status') status: string): Promise<InventoryTransfer[]> {
    return this.inventoryService.getInventoryTransfersByStatus(status);
  }

  @Get('expiry-alerts')
  getExpiryAlerts(@Query('status') status?: string): Promise<ExpiryAlert[]> {
    return this.inventoryService.getExpiryAlerts(status);
  }

  @Post('expiry-alerts/:alertId/resolve')
  resolveExpiryAlert(
    @Param('alertId') alertId: string,
    @Body('resolvedBy') resolvedBy: string
  ): Promise<ExpiryAlert> {
    return this.inventoryService.resolveExpiryAlert(alertId, resolvedBy);
  }

  @Post('audits')
  conductInventoryAudit(@Body() conductInventoryAuditDto: ConductInventoryAuditDto): Promise<InventoryAudit> {
    return this.inventoryService.conductInventoryAudit(conductInventoryAuditDto);
  }

  @Get('audits/item/:inventoryItemId')
  getInventoryAuditsByItem(@Param('inventoryItemId') inventoryItemId: string): Promise<InventoryAudit[]> {
    return this.inventoryService.getInventoryAuditsByItem(inventoryItemId);
  }

  @Post('reorder-points')
  createReorderPoint(@Body() createReorderPointDto: CreateReorderPointDto): Promise<ReorderPoint> {
    return this.inventoryService.createReorderPoint(createReorderPointDto);
  }

  @Put('reorder-points/:id')
  updateReorderPoint(
    @Param('id') id: string,
    @Body() updateReorderPointDto: UpdateReorderPointDto
  ): Promise<ReorderPoint> {
    return this.inventoryService.updateReorderPoint(id, updateReorderPointDto);
  }

  @Get('reorder-points')
  getReorderPoints(@Query('status') status?: string): Promise<ReorderPoint[]> {
    return this.inventoryService.getReorderPoints(status);
  }

  @Get('reorder-points/low-stock')
  getLowStockReorderPoints(): Promise<ReorderPoint[]> {
    return this.inventoryService.getLowStockReorderPoints();
  }
}