import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrderModule } from './../../src/modules/orders/order.module';
import { OrderController } from './../../src/modules/orders/order.controller';
import { OrderService } from './../../src/modules/orders/order.service';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let orderService: OrderService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrderModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    orderService = moduleFixture.get<OrderService>(OrderService);
    await app.init();
  });

  it('/orders (GET)', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .expect(200);
  });

  it('/orders (POST)', async () => {
    const newOrder = {
      items: [
        {
          variantId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 2,
        }
      ],
      shippingAddressId: '123e4567-e89b-12d3-a456-426614174001',
    };

    return request(app.getHttpServer())
      .post('/orders')
      .send(newOrder)
      .expect(201);
  });

  afterEach(async () => {
    await app.close();
  });
});