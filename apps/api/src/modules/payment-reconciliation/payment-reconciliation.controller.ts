import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Param
} from '@nestjs/common';
import { PaymentReconciliationService } from './payment-reconciliation.service';
import { ReconcilePaymentsDto, ResolveDiscrepancyDto } from './dto/payment-reconciliation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payment Reconciliation')
@Controller('payment-reconciliation')
export class PaymentReconciliationController {
  constructor(private readonly paymentReconciliationService: PaymentReconciliationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Post('reconcile')
  @ApiOperation({ summary: 'Reconcile payments with gateway (admin/accountant only)' })
  @ApiResponse({ status: 200, description: 'Payment reconciliation completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async reconcilePayments(@Body() reconcilePaymentsDto: ReconcilePaymentsDto) {
    return this.paymentReconciliationService.reconcilePayments(
      reconcilePaymentsDto.startDate,
      reconcilePaymentsDto.endDate
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Get('reconciliation-report')
  @ApiOperation({ summary: 'Get reconciliation report (admin/accountant only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: 200, description: 'Reconciliation report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getReconciliationReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.paymentReconciliationService.reconcilePayments(startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Post('settle')
  @ApiOperation({ summary: 'Process payment settlements (admin/accountant only)' })
  @ApiResponse({ status: 200, description: 'Payment settlements processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async processSettlement() {
    return this.paymentReconciliationService.processSettlement();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Get('settlement-report')
  @ApiOperation({ summary: 'Get settlement report (admin/accountant only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiResponse({ status: 200, description: 'Settlement report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSettlementReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string
  ) {
    return this.paymentReconciliationService.getSettlementReport({
      startDate,
      endDate,
      status,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Get('dispute-report')
  @ApiOperation({ summary: 'Get dispute report (admin/accountant only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: 200, description: 'Dispute report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDisputeReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.paymentReconciliationService.getDisputeReport({
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Get('history')
  @ApiOperation({ summary: 'Get reconciliation history (admin/accountant only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for history' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for history' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Reconciliation history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getReconciliationHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.paymentReconciliationService.getReconciliationHistory({
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Post('resolve-discrepancy/:id')
  @ApiOperation({ summary: 'Resolve a payment discrepancy (admin/accountant only)' })
  @ApiParam({ name: 'id', description: 'Discrepancy ID' })
  @ApiResponse({ status: 200, description: 'Discrepancy resolved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Discrepancy not found' })
  async resolveDiscrepancy(
    @Param('id') discrepancyId: string,
    @Body() resolveDiscrepancyDto: ResolveDiscrepancyDto
  ) {
    return this.paymentReconciliationService.resolveDiscrepancy(
      discrepancyId,
      resolveDiscrepancyDto.resolution,
      resolveDiscrepancyDto.notes
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'accountant')
  @Get('summary')
  @ApiOperation({ summary: 'Get payment reconciliation summary (admin/accountant only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for summary' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for summary' })
  @ApiResponse({ status: 200, description: 'Reconciliation summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getReconciliationSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const reconciliationReport = await this.paymentReconciliationService.reconcilePayments(startDate, endDate);
    const settlementReport = await this.paymentReconciliationService.getSettlementReport({
      startDate,
      endDate,
    });
    const disputeReport = await this.paymentReconciliationService.getDisputeReport({
      startDate,
      endDate,
    });

    return {
      reconciliation: {
        totalPayments: reconciliationReport.totalPayments,
        totalAmount: reconciliationReport.totalAmount,
        reconciledCount: reconciliationReport.reconciled.length,
        unreconciledCount: reconciliationReport.unreconciled.length,
        discrepancyCount: reconciliationReport.discrepancies.length,
      },
      settlements: {
        totalSettled: settlementReport.totalSettled,
        settlementCount: settlementReport.settlementCount,
      },
      disputes: {
        totalDisputed: disputeReport.totalDisputed,
        disputeCount: disputeReport.disputeCount,
        disputeRate: disputeReport.disputeRate,
      },
      period: {
        start: startDate,
        end: endDate,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}