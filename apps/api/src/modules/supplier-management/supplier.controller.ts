import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, CreatePurchaseOrderDto } from './dto/supplier.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Get()
  @ApiOperation({ summary: 'Get all suppliers (admin/procurement only)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by supplier type' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, company, or GST number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of suppliers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.supplierService.findAll({
      status,
      type: type as any,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Post()
  @ApiOperation({ summary: 'Create a new supplier (admin/procurement only)' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update supplier status (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('updatedBy') updatedBy: string
  ) {
    return this.supplierService.updateStatus(id, status, updatedBy);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a supplier (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Get(':id/products')
  @ApiOperation({ summary: 'Get products associated with a supplier (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getSupplierProducts(@Param('id') supplierId: string) {
    return this.supplierService.getSupplierProducts(supplierId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Post(':id/products')
  @ApiOperation({ summary: 'Add a product to a supplier (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 201, description: 'Product added to supplier successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async addProductToSupplier(
    @Param('id') supplierId: string,
    @Body('productId') productId: string,
    @Body('variantId') variantId: string,
    @Body('cost') cost: number
  ) {
    return this.supplierService.addProductToSupplier(supplierId, productId, variantId, cost);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Get(':id/orders')
  @ApiOperation({ summary: 'Get orders for a supplier (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiResponse({ status: 200, description: 'Supplier orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getSupplierOrders(
    @Param('id') supplierId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.supplierService.getSupplierOrders(supplierId, {
      status,
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Post('orders')
  @ApiOperation({ summary: 'Create a purchase order (admin/procurement only)' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createPurchaseOrder(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.supplierService.createPurchaseOrder(createPurchaseOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Get(':id/performance')
  @ApiOperation({ summary: 'Get supplier performance report (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for performance period' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for performance period' })
  @ApiResponse({ status: 200, description: 'Supplier performance report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getSupplierPerformance(
    @Param('id') supplierId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.supplierService.getSupplierPerformance(supplierId, {
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'procurement_manager')
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Add a review for a supplier (admin/procurement only)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 201, description: 'Supplier review added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async addSupplierReview(
    @Param('id') supplierId: string,
    @Body('userId') userId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string
  ) {
    return this.supplierService.addSupplierReview({
      supplierId,
      userId,
      rating,
      comment,
    });
  }
}