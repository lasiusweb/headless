import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  constructor(private supabaseService: SupabaseService) {}

  async generateDemandForecast(
    productId: string,
    days: number = 30,
    options?: {
      algorithm?: 'moving_average' | 'exponential_smoothing' | 'regression';
      seasonality?: boolean;
      trend?: boolean;
    }
  ) {
    // Get historical sales data for the product
    const { data: orderItems, error: orderItemsError } = await this.supabaseService.getClient()
      .from('order_items')
      .select(`
        quantity,
        created_at,
        order:orders(status, created_at)
      `)
      .eq('variant.product_id', productId)
      .gte('order.created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) // Last year
      .in('order.status', ['delivered', 'shipped', 'confirmed'])
      .order('order.created_at', { ascending: true });

    if (orderItemsError) {
      throw new Error(`Error fetching order data: ${orderItemsError.message}`);
    }

    // Process the historical data
    const historicalData = this.processHistoricalData(orderItems, days);

    // Apply forecasting algorithm based on options
    const forecast = this.applyForecastingAlgorithm(
      historicalData,
      days,
      options?.algorithm || 'moving_average',
      options
    );

    return {
      productId,
      forecastPeriod: days,
      algorithm: options?.algorithm || 'moving_average',
      forecast,
      historicalData,
      confidenceInterval: 0.95, // 95% confidence interval
    };
  }

  async generateInventoryRecommendations(
    warehouseId?: string,
    options?: {
      minDaysOfStock?: number;
      maxDaysOfStock?: number;
      safetyStockMultiplier?: number;
    }
  ) {
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

  private processHistoricalData(orderItems: any[], days: number) {
    // Group order items by date and calculate daily demand
    const dailyDemand = new Map<string, number>();
    
    orderItems.forEach(item => {
      const date = new Date(item.order.created_at).toISOString().split('T')[0];
      const currentDemand = dailyDemand.get(date) || 0;
      dailyDemand.set(date, currentDemand + item.quantity);
    });

    // Create an array of daily demand for the specified period
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      result.push({
        date: dateStr,
        demand: dailyDemand.get(dateStr) || 0,
      });
    }

    return result;
  }

  private applyForecastingAlgorithm(
    historicalData: Array<{ date: string; demand: number }>,
    days: number,
    algorithm: 'moving_average' | 'exponential_smoothing' | 'regression',
    options?: any
  ) {
    switch (algorithm) {
      case 'moving_average':
        return this.movingAverageForecast(historicalData, days);
      case 'exponential_smoothing':
        return this.exponentialSmoothingForecast(historicalData, days, options?.alpha || 0.3);
      case 'regression':
        return this.linearRegressionForecast(historicalData, days);
      default:
        return this.movingAverageForecast(historicalData, days);
    }
  }

  private movingAverageForecast(
    historicalData: Array<{ date: string; demand: number }>,
    days: number,
    windowSize: number = 7
  ) {
    const forecast = [];
    const recentData = historicalData.slice(-windowSize);
    
    // Calculate average of recent data
    const avgDemand = recentData.reduce((sum, item) => sum + item.demand, 0) / recentData.length;
    
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        demand: avgDemand,
        confidence: 0.8, // 80% confidence for simple moving average
      });
    }
    
    return forecast;
  }

  private exponentialSmoothingForecast(
    historicalData: Array<{ date: string; demand: number }>,
    days: number,
    alpha: number = 0.3
  ) {
    if (historicalData.length === 0) {
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        demand: 0,
        confidence: 0.5,
      }));
    }

    // Initialize forecast with first actual value
    let forecastValue = historicalData[0].demand;
    
    // Apply exponential smoothing to historical data
    for (let i = 1; i < historicalData.length; i++) {
      forecastValue = alpha * historicalData[i].demand + (1 - alpha) * forecastValue;
    }

    // Forecast future values
    const forecast = [];
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        demand: forecastValue,
        confidence: 0.7, // 70% confidence for exponential smoothing
      });
    }
    
    return forecast;
  }

  private linearRegressionForecast(
    historicalData: Array<{ date: string; demand: number }>,
    days: number
  ) {
    // Convert dates to numeric values for regression
    const xValues = historicalData.map((_, index) => index);
    const yValues = historicalData.map(item => item.demand);
    
    // Calculate regression coefficients
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecast
    const forecast = [];
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      const futureX = xValues[xValues.length - 1] + i;
      const predictedDemand = slope * futureX + intercept;
      
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        demand: Math.max(0, predictedDemand), // Ensure non-negative demand
        confidence: 0.75, // 75% confidence for linear regression
      });
    }
    
    return forecast;
  }

  private groupByPeriod(orderItems: any[], period: 'monthly' | 'quarterly' | 'yearly') {
    const grouped = new Map<string, number>();
    
    orderItems.forEach(item => {
      let periodKey: string;
      const date = new Date(item.order.created_at);
      
      switch (period) {
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'yearly':
          periodKey = `${date.getFullYear()}`;
          break;
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      const currentTotal = grouped.get(periodKey) || 0;
      grouped.set(periodKey, currentTotal + item.quantity);
    });
    
    return Array.from(grouped.entries()).map(([period, quantity]) => ({
      period,
      quantity,
    }));
  }

  private calculateSeasonalIndices(groupedData: Array<{ period: string; quantity: number }>) {
    // Calculate average quantity across all periods
    const totalQuantity = groupedData.reduce((sum, item) => sum + item.quantity, 0);
    const avgQuantity = totalQuantity / groupedData.length;
    
    // Calculate seasonal index for each period
    return groupedData.map(item => ({
      period: item.period,
      quantity: item.quantity,
      seasonalIndex: avgQuantity > 0 ? item.quantity / avgQuantity : 0,
    }));
  }

  private analyzeSeasonalPatterns(seasonalIndices: Array<{ period: string; quantity: number; seasonalIndex: number }>) {
    // Find periods with highest and lowest seasonal indices
    const sortedIndices = [...seasonalIndices].sort((a, b) => b.seasonalIndex - a.seasonalIndex);
    
    return {
      peakPeriod: sortedIndices[0]?.period,
      lowPeriod: sortedIndices[sortedIndices.length - 1]?.period,
      avgSeasonalIndex: seasonalIndices.reduce((sum, item) => sum + item.seasonalIndex, 0) / seasonalIndices.length,
      volatility: this.calculateVolatility(seasonalIndices),
    };
  }

  private calculateVolatility(indices: Array<{ seasonalIndex: number }>) {
    const avgIndex = indices.reduce((sum, item) => sum + item.seasonalIndex, 0) / indices.length;
    const variance = indices.reduce((sum, item) => sum + Math.pow(item.seasonalIndex - avgIndex, 2), 0) / indices.length;
    return Math.sqrt(variance);
  }
}