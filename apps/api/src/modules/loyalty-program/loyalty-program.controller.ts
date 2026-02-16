import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { LoyaltyProgramService } from './loyalty-program.service';
import { 
  CreateLoyaltyProfileDto, 
  UpdateLoyaltyProfileDto, 
  CreateLoyaltyTransactionDto, 
  CreateLoyaltyRewardDto, 
  UpdateLoyaltyRewardDto, 
  CreateLoyaltyCampaignDto, 
  RedeemRewardDto,
  EarnPointsDto
} from './dto/loyalty.dto';
import { 
  CustomerLoyaltyProfile, 
  LoyaltyTransaction, 
  LoyaltyReward, 
  LoyaltyCampaign,
  LoyaltyAnalytics 
} from './interfaces/loyalty.interface';

@Controller('loyalty')
export class LoyaltyProgramController {
  constructor(private readonly loyaltyProgramService: LoyaltyProgramService) {}

  @Post('profiles')
  createLoyaltyProfile(@Body() createLoyaltyProfileDto: CreateLoyaltyProfileDto): Promise<CustomerLoyaltyProfile> {
    return this.loyaltyProgramService.createLoyaltyProfile(createLoyaltyProfileDto);
  }

  @Put('profiles/:id')
  updateLoyaltyProfile(
    @Param('id') id: string,
    @Body() updateLoyaltyProfileDto: UpdateLoyaltyProfileDto
  ): Promise<CustomerLoyaltyProfile> {
    return this.loyaltyProgramService.updateLoyaltyProfile(id, updateLoyaltyProfileDto);
  }

  @Get('profiles/customer/:customerId')
  getLoyaltyProfileByCustomerId(@Param('customerId') customerId: string): Promise<CustomerLoyaltyProfile> {
    return this.loyaltyProgramService.getLoyaltyProfileByCustomerId(customerId);
  }

  @Get('profiles/:id')
  getLoyaltyProfileById(@Param('id') id: string): Promise<CustomerLoyaltyProfile> {
    return this.loyaltyProgramService.getLoyaltyProfileById(id);
  }

  @Post('transactions')
  createLoyaltyTransaction(@Body() createLoyaltyTransactionDto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction> {
    return this.loyaltyProgramService.createLoyaltyTransaction(createLoyaltyTransactionDto);
  }

  @Get('transactions/customer/:customerId')
  getLoyaltyTransactionsByCustomer(@Param('customerId') customerId: string): Promise<LoyaltyTransaction[]> {
    return this.loyaltyProgramService.getLoyaltyTransactionsByCustomer(customerId);
  }

  @Post('rewards')
  createLoyaltyReward(@Body() createLoyaltyRewardDto: CreateLoyaltyRewardDto): Promise<LoyaltyReward> {
    return this.loyaltyProgramService.createLoyaltyReward(createLoyaltyRewardDto);
  }

  @Put('rewards/:id')
  updateLoyaltyReward(
    @Param('id') id: string,
    @Body() updateLoyaltyRewardDto: UpdateLoyaltyRewardDto
  ): Promise<LoyaltyReward> {
    return this.loyaltyProgramService.updateLoyaltyReward(id, updateLoyaltyRewardDto);
  }

  @Get('rewards')
  getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return this.loyaltyProgramService.getLoyaltyRewards();
  }

  @Post('campaigns')
  createLoyaltyCampaign(@Body() createLoyaltyCampaignDto: CreateLoyaltyCampaignDto): Promise<LoyaltyCampaign> {
    return this.loyaltyProgramService.createLoyaltyCampaign(createLoyaltyCampaignDto);
  }

  @Get('campaigns/active')
  getActiveLoyaltyCampaigns(): Promise<LoyaltyCampaign[]> {
    return this.loyaltyProgramService.getActiveLoyaltyCampaigns();
  }

  @Post('redeem')
  redeemReward(@Body() redeemRewardDto: RedeemRewardDto): Promise<LoyaltyTransaction> {
    return this.loyaltyProgramService.redeemReward(redeemRewardDto);
  }

  @Post('earn-points')
  earnPoints(@Body() earnPointsDto: EarnPointsDto): Promise<LoyaltyTransaction> {
    return this.loyaltyProgramService.earnPoints(earnPointsDto);
  }

  @Get('analytics')
  getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
    return this.loyaltyProgramService.getLoyaltyAnalytics();
  }
}