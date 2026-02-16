import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

@Injectable()
export class CropService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('crops')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('crops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Crop not found');
    }

    return data;
  }

  async create(createCropDto: CreateCropDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('crops')
      .insert([
        {
          name: createCropDto.name,
          slug: createCropDto.slug,
          description: createCropDto.description,
          is_active: createCropDto.isActive ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateCropDto: UpdateCropDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('crops')
      .update({
        name: updateCropDto.name,
        slug: updateCropDto.slug,
        description: updateCropDto.description,
        is_active: updateCropDto.isActive,
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
      .from('crops')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Crop deactivated successfully' };
  }
}