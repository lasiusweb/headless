import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category', example: 'Biopesticides' })
  name: string;

  @ApiProperty({ description: 'Unique slug for the category', example: 'biopesticides' })
  slug: string;

  @ApiProperty({ description: 'Optional description', required: false })
  description?: string;
}
