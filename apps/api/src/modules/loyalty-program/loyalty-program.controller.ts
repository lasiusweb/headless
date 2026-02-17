import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoyaltyProgramService } from './loyalty-program.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class EarnPointsDto {
  orderId: string;
  orderValue: number;
  isBirthday?: boolean;
  isFirstOrder?: boolean;
  campaignId?: string;
}

class RedeemPointsDto {
  rewardId: string;
  orderId?: string;
}

class ApplyReferralDto {
  referralCode: string;
}

@ApiTags('Loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyProgramService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get customer loyalty profile' })
  async getProfile(@Req() req) {
    const customerId = req.user.id;
    return this.loyaltyService.getOrCreateProfile(customerId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get customer loyalty analytics' })
  async getAnalytics(@Req() req) {
    const customerId = req.user.id;
    return this.loyaltyService.getCustomerAnalytics(customerId);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get available rewards' })
  async getRewards(@Req() req) {
    const customerId = req.user.id;
    return this.loyaltyService.getAvailableRewards(customerId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(@Req() req, @Query('limit') limit = 50) {
    const customerId = req.user.id;
    return this.loyaltyService.getTransactionHistory(customerId, limit);
  }

  @Post('earn')
  @ApiOperation({ summary: 'Earn points for a purchase' })
  async earnPoints(@Req() req, @Body() body: EarnPointsDto) {
    const customerId = req.user.id;
    return this.loyaltyService.earnPoints({
      customerId,
      ...body,
    });
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem points for a reward' })
  async redeemPoints(@Req() req, @Body() body: RedeemPointsDto) {
    const customerId = req.user.id;
    return this.loyaltyService.redeemPoints({
      customerId,
      ...body,
    });
  }

  @Post('referral/apply')
  @ApiOperation({ summary: 'Apply referral code' })
  async applyReferral(@Req() req, @Body() body: ApplyReferralDto) {
    const customerId = req.user.id;
    const referrerProfile = await this.loyaltyService.getProfileByReferralCode(body.referralCode);
    
    if (!referrerProfile) {
      return { success: false, message: 'Invalid referral code' };
    }

    if (referrerProfile.customer_id === customerId) {
      return { success: false, message: 'Cannot use your own referral code' };
    }

    await this.loyaltyService.processReferral(referrerProfile.customer_id, customerId);
    
    return { 
      success: true, 
      message: 'Referral applied successfully! You both earned bonus points.',
    };
  }

  @Get('referral/code')
  @ApiOperation({ summary: 'Get personal referral code' })
  async getReferralCode(@Req() req) {
    const customerId = req.user.id;
    const profile = await this.loyaltyService.getOrCreateProfile(customerId);
    return { referralCode: profile.referral_code };
  }
}
