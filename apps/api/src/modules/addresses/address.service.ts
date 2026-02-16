import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new NotFoundException('Address not found');
    }

    return data;
  }

  async create(createAddressDto: CreateAddressDto, userId: string) {
    // If setting as default, unset other defaults
    if (createAddressDto.isDefault) {
      await this.supabaseService.getClient()
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('addresses')
      .insert([
        {
          user_id: userId,
          full_name: createAddressDto.fullName,
          phone: createAddressDto.phone,
          address_line1: createAddressDto.addressLine1,
          address_line2: createAddressDto.addressLine2,
          city: createAddressDto.city,
          state: createAddressDto.state,
          pincode: createAddressDto.pincode,
          country: createAddressDto.country || 'India',
          is_default: createAddressDto.isDefault ?? false,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, userId: string) {
    // If setting as default, unset other defaults
    if (updateAddressDto.isDefault) {
      await this.supabaseService.getClient()
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('addresses')
      .update({
        full_name: updateAddressDto.fullName,
        phone: updateAddressDto.phone,
        address_line1: updateAddressDto.addressLine1,
        address_line2: updateAddressDto.addressLine2,
        city: updateAddressDto.city,
        state: updateAddressDto.state,
        pincode: updateAddressDto.pincode,
        country: updateAddressDto.country,
        is_default: updateAddressDto.isDefault,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string, userId: string) {
    const { error } = await this.supabaseService.getClient()
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Address deleted successfully' };
  }

  async setDefault(id: string, userId: string) {
    // Unset all other defaults
    await this.supabaseService.getClient()
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set the specified address as default
    const { data, error } = await this.supabaseService.getClient()
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}