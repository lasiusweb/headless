import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface DemandForecast {
  productId: string;
  forecastPeriod: number;
  algorithm: string;
  forecastedDemand: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  recommendedStock: number;
  reorderPoint: number;
  safetyStock: number;
  seasonalityIndex?: number;
  trendCoefficient?: number;
  generatedAt: string;
}

export interface InventoryRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  recommendedOrderQuantity: number;
  reorderPoint: number;
  safetyStock: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  estimatedStockoutDate?: string;
  suggestedSuppliers?: string[];
}

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Generate demand forecast using multiple algorithms
   */
  async generateDemandForecast(
    productId: string,
    days: number = 30,
    options?: {
      algorithm?: 'moving_average' | 'exponential_smoothing' | 'linear_regression' | 'seasonal';
      seasonality?: boolean;
      trend?: boolean;
    }
  ): Promise<DemandForecast> {
    const client = this.supabaseService.getClient();

    // Get historical sales data
    const { data: orderItems, error } = await client
      .from('order_items')
      .select(`
        quantity,
        created_at,
        order:orders(status, created_at)
      `)
      .eq('variant.product_id', productId)
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .in('order.status', ['delivered', 'shipped', 'confirmed'])
      .order('created_at', { ascending: true });

    if (error || !orderItems || orderItems.length === 0) {
      // Return default forecast if no data
      return this.getDefaultForecast(productId, days);
    }

    // Process historical data into daily sales
    const dailySales = this.processHistoricalData(orderItems);

    // Apply forecasting algorithm
    const forecast = this.applyForecastingAlgorithm(
      dailySales,
      days,
      options?.algorithm || 'exponential_smoothing',
      options
    );

    // Calculate safety stock and reorder point
    const safetyStock = this.calculateSafetyStock(dailySales);
    const reorderPoint = this.calculateReorderPoint(forecast.forecastedDemand / days, safetyStock);

    return {
      ...forecast,
      safetyStock,
      reorderPoint,
      recommendedStock: Math.ceil(forecast.forecastedDemand + safetyStock),
    };
  }

  /**
   * Process order items into daily sales data
   */
  private processHistoricalData(orderItems: any[]): Map<string, number> {
    const dailySales = new Map<string, number>();

    for (const item of orderItems) {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const current = dailySales.get(date) || 0;
      dailySales.set(date, current + item.quantity);
    }

    return dailySales;
  }

  /**
   * Apply forecasting algorithm
   */
  private applyForecastingAlgorithm(
    dailySales: Map<string, number>,
    forecastDays: number,
    algorithm: string,
    options?: any
  ): DemandForecast {
    const salesArray = Array.from(dailySales.values());
    const avgDailySales = salesArray.reduce((a, b) => a + b, 0) / salesArray.length;

    switch (algorithm) {
      case 'moving_average':
        return this.movingAverageForecast(salesArray, forecastDays, avgDailySales);
      case 'exponential_smoothing':
        return this.exponentialSmoothingForecast(salesArray, forecastDays, avgDailySales);
      case 'linear_regression':
        return this.linearRegressionForecast(salesArray, forecastDays, avgDailySales);
      case 'seasonal':
        return this.seasonalForecast(salesArray, forecastDays, avgDailySales, options);
      default:
        return this.exponentialSmoothingForecast(salesArray, forecastDays, avgDailySales);
    }
  }

  /**
   * Simple moving average forecast
   */
  private movingAverageForecast(
    sales: number[],
    days: number,
    avgDaily: number
  ): DemandForecast {
    const forecastedDemand = Math.ceil(avgDaily * days);
    const stdDev = this.calculateStdDev(sales);
    const zScore = 1.65; // 95% confidence

    return {
      productId: '',
      forecastPeriod: days,
      algorithm: 'moving_average',
      forecastedDemand,
      confidenceInterval: {
        lower: Math.max(0, Math.ceil(forecastedDemand - zScore * stdDev * Math.sqrt(days))),
        upper: Math.ceil(forecastedDemand + zScore * stdDev * Math.sqrt(days)),
      },
      recommendedStock: forecastedDemand,
      reorderPoint: 0,
      safetyStock: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Exponential smoothing forecast
   */
  private exponentialSmoothingForecast(
    sales: number[],
    days: number,
    avgDaily: number
  ): DemandForecast {
    const alpha = 0.3; // Smoothing factor
    let smoothed = sales[0] || avgDaily;

    for (let i = 1; i < sales.length; i++) {
      smoothed = alpha * sales[i] + (1 - alpha) * smoothed;
    }

    const forecastedDemand = Math.ceil(smoothed * days);
    const trendCoefficient = (sales[sales.length - 1] - sales[0]) / sales.length;

    return {
      productId: '',
      forecastPeriod: days,
      algorithm: 'exponential_smoothing',
      forecastedDemand,
      confidenceInterval: {
        lower: Math.ceil(forecastedDemand * 0.8),
        upper: Math.ceil(forecastedDemand * 1.2),
      },
      recommendedStock: forecastedDemand,
      reorderPoint: 0,
      safetyStock: 0,
      trendCoefficient,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Linear regression forecast
   */
  private linearRegressionForecast(
    sales: number[],
    days: number,
    avgDaily: number
  ): DemandForecast {
    // Simple linear regression
    const n = sales.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += sales[i];
      sumXY += i * sales[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast next 'days' periods
    let forecastedDemand = 0;
    for (let i = n; i < n + days; i++) {
      forecastedDemand += slope * i + intercept;
    }

    return {
      productId: '',
      forecastPeriod: days,
      algorithm: 'linear_regression',
      forecastedDemand: Math.ceil(forecastedDemand),
      confidenceInterval: {
        lower: Math.ceil(forecastedDemand * 0.85),
        upper: Math.ceil(forecastedDemand * 1.15),
      },
      recommendedStock: Math.ceil(forecastedDemand),
      reorderPoint: 0,
      safetyStock: 0,
      trendCoefficient: slope,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Seasonal forecast with trend
   */
  private seasonalForecast(
    sales: number[],
    days: number,
    avgDaily: number,
    options?: any
  ): DemandForecast {
    // Calculate seasonal indices (weekly pattern)
    const weeklyPattern = new Array(7).fill(0);
    const weeklyCount = new Array(7).fill(0);

    for (let i = 0; i < sales.length; i++) {
      const dayOfWeek = i % 7;
      weeklyPattern[dayOfWeek] += sales[i];
      weeklyCount[dayOfWeek]++;
    }

    const seasonalIndices = weeklyPattern.map((sum, i) =>
      weeklyCount[i] > 0 ? sum / weeklyCount[i] / avgDaily : 1
    );

    // Apply seasonal adjustment
    let seasonalDemand = 0;
    for (let i = 0; i < days; i++) {
      const seasonalIndex = seasonalIndices[i % 7];
      seasonalDemand += avgDaily * seasonalIndex;
    }

    return {
      productId: '',
      forecastPeriod: days,
      algorithm: 'seasonal',
      forecastedDemand: Math.ceil(seasonalDemand),
      confidenceInterval: {
        lower: Math.ceil(seasonalDemand * 0.75),
        upper: Math.ceil(seasonalDemand * 1.25),
      },
      recommendedStock: Math.ceil(seasonalDemand),
      reorderPoint: 0,
      safetyStock: 0,
      seasonalityIndex: Math.max(...seasonalIndices),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate safety stock
   */
  private calculateSafetyStock(dailySales: Map<string, number>): number {
    const sales = Array.from(dailySales.values());
    if (sales.length < 2) return 0;

    const stdDev = this.calculateStdDev(sales);
    const zScore = 1.65; // 95% service level
    const leadTimeDays = 7; // Default lead time

    return Math.ceil(zScore * stdDev * Math.sqrt(leadTimeDays));
  }

  /**
   * Calculate reorder point
   */
  private calculateReorderPoint(avgDailyDemand: number, safetyStock: number): number {
    const leadTimeDays = 7;
    return Math.ceil(avgDailyDemand * leadTimeDays + safetyStock);
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[]): number {
    if (values.length < 2) return 0;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Get default forecast when no data available
   */
  private getDefaultForecast(productId: string, days: number): DemandForecast {
    return {
      productId,
      forecastPeriod: days,
      algorithm: 'default',
      forecastedDemand: 0,
      confidenceInterval: { lower: 0, upper: 0 },
      recommendedStock: 0,
      reorderPoint: 0,
      safetyStock: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate inventory recommendations for all products
   */
  async generateInventoryRecommendations(): Promise<InventoryRecommendation[]> {
    const client = this.supabaseService.getClient();

    // Get all products with inventory
    const { data: products } = await client
      .from('products')
      .select(`
        *,
        inventory:inventory(available_stock, reorder_level),
        variants:product_variants(id)
      `);

    if (!products || products.length === 0) {
      return [];
    }

    const recommendations: InventoryRecommendation[] = [];

    for (const product of products) {
      const inventory = product.inventory?.[0];
      if (!inventory) continue;

      // Get forecast for this product
      const forecast = await this.generateDemandForecast(product.id, 30);

      const currentStock = inventory.available_stock || 0;
      const reorderPoint = forecast.reorderPoint || inventory.reorder_level || 0;
      const safetyStock = forecast.safetyStock || 0;

      // Determine priority
      let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
      let reason = '';
      let estimatedStockoutDate: string | undefined;

      if (currentStock <= safetyStock) {
        priority = 'critical';
        reason = 'Stock below safety stock level';
        const daysToStockout = Math.ceil(currentStock / (forecast.forecastedDemand / 30));
        estimatedStockoutDate = new Date(Date.now() + daysToStockout * 24 * 60 * 60 * 1000).toISOString();
      } else if (currentStock <= reorderPoint) {
        priority = 'high';
        reason = 'Stock below reorder point';
      } else if (currentStock <= reorderPoint * 1.5) {
        priority = 'medium';
        reason = 'Stock approaching reorder point';
      } else {
        priority = 'low';
        reason = 'Stock levels adequate';
      }

      // Calculate recommended order quantity
      const recommendedOrderQuantity = Math.max(
        0,
        forecast.recommendedStock - currentStock + safetyStock
      );

      if (recommendedOrderQuantity > 0 || priority !== 'low') {
        recommendations.push({
          productId: product.id,
          productName: product.name,
          currentStock,
          recommendedOrderQuantity,
          reorderPoint,
          safetyStock,
          priority,
          reason,
          estimatedStockoutDate,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
  }

  /**
   * Get forecast accuracy metrics
   */
  async getForecastAccuracy(productId: string, period: string): Promise<any> {
    const client = this.supabaseService.getClient();

    // Get historical forecasts and actual sales
    const { data: forecasts } = await client
      .from('demand_forecasts')
      .select('*')
      .eq('product_id', productId)
      .gte('created_at', new Date(`${period}-01`).toISOString())
      .lt('created_at', new Date(`${period}-01`).setMonth(new Date(`${period}-01`).getMonth() + 1));

    if (!forecasts || forecasts.length === 0) {
      return { accuracy: 0, mape: 0, bias: 0 };
    }

    // Calculate accuracy metrics
    let totalError = 0;
    let totalActual = 0;
    let totalBias = 0;

    for (const forecast of forecasts) {
      const error = Math.abs(forecast.actual_demand - forecast.forecasted_demand);
      totalError += error;
      totalActual += forecast.actual_demand;
      totalBias += forecast.actual_demand - forecast.forecasted_demand;
    }

    const mape = (totalError / totalActual) * 100; // Mean Absolute Percentage Error
    const accuracy = 100 - mape;
    const bias = totalBias / forecasts.length;

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      mape: Math.round(mape * 100) / 100,
      bias: Math.round(bias * 100) / 100,
      forecastCount: forecasts.length,
    };
  }

  /**
   * Generate inventory recommendations based on forecast
   */
  async generateInventoryRecommendations(
    warehouseId?: string,
    options?: {
      minDaysOfStock?: number;
      maxDaysOfStock?: number;
      safetyStockMultiplier?: number;
    }
  ): Promise<InventoryRecommendation[]> {
    const minDays = options?.minDaysOfStock || 7;
    const maxDays = options?.maxDaysOfStock || 30;
    const safetyMultiplier = options?.safetyStockMultiplier || 1.2;

    // Get all active products with their inventory levels
    let query = this.supabaseService.getClient()
      .from('inventory')
      .select(`
        *,
        variant:product_variants(
          id,
          name,
          sku,
          product:products(name, segment_id)
        )
      `)
      .eq('variant.is_active', true);

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data: inventoryData, error: inventoryError } = await query;

    if (inventoryError) {
      throw new Error(`Error fetching inventory data: ${inventoryError.message}`);
    }

    const recommendations = [];

    for (const inventory of inventoryData) {
      // Get demand forecast for this product (last 30 days)
      const forecast = await this.generateDemandForecast(
        inventory.variant.product.id,
        30
      );

      // Calculate average daily demand
      const avgDailyDemand = forecast.forecast.reduce((sum, day) => sum + day.demand, 0) / forecast.forecast.length;

      // Calculate recommended stock levels
      const minStockLevel = Math.ceil(avgDailyDemand * minDays * safetyMultiplier);
      const maxStockLevel = Math.ceil(avgDailyDemand * maxDays);
      const currentStock = inventory.available_quantity;
      
      // Calculate days of stock remaining
      const daysOfStockRemaining = avgDailyDemand > 0 ? currentStock / avgDailyDemand : Infinity;

      // Determine recommendation
      let recommendation = 'normal';
      if (currentStock < minStockLevel) {
        recommendation = 'reorder';
      } else if (currentStock > maxStockLevel) {
        recommendation = 'reduce';
      }

      recommendations.push({
        variantId: inventory.variant.id,
        productId: inventory.variant.product.id,
        productName: inventory.variant.product.name,
        variantName: inventory.variant.name,
        sku: inventory.variant.sku,
        currentStock: currentStock,
        minStockLevel,
        maxStockLevel,
        avgDailyDemand: parseFloat(avgDailyDemand.toFixed(2)),
        daysOfStockRemaining: parseFloat(daysOfStockRemaining.toFixed(2)),
        recommendation,
        suggestedOrderQuantity: Math.max(0, minStockLevel - currentStock),
        forecast: forecast.forecast.slice(0, 7), // Include 7-day forecast
      });
    }

    return {
      warehouseId,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }

  async getSeasonalTrends(productId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') {
    const { data: orderItems, error: orderItemsError } = await this.supabaseService.getClient()
      .from('order_items')
      .select(`
        quantity,
        created_at,
        order:orders(status, created_at)
      `)
      .eq('variant.product_id', productId)
      .gte('order.created_at', new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()) // Last 2 years
      .in('order.status', ['delivered', 'shipped', 'confirmed']);

    if (orderItemsError) {
      throw new Error(`Error fetching order data: ${orderItemsError.message}`);
    }

    // Group data by the specified period
    const groupedData = this.groupByPeriod(orderItems, period);

    // Calculate seasonal indices
    const seasonalIndices = this.calculateSeasonalIndices(groupedData);

    return {
      productId,
      period,
      seasonalTrends: groupedData,
      seasonalIndices,
      analysis: this.analyzeSeasonalPatterns(seasonalIndices),
    };
  }

  async predictRestockDate(variantId: string, warehouseId: string) {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (inventoryError) {
      throw new Error(`Inventory not found: ${inventoryError.message}`);
    }

    // Get demand forecast
    const forecast = await this.generateDemandForecast(
      variantId,
      30
    );

    // Calculate average daily demand
    const avgDailyDemand = forecast.forecast.reduce((sum, day) => sum + day.demand, 0) / forecast.forecast.length;

    if (avgDailyDemand <= 0) {
      return {
        variantId,
        daysUntilReorder: 'N/A',
        predictedReorderDate: null,
        message: 'Insufficient demand data to predict restock date',
      };
    }

    // Calculate days until stock runs out
    const daysUntilReorder = Math.floor(inventory.available_quantity / avgDailyDemand);

    // Predict reorder date
    const predictedReorderDate = new Date();
    predictedReorderDate.setDate(predictedReorderDate.getDate() + daysUntilReorder);

    return {
      variantId,
      daysUntilReorder,
      predictedReorderDate: predictedReorderDate.toISOString(),
      currentStock: inventory.available_quantity,
      avgDailyDemand: parseFloat(avgDailyDemand.toFixed(2)),
    };
  }
}