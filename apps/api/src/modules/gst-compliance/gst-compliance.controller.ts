import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards,
  HttpStatus,
  HttpCode,
  Param,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { GstComplianceService } from './gst-compliance.service';
import { GenerateGstInvoiceDto } from './dto/generate-gst-invoice.dto';
import { GstReportDto } from './dto/gst-report.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('GST Compliance')
@Controller('gst-compliance')
export class GstComplianceController {
  constructor(private readonly gstComplianceService: GstComplianceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('calculate-gst/:orderId')
  @ApiOperation({ summary: 'Calculate GST for an order (admin only)' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'GST calculated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async calculateGst(@Param('orderId') orderId: string) {
    return this.gstComplianceService.calculateGstForOrder(orderId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('generate-invoice/:orderId')
  @ApiOperation({ summary: 'Generate GST-compliant invoice for an order (admin only)' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 201, description: 'GST invoice generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async generateGstInvoice(@Param('orderId') orderId: string) {
    return this.gstComplianceService.generateGstInvoice(orderId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('reports')
  @ApiOperation({ summary: 'Get GST reports (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  @ApiQuery({ name: 'gstType', required: false, description: 'Filter by GST type (cgst, sgst, igst, all)' })
  @ApiResponse({ status: 200, description: 'GST reports retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getGstReports(@Query() filters: GstReportDto) {
    return this.gstComplianceService.getGstReports(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('gstr1/:month/:year')
  @ApiOperation({ summary: 'Generate GSTR-1 report for a month/year (admin only)' })
  @ApiParam({ name: 'month', description: 'Month (1-12)' })
  @ApiParam({ name: 'year', description: 'Year (e.g., 2023)' })
  @ApiResponse({ status: 200, description: 'GSTR-1 report generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateGstr1Report(
    @Param('month') month: string,
    @Param('year') year: string
  ) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('Invalid month. Month must be between 1 and 12');
    }
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      throw new Error('Invalid year. Year must be between 2000 and 2100');
    }
    
    return this.gstComplianceService.generateGstr1Report(monthNum, yearNum);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('validate-gst')
  @ApiOperation({ summary: 'Validate GST number format (admin only)' })
  @ApiResponse({ status: 200, description: 'GST number validation result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async validateGstNumber(@Body('gstNumber') gstNumber: string) {
    return {
      gstNumber,
      isValid: await this.gstComplianceService.validateGstNumber(gstNumber)
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('invoice/:invoiceId/download')
  @ApiOperation({ summary: 'Download GST invoice as PDF (admin only)' })
  @ApiParam({ name: 'invoiceId', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'PDF invoice downloaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadInvoice(
    @Param('invoiceId') invoiceId: string,
    @Res() res: Response
  ) {
    const pdfPath = await this.gstComplianceService.generateTaxInvoicePdf(invoiceId);
    
    // In a real implementation, this would serve the actual PDF file
    // For now, we'll return a placeholder response
    res.json({
      message: 'PDF generation would happen here in a real implementation',
      invoiceId,
      downloadUrl: pdfPath
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('summary')
  @ApiOperation({ summary: 'Get GST compliance summary (admin only)' })
  @ApiResponse({ status: 200, description: 'GST compliance summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getGstSummary() {
    // This would return a summary of GST compliance metrics
    // For now, returning a placeholder response
    return {
      totalTaxableAmount: 0,
      totalGstCollected: 0,
      totalCgst: 0,
      totalSgst: 0,
      totalIgst: 0,
      totalInvoices: 0,
      pendingReturns: 0,
      overdueReturns: 0,
      lastFiledDate: null,
    };
  }
}