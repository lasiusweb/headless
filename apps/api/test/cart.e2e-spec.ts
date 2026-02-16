import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { CartModule } from './../src/modules/cart/cart.module';
import { SupabaseModule } from './../src/modules/supabase/supabase.module';
import { AuthModule } from './../src/modules/auth/auth.module';

describe('CartController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CartModule, SupabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET /cart', () => {
    it('should return cart with items and total', async () => {
      return request(app.getHttpServer())
        .get('/cart')
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('items');
          expect(response.body).toHaveProperty('total');
        });
    });
  });

  describe('POST /cart/items', () => {
    it('should add item to cart', async () => {
      const newItem = {
        variantId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
      };

      return request(app.getHttpServer())
        .post('/cart/items')
        .send(newItem)
        .expect(HttpStatus.CREATED);
    });

    it('should return 400 if variantId is missing', async () => {
      const invalidItem = {
        quantity: 2,
      };

      return request(app.getHttpServer())
        .post('/cart/items')
        .send(invalidItem)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if quantity is less than 1', async () => {
      const invalidItem = {
        variantId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 0,
      };

      return request(app.getHttpServer())
        .post('/cart/items')
        .send(invalidItem)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /cart/items/:id', () => {
    it('should update cart item quantity', async () => {
      const cartItemId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { quantity: 5 };

      return request(app.getHttpServer())
        .patch(`/cart/items/${cartItemId}`)
        .send(updateData)
        .expect(HttpStatus.OK);
    });

    it('should return 400 if quantity is less than 1', async () => {
      const cartItemId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { quantity: 0 };

      return request(app.getHttpServer())
        .patch(`/cart/items/${cartItemId}`)
        .send(updateData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /cart/items/:id', () => {
    it('should remove item from cart', async () => {
      const cartItemId = '123e4567-e89b-12d3-a456-426614174000';

      return request(app.getHttpServer())
        .delete(`/cart/items/${cartItemId}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE /cart/clear', () => {
    it('should clear all items from cart', async () => {
      return request(app.getHttpServer())
        .delete('/cart/clear')
        .expect(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});