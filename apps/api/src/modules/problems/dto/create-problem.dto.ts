import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateProblemDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}