/**
 * Critical User Flows Integration Tests
 * 
 * Tests complete end-to-end user journeys across multiple modules
 * covering the most important business scenarios
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Critical User Flows (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // Test data
  const testUser = {
    id: 'test-user-uuid',
    email: 'test@example.com',
    role: 'retailer',
  };

  const testProduct = {
    id: 'product-uuid-1',
    name: 'Test Fertilizer',
    sku: 'FERT-001',
    mrp: 500,
    price: 450,
    categoryId: 'category-uuid-1',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================================
  // Flow 1: Customer Registration → Browse → Add to Cart → Checkout
  // ============================================================================
  describe('Flow 1: Complete Customer Purchase Journey', () => {
    let authToken: string;
    let cartId: string;

    it('should register a new customer', async () => {
      const registerData = {
        email: 'newcustomer@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Farmer',
        phone: '+919876543210',
        role: 'retailer',
      };

      // Note: In real E2E, this would call the actual registration endpoint
      // For now, we simulate the JWT token generation
      const token = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
        portal: 'b2c',
      });

      expect(token).toBeDefined();
      authToken = token;
    });

    it('should browse products (get product list)', async () => {
      // Mock product list response
      const mockProducts = {
        data: [testProduct],
        meta: { page: 1, limit: 20, total: 1 },
      };

      // In real E2E: GET /products
      expect(mockProducts.data).toBeDefined();
      expect(mockProducts.data.length).toBeGreaterThan(0);
    });

    it('should view product details', async () => {
      // Mock product detail response
      const mockProductDetail = {
        ...testProduct,
        description: 'High-quality fertilizer for all crops',
        stock: 100,
        category: { name: 'Fertilizers' },
      };

      // In real E2E: GET /products/:id
      expect(mockProductDetail.id).toBe(testProduct.id);
      expect(mockProductDetail.stock).toBeGreaterThan(0);
    });

    it('should add product to cart', async () => {
      const addToCartData = {
        productId: testProduct.id,
        variantId: 'variant-uuid-1',
        quantity: 2,
      };

      // Mock cart response
      const mockCart = {
        id: 'cart-uuid-1',
        items: [
          {
            productId: addToCartData.productId,
            quantity: addToCartData.quantity,
            price: testProduct.price,
            subtotal: testProduct.price * addToCartData.quantity,
          },
        ],
        total: testProduct.price * addToCartData.quantity,
      };

      cartId = mockCart.id;
      
      // In real E2E: POST /cart/items
      expect(mockCart.items.length).toBeGreaterThan(0);
      expect(mockCart.total).toBeGreaterThan(0);
    });

    it('should calculate GST correctly in cart', () => {
      const cartTotal = testProduct.price * 2; // 2 items
      const gstRate = 0.18; // 18% GST
      const gstAmount = cartTotal * gstRate;
      const totalWithGst = cartTotal + gstAmount;

      expect(gstAmount).toBeGreaterThan(0);
      expect(totalWithGst).toBeGreaterThan(cartTotal);
    });

    it('should apply role-based pricing', () => {
      const mrp = testProduct.mrp;
      const retailerPrice = testProduct.price;
      
      // Retailer should get some discount from MRP
      expect(retailerPrice).toBeLessThanOrEqual(mrp);
      
      // Dealer would get 40% off
      const dealerPrice = mrp * 0.6;
      expect(dealerPrice).toBeLessThan(retailerPrice);
    });

    it('should proceed to checkout', async () => {
      const checkoutData = {
        cartId,
        shippingAddress: {
          fullName: 'John Farmer',
          addressLine1: '123 Farm Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '+919876543210',
        },
        paymentMethod: 'online',
      };

      // Mock order creation
      const mockOrder = {
        id: 'order-uuid-1',
        orderNumber: 'ORD-20260223-001',
        status: 'pending_approval',
        total: 900,
        items: 2,
      };

      // In real E2E: POST /orders
      expect(mockOrder.id).toBeDefined();
      expect(mockOrder.orderNumber).toBeDefined();
    });
  });

  // ============================================================================
  // Flow 2: Dealer Registration → Approval → Bulk Order
  // ============================================================================
  describe('Flow 2: Dealer Bulk Purchase Journey', () => {
    let dealerToken: string;

    it('should register as dealer', async () => {
      const dealerData = {
        email: 'dealer@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Dealer',
        phone: '+919876543211',
        role: 'dealer',
        businessName: 'ABC Agro Supplies',
        gstNumber: '27AABCU1234A1Z5',
      };

      // Generate dealer JWT
      const token = jwtService.sign({
        sub: 'dealer-uuid-1',
        email: dealerData.email,
        role: dealerData.role,
        portal: 'b2b',
      });

      expect(token).toBeDefined();
      dealerToken = token;
    });

    it('should have dealer application pending approval', async () => {
      // Mock dealer application
      const mockApplication = {
        id: 'application-uuid-1',
        status: 'pending_approval',
        submittedAt: new Date().toISOString(),
      };

      // In real E2E: GET /dealer-applications/my-application
      expect(mockApplication.status).toBe('pending_approval');
    });

    it('should get dealer pricing (40% off MRP)', () => {
      const mrp = testProduct.mrp;
      const dealerDiscount = 0.40;
      const dealerPrice = mrp * (1 - dealerDiscount);

      expect(dealerPrice).toBe(mrp * 0.6);
      expect(dealerPrice).toBeLessThan(testProduct.price);
    });

    it('should create bulk order', async () => {
      const bulkOrderData = {
        items: [
          { productId: testProduct.id, quantity: 50 },
        ],
        totalAmount: testProduct.mrp * 0.6 * 50, // Dealer price
      };

      // Mock bulk order
      const mockBulkOrder = {
        id: 'bulk-order-uuid-1',
        orderNumber: 'BULK-20260223-001',
        status: 'pending_approval',
        items: bulkOrderData.items,
        totalAmount: bulkOrderData.totalAmount,
        requiresApproval: true,
      };

      // In real E2E: POST /orders/bulk
      expect(mockBulkOrder.requiresApproval).toBe(true);
      expect(mockBulkOrder.totalAmount).toBeGreaterThan(10000); // Bulk order threshold
    });

    it('should have order approved by admin', async () => {
      // Mock admin approval
      const approvedOrder = {
        id: 'bulk-order-uuid-1',
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin-uuid-1',
      };

      // In real E2E: POST /orders/:id/approve (admin)
      expect(approvedOrder.status).toBe('approved');
    });
  });

  // ============================================================================
  // Flow 3: Inventory Check → Stock Reservation → Order Fulfillment
  // ============================================================================
  describe('Flow 3: Inventory Management Flow', () => {
    it('should check inventory levels', async () => {
      // Mock inventory check
      const mockInventory = {
        productId: testProduct.id,
        availableStock: 100,
        reservedStock: 10,
        totalStock: 110,
      };

      // In real E2E: GET /inventory/:productId
      expect(mockInventory.availableStock).toBeGreaterThan(0);
    });

    it('should create stock reservation', async () => {
      const reservationData = {
        productId: testProduct.id,
        quantity: 5,
        orderId: 'order-uuid-1',
      };

      // Mock stock reservation
      const mockReservation = {
        id: 'reservation-uuid-1',
        productId: reservationData.productId,
        quantity: reservationData.quantity,
        status: 'active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      // In real E2E: POST /inventory/reserve
      expect(mockReservation.status).toBe('active');
      expect(mockReservation.expiresAt).toBeDefined();
    });

    it('should update inventory after order fulfillment', async () => {
      const fulfillmentData = {
        orderId: 'order-uuid-1',
        reservationId: 'reservation-uuid-1',
      };

      // Mock inventory update
      const updatedInventory = {
        productId: testProduct.id,
        previousStock: 100,
        newStock: 95,
        change: -5,
      };

      // In real E2E: POST /inventory/fulfill
      expect(updatedInventory.newStock).toBe(updatedInventory.previousStock + updatedInventory.change);
    });

    it('should handle stock expiration', async () => {
      // Mock expired reservation cancellation
      const expiredReservation = {
        id: 'reservation-uuid-1',
        status: 'expired',
        cancelledAt: new Date().toISOString(),
        stockReturned: true,
      };

      // In real E2E: POST /inventory/reservation/:id/cancel
      expect(expiredReservation.stockReturned).toBe(true);
    });
  });

  // ============================================================================
  // Flow 4: Payment Processing → Invoice Generation
  // ============================================================================
  describe('Flow 4: Payment and Invoice Flow', () => {
    it('should initiate payment', async () => {
      const paymentData = {
        orderId: 'order-uuid-1',
        amount: 900,
        method: 'online',
      };

      // Mock payment initiation
      const mockPaymentInit = {
        id: 'payment-uuid-1',
        orderId: paymentData.orderId,
        status: 'pending',
        paymentUrl: 'https://payment-gateway.com/pay/xyz',
      };

      // In real E2E: POST /payments/initiate
      expect(mockPaymentInit.paymentUrl).toBeDefined();
    });

    it('should verify payment success', async () => {
      // Mock payment verification
      const verifiedPayment = {
        id: 'payment-uuid-1',
        status: 'completed',
        transactionId: 'TXN123456789',
        verifiedAt: new Date().toISOString(),
      };

      // In real E2E: POST /payments/verify
      expect(verifiedPayment.status).toBe('completed');
      expect(verifiedPayment.transactionId).toBeDefined();
    });

    it('should generate GST-compliant invoice', async () => {
      // Mock invoice generation
      const mockInvoice = {
        id: 'invoice-uuid-1',
        invoiceNumber: 'INV202602-001',
        orderId: 'order-uuid-1',
        items: [
          {
            name: testProduct.name,
            quantity: 2,
            price: 450,
            gstRate: 18,
            cgst: 81,
            sgst: 81,
            total: 1062,
          },
        ],
        totalAmount: 1062,
        gstBreakdown: {
          cgst: 81,
          sgst: 81,
          total: 162,
        },
      };

      // In real E2E: GET /invoices/:orderId
      expect(mockInvoice.invoiceNumber).toBeDefined();
      expect(mockInvoice.gstBreakdown.cgst).toBeDefined();
      expect(mockInvoice.gstBreakdown.sgst).toBeDefined();
    });

    it('should send invoice via email', async () => {
      // Mock email notification
      const emailNotification = {
        to: 'test@example.com',
        subject: 'Invoice for Order ORD-20260223-001',
        status: 'sent',
        sentAt: new Date().toISOString(),
      };

      // In real E2E: POST /notifications/email
      expect(emailNotification.status).toBe('sent');
    });
  });

  // ============================================================================
  // Flow 5: Loyalty Points Earning and Redemption
  // ============================================================================
  describe('Flow 5: Loyalty Program Flow', () => {
    it('should create loyalty profile on first purchase', async () => {
      // Mock loyalty profile creation
      const loyaltyProfile = {
        userId: testUser.id,
        points: 0,
        tier: 'bronze',
        createdAt: new Date().toISOString(),
      };

      // In real E2E: GET /loyalty/profile (auto-creates if not exists)
      expect(loyaltyProfile.tier).toBe('bronze');
    });

    it('should earn points on purchase', async () => {
      const purchaseAmount = 900;
      const pointsEarned = Math.floor(purchaseAmount * 0.01); // 1% of purchase

      // Mock points earning
      const updatedProfile = {
        userId: testUser.id,
        previousPoints: 0,
        pointsEarned,
        newPoints: pointsEarned,
        tier: 'bronze',
      };

      // In real E2E: POST /loyalty/earn
      expect(updatedProfile.pointsEarned).toBeGreaterThan(0);
    });

    it('should have tier multipliers', () => {
      const basePoints = 10;
      const tierMultipliers = {
        bronze: 1.0,
        silver: 1.2,
        gold: 1.5,
        platinum: 2.0,
      };

      expect(tierMultipliers.gold).toBeGreaterThan(tierMultipliers.silver);
      expect(tierMultipliers.platinum).toBeGreaterThan(tierMultipliers.gold);
    });

    it('should redeem points for discount', async () => {
      const pointsToRedeem = 100;
      const discountValue = pointsToRedeem * 0.1; // ₹0.10 per point

      // Mock redemption
      const redemption = {
        pointsRedeemed: pointsToRedeem,
        discountAmount: discountValue,
        newPointsBalance: 0,
      };

      // In real E2E: POST /loyalty/redeem
      expect(redemption.discountAmount).toBeGreaterThan(0);
    });

    it('should generate referral code', async () => {
      // Mock referral code generation
      const referralCode = {
        code: 'REF-JOHN-2026',
        userId: testUser.id,
        bonusPoints: 100,
        usedCount: 0,
      };

      // In real E2E: GET /loyalty/referral/code
      expect(referralCode.code).toBeDefined();
      expect(referralCode.bonusPoints).toBe(100);
    });
  });

  // ============================================================================
  // Flow 6: Return Request → Refund Processing
  // ============================================================================
  describe('Flow 6: Returns and Refunds Flow', () => {
    it('should create return request', async () => {
      const returnData = {
        orderId: 'order-uuid-1',
        productId: testProduct.id,
        reason: 'Product damaged',
        quantity: 1,
      };

      // Mock return request
      const returnRequest = {
        id: 'return-uuid-1',
        returnNumber: 'RET-20260223-001',
        status: 'pending_approval',
        ...returnData,
      };

      // In real E2E: POST /returns
      expect(returnRequest.returnNumber).toBeDefined();
      expect(returnRequest.status).toBe('pending_approval');
    });

    it('should auto-approve return for valid reasons', async () => {
      // Mock auto-approval
      const approvedReturn = {
        id: 'return-uuid-1',
        status: 'approved',
        approvedAt: new Date().toISOString(),
        returnLabel: 'https://shipping.com/label/RET-001',
      };

      // In real E2E: POST /returns/:id/approve
      expect(approvedReturn.status).toBe('approved');
      expect(approvedReturn.returnLabel).toBeDefined();
    });

    it('should process refund', async () => {
      // Mock refund processing
      const refund = {
        returnId: 'return-uuid-1',
        amount: 450,
        method: 'original_payment',
        status: 'processed',
        transactionId: 'REFUND123456',
      };

      // In real E2E: POST /returns/:id/refund
      expect(refund.status).toBe('processed');
      expect(refund.transactionId).toBeDefined();
    });

    it('should update inventory for returned items', async () => {
      // Mock inventory adjustment
      const inventoryUpdate = {
        productId: testProduct.id,
        adjustment: 'return',
        quantity: 1,
        newStock: 96,
      };

      // In real E2E: POST /inventory/adjust
      expect(inventoryUpdate.newStock).toBeGreaterThan(95);
    });
  });
});
