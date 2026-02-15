import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { SupabaseService } from '../../supabase/supabase.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let supabaseService: Partial<SupabaseService>;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    supabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: SupabaseService, useValue: supabaseService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1', sku: 'SKU1' }];
      mockSupabaseClient.select.mockResolvedValue({ data: mockProducts, error: null });

      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
    });

    it('should throw an error if supabase returns an error', async () => {
      mockSupabaseClient.select.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      const createDto = { name: 'New Product', slug: 'new-product', categoryId: 'cat-1', mrp: 100, sku: 'NEW' };
      const mockProduct = { id: '2', ...createDto };
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: mockProduct, error: null });

      const result = await service.create(createDto);
      expect(result).toEqual(mockProduct);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
    });
  });
});
