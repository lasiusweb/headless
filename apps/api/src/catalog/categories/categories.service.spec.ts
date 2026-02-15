import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { SupabaseService } from '../../supabase/supabase.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
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
        CategoriesService,
        { provide: SupabaseService, useValue: supabaseService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [{ id: '1', name: 'Category 1' }];
      mockSupabaseClient.select.mockResolvedValue({ data: mockCategories, error: null });

      const result = await service.findAll();
      expect(result).toEqual(mockCategories);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories');
    });

    it('should throw an error if supabase returns an error', async () => {
      mockSupabaseClient.select.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      const createDto = { name: 'New Category', slug: 'new-category' };
      const mockCategory = { id: '2', ...createDto };
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: mockCategory, error: null });

      const result = await service.create(createDto);
      expect(result).toEqual(mockCategory);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories');
    });
  });
});
