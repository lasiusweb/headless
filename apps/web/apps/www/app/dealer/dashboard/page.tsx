'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@kn/ui';
import { useAuth, api, Order } from '@kn/lib';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingApproval: 0,
    totalSpent: 0,
    creditLimit: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    try {
      // Load recent orders
      const { data: ordersData } = await api.get<Order[]>('/orders/my-orders');
      if (ordersData) {
        setOrders(ordersData.slice(0, 5)); // Last 5 orders
        
        // Calculate stats
        setStats({
          totalOrders: ordersData.length,
          pendingApproval: ordersData.filter(o => o.status === 'pending_approval').length,
          totalSpent: ordersData
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + o.total, 0),
          creditLimit: 100000, // TODO: Fetch from user profile
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dealer Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.first_name} {user.last_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/shop">
                <Button variant="outline">Shop Products</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">Pending Approval</div>
            <div className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">Total Spent</div>
            <div className="text-3xl font-bold text-green-600">₹{stats.totalSpent.toLocaleString('en-IN')}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">Credit Limit</div>
            <div className="text-3xl font-bold text-blue-600">₹{stats.creditLimit.toLocaleString('en-IN')}</div>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          <Link href="/orders">
            <Button variant="outline">View All Orders</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No orders yet. <Link href="/shop" className="text-blue-600 hover:underline">Start shopping</Link>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/shop">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600">Explore our catalog of agricultural products</p>
            </Card>
          </Link>
          
          <Link href="/orders/new">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Quick Order</h3>
              <p className="text-gray-600">Place a new order with bulk order form</p>
            </Card>
          </Link>
          
          <Link href="/support">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="text-gray-600">Get help with orders or products</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    pending_approval: 'bg-orange-100 text-orange-800',
    approved: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  );
}
