import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req
} from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { AwardPointsDto } from './dto/award-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Loyalty Program')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-points')
  @ApiOperation({ summary: 'Get current user\'s loyalty points' })
  @ApiResponse({ status: 200, description: 'Loyalty points retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyLoyalty(@Req() req) {
    return this.loyaltyService.getUserLoyalty(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-history')
  @ApiOperation({ summary: 'Get current user\'s loyalty points history' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: 200, description: 'Loyalty points history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyHistory(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 20;
    const offsetNum = offset ? parseInt(offset) : 0;
    
    return this.loyaltyService.getLoyaltyPointsHistory(req.user.id, limitNum, offsetNum);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('rewards')
  @ApiOperation({ summary: 'Get available loyalty rewards' })
  @ApiResponse({ status: 200, description: 'Available rewards retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRewards() {
    return this.loyaltyService.getEligibleRewards();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-rewards')
  @ApiOperation({ summary: 'Get rewards eligible for current user based on points' })
  @ApiResponse({ status: 200, description: 'Eligible rewards retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyRewards(@Req() req) {
    return this.loyaltyService.getEligibleRewards(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('award-points')
  @ApiOperation({ summary: 'Award loyalty points to a user (admin only)' })
  @ApiResponse({ status: 200, description: 'Points awarded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async awardPoints(@Body() awardPointsDto: AwardPointsDto) {
    return this.loyaltyService.awardPoints(
      awardPointsDto.userId,
      awardPointsDto.points,
      awardPointsDto.reason,
      awardPointsDto.orderId
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('redeem-points')
  @ApiOperation({ summary: 'Redeem loyalty points' })
  @ApiResponse({ status: 200, description: 'Points redeemed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Insufficient points' })
  async redeemPoints(@Body() redeemPointsDto: RedeemPointsDto, @Req() req) {
    // Only allow users to redeem their own points
    if (req.user.id !== redeemPointsDto.userId) {
      throw new Error('You can only redeem your own points');
    }
    
    return this.loyaltyService.redeemPoints(
      redeemPointsDto.userId,
      redeemPointsDto.pointsToRedeem,
      redeemPointsDto.reason,
      redeemPointsDto.orderId
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('claim-reward')
  @ApiOperation({ summary: 'Claim a loyalty reward' })
  @ApiResponse({ status: 200, description: 'Reward claimed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Insufficient points or invalid reward' })
  async claimReward(@Body() claimRewardDto: ClaimRewardDto, @Req() req) {
    // Only allow users to claim rewards for themselves
    if (req.user.id !== claimRewardDto.userId) {
      throw new Error('You can only claim rewards for yourself');
    }
    
    return this.loyaltyService.claimReward(
      claimRewardDto.userId,
      claimRewardDto.rewardId
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('tiers')
  @ApiOperation({ summary: 'Get all loyalty tiers (admin only)' })
  @ApiResponse({ status: 200, description: 'Loyalty tiers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTiers() {
    return this.loyaltyService.getLoyaltyTiers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('calculate-order-points/:orderId')
  @ApiOperation({ summary: 'Calculate and award points for an order (admin only)' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Points calculated and awarded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async calculateOrderPoints(@Param('orderId') orderId: string) {
    return this.loyaltyService.calculateOrderPoints(orderId);
  }
}