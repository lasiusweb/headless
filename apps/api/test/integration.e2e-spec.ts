import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';

describe('Full Order Flow Integration (e2e)', () => {
  let app: INestApplication;

  // Mock guards for testing
  const mockJwtGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtGuard)
    .overrideGuard(RolesGuard)
    .useValue(mockRolesGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should complete full order flow', async () => {
    // Step 1: Create a product
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product for integration',
        segmentId: 'segment-1',
        categoryId: 'category-1',
        isActive: true,
      })
      .expect(201);

    expect(productResponse.body.name).toBe('Test Product');
    const productId = productResponse.body.id;

    // Step 2: Create a product variant
    const variantResponse = await request(app.getHttpServer())
      .post('/product-variants')
      .send({
        productId,
        sku: 'TEST-SKU-001',
        name: 'Test Variant',
        mrp: 1000,
        dealerPrice: 600, // 40% discount for dealers
        distributorPrice: 550, // 45% discount for distributors
        isActive: true,
      })
      .expect(201);

    expect(variantResponse.body.sku).toBe('TEST-SKU-001');
    const variantId = variantResponse.body.id;

    // Step 3: Add inventory for the variant
    await request(app.getHttpServer())
      .post('/inventory')
      .send({
        variantId,
        warehouseId: 'warehouse-1',
        stockLevel: 100,
        reservedQuantity: 0,
      })
      .expect(201);

    // Step 4: Create an order
    const orderResponse = await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [
          {
            variantId,
            quantity: 2,
          }
        ],
        shippingAddressId: 'address-1',
        billingAddressId: 'address-1',
      })
      .expect(201);

    expect(orderResponse.body.status).toBe('pending');
    expect(orderResponse.body.totalAmount).toBeGreaterThan(0);
    const orderId = orderResponse.body.id;

    // Step 5: Initiate payment for the order
    const paymentResponse = await request(app.getHttpServer())
      .post('/payments/initiate')
      .send({
        orderId,
        paymentMethod: 'easebuzz',
        amount: orderResponse.body.totalAmount,
      })
      .expect(201);

    expect(paymentResponse.body.status).toBe('initiated');
    expect(paymentResponse.body.orderId).toBe(orderId);

    // Step 6: Verify payment completion
    const verifyResponse = await request(app.getHttpServer())
      .post('/payments/verify')
      .send({
        transactionId: paymentResponse.body.transactionId,
        gateway: 'easebuzz',
        gatewayData: {
          status: 'success',
          amount: orderResponse.body.totalAmount,
        },
      })
      .expect(200);

    expect(verifyResponse.body.status).toBe('completed');

    // Step 7: Update order status to confirmed
    const confirmResponse = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(confirmResponse.body.status).toBe('confirmed');

    // Step 8: Create shipment for the order
    const shipmentResponse = await request(app.getHttpServer())
      .post('/shipments')
      .send({
        orderId,
        carrierId: 'carrier-1',
        trackingNumber: 'TRACK123456789',
      })
      .expect(201);

    expect(shipmentResponse.body.status).toBe('pending');

    // Step 9: Update shipment status to shipped
    const updateShipmentResponse = await request(app.getHttpServer())
      .patch(`/shipments/${shipmentResponse.body.id}/status`)
      .send({ status: 'shipped' })
      .expect(200);

    expect(updateShipmentResponse.body.status).toBe('shipped');

    // Step 10: Update order status to delivered
    const deliveredResponse = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .send({ status: 'delivered' })
      .expect(200);

    expect(deliveredResponse.body.status).toBe('delivered');

    // All steps completed successfully
    return true;
  });

  it('should handle dealer-specific pricing', async () => {
    // Create a user with dealer role
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dealer@example.com',
        password: 'password123',
        firstName: 'Dealer',
        lastName: 'User',
        role: 'dealer',
      })
      .expect(201);

    expect(userResponse.body.user.role).toBe('dealer');
    const userId = userResponse.body.user.id;

    // Create a product with regular and dealer pricing
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Dealer Product',
        slug: 'dealer-product',
        description: 'Product with dealer pricing',
        segmentId: 'segment-1',
        categoryId: 'category-1',
        isActive: true,
      })
      .expect(201);

    const variantResponse = await request(app.getHttpServer())
      .post('/product-variants')
      .send({
        productId: productResponse.body.id,
        sku: 'DEALER-SKU-001',
        name: 'Dealer Variant',
        mrp: 1000,
        dealerPrice: 600, // 40% discount for dealers
        distributorPrice: 550, // 45% discount for distributors
        isActive: true,
      })
      .expect(201);

    // Add to cart as dealer user
    const cartResponse = await request(app.getHttpServer())
      .post('/cart/items')
      .send({
        variantId: variantResponse.body.id,
        quantity: 1,
      })
      .expect(201);

    // Create order as dealer user
    const orderResponse = await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [
          {
            variantId: variantResponse.body.id,
            quantity: 1,
          }
        ],
        shippingAddressId: 'address-1',
        billingAddressId: 'address-1',
      })
      .expect(201);

    // For dealer, the price should be the dealer price (600) not MRP (1000)
    expect(orderResponse.body.totalAmount).toBeLessThan(1000); // Less than MRP
    expect(orderResponse.body.totalAmount).toBeGreaterThanOrEqual(600); // Greater than or equal to dealer price
  });

  afterEach(async () => {
    await app.close();
  });
});