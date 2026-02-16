import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  Query
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get current user\'s cart with pricing breakdown' })
  @ApiResponse({ status: 200, description: 'Current cart with items and pricing' })
  @ApiQuery({ 
    name: 'userType', 
    required: false, 
    enum: ['retailer', 'dealer', 'distributor'],
    description: 'User type for role-based pricing'
  })
  @ApiQuery({ 
    name: 'shippingState', 
    required: false, 
    description: 'Shipping state for GST calculation (CGST+SGST vs IGST)'
  })
  async getCart(
    @Req() req,
    @Query('userType') userType?: 'retailer' | 'dealer' | 'distributor',
    @Query('shippingState') shippingState?: string
  ) {
    // Get or create cart based on user authentication
    const userId = req.user?.id;
    const sessionId = req.session?.id || req.cookies?.['connect.sid'];

    const cart = await this.cartService.getOrCreateCart(userId, sessionId);
    const items = await this.cartService.getCartItems(cart.id);
    const pricing = await this.cartService.getCartTotal(cart.id, userType || 'retailer', shippingState);

    return {
      ...cart,
      items,
      pricing
    };
  }

  @Public()
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  async addItemToCart(@Body() createCartItemDto: CreateCartItemDto, @Req() req) {
    // Get or create cart based on user authentication
    const userId = req.user?.id;
    const sessionId = req.session?.id || req.cookies?.['connect.sid'];
    
    const cart = await this.cartService.getOrCreateCart(userId, sessionId);
    return this.cartService.addToCart(cart.id, createCartItemDto);
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  async updateCartItem(
    @Param('id') cartItemId: string, 
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(cartItemId, updateCartItemDto);
  }

  @Public()
  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  async removeCartItem(@Param('id') cartItemId: string) {
    return this.cartService.removeFromCart(cartItemId);
  }

  @Public()
  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Req() req) {
    // Get or create cart based on user authentication
    const userId = req.user?.id;
    const sessionId = req.session?.id || req.cookies?.['connect.sid'];
    
    const cart = await this.cartService.getOrCreateCart(userId, sessionId);
    return this.cartService.clearCart(cart.id);
  }
}