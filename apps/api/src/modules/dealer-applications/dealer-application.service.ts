import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateDealerApplicationDto } from './dto/create-dealer-application.dto';
import { UpdateDealerApplicationDto } from './dto/update-dealer-application.dto';

@Injectable()
export class DealerApplicationService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select(`
        *,
        user:profiles(email, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findByUser(userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw new Error(error.message);
    }

    return data || null;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select(`
        *,
        user:profiles(email, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Dealer application not found');
    }

    return data;
  }

  async create(createDealerApplicationDto: CreateDealerApplicationDto, userId: string) {
    // Check if user already has a pending application
    const existingApplication = await this.findByUser(userId);
    if (existingApplication && existingApplication.status !== 'rejected') {
      throw new ForbiddenException('You already have a pending or approved dealer application');
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .insert([
        {
          user_id: userId,
          company_name: createDealerApplicationDto.companyName,
          gst_number: createDealerApplicationDto.gstNumber,
          pan_number: createDealerApplicationDto.panNumber,
          gst_certificate_url: createDealerApplicationDto.gstCertificateUrl,
          business_pan_url: createDealerApplicationDto.businessPanUrl,
          business_address: createDealerApplicationDto.businessAddress,
          annual_turnover: createDealerApplicationDto.annualTurnover,
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateDealerApplicationDto: UpdateDealerApplicationDto, userId: string) {
    // Check if the application belongs to the user
    const application = await this.findOne(id);
    if (application.user_id !== userId) {
      throw new ForbiddenException('You can only update your own application');
    }

    // Only allow updates if the application is still pending
    if (application.status !== 'pending') {
      throw new ForbiddenException('Cannot update application after review has started');
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .update({
        ...updateDealerApplicationDto,
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

  async updateStatus(id: string, status: string, reviewerId: string, rejectionReason?: string) {
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .update({
        status: status,
        reviewed_by: status !== 'pending' ? reviewerId : null,
        reviewed_at: status !== 'pending' ? new Date().toISOString() : null,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:profiles(email, first_name, last_name)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // If approved, update the user's role in profiles table
    if (status === 'approved') {
      const { error: profileError } = await this.supabaseService.getClient()
        .from('profiles')
        .update({ role: 'dealer' })
        .eq('id', data.user_id);

      if (profileError) {
        console.error('Failed to update user role:', profileError);
        // Don't throw error as the application was processed, just log it
      }
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Dealer application deleted successfully' };
  }
}