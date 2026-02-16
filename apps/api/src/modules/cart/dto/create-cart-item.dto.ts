import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}