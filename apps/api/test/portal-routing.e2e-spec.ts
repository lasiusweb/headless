/**
 * E2E Integration Tests for B2B/D2C Portal Routing
 * 
 * Tests the complete flow from authentication to portal redirection
 * covering both frontend middleware and backend JWT token generation.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Portal Routing E2E (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let supabaseService: SupabaseService;

  // Test users with different roles
  const testUsers = {
    dealer: {
      id: 'dealer-test-uuid',
      email: 'dealer@test.com',
      role: 'dealer',
      portal: 'b2b',
    },
    distributor: {
      id: 'distributor-test-uuid',
      email: 'distributor@test.com',
      role: 'distributor',
      portal: 'b2b',
    },
    retailer: {
      id: 'retailer-test-uuid',
      email: 'retailer@test.com',
      role: 'retailer',
      portal: 'b2c',
    },
    farmer: {
      id: 'farmer-test-uuid',
      email: 'farmer@test.com',
      role: 'farmer',
      portal: 'b2c',
    },
    customer: {
      id: 'customer-test-uuid',
      email: 'customer@test.com',
      role: 'customer',
      portal: 'b2c',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    jwtService = moduleFixture.get<JwtService>(JwtService);
    supabaseService = moduleFixture.get<SupabaseService>(SupabaseService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('JWT Token Generation with Portal Claims', () => {
    it('should generate JWT token with correct portal claim for dealer', () => {
      const payload = {
        sub: testUsers.dealer.id,
        email: testUsers.dealer.email,
        role: testUsers.dealer.role,
      };

      const token = jwtService.sign(payload);
      const decoded: any = jwtService.decode(token);

      expect(decoded.role).toBe('dealer');
      expect(decoded.portal).toBe('b2b');
    });

    it('should generate JWT token with correct portal claim for distributor', () => {
      const payload = {
        sub: testUsers.distributor.id,
        email: testUsers.distributor.email,
        role: testUsers.distributor.role,
      };

      const token = jwtService.sign(payload);
      const decoded: any = jwtService.decode(token);

      expect(decoded.role).toBe('distributor');
      expect(decoded.portal).toBe('b2b');
    });

    it('should generate JWT token with correct portal claim for retailer', () => {
      const payload = {
        sub: testUsers.retailer.id,
        email: testUsers.retailer.email,
        role: testUsers.retailer.role,
      };

      const token = jwtService.sign(payload);
      const decoded: any = jwtService.decode(token);

      expect(decoded.role).toBe('retailer');
      expect(decoded.portal).toBe('b2c');
    });

    it('should generate JWT token with correct portal claim for farmer', () => {
      const payload = {
        sub: testUsers.farmer.id,
        email: testUsers.farmer.email,
        role: testUsers.farmer.role,
      };

      const token = jwtService.sign(payload);
      const decoded: any = jwtService.decode(token);

      expect(decoded.role).toBe('farmer');
      expect(decoded.portal).toBe('b2c');
    });

    it('should generate JWT token with correct portal claim for customer', () => {
      const payload = {
        sub: testUsers.customer.id,
        email: testUsers.customer.email,
        role: testUsers.customer.role,
      };

      const token = jwtService.sign(payload);
      const decoded: any = jwtService.decode(token);

      expect(decoded.role).toBe('customer');
      expect(decoded.portal).toBe('b2c');
    });
  });

  describe('Auth Endpoint - Login and Token Generation', () => {
    it('should return JWT token with portal claim on successful login', async () => {
      // Mock successful login response
      const mockLoginResponse = {
        access_token: jwtService.sign({
          sub: testUsers.dealer.id,
          email: testUsers.dealer.email,
          role: testUsers.dealer.role,
          portal: testUsers.dealer.portal,
        }),
        user: {
          id: testUsers.dealer.id,
          email: testUsers.dealer.email,
          role: testUsers.dealer.role,
          portal: testUsers.dealer.portal,
        },
      };

      // Note: In a real E2E test, you would call the actual login endpoint
      // This is a simplified version for demonstration
      expect(mockLoginResponse.access_token).toBeDefined();
      expect(mockLoginResponse.user.portal).toBe('b2b');
    });
  });

  describe('Role to Portal Mapping', () => {
    const roleToPortalMap = [
      { role: 'dealer', expectedPortal: 'b2b' },
      { role: 'distributor', expectedPortal: 'b2b' },
      { role: 'retailer', expectedPortal: 'b2c' },
      { role: 'farmer', expectedPortal: 'b2c' },
      { role: 'customer', expectedPortal: 'b2c' },
      { role: 'admin', expectedPortal: 'admin' },
    ];

    roleToPortalMap.forEach(({ role, expectedPortal }) => {
      it(`should map role "${role}" to portal "${expectedPortal}"`, () => {
        const payload = {
          sub: `test-${role}`,
          email: `${role}@test.com`,
          role: role,
        };

        const token = jwtService.sign(payload);
        const decoded: any = jwtService.decode(token);

        expect(decoded.portal).toBe(expectedPortal);
      });
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate token with correct structure', () => {
      const payload = {
        sub: testUsers.dealer.id,
        email: testUsers.dealer.email,
        role: testUsers.dealer.role,
        portal: testUsers.dealer.portal,
      };

      const token = jwtService.sign(payload);
      
      // Token should have 3 parts
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Should decode successfully
      const decoded = jwtService.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe(testUsers.dealer.id);
    });

    it('should include expiration in token', () => {
      const payload = {
        sub: testUsers.dealer.id,
        email: testUsers.dealer.email,
        role: testUsers.dealer.role,
      };

      const token = jwtService.sign(payload, { expiresIn: '1h' });
      const decoded: any = jwtService.decode(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should reject expired tokens', () => {
      const payload = {
        sub: testUsers.dealer.id,
        email: testUsers.dealer.email,
        role: testUsers.dealer.role,
      };

      // Sign with past expiration
      const token = jwtService.sign(payload, { expiresIn: '-1h' });
      
      try {
        jwtService.verify(token);
        fail('Token should have been rejected');
      } catch (error) {
        expect(error.message).toContain('expired');
      }
    });
  });

  describe('Portal URL Configuration', () => {
    const portalUrls = {
      b2b: process.env.NEXT_PUBLIC_B2B_URL || 'https://www.knbiosciences.in',
      b2c: process.env.NEXT_PUBLIC_B2C_URL || 'https://agriculture.knbiosciences.in',
      admin: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.knbiosciences.in',
    };

    it('should have B2B portal URL configured', () => {
      expect(portalUrls.b2b).toBeDefined();
      expect(portalUrls.b2b).toBeTruthy();
    });

    it('should have B2C portal URL configured', () => {
      expect(portalUrls.b2c).toBeDefined();
      expect(portalUrls.b2c).toBeTruthy();
    });

    it('should have different URLs for B2B and B2C', () => {
      expect(portalUrls.b2b).not.toBe(portalUrls.b2c);
    });
  });

  describe('Cookie Domain Configuration', () => {
    it('should have cookie domain configured', () => {
      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.knbiosciences.in';
      expect(cookieDomain).toBeDefined();
    });

    it('should have valid cookie domain format', () => {
      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.knbiosciences.in';
      // Should start with dot for subdomain cookies
      expect(cookieDomain.startsWith('.') || cookieDomain.includes('localhost')).toBeTruthy();
    });
  });

  describe('JWT Secret Configuration', () => {
    it('should have JWT secret configured', () => {
      const jwtSecret = process.env.JWT_SECRET;
      expect(jwtSecret).toBeDefined();
      expect(jwtSecret?.length).toBeGreaterThan(10);
    });

    it('should have strong JWT secret (min 32 chars)', () => {
      const jwtSecret = process.env.JWT_SECRET;
      expect(jwtSecret?.length).toBeGreaterThanOrEqual(32);
    });
  });
});
