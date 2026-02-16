import * as React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  IndianRupee,
  Calendar,
  Filter,
  Download,
  Eye,
  MoreHorizontal
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { DataTable } from "../data-table/data-table";
import { Chart, ChartData } from "../chart/chart";

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard = React.forwardRef<
  HTMLDivElement,
  AnalyticsDashboardProps
>(({
  className
}, ref) => {
  // Mock data for the dashboard
  const stats = {
    totalRevenue: 2458900,
    totalOrders: 1248,
    totalCustomers: 562,
    totalProducts: 128,
    avgOrderValue: 1970,
    conversionRate: 12.5,
  };

  const revenueData: ChartData[] = [
    { name: 'Jan', revenue: 180000 },
    { name: 'Feb', revenue: 220000 },
    { name: 'Mar', revenue: 190000 },
    { name: 'Apr', revenue: 240000 },
    { name: 'May', revenue: 210000 },
    { name: 'Jun', revenue: 260000 },
  ];

  const salesData: ChartData[] = [
    { name: 'Jan', sales: 120 },
    { name: 'Feb', sales: 150 },
    { name: 'Mar', sales: 130 },
    { name: 'Apr', sales: 180 },
    { name: 'May', sales: 160 },
    { name: 'Jun', sales: 200 },
  ];

  const topProducts = [
    { id: '1', name: 'Organic Neem Cake Fertilizer', sales: 245, revenue: 49000 },
    { id: '2', name: 'Bio-Zyme Growth Enhancer', sales: 198, revenue: 39600 },
    { id: '3', name: 'Panchagavya Organic Liquid', sales: 176, revenue: 35200 },
    { id: '4', name: 'Vermi Compost Premium', sales: 154, revenue: 30800 },
    { id: '5', name: 'Azospirillum Biofertilizer', sales: 132, revenue: 26400 },
  ];

  const recentOrders = [
    { id: 'ORD20240101-0001', customer: 'Rajesh Kumar', amount: 12450, status: 'delivered', date: '2024-01-15' },
    { id: 'ORD20240101-0002', customer: 'Priya Sharma', amount: 8900, status: 'shipped', date: '2024-01-14' },
    { id: 'ORD20240101-0003', customer: 'Suresh Patel', amount: 15670, status: 'processing', date: '2024-01-14' },
    { id: 'ORD20240101-0004', customer: 'Anita Desai', amount: 6230, status: 'confirmed', date: '2024-01-13' },
    { id: 'ORD20240101-0005', customer: 'Vijay Singh', amount: 22150, status: 'delivered', date: '2024-01-12' },
  ];

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Orders</CardDescription>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>New Customers</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.3% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Products</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +3.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Avg. Order Value</CardDescription>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.avgOrderValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2.4% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +1.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="line"
              data={revenueData}
              dataKey="revenue"
              title="Revenue"
              description="Revenue over time"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              data={salesData}
              dataKey="sales"
              title="Sales"
              description="Sales over time"
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Selling Products</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.amount.toLocaleString('en-IN')}</p>
                    <Badge 
                      variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'processing' ? 'outline' :
                        order.status === 'confirmed' ? 'outline' : 'destructive'
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventory Alerts</CardTitle>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium">Organic Neem Cake Fertilizer</p>
                <p className="text-sm text-muted-foreground">Only 5 units left</p>
              </div>
              <Button variant="outline" size="sm">
                Restock
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium">Bio-Zyme Growth Enhancer</p>
                <p className="text-sm text-muted-foreground">Only 3 units left</p>
              </div>
              <Button variant="outline" size="sm">
                Restock
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium">Panchagavya Organic Liquid</p>
                <p className="text-sm text-muted-foreground">Out of stock</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                Urgent Restock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AnalyticsDashboard.displayName = "AnalyticsDashboard";

export { AnalyticsDashboard };