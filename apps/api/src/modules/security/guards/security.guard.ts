import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../security.service';

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private securityService: SecurityService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // If no specific permissions required, allow access
    }

    if (!userId) {
      return false; // User must be authenticated
    }

    // Check if user has required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.checkPermission(userId, permission);
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  private async checkPermission(userId: string, permission: string): Promise<boolean> {
    // In a real implementation, this would check the user's permissions in the database
    // For now, we'll implement a basic check based on user role
    
    const { data: user, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      return false;
    }

    // Define permissions based on role
    const rolePermissions: Record<string, string[]> = {
      'customer': [
        'view_products',
        'add_to_cart',
        'place_order',
        'view_own_orders',
        'update_own_profile',
      ],
      'dealer': [
        'view_products',
        'add_to_cart',
        'place_order',
        'view_own_orders',
        'update_own_profile',
        'view_dealer_prices',
        'bulk_order_access',
        'view_catalog',
      ],
      'distributor': [
        'view_products',
        'add_to_cart',
        'place_order',
        'view_own_orders',
        'update_own_profile',
        'view_distributor_prices',
        'bulk_order_access',
        'view_catalog',
        'priority_support',
        'special_discounts',
      ],
      'admin': [
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
        'view_security_events',
        'manage_audit_trails',
      ],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  }
}