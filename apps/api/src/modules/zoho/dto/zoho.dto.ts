import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean, IsISO8601 } from 'class-validator';

export class ZohoAuthDto {
  @IsString()
  code: string;

  @IsString()
  redirectUri: string;
}

export class ZohoRefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class SyncEntityDto {
  @IsString()
  @IsEnum(['contact', 'item', 'invoice', 'order'])
  entity: 'contact' | 'item' | 'invoice' | 'order';

  @IsString()
  entityId: string;

  @IsString()
  @IsEnum(['created', 'updated', 'deleted'])
  action: 'created' | 'updated' | 'deleted';
}

export class ZohoConfigDto {
  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;

  @IsString()
  redirectUri: string;

  @IsString()
  organizationId: string;

  @IsArray()
  @IsString({ each: true })
  scopes: string[];
}

export class SyncAllEntitiesDto {
  @IsString()
  @IsEnum(['contacts', 'items', 'invoices', 'orders'])
  entityType: 'contacts' | 'items' | 'invoices' | 'orders';

  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @IsOptional()
  @IsISO8601()
  toDate?: string;
}