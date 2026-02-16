import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';

enum ShipmentStatus {
  Pending = 'pending',
  PickedUp = 'picked_up',
  InTransit = 'in_transit',
  OutForDelivery = 'out_for_delivery',
  Delivered = 'delivered',
  RTO = 'rto'
}

export class CreateShipmentDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  carrierId: string;

  @IsString()
  @IsOptional()
  awbNumber?: string;

  @IsString()
  @IsOptional()
  lrNumber?: string;

  @IsString()
  @IsOptional()
  trackingUrl?: string;

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;
}