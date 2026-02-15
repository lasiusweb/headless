import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Product[]> {
    const response = await this.supabaseService
      .getClient()
      .from('products')
      .select('*');

    if (response.error) {
      throw new InternalServerErrorException(response.error.message);
    }

    return response.data as Product[];
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const response = await this.supabaseService
      .getClient()
      .from('products')
      .insert(createProductDto)
      .select()
      .single();

    if (response.error) {
      throw new InternalServerErrorException(response.error.message);
    }

    return response.data as Product;
  }
}
