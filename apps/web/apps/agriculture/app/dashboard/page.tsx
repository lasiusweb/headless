'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout, Card, useSwipeNavigation } from '@kn/ui';
import { useAuth, api, useRouter } from '@kn/lib';
import { useRouter as useNextRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, MessageSquare, BookOpen, Phone, MapPin } from 'lucide-react';

export default function D2CDashboardPage() {
  const { user, logout } = useAuth();
  const router = useNextRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Swipe navigation
  const swipeHandlers = useSwipeNavigation({
    left: '/shop',
    right: undefined,
    up: '/dashboard/knowledge-centre',
    down: undefined,
  }, router);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    try {
      const { data: ordersData } = await api.get('/orders/my-orders');
      if (ordersData) {
        setOrders(ordersData.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout variant="d2c" logoText="KN Biosciences Agriculture" showBottomNav enableSwipe>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="d2c" logoText="KN Biosciences Agriculture" showBottomNav enableSwipe>
      {/* Hero Section - Farmer Focused */}
      <div className="mb-8 bg-gradient-to-r from-green-600 to-orange-600 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.first_name || 'Farmer'}
        </h1>
        <p className="text-green-100 mb-6">
          Quality agricultural products delivered to your farm
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/shop">
            <button className="bg-white text-green-700 px-6 py-3 rounded-lg hover:bg-green-50 font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shop Products
            </button>
          </Link>
          <Link href="/dashboard/orders/tracking">
            <button className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Track Order
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full">
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Support</p>
              <p className="text-lg font-bold text-gray-900">24/7 Helpline</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Knowledge</p>
              <p className="text-lg font-bold text-gray-900">Crop Guides</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-green-600 hover:text-green-700 font-medium">
              View All →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">No orders yet</p>
              <Link href="/shop">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.order_number}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                      Track →
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Crop Guides Quick Access */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Crop Guides</h2>
            <Link href="/dashboard/knowledge-centre/crop-guides" className="text-green-600 hover:text-green-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            <Link href="/dashboard/knowledge-centre/crop-guides/rice" className="block">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="text-3xl">🌾</div>
                <div>
                  <p className="font-medium text-gray-900">Rice Cultivation</p>
                  <p className="text-sm text-gray-600">Complete guide for better yield</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/knowledge-centre/crop-guides/wheat" className="block">
              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="text-3xl">🌾</div>
                <div>
                  <p className="font-medium text-gray-900">Wheat Farming</p>
                  <p className="text-sm text-gray-600">Best practices & tips</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/knowledge-centre/crop-guides/vegetables" className="block">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-3xl">🥬</div>
                <div>
                  <p className="font-medium text-gray-900">Vegetable Crops</p>
                  <p className="text-sm text-gray-600">Seasonal planting guide</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Contact & Support */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="h-6 w-6 text-green-600" />
            <h3 className="font-bold text-gray-900">Agriculture Helpline</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Speak with our agriculture experts for crop advice and product guidance
          </p>
          <a href="tel:18001234567" className="text-2xl font-bold text-green-600">
            1800-123-4567
          </a>
          <p className="text-sm text-gray-600 mt-2">Toll-free • 9 AM to 6 PM</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h3 className="font-bold text-gray-900">Nearest Dealer</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Find authorized dealers near your location for in-person support
          </p>
          <Link href="/dealer-locator" className="text-blue-600 hover:text-blue-700 font-medium">
            Find Dealers →
          </Link>
        </Card>
      </div>

      {/* WhatsApp Support CTA */}
      <Card className="mt-8 p-6 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Need Quick Help?</h3>
            <p className="text-gray-600">Chat with us on WhatsApp for instant support</p>
          </div>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </Card>
    </DashboardLayout>
  );
}
