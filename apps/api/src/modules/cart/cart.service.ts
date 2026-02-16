import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class CartService {
  constructor(
    private supabaseService: SupabaseService,
    private pricingService: PricingService,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string) {
    // If user is authenticated, use their user ID
    if (userId) {
      const { data: existingCart, error } = await this.supabaseService.getClient()
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw new Error(error.message);
      }

      if (existingCart) {
        return existingCart;
      }

      // Create new cart for user
      const { data: newCart, error: createError } = await this.supabaseService.getClient()
        .from('carts')
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      return newCart;
    }

    // If user is not authenticated, use session ID
    if (sessionId) {
      const { data: existingCart, error } = await this.supabaseService.getClient()
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      if (existingCart) {
        return existingCart;
      }

      // Create new cart for session
      const { data: newCart, error: createError } = await this.supabaseService.getClient()
        .from('carts')
        .insert([{ session_id: sessionId }])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      return newCart;
    }

    throw new BadRequestException('Either userId or sessionId must be provided');
  }

  async getCartItems(cartId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('cart_items')
      .select(`
        *,
        variant:product_variants(*, product:products(name, slug, description))
      `)
      .eq('cart_id', cartId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async addToCart(cartId: string, createCartItemDto: CreateCartItemDto) {
    // Check if item already exists in cart
    const { data: existingItem, error: selectError } = await this.supabaseService.getClient()
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('variant_id', createCartItemDto.variantId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(selectError.message);
    }

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + createCartItemDto.quantity;
      return this.updateCartItem(existingItem.id, { quantity: newQuantity });
    }

    // Add new item to cart
    const { data, error } = await this.supabaseService.getClient()
      .from('cart_items')
      .insert([
        {
          cart_id: cartId,
          variant_id: createCartItemDto.variantId,
          quantity: createCartItemDto.quantity,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateCartItem(cartItemId: string, updateCartItemDto: UpdateCartItemDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('cart_items')
      .update({
        quantity: updateCartItemDto.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async removeFromCart(cartItemId: string) {
    const { error } = await this.supabaseService.getClient()
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Item removed from cart successfully' };
  }

  async clearCart(cartId: string) {
    const { error } = await this.supabaseService.getClient()
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Cart cleared successfully' };
  }

  async getCartTotal(
    cartId: string,
    userType: 'retailer' | 'dealer' | 'distributor' = 'retailer',
    shippingState?: string,
  ) {
    const { data, error } = await this.supabaseService.getClient()
      .from('cart_items')
      .select(`
        *,
        variant:product_variants(*, product:products(name, slug, description, mrp, dealer_price, distributor_price, gst_rate))
      `)
      .eq('cart_id', cartId);

    if (error) {
      throw new Error(error.message);
    }

    // Calculate subtotal based on user role
    const subtotal = data.reduce((sum, item) => {
      let price: number;

      switch (userType) {
        case 'distributor':
          price = item.variant.distributor_price || item.variant.mrp;
          break;
        case 'dealer':
          price = item.variant.dealer_price || item.variant.mrp;
          break;
        default:
          price = item.variant.mrp; // Retail price (MRP)
      }

      return sum + (price * item.quantity);
    }, 0);

    // Calculate GST (CGST + SGST for same state, IGST for different state)
    // GST rates: 5%, 12%, 18%, 28% as per Indian tax slabs
    const gstRate = data.reduce((sum, item) => {
      const itemGstRate = item.variant.gst_rate || 18; // Default 18%
      let price: number;

      switch (userType) {
        case 'distributor':
          price = item.variant.distributor_price || item.variant.mrp;
          break;
        case 'dealer':
          price = item.variant.dealer_price || item.variant.mrp;
          break;
        default:
          price = item.variant.mrp;
      }

      return sum + (price * item.quantity * (itemGstRate / 100));
    }, 0);

    // Split GST into CGST + SGST (intra-state) or IGST (inter-state)
    const cgst = shippingState ? gstRate / 2 : 0;
    const sgst = shippingState ? gstRate / 2 : 0;
    const igst = shippingState ? 0 : gstRate;

    // Calculate discount from MRP
    const mrpTotal = data.reduce((sum, item) => sum + (item.variant.mrp * item.quantity), 0);
    const discount = mrpTotal - subtotal;

    // Calculate total
    const total = subtotal + (shippingState ? cgst + sgst : igst);

    return {
      total,
      subtotal,
      discount,
      mrpTotal,
      gstRate: shippingState ? cgst + sgst : igst,
      cgst,
      sgst,
      igst,
      itemCount: data.reduce((sum, item) => sum + item.quantity, 0),
      itemCounts: data.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}