import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(productId?: string) {
    let query = this.supabaseService.getClient()
      .from('product_variants')
      .select(`
        *,
        product:products(name, slug)
      `)
      .eq('is_active', true);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('product_variants')
      .select(`
        *,
        product:products(name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Product variant not found');
    }

    return data;
  }

  async create(createProductVariantDto: CreateProductVariantDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('product_variants')
      .insert([
        {
          product_id: createProductVariantDto.productId,
          sku: createProductVariantDto.sku,
          name: createProductVariantDto.name,
          barcode: createProductVariantDto.barcode,
          weight: createProductVariantDto.weight,
          dimensions: createProductVariantDto.dimensions,
          mrp: createProductVariantDto.mrp,
          dealer_price: createProductVariantDto.dealerPrice,
          distributor_price: createProductVariantDto.distributorPrice,
          is_active: createProductVariantDto.isActive ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('product_variants')
      .update({
        sku: updateProductVariantDto.sku,
        name: updateProductVariantDto.name,
        barcode: updateProductVariantDto.barcode,
        weight: updateProductVariantDto.weight,
        dimensions: updateProductVariantDto.dimensions,
        mrp: updateProductVariantDto.mrp,
        dealer_price: updateProductVariantDto.dealerPrice,
        distributor_price: updateProductVariantDto.distributorPrice,
        is_active: updateProductVariantDto.isActive,
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
      .from('product_variants')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Product variant deactivated successfully' };
  }
}