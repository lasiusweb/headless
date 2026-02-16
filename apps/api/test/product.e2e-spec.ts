import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProductController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/products (GET) - should return products', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/products (POST) - should create a product', () => {
    const newProduct = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      segmentId: 'segment-1',
      categoryId: 'category-1',
      isActive: true,
    };

    return request(app.getHttpServer())
      .post('/products')
      .send(newProduct)
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test Product');
        expect(res.body.slug).toBe('test-product');
      });
  });

  it('/products/:id (GET) - should return a specific product', () => {
    return request(app.getHttpServer())
      .get('/products/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});