import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(filters?: any) {
    let query = this.supabaseService.getClient()
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        segment:segments(name, slug),
        crops:crops(name, slug),
        problems:problems(name, slug)
      `)
      .eq('is_active', true);

    // Apply filters if provided
    if (filters) {
      if (filters.segment) {
        query = query.eq('segment_id', filters.segment);
      }
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters.crop) {
        query = query.contains('crop_ids', [filters.crop]);
      }
      if (filters.problem) {
        query = query.contains('problem_ids', [filters.problem]);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        segment:segments(name, slug),
        crops:crops(name, slug),
        problems:problems(name, slug),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Product not found');
    }

    return data;
  }

  async create(createProductDto: CreateProductDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('products')
      .insert([
        {
          name: createProductDto.name,
          slug: createProductDto.slug,
          description: createProductDto.description,
          segment_id: createProductDto.segmentId,
          category_id: createProductDto.categoryId,
          mrp: createProductDto.mrp,
          dealer_price: createProductDto.dealerPrice,
          distributor_price: createProductDto.distributorPrice,
          sku: createProductDto.sku,
          gst_rate: createProductDto.gstRate,
          usage_instructions: createProductDto.usageInstructions,
          precautions: createProductDto.precautions,
          benefits: createProductDto.benefits,
          composition: createProductDto.composition,
          application_method: createProductDto.applicationMethod,
          target_pests_or_issues: createProductDto.targetPestsOrIssues,
          target_crops: createProductDto.targetCrops,
          weight_or_volume: createProductDto.weightOrVolume,
          unit_of_measurement: createProductDto.unitOfMeasurement,
          image_urls: createProductDto.imageUrls || [],
          is_active: createProductDto.isActive ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Handle crops and problems relationships
    if (createProductDto.cropIds && createProductDto.cropIds.length > 0) {
      const cropRelations = createProductDto.cropIds.map(cropId => ({
        product_id: data.id,
        crop_id: cropId
      }));

      await this.supabaseService.getClient()
        .from('product_crops')
        .insert(cropRelations);
    }

    if (createProductDto.problemIds && createProductDto.problemIds.length > 0) {
      const problemRelations = createProductDto.problemIds.map(problemId => ({
        product_id: data.id,
        problem_id: problemId
      }));

      await this.supabaseService.getClient()
        .from('product_problems')
        .insert(problemRelations);
    }

    return data;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Prepare update object with only defined fields
    const updateObject: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateProductDto.name !== undefined) updateObject.name = updateProductDto.name;
    if (updateProductDto.slug !== undefined) updateObject.slug = updateProductDto.slug;
    if (updateProductDto.description !== undefined) updateObject.description = updateProductDto.description;
    if (updateProductDto.segmentId !== undefined) updateObject.segment_id = updateProductDto.segmentId;
    if (updateProductDto.categoryId !== undefined) updateObject.category_id = updateProductDto.categoryId;
    if (updateProductDto.mrp !== undefined) updateObject.mrp = updateProductDto.mrp;
    if (updateProductDto.dealerPrice !== undefined) updateObject.dealer_price = updateProductDto.dealerPrice;
    if (updateProductDto.distributorPrice !== undefined) updateObject.distributor_price = updateProductDto.distributorPrice;
    if (updateProductDto.sku !== undefined) updateObject.sku = updateProductDto.sku;
    if (updateProductDto.gstRate !== undefined) updateObject.gst_rate = updateProductDto.gstRate;
    if (updateProductDto.usageInstructions !== undefined) updateObject.usage_instructions = updateProductDto.usageInstructions;
    if (updateProductDto.precautions !== undefined) updateObject.precautions = updateProductDto.precautions;
    if (updateProductDto.benefits !== undefined) updateObject.benefits = updateProductDto.benefits;
    if (updateProductDto.composition !== undefined) updateObject.composition = updateProductDto.composition;
    if (updateProductDto.applicationMethod !== undefined) updateObject.application_method = updateProductDto.applicationMethod;
    if (updateProductDto.targetPestsOrIssues !== undefined) updateObject.target_pests_or_issues = updateProductDto.targetPestsOrIssues;
    if (updateProductDto.targetCrops !== undefined) updateObject.target_crops = updateProductDto.targetCrops;
    if (updateProductDto.weightOrVolume !== undefined) updateObject.weight_or_volume = updateProductDto.weightOrVolume;
    if (updateProductDto.unitOfMeasurement !== undefined) updateObject.unit_of_measurement = updateProductDto.unitOfMeasurement;
    if (updateProductDto.imageUrls !== undefined) updateObject.image_urls = updateProductDto.imageUrls;
    if (updateProductDto.isActive !== undefined) updateObject.is_active = updateProductDto.isActive;

    const { data, error } = await this.supabaseService.getClient()
      .from('products')
      .update(updateObject)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update crops relationships
    if (updateProductDto.cropIds !== undefined) {
      // Delete existing relations
      await this.supabaseService.getClient()
        .from('product_crops')
        .delete()
        .eq('product_id', id);

      // Insert new relations if any
      if (updateProductDto.cropIds && updateProductDto.cropIds.length > 0) {
        const cropRelations = updateProductDto.cropIds.map(cropId => ({
          product_id: id,
          crop_id: cropId
        }));

        await this.supabaseService.getClient()
          .from('product_crops')
          .insert(cropRelations);
      }
    }

    // Update problems relationships
    if (updateProductDto.problemIds !== undefined) {
      // Delete existing relations
      await this.supabaseService.getClient()
        .from('product_problems')
        .delete()
        .eq('product_id', id);

      // Insert new relations if any
      if (updateProductDto.problemIds && updateProductDto.problemIds.length > 0) {
        const problemRelations = updateProductDto.problemIds.map(problemId => ({
          product_id: id,
          problem_id: problemId
        }));

        await this.supabaseService.getClient()
          .from('product_problems')
          .insert(problemRelations);
      }
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Product deactivated successfully' };
  }
}