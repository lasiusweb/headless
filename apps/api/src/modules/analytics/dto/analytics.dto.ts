import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, IsISO8601, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFilterDto {
  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(['retailer', 'dealer', 'distributor'], { each: true })
  customerTypes?: ('retailer' | 'dealer' | 'distributor')[];
}

export class ReportScheduleDto {
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly'])
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsString()
  time: string; // In HH:MM format
}

export class CreateReportDto {
  @IsString()
  title: string;

  @IsEnum(['sales', 'customer', 'inventory', 'financial', 'custom'])
  type: 'sales' | 'customer' | 'inventory' | 'financial' | 'custom';

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => ReportFilterDto)
  filters: ReportFilterDto;

  @ValidateNested()
  @Type(() => ReportScheduleDto)
  schedule: ReportScheduleDto;

  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsEnum(['active', 'inactive', 'scheduled'])
  status: 'active' | 'inactive' | 'scheduled';
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReportFilterDto)
  filters?: ReportFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReportScheduleDto)
  schedule?: ReportScheduleDto;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'scheduled'])
  status?: 'active' | 'inactive' | 'scheduled';
}

export class GenerateReportDto {
  @IsString()
  reportId: string;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;
}

export class GetAnalyticsDto {
  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(['retailer', 'dealer', 'distributor'], { each: true })
  customerTypes?: ('retailer' | 'dealer' | 'distributor')[];
}