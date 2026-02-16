import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: SupabaseService;
  let jwtService: JwtService;

  const mockSupabaseService = {
    getClient: jest.fn(() => ({
      auth: {
        signInWithPassword: jest.fn(() => Promise.resolve({
          data: { user: { id: 'user-1', email: 'test@example.com' }, session: { access_token: 'mock-token' } },
          error: null
        })),
        signUp: jest.fn(() => Promise.resolve({
          data: { user: { id: 'user-1', email: 'test@example.com' }, session: { access_token: 'mock-token' } },
          error: null
        })),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: { id: 'user-1', email: 'test@example.com', role: 'customer' }, error: null })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: { id: 'user-1', email: 'test@example.com', role: 'customer' }, error: null })),
          })),
        })),
      })),
    })),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({ id: 'user-1', email: 'test@example.com', role: 'customer' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate a user', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toEqual({ id: 'user-1', email: 'test@example.com', role: 'customer' });
  });

  it('should register a new user', async () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'customer',
    };

    const result = await service.register(registerDto);
    expect(result).toEqual({ id: 'user-1', email: 'newuser@example.com', role: 'customer' });
  });

  it('should login a user', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await service.login(loginDto);
    expect(result).toEqual({
      access_token: 'mock-jwt-token',
      user: { id: 'user-1', email: 'test@example.com', role: 'customer' },
    });
  });

  it('should create JWT token', () => {
    const payload = { id: 'user-1', email: 'test@example.com', role: 'customer' };
    const result = service.createToken(payload);
    expect(result).toBe('mock-jwt-token');
  });
});