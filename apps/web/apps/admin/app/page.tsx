'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kn/ui';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock data for dashboard
  const stats = [
    { title: 'Total Revenue', value: '₹2,45,890', change: '+12.5%', icon: DollarSign },
    { title: 'Total Orders', value: '1,248', change: '+8.2%', icon: ShoppingCart },
    { title: 'Active Users', value: '562', change: '+3.1%', icon: Users },
    { title: 'Products', value: '128', change: '+5.7%', icon: Package },
  ];

  const recentOrders = [
    { id: '#ORD20240101-0001', customer: 'Rajesh Kumar', status: 'Delivered', amount: '₹12,450' },
    { id: '#ORD20240101-0002', customer: 'Priya Sharma', status: 'Processing', amount: '₹8,900' },
    { id: '#ORD20240101-0003', customer: 'Suresh Patel', status: 'Pending', amount: '₹15,670' },
    { id: '#ORD20240101-0004', customer: 'Anita Desai', status: 'Shipped', amount: '₹6,230' },
    { id: '#ORD20240101-0005', customer: 'Vijay Singh', status: 'Confirmed', amount: '₹22,150' },
  ];

  const lowStockProducts = [
    { name: 'Organic Neem Cake Fertilizer', stock: 5 },
    { name: 'Bio-Zyme Growth Enhancer', stock: 8 },
    { name: 'Panchagavya Organic Liquid', stock: 12 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      order.status === 'Delivered' ? 'text-green-600' :
                      order.status === 'Processing' ? 'text-yellow-600' :
                      order.status === 'Pending' ? 'text-orange-600' :
                      order.status === 'Shipped' ? 'text-blue-600' :
                      'text-purple-600'
                    }`}>
                      {order.status}
                    </p>
                    <p className="text-sm text-gray-600">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Low Stock Products
            </CardTitle>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{product.stock} left</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Low</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your store efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium mb-1">Manage Products</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove products</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium mb-1">Manage Orders</h3>
              <p className="text-sm text-gray-600">View and process orders</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">Approve dealers, manage accounts</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium mb-1">Inventory</h3>
              <p className="text-sm text-gray-600">Track stock levels</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}