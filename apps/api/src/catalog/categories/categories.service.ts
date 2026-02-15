import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Category[]> {
    const response = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*');

    if (response.error) {
      throw new InternalServerErrorException(response.error.message);
    }

    return response.data as Category[];
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const response = await this.supabaseService
      .getClient()
      .from('categories')
      .insert(createCategoryDto)
      .select()
      .single();

    if (response.error) {
      throw new InternalServerErrorException(response.error.message);
    }

    return response.data as Category;
  }
}
