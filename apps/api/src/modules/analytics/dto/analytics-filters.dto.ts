import { IsOptional, IsString, IsEnum } from 'class-validator';

enum TimeGrouping {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year'
}

export class AnalyticsFiltersDto {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(TimeGrouping)
  @IsOptional()
  groupBy?: TimeGrouping;

  @IsString()
  @IsOptional()
  timezone?: string;
}