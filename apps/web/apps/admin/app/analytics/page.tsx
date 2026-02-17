'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@kn/ui';
import { api } from '@kn/lib';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
  });
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      // Load overview analytics
      const { data: overviewData } = await api.get<any>('/analytics/overview');
      if (overviewData) {
        setAnalytics(overviewData);
      }

      // Load sales trend
      const { data: trendData } = await api.get<any>(`/analytics/sales-trend?range=${dateRange}`);
      if (trendData) {
        setSalesTrend(trendData);
      }

      // Load top products
      const { data: productsData } = await api.get<any>('/analytics/top-products');
      if (productsData) {
        setTopProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of your business performance</p>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard
            title="Total Revenue"
            value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`}
            trend={analytics.revenueGrowth}
            trendLabel="vs previous period"
            icon="💰"
          />
          <OverviewCard
            title="Total Orders"
            value={analytics.totalOrders.toString()}
            trend={analytics.orderGrowth}
            trendLabel="vs previous period"
            icon="📦"
          />
          <OverviewCard
            title="Total Customers"
            value={analytics.totalCustomers.toString()}
            trend={12.5}
            trendLabel="vs previous period"
            icon="👥"
          />
          <OverviewCard
            title="Total Products"
            value={analytics.totalProducts.toString()}
            trend={5.2}
            trendLabel="vs previous period"
            icon="🏷️"
          />
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {salesTrend.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                  style={{
                    height: `${(item.revenue / Math.max(...salesTrend.map(t => t.revenue))) * 100}%`,
                    minHeight: '4px',
                  }}
                ></div>
                <span className="text-xs text-gray-600">{item.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Products by Revenue</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.unitsSold} units sold</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₹{product.revenue.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Insights</h2>
            <div className="space-y-4">
              <InsightCard
                icon="📈"
                title="Best Performing Category"
                description="Fertilizers contributed 48% of total revenue"
                value="₹1,200,000"
              />
              <InsightCard
                icon="🎯"
                title="Customer Retention"
                description="85.5% of customers made repeat purchases"
                value="+5.2%"
              />
              <InsightCard
                icon="⚠️"
                title="Low Stock Alert"
                description="12 products are out of stock, 45 running low"
                value="Action needed"
              />
              <InsightCard
                icon="🌟"
                title="Top Region"
                description="Karnataka leads with 40% of total sales"
                value="₹1,000,000"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Export Options */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Export Reports</h2>
          <p className="text-gray-600 mb-6">Download detailed analytics reports for further analysis</p>
          <div className="flex gap-4">
            <Button variant="outline">Export as PDF</Button>
            <Button variant="outline">Export as Excel</Button>
            <Button variant="outline">Export as CSV</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
}: {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: string;
}) {
  const isPositive = trend >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="text-sm text-gray-500">{trendLabel}</span>
      </div>
    </Card>
  );
}

function InsightCard({
  icon,
  title,
  description,
  value,
}: {
  icon: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <p className="text-sm font-bold text-blue-600">{value}</p>
      </div>
    </div>
  );
}
