import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';

@Injectable()
export class ProblemService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('problems')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Problem not found');
    }

    return data;
  }

  async create(createProblemDto: CreateProblemDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('problems')
      .insert([
        {
          name: createProblemDto.name,
          slug: createProblemDto.slug,
          description: createProblemDto.description,
          is_active: createProblemDto.isActive ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateProblemDto: UpdateProblemDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('problems')
      .update({
        name: updateProblemDto.name,
        slug: updateProblemDto.slug,
        description: updateProblemDto.description,
        is_active: updateProblemDto.isActive,
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
      .from('problems')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Problem deactivated successfully' };
  }
}