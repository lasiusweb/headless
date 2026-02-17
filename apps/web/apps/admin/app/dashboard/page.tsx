'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@kn/ui';
import { api } from '@kn/lib';
import Link from 'next/link';

interface DashboardMetrics {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  topProduct: { name: string; revenue: number };
  pendingApprovals: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    topProduct: { name: '', revenue: 0 },
    pendingApprovals: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [metricsRes, ordersRes, inventoryRes] = await Promise.all([
        api.get('/analytics/dashboard-metrics'),
        api.get('/orders?limit=5&status=pending_approval'),
        api.get('/suppliers/inventory/low-stock'),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (ordersRes.data) setRecentOrders(ordersRes.data);
      if (inventoryRes.data) setInventoryAlerts(inventoryRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of your business performance</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadDashboard} variant="outline">Refresh</Button>
              <Link href="/analytics">
                <Button>View Analytics</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Revenue"
            value={`₹${metrics.todayRevenue.toLocaleString('en-IN')}`}
            icon="💰"
            trend={metrics.monthlyGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${metrics.monthlyGrowth}%`}
          />
          <MetricCard
            title="Today's Orders"
            value={metrics.todayOrders.toString()}
            icon="📦"
            trend="neutral"
          />
          <MetricCard
            title="Pending Approvals"
            value={metrics.pendingApprovals.toString()}
            icon="⏳"
            trend={metrics.pendingApprovals > 0 ? 'warning' : 'neutral'}
            link="/orders/pending"
          />
          <MetricCard
            title="Low Stock Alerts"
            value={metrics.lowStockProducts.toString()}
            icon="⚠️"
            trend={metrics.lowStockProducts > 0 ? 'warning' : 'neutral'}
            link="/inventory/alerts"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
              <Link href="/orders/pending">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="outline">Review</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Inventory Alerts */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Inventory Alerts</h2>
              <Link href="/inventory">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
            {inventoryAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✓</div>
                <p>All stock levels healthy</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inventoryAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.variant?.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {item.available_stock} / Reorder: {item.reorder_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.available_stock <= item.reorder_level * 0.5
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.available_stock <= item.reorder_level * 0.5 ? 'Critical' : 'Low'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon="📝"
              title="New Product"
              href="/products/new"
              description="Add a new product"
            />
            <QuickActionCard
              icon="👥"
              title="Manage Dealers"
              href="/dealers"
              description="View dealer applications"
            />
            <QuickActionCard
              icon="📊"
              title="Reports"
              href="/reports"
              description="Generate reports"
            />
            <QuickActionCard
              icon="⚙️"
              title="Settings"
              href="/settings"
              description="Configure system"
            />
          </div>
        </Card>
      </div>

      {/* Monthly Summary */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">Monthly Revenue</div>
            <div className="text-3xl font-bold text-gray-900">
              ₹{metrics.monthlyRevenue.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-sm text-green-600">
              ↑ {metrics.monthlyGrowth}% from last month
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">Top Product</div>
            <div className="text-lg font-bold text-gray-900">
              {metrics.topProduct.name || 'N/A'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              ₹{metrics.topProduct.revenue?.toLocaleString('en-IN')} revenue
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-gray-900">All Systems Operational</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Last checked: {new Date().toLocaleTimeString('en-IN')}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  link,
}: {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral' | 'warning';
  trendValue?: string;
  link?: string;
}) {
  const content = (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && trendValue && (
            <div className={`mt-2 text-sm flex items-center gap-1 ${
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' :
              trend === 'warning' ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'warning' && '⚠️'}
              {trendValue}
            </div>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

function QuickActionCard({
  icon,
  title,
  href,
  description,
}: {
  icon: string;
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
