import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface Customer {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class CustomersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(): Promise<Customer[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('customers')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async findOne(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabaseService.getClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const { data, error } = await this.supabaseService.getClient()
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}
