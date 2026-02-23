import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ForecastingService } from './forecasting.service';
import { DemandForecastDto } from './dto/demand-forecast.dto';
import { InventoryRecommendationDto } from './dto/inventory-recommendation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Forecasting & Demand Planning')
@Controller('forecasting')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Post('demand-forecast')
  @ApiOperation({ summary: 'Generate demand forecast for a product (admin/manager only)' })
  @ApiResponse({ status: 200, description: 'Demand forecast generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateDemandForecast(@Body() demandForecastDto: DemandForecastDto) {
    return this.forecastingService.generateDemandForecast(
      demandForecastDto.productId,
      demandForecastDto.days,
      {
        algorithm: demandForecastDto.algorithm,
        seasonality: demandForecastDto.includeSeasonality,
        trend: demandForecastDto.includeTrend,
      }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('demand-forecast/:productId')
  @ApiOperation({ summary: 'Get demand forecast for a specific product (admin/manager only)' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to forecast (default: 30)' })
  @ApiQuery({ name: 'algorithm', required: false, description: 'Forecasting algorithm to use' })
  @ApiResponse({ status: 200, description: 'Demand forecast retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getDemandForecast(
    @Param('productId') productId: string,
    @Query('days') days?: string,
    @Query('algorithm') algorithm?: string
  ) {
    const daysNum = days ? parseInt(days) : 30;
    return this.forecastingService.generateDemandForecast(
      productId,
      daysNum,
      { algorithm: algorithm as any }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Post('inventory-recommendations')
  @ApiOperation({ summary: 'Generate inventory recommendations (admin/manager only)' })
  @ApiResponse({ status: 200, description: 'Inventory recommendations generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async generateInventoryRecommendations(@Body() inventoryRecommendationDto: InventoryRecommendationDto) {
    return this.forecastingService.generateInventoryRecommendations(
      inventoryRecommendationDto.warehouseId,
      {
        minDaysOfStock: inventoryRecommendationDto.minDaysOfStock,
        maxDaysOfStock: inventoryRecommendationDto.maxDaysOfStock,
        safetyStockMultiplier: inventoryRecommendationDto.safetyStockMultiplier,
      }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('seasonal-trends/:productId')
  @ApiOperation({ summary: 'Get seasonal trends for a product (admin/manager only)' })
  @ApiQuery({ name: 'period', required: false, description: 'Period grouping (monthly, quarterly, yearly)' })
  @ApiResponse({ status: 200, description: 'Seasonal trends retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getSeasonalTrends(
    @Param('productId') productId: string,
    @Query('period') period?: 'monthly' | 'quarterly' | 'yearly'
  ) {
    return this.forecastingService.getSeasonalTrends(productId, period);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('restock-predictions/:variantId')
  @ApiOperation({ summary: 'Predict restock date for a variant (admin/manager only)' })
  @ApiQuery({ name: 'warehouseId', required: true, description: 'Warehouse ID' })
  @ApiResponse({ status: 200, description: 'Restock prediction retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async predictRestockDate(
    @Param('variantId') variantId: string,
    @Query('warehouseId') warehouseId: string
  ) {
    return this.forecastingService.predictRestockDate(variantId, warehouseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('inventory-alerts')
  @ApiOperation({ summary: 'Get inventory alerts based on forecasting (admin/manager only)' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: 'days', required: false, description: 'Days to look ahead for low stock (default: 7)' })
  @ApiResponse({ status: 200, description: 'Inventory alerts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getInventoryAlerts(
    @Query('warehouseId') warehouseId?: string,
    @Query('days') days?: string
  ) {
    const daysNum = days ? parseInt(days) : 7;
    
    // Generate inventory recommendations to identify potential low stock situations
    const recommendations = await this.forecastingService.generateInventoryRecommendations(
      warehouseId,
      { minDaysOfStock: daysNum }
    );
    
    // Filter for items that need reordering
    const alerts = recommendations.recommendations
      .filter(item => item.recommendation === 'reorder')
      .map(item => ({
        variantId: item.variantId,
        productId: item.productId,
        productName: item.productName,
        currentStock: item.currentStock,
        minStockLevel: item.minStockLevel,
        daysOfStockRemaining: item.daysOfStockRemaining,
        suggestedOrderQuantity: item.suggestedOrderQuantity,
      }));
    
    return {
      alerts,
      warehouseId,
      daysLookahead: daysNum,
      generatedAt: new Date().toISOString(),
    };
  }
}