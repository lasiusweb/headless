'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@kn/ui';
import { api, Order } from '@kn/lib';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data, error } = await api.get<Order[]>('/orders/my-orders');
    if (data && !error) {
      setOrders(data);
    }
    setLoading(false);
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_approval: 'text-orange-600 bg-orange-50',
      approved: 'text-blue-600 bg-blue-50',
      processing: 'text-purple-600 bg-purple-50',
      shipped: 'text-indigo-600 bg-indigo-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
      rejected: 'text-gray-600 bg-gray-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <Link href="/shop">
              <Button>New Order</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending_approval', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet"
                : `No orders with status "${filter}"`}
            </p>
            {filter === 'all' && (
              <Link href="/shop">
                <Button>Start Shopping</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">#{order.order_number}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Ordered on: {new Date(order.created_at).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p>Items: {order.items?.length || 0} products</p>
                      {order.payment_status && (
                        <p>Payment: <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}>
                          {order.payment_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span></p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      ₹{order.total.toLocaleString('en-IN')}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                      {order.status === 'delivered' && (
                        <Button size="sm">Reorder</Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Progress for active orders */}
                {['pending_approval', 'approved', 'processing', 'shipped'].includes(order.status) && (
                  <div className="mt-6 pt-6 border-t">
                    <OrderProgress status={order.status} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderProgress({ status }: { status: string }) {
  const steps = [
    { key: 'pending_approval', label: 'Pending Approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStepIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index <= currentStepIndex ? '✓' : index + 1}
            </div>
            <span className={`text-xs mt-2 ${
              index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
