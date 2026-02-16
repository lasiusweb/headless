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
  HttpCode,
  Req
} from '@nestjs/common';
import { MobilePosService } from './mobile-pos.service';
import { CreatePosTransactionDto } from './dto/create-pos-transaction.dto';
import { UpdatePosTransactionDto } from './dto/update-pos-transaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Mobile POS')
@Controller('mobile-pos')
export class MobilePosController {
  constructor(private readonly mobilePosService: MobilePosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff', 'dealer')
  @Post('transaction')
  @ApiOperation({ summary: 'Create a new POS transaction (for authorized users)' })
  @ApiResponse({ status: 201, description: 'POS transaction created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPosTransaction(
    @Body() createPosTransactionDto: CreatePosTransactionDto,
    @Req() req
  ) {
    return this.mobilePosService.createPosTransaction(createPosTransactionDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff', 'dealer')
  @Get('transactions')
  @ApiOperation({ summary: 'Get POS transactions for the authenticated user' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search by transaction number or customer name' })
  @ApiResponse({ status: 200, description: 'List of POS transactions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserPosTransactions(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('searchTerm') searchTerm?: string
  ) {
    return this.mobilePosService.getUserPosTransactions(req.user.id, {
      startDate,
      endDate,
      status,
      searchTerm
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff', 'dealer')
  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get a specific POS transaction by ID' })
  @ApiParam({ name: 'id', description: 'POS Transaction ID' })
  @ApiResponse({ status: 200, description: 'POS transaction details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getPosTransaction(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.mobilePosService.getPosTransactionById(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update a POS transaction (admin/staff only)' })
  @ApiParam({ name: 'id', description: 'POS Transaction ID' })
  @ApiResponse({ status: 200, description: 'POS transaction updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updatePosTransaction(
    @Param('id') id: string,
    @Body() updatePosTransactionDto: UpdatePosTransactionDto,
    @Req() req
  ) {
    return this.mobilePosService.updatePosTransaction(id, updatePosTransactionDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff', 'dealer')
  @Post('sync-offline-transactions')
  @ApiOperation({ summary: 'Sync offline POS transactions when device comes online' })
  @ApiResponse({ status: 200, description: 'Offline transactions synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async syncOfflineTransactions(@Req() req) {
    return this.mobilePosService.syncOfflineTransactions(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff', 'dealer')
  @Get('dashboard-metrics')
  @ApiOperation({ summary: 'Get POS dashboard metrics for the authenticated user' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for metrics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for metrics' })
  @ApiResponse({ status: 200, description: 'POS dashboard metrics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPosDashboardMetrics(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.mobilePosService.getPosDashboardMetrics(req.user.id, {
      startDate,
      endDate
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('transactions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a POS transaction (admin only)' })
  @ApiParam({ name: 'id', description: 'POS Transaction ID' })
  @ApiResponse({ status: 200, description: 'POS transaction deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deletePosTransaction(
    @Param('id') id: string,
    @Req() req
  ) {
    // In a real implementation, we might not want to allow deletion of completed transactions
    // For now, we'll implement a soft delete or status change
    return this.mobilePosService.updatePosTransaction(id, { 
      type: 'adjustment', 
      notes: 'Transaction voided by admin', 
      reason: 'admin_action' 
    }, req.user.id);
  }
}