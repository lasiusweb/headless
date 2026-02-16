import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../src/modules/products/product.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('ProductService', () => {
  let service: ProductService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(() => ({
              from: jest.fn(() => ({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Test Product' }, error: null })),
                    limit: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Test Product' }, error: null })),
                    })),
                  })),
                  insert: jest.fn(() => ({
                    select: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Test Product' }, error: null })),
                    })),
                  })),
                  update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      select: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Updated Product' }, error: null })),
                      })),
                    })),
                  })),
                  delete: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
                    })),
                  })),
                })),
              })),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const createProductDto = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      segmentId: 'segment-1',
      categoryId: 'category-1',
      isActive: true,
    };

    const result = await service.create(createProductDto);
    expect(result).toEqual({ id: '1', name: 'Test Product' });
  });

  it('should find a product by ID', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Product' });
  });

  it('should update a product', async () => {
    const updateProductDto = {
      name: 'Updated Product',
      slug: 'updated-product',
      description: 'An updated product',
      segmentId: 'segment-1',
      categoryId: 'category-1',
      isActive: true,
    };

    const result = await service.update('1', updateProductDto);
    expect(result).toEqual({ id: '1', name: 'Updated Product' });
  });

  it('should remove a product', async () => {
    const result = await service.remove('1');
    expect(result).toEqual({ message: 'Product removed successfully' });
  });
});