import { IsString, IsUUID, IsOptional } from 'class-validator';

export class ApproveDealerApplicationDto {
  @IsUUID()
  applicationId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}