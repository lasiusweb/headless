import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateSupplierDto {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  gst_number?: string;
  pan_number?: string;
  address?: any;
  payment_terms?: number;
  credit_limit?: number;
}

class CreatePurchaseOrderDto {
  supplier_id: string;
  items: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
  }>;
  expected_delivery_date: string;
  notes?: string;
}

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  async getAllSuppliers() {
    return this.supplierService.getAllSuppliers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  async getSupplier(@Param('id') id: string) {
    return this.supplierService.getSupplierById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new supplier' })
  async createSupplier(@Body() body: CreateSupplierDto) {
    return this.supplierService.createSupplier(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(@Param('id') id: string, @Body() body: Partial<CreateSupplierDto>) {
    return this.supplierService.updateSupplier(id, body);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get supplier analytics' })
  async getSupplierAnalytics(@Param('id') id: string) {
    return this.supplierService.getSupplierAnalytics(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get purchase orders by supplier' })
  async getPurchaseOrders(@Param('id') id: string) {
    return this.supplierService.getPurchaseOrdersBySupplier(id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create purchase order' })
  async createPurchaseOrder(@Body() body: CreatePurchaseOrderDto) {
    return this.supplierService.createPurchaseOrder(body);
  }

  @Post('orders/:id/approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  async approvePurchaseOrder(@Param('id') id: string) {
    return this.supplierService.approvePurchaseOrder(id);
  }

  @Post('orders/:id/receive')
  @ApiOperation({ summary: 'Mark purchase order as received' })
  async receivePurchaseOrder(
    @Param('id') id: string,
    @Body() items?: Array<{ id: string; received_quantity: number }>,
  ) {
    return this.supplierService.receivePurchaseOrder(id, items);
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  async getLowStockProducts() {
    return this.supplierService.getLowStockProducts();
  }

  @Post('inventory/auto-reorder')
  @ApiOperation({ summary: 'Auto-create POs for low stock' })
  async autoCreatePurchaseOrders() {
    return this.supplierService.autoCreatePurchaseOrders();
  }
}
