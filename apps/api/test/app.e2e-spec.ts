import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SupabaseService } from './../src/supabase/supabase.service';

/**
 * E2E Test Suite for KN Biosciences API
 * 
 * This test suite covers critical user flows:
 * 1. User Registration & Authentication
 * 2. Product Browsing
 * 3. Cart Management
 * 4. Order Creation & Approval Workflow
 * 5. Payment Processing
 */

describe('KN Biosciences API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let testProductId: string;
  let testOrderId: string;

  const mockSupabaseService = {
    getClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue(mockSupabaseService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Flow 1: Authentication
   */
  describe('/auth (POST)', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'testdealer@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Dealer',
        phone: '+919876543210',
        role: 'dealer',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.email).toBe(registerData.email);
          testUserId = response.body.id;
        });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'testdealer@example.com',
        password: 'TestPassword123!',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('access_token');
          authToken = response.body.access_token;
        });
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'testdealer@example.com',
        password: 'WrongPassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  /**
   * Flow 2: Product Browsing
   */
  describe('/products (GET)', () => {
    it('should get list of products (public)', async () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .then((response) => {
          expect(response.body).toBeInstanceOf(Array);
        });
    });

    it('should get product by ID', async () => {
      return request(app.getHttpServer())
        .get('/products/test-product-id')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name');
          testProductId = response.body.id;
        });
    });

    it('should filter products by category', async () => {
      return request(app.getHttpServer())
        .get('/products?category=fertilizers')
        .expect(200)
        .then((response) => {
          expect(response.body).toBeInstanceOf(Array);
        });
    });
  });

  /**
   * Flow 3: Cart Management
   */
  describe('/cart (GET, POST, PATCH, DELETE)', () => {
    it('should get or create cart for authenticated user', async () => {
      return request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('items');
        });
    });

    it('should add item to cart', async () => {
      const addItemData = {
        variantId: 'test-variant-id',
        quantity: 2,
      };

      return request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addItemData)
        .expect(201);
    });

    it('should update cart item quantity', async () => {
      const updateData = {
        quantity: 5,
      };

      return request(app.getHttpServer())
        .patch('/cart/items/test-item-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
    });

    it('should remove item from cart', async () => {
      return request(app.getHttpServer())
        .delete('/cart/items/test-item-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should clear entire cart', async () => {
      return request(app.getHttpServer())
        .delete('/cart/clear')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  /**
   * Flow 4: Order Creation & B2B Approval Workflow
   */
  describe('/orders (GET, POST, PATCH)', () => {
    it('should create new order from cart', async () => {
      const createOrderData = {
        items: [
          { variantId: 'test-variant-id', quantity: 2 },
        ],
        shippingAddressId: 'test-address-id',
        billingAddressId: 'test-address-id',
        notes: 'Test order for E2E',
      };

      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createOrderData)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('order_number');
          testOrderId = response.body.id;
          
          // For dealer, order should be pending approval
          expect(response.body.status).toBe('pending_approval');
        });
    });

    it('should get user orders', async () => {
      return request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toBeInstanceOf(Array);
        });
    });

    it('should get order by ID', async () => {
      return request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should approve order (admin)', async () => {
      // Simulating admin approval
      return request(app.getHttpServer())
        .post(`/orders/${testOrderId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ approvedBy: 'admin-user-id' })
        .expect(200)
        .then((response) => {
          expect(response.body.status).toBe('approved');
        });
    });
  });

  /**
   * Flow 5: Payment Processing
   */
  describe('/payments (POST)', () => {
    it('should initiate payment for approved order', async () => {
      const initiatePaymentData = {
        orderId: testOrderId,
        paymentMethod: 'easebuzz',
        callbackUrl: 'https://www.knbiosciences.in/payment/callback',
        returnUrl: 'https://www.knbiosciences.in/orders/success',
      };

      return request(app.getHttpServer())
        .post('/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(initiatePaymentData)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('paymentId');
          expect(response.body).toHaveProperty('paymentUrl');
        });
    });

    it('should verify payment after gateway callback', async () => {
      const verifyPaymentData = {
        paymentId: 'test-payment-id',
        gateway: 'easebuzz',
        gatewayData: {
          status: 'success',
          transactionId: 'TXN123456',
        },
      };

      return request(app.getHttpServer())
        .post('/payments/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyPaymentData)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
        });
    });
  });

  /**
   * Flow 6: Loyalty Program
   */
  describe('/loyalty (GET, POST)', () => {
    it('should get customer loyalty profile', async () => {
      return request(app.getHttpServer())
        .get('/loyalty/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('points_balance');
          expect(response.body).toHaveProperty('tier');
        });
    });

    it('should get available rewards', async () => {
      return request(app.getHttpServer())
        .get('/loyalty/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should earn points on purchase', async () => {
      const earnPointsData = {
        orderId: testOrderId,
        orderValue: 5000,
      };

      return request(app.getHttpServer())
        .post('/loyalty/earn')
        .set('Authorization', `Bearer ${authToken}`)
        .send(earnPointsData)
        .expect(201);
    });

    it('should get personal referral code', async () => {
      return request(app.getHttpServer())
        .get('/loyalty/referral/code')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('referralCode');
        });
    });
  });

  /**
   * Flow 7: Inventory & Supplier
   */
  describe('/suppliers (GET, POST)', () => {
    it('should get all suppliers', async () => {
      return request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get low stock products', async () => {
      return request(app.getHttpServer())
        .get('/suppliers/inventory/low-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should create purchase order', async () => {
      const createPOData = {
        supplier_id: 'test-supplier-id',
        items: [
          {
            product_id: 'test-product-id',
            variant_id: 'test-variant-id',
            quantity: 100,
            unit_price: 50,
          },
        ],
        expected_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return request(app.getHttpServer())
        .post('/suppliers/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPOData)
        .expect(201);
    });
  });

  /**
   * Flow 8: Analytics & Forecasting
   */
  describe('/analytics (GET)', () => {
    it('should get dashboard metrics', async () => {
      return request(app.getHttpServer())
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get demand forecast for product', async () => {
      return request(app.getHttpServer())
        .get(`/forecasting/demand/${testProductId}?days=30`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get inventory recommendations', async () => {
      return request(app.getHttpServer())
        .get('/forecasting/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Error Handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      return request(app.getHttpServer())
        .get('/orders')
        .expect(401);
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        // Missing required fields
        quantity: -1, // Invalid quantity
      };

      return request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 404 for non-existent resource', async () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-id')
        .expect(404);
    });
  });
});
