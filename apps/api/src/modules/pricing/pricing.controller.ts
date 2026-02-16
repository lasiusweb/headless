import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingRuleDto, UpdatePricingRuleDto, CalculatePriceDto } from './dto/pricing.dto';
import { PricingRule, UserPricingTier } from './interfaces/pricing.interface';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('rules')
  createPricingRule(@Body() createPricingRuleDto: CreatePricingRuleDto): PricingRule {
    return this.pricingService.createPricingRule(createPricingRuleDto);
  }

  @Put('rules/:id')
  updatePricingRule(
    @Param('id') id: string,
    @Body() updatePricingRuleDto: UpdatePricingRuleDto
  ): PricingRule {
    return this.pricingService.updatePricingRule(id, updatePricingRuleDto);
  }

  @Get('rules')
  getAllPricingRules(): PricingRule[] {
    return this.pricingService.getAllPricingRules();
  }

  @Get('rules/:id')
  getPricingRuleById(@Param('id') id: string): PricingRule {
    return this.pricingService.getPricingRuleById(id);
  }

  @Get('rules/product/:productId')
  getPricingRulesForProduct(@Param('productId') productId: string): PricingRule[] {
    return this.pricingService.getPricingRulesForProduct(productId);
  }

  @Delete('rules/:id')
  deletePricingRule(@Param('id') id: string): boolean {
    return this.pricingService.deletePricingRule(id);
  }

  @Post('calculate-price')
  calculatePrice(@Body() calculatePriceDto: CalculatePriceDto): number {
    return this.pricingService.calculatePrice(calculatePriceDto);
  }

  @Get('user-tier/:userId')
  getUserPricingTier(@Param('userId') userId: string): UserPricingTier {
    return this.pricingService.getUserPricingTier(userId);
  }
}