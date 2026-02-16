import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private supabaseService: SupabaseService) {}

  async getDashboardStats() {
    // Get total revenue
    const { data: revenueData, error: revenueError } = await this.supabaseService.getClient()
      .from('orders')
      .select('total_amount')
      .in('status', ['confirmed', 'processing', 'packed', 'shipped', 'delivered']);

    if (revenueError) {
      throw new Error(revenueError.message);
    }

    const totalRevenue = revenueData.reduce((sum, order) => sum + order.total_amount, 0);

    // Get total orders
    const { count: totalOrders, error: ordersError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    // Get active users
    const { count: activeUsers, error: usersError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      throw new Error(usersError.message);
    }

    // Get products count
    const { count: productCount, error: productError } = await this.supabaseService.getClient()
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (productError) {
      throw new Error(productError.message);
    }

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      throw new Error(recentOrdersError.message);
    }

    // Get low stock products
    const { data: lowStockProducts, error: lowStockError } = await this.supabaseService.getClient()
      .from('inventory')
      .select(`
        *,
        variant:product_variants(name, sku, product:products(name))
      `)
      .lte('available_quantity', 10)
      .gt('available_quantity', 0);

    if (lowStockError) {
      throw new Error(lowStockError.message);
    }

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      activeUsers,
      productCount,
      recentOrders,
      lowStockProducts,
    };
  }

  async getUserManagementStats() {
    const { count: totalUsers, error: totalUsersError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (totalUsersError) {
      throw new Error(totalUsersError.message);
    }

    const { count: customers, error: customersError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    if (customersError) {
      throw new Error(customersError.message);
    }

    const { count: dealers, error: dealersError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer');

    if (dealersError) {
      throw new Error(dealersError.message);
    }

    const { count: distributors, error: distributorsError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'distributor');

    if (distributorsError) {
      throw new Error(distributorsError.message);
    }

    const { count: admins, error: adminsError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminsError) {
      throw new Error(adminsError.message);
    }

    return {
      totalUsers,
      customers,
      dealers,
      distributors,
      admins,
    };
  }

  async getOrderManagementStats() {
    const { count: pendingOrders, error: pendingError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) {
      throw new Error(pendingError.message);
    }

    const { count: processingOrders, error: processingError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    if (processingError) {
      throw new Error(processingError.message);
    }

    const { count: shippedOrders, error: shippedError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'shipped');

    if (shippedError) {
      throw new Error(shippedError.message);
    }

    const { count: deliveredOrders, error: deliveredError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');

    if (deliveredError) {
      throw new Error(deliveredError.message);
    }

    return {
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    };
  }

  async getInventoryManagementStats() {
    const { count: totalProducts, error: totalProductsError } = await this.supabaseService.getClient()
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (totalProductsError) {
      throw new Error(totalProductsError.message);
    }

    const { count: outOfStock, error: outOfStockError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('available_quantity', 0);

    if (outOfStockError) {
      throw new Error(outOfStockError.message);
    }

    const { count: lowStock, error: lowStockError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .gt('available_quantity', 0)
      .lte('available_quantity', 10);

    if (lowStockError) {
      throw new Error(lowStockError.message);
    }

    const { count: sufficientStock, error: sufficientStockError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .gt('available_quantity', 10);

    if (sufficientStockError) {
      throw new Error(sufficientStockError.message);
    }

    return {
      totalProducts,
      outOfStock,
      lowStock,
      sufficientStock,
    };
  }
}