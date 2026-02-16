import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { 
  CreateReportDto, 
  UpdateReportDto, 
  GenerateReportDto, 
  GetAnalyticsDto 
} from './dto/analytics.dto';
import { 
  SalesAnalytics, 
  CustomerAnalytics, 
  InventoryAnalytics, 
  FinancialAnalytics, 
  Report,
  DashboardWidget
} from './interfaces/analytics.interface';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  getSalesAnalytics(@Query() getAnalyticsDto: GetAnalyticsDto): Promise<SalesAnalytics> {
    return this.analyticsService.getSalesAnalytics(getAnalyticsDto);
  }

  @Get('customers')
  getCustomerAnalytics(@Query() getAnalyticsDto: GetAnalyticsDto): Promise<CustomerAnalytics> {
    return this.analyticsService.getCustomerAnalytics(getAnalyticsDto);
  }

  @Get('inventory')
  getInventoryAnalytics(@Query() getAnalyticsDto: GetAnalyticsDto): Promise<InventoryAnalytics> {
    return this.analyticsService.getInventoryAnalytics(getAnalyticsDto);
  }

  @Get('financial')
  getFinancialAnalytics(@Query() getAnalyticsDto: GetAnalyticsDto): Promise<FinancialAnalytics> {
    return this.analyticsService.getFinancialAnalytics(getAnalyticsDto);
  }

  @Post('reports')
  createReport(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.analyticsService.createReport(createReportDto);
  }

  @Put('reports/:id')
  updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto
  ): Promise<Report> {
    return this.analyticsService.updateReport(id, updateReportDto);
  }

  @Get('reports/:id')
  getReportById(@Param('id') id: string): Promise<Report> {
    return this.analyticsService.getReportById(id);
  }

  @Get('reports')
  getAllReports(): Promise<Report[]> {
    return this.analyticsService.getAllReports();
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string): Promise<boolean> {
    return this.analyticsService.deleteReport(id);
  }

  @Post('reports/generate')
  generateReport(@Body() generateReportDto: GenerateReportDto): Promise<any> {
    return this.analyticsService.generateReport(generateReportDto);
  }

  @Get('reports/scheduled')
  getScheduledReports(): Promise<Report[]> {
    return this.analyticsService.getScheduledReports();
  }

  @Post('dashboard-widgets')
  addDashboardWidget(@Body() widget: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardWidget> {
    return this.analyticsService.addDashboardWidget(widget);
  }

  @Get('dashboard-widgets')
  getDashboardWidgets(): Promise<DashboardWidget[]> {
    return this.analyticsService.getDashboardWidgets();
  }

  @Put('dashboard-widgets/:id')
  updateDashboardWidget(
    @Param('id') id: string,
    @Body() widget: Partial<DashboardWidget>
  ): Promise<DashboardWidget> {
    return this.analyticsService.updateDashboardWidget(id, widget);
  }
}