import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';

// Mock the SupabaseService
const mockSupabaseService = {
  getClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        contains: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          returning: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
};

describe('ProductService', () => {
  let service: ProductService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          segment_id: 'seg1',
          category_id: 'cat1',
          mrp: 100,
          dealer_price: 80,
          distributor_price: 70,
          sku: 'TEST001',
          gst_rate: 18,
          usage_instructions: 'Use as directed',
          precautions: 'Keep away from children',
          benefits: 'Provides nutrition',
          composition: 'Natural ingredients',
          application_method: 'Apply evenly',
          target_pests_or_issues: 'Pests',
          target_crops: 'All crops',
          weight_or_volume: 500,
          unit_of_measurement: 'ml',
          image_urls: ['https://example.com/image.jpg'],
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(),
            })),
            contains: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        segment_id: 'seg1',
        category_id: 'cat1',
        mrp: 100,
        dealer_price: 80,
        distributor_price: 70,
        sku: 'TEST001',
        gst_rate: 18,
        usage_instructions: 'Use as directed',
        precautions: 'Keep away from children',
        benefits: 'Provides nutrition',
        composition: 'Natural ingredients',
        application_method: 'Apply evenly',
        target_pests_or_issues: 'Pests',
        target_crops: 'All crops',
        weight_or_volume: 500,
        unit_of_measurement: 'ml',
        image_urls: ['https://example.com/image.jpg'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockProduct, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            })),
          })),
        })),
      } as any);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const createProductDto = {
        name: 'New Product',
        slug: 'new-product',
        description: 'New Product Description',
        segmentId: 'seg1',
        categoryId: 'cat1',
        mrp: 150,
        dealerPrice: 120,
        distributorPrice: 100,
        sku: 'NEW001',
        gstRate: 12,
        usageInstructions: 'Use as directed',
        precautions: 'Handle with care',
        benefits: 'Great benefits',
        composition: 'Quality ingredients',
        applicationMethod: 'Apply carefully',
        targetPestsOrIssues: 'Various pests',
        targetCrops: 'All crops',
        weightOrVolume: 1000,
        unitOfMeasurement: 'gm',
        imageUrls: ['https://example.com/new-image.jpg'],
        isActive: true,
      };

      const mockCreatedProduct = {
        id: '2',
        ...createProductDto,
        segment_id: createProductDto.segmentId,
        category_id: createProductDto.categoryId,
        dealer_price: createProductDto.dealerPrice,
        distributor_price: createProductDto.distributorPrice,
        gst_rate: createProductDto.gstRate,
        usage_instructions: createProductDto.usageInstructions,
        application_method: createProductDto.applicationMethod,
        target_pests_or_issues: createProductDto.targetPestsOrIssues,
        target_crops: createProductDto.targetCrops,
        weight_or_volume: createProductDto.weightOrVolume,
        unit_of_measurement: createProductDto.unitOfMeasurement,
        image_urls: createProductDto.imageUrls,
        is_active: createProductDto.isActive,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockCreatedProduct, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.create(createProductDto);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('update', () => {
    it('should update and return the updated product', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        slug: 'updated-product',
        description: 'Updated Description',
        segmentId: 'seg2',
        categoryId: 'cat2',
        mrp: 200,
        dealerPrice: 160,
        distributorPrice: 140,
        sku: 'UPD001',
        gstRate: 15,
        usageInstructions: 'Updated instructions',
        precautions: 'Updated precautions',
        benefits: 'Updated benefits',
        composition: 'Updated composition',
        applicationMethod: 'Updated method',
        targetPestsOrIssues: 'Updated pests',
        targetCrops: 'Updated crops',
        weightOrVolume: 750,
        unitOfMeasurement: 'ml',
        imageUrls: ['https://example.com/updated-image.jpg'],
        isActive: false,
      };

      const mockUpdatedProduct = {
        id: '1',
        ...updateProductDto,
        segment_id: updateProductDto.segmentId,
        category_id: updateProductDto.categoryId,
        dealer_price: updateProductDto.dealerPrice,
        distributor_price: updateProductDto.distributorPrice,
        gst_rate: updateProductDto.gstRate,
        usage_instructions: updateProductDto.usageInstructions,
        application_method: updateProductDto.applicationMethod,
        target_pests_or_issues: updateProductDto.targetPestsOrIssues,
        target_crops: updateProductDto.targetCrops,
        weight_or_volume: updateProductDto.weightOrVolume,
        unit_of_measurement: updateProductDto.unitOfMeasurement,
        image_urls: updateProductDto.imageUrls,
        is_active: updateProductDto.isActive,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: mockUpdatedProduct, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.update('1', updateProductDto);
      expect(result).toEqual(mockUpdatedProduct);
    });
  });

  describe('remove', () => {
    it('should deactivate a product', async () => {
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.remove('1');
      expect(result).toEqual({ message: 'Product deactivated successfully' });
    });
  });
});