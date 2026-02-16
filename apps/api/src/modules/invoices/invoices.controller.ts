import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { 
  CreateInvoiceDto, 
  UpdateInvoiceDto, 
  GenerateGstReportDto 
} from './dto/invoice.dto';
import { Invoice, GstComplianceReport } from './interfaces/invoice.interface';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.invoicesService.createInvoice(createInvoiceDto);
  }

  @Put(':id')
  updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto
  ): Promise<Invoice> {
    return this.invoicesService.updateInvoice(id, updateInvoiceDto);
  }

  @Get(':id')
  getInvoiceById(@Param('id') id: string): Promise<Invoice> {
    return this.invoicesService.getInvoiceById(id);
  }

  @Get('number/:invoiceNumber')
  getInvoiceByNumber(@Param('invoiceNumber') invoiceNumber: string): Promise<Invoice> {
    return this.invoicesService.getInvoiceByNumber(invoiceNumber);
  }

  @Get('order/:orderId')
  getInvoicesByOrder(@Param('orderId') orderId: string): Promise<Invoice[]> {
    return this.invoicesService.getInvoicesByOrder(orderId);
  }

  @Get('customer/:customerId')
  getInvoicesByCustomer(@Param('customerId') customerId: string): Promise<Invoice[]> {
    return this.invoicesService.getInvoicesByCustomer(customerId);
  }

  @Get('status/:status')
  getInvoicesByStatus(@Param('status') status: string): Promise<Invoice[]> {
    return this.invoicesService.getInvoicesByStatus(status);
  }

  @Get('date-range')
  getInvoicesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<Invoice[]> {
    return this.invoicesService.getInvoicesByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('gst-report')
  generateGstReport(@Body() generateGstReportDto: GenerateGstReportDto): Promise<GstComplianceReport> {
    return this.invoicesService.generateGstReport(generateGstReportDto);
  }

  @Get('gst-report/:id')
  getGstReportById(@Param('id') id: string): Promise<GstComplianceReport> {
    return this.invoicesService.getGstReportById(id);
  }

  @Get('gst-report/period/:period')
  getGstReportsByPeriod(@Param('period') period: string): Promise<GstComplianceReport[]> {
    return this.invoicesService.getGstReportsByPeriod(period);
  }

  @Put('gst-report/:id/status')
  updateGstReportStatus(
    @Param('id') id: string,
    @Query('status') status: 'pending' | 'submitted' | 'verified'
  ): Promise<GstComplianceReport> {
    return this.invoicesService.updateGstReportStatus(id, status);
  }
}