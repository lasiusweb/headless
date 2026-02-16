import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue(mockSupabaseClient),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateCart', () => {
    it('should return existing cart for authenticated user', async () => {
      const userId = 'user-123';
      const existingCart = { id: 'cart-123', user_id: userId };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: existingCart, error: null }),
      });

      const result = await service.getOrCreateCart(userId);

      expect(result).toEqual(existingCart);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('carts');
    });

    it('should create new cart for authenticated user if none exists', async () => {
      const userId = 'user-123';
      const newCart = { id: 'cart-456', user_id: userId };

      // First call returns null (no existing cart)
      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
          .mockResolvedValueOnce({ data: newCart, error: null }),
      });

      const result = await service.getOrCreateCart(userId);

      expect(result).toEqual(newCart);
    });

    it('should create new cart for session if user not authenticated', async () => {
      const sessionId = 'session-123';
      const newCart = { id: 'cart-789', session_id: sessionId };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
          .mockResolvedValueOnce({ data: newCart, error: null }),
      });

      const result = await service.getOrCreateCart(undefined, sessionId);

      expect(result).toEqual(newCart);
    });

    it('should throw BadRequestException if no userId or sessionId provided', async () => {
      await expect(service.getOrCreateCart()).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCartItems', () => {
    it('should return cart items with variant and product details', async () => {
      const cartId = 'cart-123';
      const mockItems = [
        {
          id: 'item-1',
          variant_id: 'variant-1',
          quantity: 2,
          variant: {
            id: 'variant-1',
            mrp: 100,
            product: { name: 'Test Product', slug: 'test-product' },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
      });

      const result = await service.getCartItems(cartId);

      expect(result).toEqual(mockItems);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('cart_items');
    });
  });

  describe('addToCart', () => {
    it('should update quantity if item already exists in cart', async () => {
      const cartId = 'cart-123';
      const createCartItemDto = { variantId: 'variant-1', quantity: 2 };
      const existingItem = { id: 'item-1', quantity: 3 };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: existingItem, error: null }),
      });

      jest.spyOn(service, 'updateCartItem').mockResolvedValue({
        ...existingItem,
        quantity: 5,
      });

      const result = await service.addToCart(cartId, createCartItemDto);

      expect(result.quantity).toBe(5);
      expect(service.updateCartItem).toHaveBeenCalledWith('item-1', { quantity: 5 });
    });

    it('should create new cart item if it does not exist', async () => {
      const cartId = 'cart-123';
      const createCartItemDto = { variantId: 'variant-1', quantity: 2 };
      const newItem = { id: 'item-new', cart_id: cartId, variant_id: 'variant-1', quantity: 2 };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
          .mockResolvedValueOnce({ data: newItem, error: null }),
      });

      const result = await service.addToCart(cartId, createCartItemDto);

      expect(result).toEqual(newItem);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const cartItemId = 'item-123';
      const updateDto = { quantity: 5 };
      const updatedItem = { id: cartItemId, quantity: 5 };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedItem, error: null }),
      });

      const result = await service.updateCartItem(cartItemId, updateDto);

      expect(result).toEqual(updatedItem);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const cartItemId = 'item-123';

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      });

      const result = await service.removeFromCart(cartItemId);

      expect(result).toEqual({ message: 'Item removed from cart successfully' });
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const cartId = 'cart-123';

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      });

      const result = await service.clearCart(cartId);

      expect(result).toEqual({ message: 'Cart cleared successfully' });
    });
  });

  describe('getCartTotal', () => {
    it('should calculate cart total with GST for intra-state (CGST + SGST)', async () => {
      const cartId = 'cart-123';
      const userType = 'dealer';
      const shippingState = 'Maharashtra';
      const mockItems = [
        { 
          variant: { mrp: 100, dealer_price: 60, distributor_price: 45, gst_rate: 18 }, 
          quantity: 2 
        },
        { 
          variant: { mrp: 200, dealer_price: 120, distributor_price: 90, gst_rate: 18 }, 
          quantity: 1 
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
      });

      const result = await service.getCartTotal(cartId, userType, shippingState);

      // Subtotal: (60 * 2) + (120 * 1) = 240
      // GST: 240 * 0.18 = 43.2
      // CGST: 43.2 / 2 = 21.6, SGST: 21.6
      // Total: 240 + 43.2 = 283.2
      expect(result.subtotal).toBe(240);
      expect(result.cgst).toBeCloseTo(21.6, 1);
      expect(result.sgst).toBeCloseTo(21.6, 1);
      expect(result.igst).toBe(0);
      expect(result.total).toBeCloseTo(283.2, 1);
    });

    it('should calculate cart total with IGST for inter-state', async () => {
      const cartId = 'cart-123';
      const userType = 'retailer';
      const mockItems = [
        { 
          variant: { mrp: 100, dealer_price: 60, distributor_price: 45, gst_rate: 18 }, 
          quantity: 2 
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
      });

      const result = await service.getCartTotal(cartId, userType, undefined);

      // Subtotal: (100 * 2) = 200
      // IGST: 200 * 0.18 = 36
      // Total: 200 + 36 = 236
      expect(result.subtotal).toBe(200);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBeCloseTo(36, 1);
      expect(result.total).toBeCloseTo(236, 1);
    });

    it('should calculate discount from MRP correctly', async () => {
      const cartId = 'cart-123';
      const userType = 'dealer';
      const mockItems = [
        { 
          variant: { mrp: 100, dealer_price: 60, distributor_price: 45, gst_rate: 18 }, 
          quantity: 2 
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
      });

      const result = await service.getCartTotal(cartId, userType, undefined);

      // MRP Total: 100 * 2 = 200
      // Subtotal (dealer): 60 * 2 = 120
      // Discount: 200 - 120 = 80
      expect(result.mrpTotal).toBe(200);
      expect(result.subtotal).toBe(120);
      expect(result.discount).toBe(80);
    });

    it('should use default 18% GST rate if not specified', async () => {
      const cartId = 'cart-123';
      const mockItems = [
        { 
          variant: { mrp: 100, dealer_price: 60, distributor_price: 45 }, 
          quantity: 1 
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
      });

      const result = await service.getCartTotal(cartId, 'retailer', undefined);

      // Subtotal: 100
      // IGST: 100 * 0.18 = 18
      expect(result.gstRate).toBeCloseTo(18, 1);
      expect(result.igst).toBeCloseTo(18, 1);
    });
  });
});
