import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

enum ForecastAlgorithm {
  MovingAverage = 'moving_average',
  ExponentialSmoothing = 'exponential_smoothing',
  Regression = 'regression'
}

export class DemandForecastDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  days: number;

  @IsEnum(ForecastAlgorithm)
  @IsOptional()
  algorithm?: ForecastAlgorithm;

  @IsNumber()
  @IsOptional()
  windowSize?: number; // For moving average

  @IsNumber()
  @IsOptional()
  alpha?: number; // For exponential smoothing

  @IsOptional()
  includeSeasonality?: boolean;

  @IsOptional()
  includeTrend?: boolean;
}