import { IsString } from 'class-validator';

export class ClaimRewardDto {
  @IsString()
  userId: string;

  @IsString()
  rewardId: string;
}