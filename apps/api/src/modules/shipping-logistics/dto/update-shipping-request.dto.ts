import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

enum ShipmentStatus {
  Pending = 'pending',
  PickedUp = 'picked_up',
  InTransit = 'in_transit',
  OutForDelivery = 'out_for_delivery',
  Delivered = 'delivered',
  RTO = 'rto',
  Lost = 'lost'
}

export class UpdateShippingRequestDto {
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}