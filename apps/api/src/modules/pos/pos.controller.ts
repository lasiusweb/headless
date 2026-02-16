import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { PosService } from './pos.service';
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
import { 
  PosSession, 
  PosTransaction, 
  PosProduct, 
  PosCustomer, 
  PosInventoryAdjustment,
  PosSyncLog,
  PosDevice
} from './interfaces/pos.interface';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('session/start')
  startSession(@Body() startPosSessionDto: StartPosSessionDto): Promise<PosSession> {
    return this.posService.startSession(startPosSessionDto);
  }

  @Post('session/close')
  closeSession(@Body() closePosSessionDto: ClosePosSessionDto): Promise<PosSession> {
    return this.posService.closeSession(closePosSessionDto);
  }

  @Post('transaction')
  createTransaction(@Body() createPosTransactionDto: CreatePosTransactionDto): Promise<PosTransaction> {
    return this.posService.createTransaction(createPosTransactionDto);
  }

  @Put('transaction/:id')
  updateTransaction(
    @Param('id') id: string,
    @Body() updatePosTransactionDto: UpdatePosTransactionDto
  ): Promise<PosTransaction> {
    return this.posService.updateTransaction(id, updatePosTransactionDto);
  }

  @Get('transaction/:id')
  getTransactionById(@Param('id') id: string): Promise<PosTransaction> {
    return this.posService.getTransactionById(id);
  }

  @Get('transaction/session/:sessionId')
  getTransactionsBySession(@Param('sessionId') sessionId: string): Promise<PosTransaction[]> {
    return this.posService.getTransactionsBySession(sessionId);
  }

  @Post('product')
  createProduct(@Body() createPosProductDto: CreatePosProductDto): Promise<PosProduct> {
    return this.posService.createProduct(createPosProductDto);
  }

  @Put('product/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() updatePosProductDto: UpdatePosProductDto
  ): Promise<PosProduct> {
    return this.posService.updateProduct(id, updatePosProductDto);
  }

  @Get('product/:id')
  getProductById(@Param('id') id: string): Promise<PosProduct> {
    return this.posService.getProductById(id);
  }

  @Post('customer')
  createCustomer(@Body() createPosCustomerDto: CreatePosCustomerDto): Promise<PosCustomer> {
    return this.posService.createCustomer(createPosCustomerDto);
  }

  @Put('customer/:id')
  updateCustomer(
    @Param('id') id: string,
    @Body() updatePosCustomerDto: UpdatePosCustomerDto
  ): Promise<PosCustomer> {
    return this.posService.updateCustomer(id, updatePosCustomerDto);
  }

  @Get('customer/:id')
  getCustomerById(@Param('id') id: string): Promise<PosCustomer> {
    return this.posService.getCustomerById(id);
  }

  @Post('inventory-adjustment')
  createInventoryAdjustment(@Body() posInventoryAdjustmentDto: PosInventoryAdjustmentDto): Promise<PosInventoryAdjustment> {
    return this.posService.createInventoryAdjustment(posInventoryAdjustmentDto);
  }

  @Get('sync-queue')
  getSyncQueue(): Promise<PosSyncLog[]> {
    return this.posService.getSyncQueue();
  }

  @Post('process-sync')
  processSyncQueue(): Promise<void> {
    return this.posService.processSyncQueue();
  }

  @Get('sessions/active')
  getActiveSessions(): Promise<PosSession[]> {
    return this.posService.getActiveSessions();
  }

  @Get('sync-logs')
  getSyncLogs(): Promise<PosSyncLog[]> {
    return this.posService.getSyncLogs();
  }

  @Post('device/register')
  registerDevice(@Body() registerPosDeviceDto: RegisterPosDeviceDto): Promise<PosDevice> {
    return this.posService.registerDevice(registerPosDeviceDto);
  }

  @Get('device/:id')
  getDeviceById(@Param('id') id: string): Promise<PosDevice> {
    return this.posService.getDeviceById(id);
  }
}