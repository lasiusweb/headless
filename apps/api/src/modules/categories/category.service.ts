import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .insert([
        {
          name: createCategoryDto.name,
          slug: createCategoryDto.slug,
          description: createCategoryDto.description,
          parent_id: createCategoryDto.parentId,
          is_active: createCategoryDto.isActive ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .update({
        name: updateCategoryDto.name,
        slug: updateCategoryDto.slug,
        description: updateCategoryDto.description,
        parent_id: updateCategoryDto.parentId,
        is_active: updateCategoryDto.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Category deactivated successfully' };
  }
}