import { IsString, IsEmail, IsPhoneNumber, IsDate, IsEnum, IsBoolean, IsNumber, Min, MaxLength, ValidateNested, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDealerDto } from './create-dealer.dto';

export class UpdateDealerDto extends CreateDealerDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'under_review'])
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}