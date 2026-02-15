import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { SupabaseAuthGuard } from '../../supabase/supabase-auth/supabase-auth.guard';
import { SupabaseService } from '../../supabase/supabase.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: Partial<CategoriesService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: service },
        {
          provide: SupabaseService,
          useValue: { getClient: jest.fn() },
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const mockCategories = [{ id: '1', name: 'Cat 1', slug: 'cat-1', createdAt: new Date(), updatedAt: new Date() }];
      (service.findAll as jest.Mock).mockResolvedValue(mockCategories);

      const result = await controller.findAll();
      expect(result).toEqual(mockCategories);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { name: 'New', slug: 'new' };
      const mockCategory = { id: '2', ...dto, createdAt: new Date(), updatedAt: new Date() };
      (service.create as jest.Mock).mockResolvedValue(mockCategory);

      const result = await controller.create(dto);
      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});
