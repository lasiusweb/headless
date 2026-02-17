'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout, Card } from '@kn/ui';
import { useAuth, api, Order } from '@kn/lib';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Headphones,
  FolderOpen
} from 'lucide-react';

export default function DealerDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingApproval: 0,
    totalSpent: 0,
    creditLimit: 100000,
    pendingPayments: 0,
    activeTickets: 0,
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
      const { data: ordersData } = await api.get<Order[]>('/orders/my-orders');
      if (ordersData) {
        setOrders(ordersData.slice(0, 5));
        setStats({
          totalOrders: ordersData.length,
          pendingApproval: ordersData.filter(o => o.status === 'pending_approval').length,
          totalSpent: ordersData
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + o.total, 0),
          creditLimit: 100000,
          pendingPayments: ordersData.filter(o => o.payment_status === 'pending').length,
          activeTickets: 2, // Would come from API
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout variant="b2b" logoText="KN Biosciences B2B">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="b2b" logoText="KN Biosciences B2B">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || 'Dealer'}
        </h1>
        <p className="text-gray-600">
          Manage your orders, track shipments, and access exclusive dealer resources
        </p>
      </div>

      {/* Quick Actions - Hero CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/orders" className="group">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">View Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                <p className="text-green-100 text-sm mt-2">Total orders placed</p>
              </div>
              <ShoppingBag className="h-16 w-16 opacity-50" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/orders/payments" className="group">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Make Payment</p>
                <p className="text-3xl font-bold">{stats.pendingPayments}</p>
                <p className="text-blue-100 text-sm mt-2">Pending payments</p>
              </div>
              <TrendingUp className="h-16 w-16 opacity-50" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/support/tickets" className="group">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Support Tickets</p>
                <p className="text-3xl font-bold">{stats.activeTickets}</p>
                <p className="text-orange-100 text-sm mt-2">Active tickets</p>
              </div>
              <MessageSquare className="h-16 w-16 opacity-50" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval.toString()}
          icon={<Clock className="h-6 w-6" />}
          trend={stats.pendingApproval > 0 ? 'warning' : 'success'}
          href="/dashboard/orders"
        />
        <StatCard
          title="Total Spent"
          value={`₹${stats.totalSpent.toLocaleString('en-IN')}`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend="success"
          href="/dashboard/orders/payments"
        />
        <StatCard
          title="Credit Limit"
          value={`₹${stats.creditLimit.toLocaleString('en-IN')}`}
          icon={<FileText className="h-6 w-6" />}
          trend="neutral"
          href="/dashboard/account/profile"
        />
        <StatCard
          title="Active Tickets"
          value={stats.activeTickets.toString()}
          icon={<MessageSquare className="h-6 w-6" />}
          trend={stats.activeTickets > 0 ? 'warning' : 'success'}
          href="/dashboard/support/tickets"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Link href="/shop">
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    Start Shopping
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Links & Resources */}
        <div className="space-y-6">
          {/* Knowledge Centre Quick Access */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
              <h3 className="font-bold text-gray-900">Knowledge Centre</h3>
            </div>
            <div className="space-y-2">
              <Link href="/dashboard/knowledge-centre/articles" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">Product Articles</p>
                <p className="text-sm text-gray-600">Learn about our products</p>
              </Link>
              <Link href="/dashboard/knowledge-centre/guides" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">Usage Guides</p>
                <p className="text-sm text-gray-600">Best practices & tips</p>
              </Link>
              <Link href="/dashboard/knowledge-centre/tutorials" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">Video Tutorials</p>
                <p className="text-sm text-gray-600">Watch & learn</p>
              </Link>
            </div>
          </Card>

          {/* Support Quick Access */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="h-6 w-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Support</h3>
            </div>
            <div className="space-y-2">
              <Link href="/dashboard/support/tickets" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">My Tickets</p>
                <p className="text-sm text-gray-600">View & manage tickets</p>
              </Link>
              <Link href="/dashboard/support/feedback" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">Send Feedback</p>
                <p className="text-sm text-gray-600">Share your thoughts</p>
              </Link>
              <Link href="/dashboard/support/emergency" className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p className="font-medium text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Report Emergency
                </p>
                <p className="text-sm text-red-600">Safety issues & recalls</p>
              </Link>
            </div>
          </Card>

          {/* Resources Quick Access */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="h-6 w-6 text-purple-600" />
              <h3 className="font-bold text-gray-900">Resources</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/resources/documents" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <p className="font-medium text-gray-900 text-sm">Documents</p>
              </Link>
              <Link href="/dashboard/resources/wishlist" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <p className="font-medium text-gray-900 text-sm">Wishlist</p>
              </Link>
              <Link href="/dashboard/resources/coupons" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <p className="font-medium text-gray-900 text-sm">Coupons</p>
              </Link>
              <Link href="/dashboard/resources/reviews" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <p className="font-medium text-gray-900 text-sm">Reviews</p>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'success' | 'warning' | 'neutral';
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
          {trend === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {trend === 'warning' && <AlertCircle className="h-5 w-5 text-orange-500" />}
        </div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </Card>
    </Link>
  );
}

function OrderRow({ order }: { order: Order }) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_approval: 'bg-orange-100 text-orange-800',
      approved: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Link href={`/dashboard/orders/${order.id}`} className="block">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-1">
          <p className="font-medium text-gray-900">#{order.order_number}</p>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <p className="text-lg font-bold text-gray-900 mt-2">
            ₹{order.total?.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </Link>
  );
}
