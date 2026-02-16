import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';

enum UserRole {
  Customer = 'customer',
  Dealer = 'dealer',
  Distributor = 'distributor',
  Admin = 'admin',
  PosUser = 'pos_user'
}

export class UpdateUserRoleDto {
  @IsUUID()
  userId: string;

  @IsEnum(UserRole)
  newRole: UserRole;

  @IsString()
  @IsOptional()
  reason?: string;
}