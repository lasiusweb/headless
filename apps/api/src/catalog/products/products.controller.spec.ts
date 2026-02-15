import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SupabaseAuthGuard } from '../../supabase/supabase-auth/supabase-auth.guard';
import { SupabaseService } from '../../supabase/supabase.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: Partial<ProductsService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: service },
        {
          provide: SupabaseService,
          useValue: { getClient: jest.fn() },
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const mockProducts = [{ id: '1', name: 'Prod 1', slug: 'p1', categoryId: 'c1', mrp: 10, sku: 'S1', createdAt: new Date(), updatedAt: new Date() }];
      (service.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const result = await controller.findAll();
      expect(result).toEqual(mockProducts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { name: 'New', slug: 'new', categoryId: 'c1', mrp: 20, sku: 'N1' };
      const mockProduct = { id: '2', ...dto, createdAt: new Date(), updatedAt: new Date() };
      (service.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await controller.create(dto);
      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});
