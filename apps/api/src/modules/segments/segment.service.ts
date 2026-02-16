import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';

@Injectable()
export class SegmentService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('segments')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('segments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Segment not found');
    }

    return data;
  }

  async create(createSegmentDto: CreateSegmentDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('segments')
      .insert([
        {
          name: createSegmentDto.name,
          slug: createSegmentDto.slug,
          description: createSegmentDto.description,
          is_active: createSegmentDto.isActive ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateSegmentDto: UpdateSegmentDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('segments')
      .update({
        name: updateSegmentDto.name,
        slug: updateSegmentDto.slug,
        description: updateSegmentDto.description,
        is_active: updateSegmentDto.isActive,
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
      .from('segments')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Segment deactivated successfully' };
  }
}