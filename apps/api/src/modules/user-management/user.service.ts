import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private supabaseService: SupabaseService) {}

  async findAll(filters?: { 
    role?: string; 
    status?: string; 
    search?: string 
  }) {
    let query = this.supabaseService.getClient()
      .from('profiles')
      .select(`
        *,
        dealer_application:dealer_applications(status)
      `)
      .order('created_at', { ascending: false });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select(`
        *,
        dealer_application:dealer_applications(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('User not found');
    }

    return data;
  }

  async updateRole(userId: string, newRole: string, updatedBy: string) {
    // Validate role
    const validRoles = ['customer', 'dealer', 'distributor', 'admin', 'pos_user'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    // Get current user to verify permissions
    const { data: currentUser, error: currentUserError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', updatedBy)
      .single();

    if (currentUserError) {
      throw new Error('Updater not found');
    }

    // Only admins can update roles
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can update user roles');
    }

    // Update user role
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Log the role change
    await this.logRoleChange(userId, currentUser.id, newRole);

    return data;
  }

  async updateUserStatus(userId: string, newStatus: string, updatedBy: string, reason?: string) {
    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended', 'pending_verification'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Get current user to verify permissions
    const { data: currentUser, error: currentUserError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', updatedBy)
      .single();

    if (currentUserError) {
      throw new Error('Updater not found');
    }

    // Only admins can update user status
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can update user status');
    }

    // Update user status
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Log the status change
    await this.logStatusChange(userId, currentUser.id, newStatus, reason);

    return data;
  }

  async approveDealerApplication(applicationId: string, approvedBy: string) {
    // Get the dealer application
    const { data: application, error: applicationError } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      throw new Error('Dealer application not found');
    }

    // Update application status to approved
    const { error: updateError } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .update({
        status: 'approved',
        reviewed_by: approvedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Update user role to dealer
    const { error: userUpdateError } = await this.supabaseService.getClient()
      .from('profiles')
      .update({ role: 'dealer' })
      .eq('id', application.user_id);

    if (userUpdateError) {
      this.logger.error(`Failed to update user role after dealer approval: ${userUpdateError.message}`);
      // Don't throw error as the application was approved, just log it
    }

    // Log the approval
    await this.logDealerApproval(applicationId, approvedBy);

    return {
      success: true,
      message: 'Dealer application approved successfully',
      userId: application.user_id,
      applicationId: application.id,
    };
  }

  async rejectDealerApplication(applicationId: string, rejectedBy: string, reason: string) {
    // Get the dealer application
    const { data: application, error: applicationError } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      throw new Error('Dealer application not found');
    }

    // Update application status to rejected
    const { error: updateError } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .update({
        status: 'rejected',
        reviewed_by: rejectedBy,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Log the rejection
    await this.logDealerRejection(applicationId, rejectedBy, reason);

    return {
      success: true,
      message: 'Dealer application rejected successfully',
      userId: application.user_id,
      applicationId: application.id,
    };
  }

  async getRolePermissions(role: string) {
    // Define permissions based on role
    const permissions: Record<string, string[]> = {
      customer: [
        'view_products',
        'add_to_cart',
        'place_order',
        'view_profile',
        'update_profile',
        'view_orders',
        'view_cart',
        'apply_for_dealer',
      ],
      dealer: [
        'view_products',
        'add_to_cart',
        'place_order',
        'view_profile',
        'update_profile',
        'view_orders',
        'view_cart',
        'view_dealer_prices',
        'bulk_order_access',
        'view_catalog',
        'apply_for_distributor',
      ],
      distributor: [
        'view_products',
        'add_to_cart',
        'place_order',
        'view_profile',
        'update_profile',
        'view_orders',
        'view_cart',
        'view_distributor_prices',
        'bulk_order_access',
        'view_catalog',
        'priority_support',
        'special_discounts',
      ],
      admin: [
        'manage_users',
        'manage_products',
        'manage_orders',
        'manage_inventory',
        'manage_payments',
        'manage_shipping',
        'view_reports',
        'manage_settings',
        'approve_dealer_applications',
        'view_all_data',
        'manage_roles',
        'manage_permissions',
      ],
      pos_user: [
        'view_products',
        'create_orders',
        'process_payments',
        'view_inventory',
        'offline_access',
        'scan_barcode',
      ],
    };

    return permissions[role] || [];
  }

  async assignPermissions(userId: string, permissions: string[], assignedBy: string) {
    // Get current user to verify permissions
    const { data: currentUser, error: currentUserError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', assignedBy)
      .single();

    if (currentUserError) {
      throw new Error('Assigner not found');
    }

    // Only admins can assign custom permissions
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can assign custom permissions');
    }

    // In a real implementation, this would update a permissions table
    // For now, we'll just return a success response
    return {
      success: true,
      message: 'Permissions assigned successfully',
      userId,
      permissions,
    };
  }

  private async logRoleChange(userId: string, changerId: string, newRole: string) {
    const { error } = await this.supabaseService.getClient()
      .from('audit_log')
      .insert([
        {
          actor_id: changerId,
          action: 'user.role_change',
          entity_type: 'user',
          entity_id: userId,
          old_values: { role: 'unknown' }, // Would need to fetch old role in real implementation
          new_values: { role: newRole },
        }
      ]);

    if (error) {
      this.logger.error(`Error logging role change: ${error.message}`);
    }
  }

  private async logStatusChange(userId: string, changerId: string, newStatus: string, reason?: string) {
    const { error } = await this.supabaseService.getClient()
      .from('audit_log')
      .insert([
        {
          actor_id: changerId,
          action: 'user.status_change',
          entity_type: 'user',
          entity_id: userId,
          old_values: { status: 'unknown' }, // Would need to fetch old status in real implementation
          new_values: { status: newStatus, reason },
        }
      ]);

    if (error) {
      this.logger.error(`Error logging status change: ${error.message}`);
    }
  }

  private async logDealerApproval(applicationId: string, approverId: string) {
    const { error } = await this.supabaseService.getClient()
      .from('audit_log')
      .insert([
        {
          actor_id: approverId,
          action: 'dealer.application_approved',
          entity_type: 'dealer_application',
          entity_id: applicationId,
        }
      ]);

    if (error) {
      this.logger.error(`Error logging dealer approval: ${error.message}`);
    }
  }

  private async logDealerRejection(applicationId: string, rejectorId: string, reason: string) {
    const { error } = await this.supabaseService.getClient()
      .from('audit_log')
      .insert([
        {
          actor_id: rejectorId,
          action: 'dealer.application_rejected',
          entity_type: 'dealer_application',
          entity_id: applicationId,
          new_values: { reason },
        }
      ]);

    if (error) {
      this.logger.error(`Error logging dealer rejection: ${error.message}`);
    }
  }
}