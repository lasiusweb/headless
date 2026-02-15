import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product', example: 'Neem Oil 1500ppm' })
  name: string;

  @ApiProperty({ description: 'Unique slug for the product', example: 'neem-oil-1500' })
  slug: string;

  @ApiProperty({ description: 'Optional description', required: false })
  description?: string;

  @ApiProperty({ description: 'The ID of the category this product belongs to' })
  categoryId: string;

  @ApiProperty({ description: 'Maximum Retail Price', example: 450 })
  mrp: number;

  @ApiProperty({ description: 'Stock Keeping Unit identifier', example: 'KNB-NEEM-1500' })
  sku: string;
}
