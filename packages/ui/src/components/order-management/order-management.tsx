import * as React from "react";
import { 
  Package, 
  PackageCheck, 
  PackageX, 
  PackageOpen, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Input } from "../input";
import { Badge } from "../badge";
import { DataTable } from "../data-table/data-table";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingStatus: 'not_shipped' | 'shipped' | 'delivered' | 'in_transit' | 'out_for_delivery';
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface OrderManagementProps {
  orders: Order[];
  onOrderView?: (order: Order) => void;
  onOrderStatusUpdate?: (orderId: string, newStatus: string) => void;
  className?: string;
}

const OrderManagement = React.forwardRef<
  HTMLDivElement,
  OrderManagementProps
>(({
  orders,
  onOrderView,
  onOrderStatusUpdate,
  className
}, ref) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = React.useState<string>("all");
  const [filterShippingStatus, setFilterShippingStatus] = React.useState<string>("all");

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesPaymentStatus = filterPaymentStatus === "all" || order.paymentStatus === filterPaymentStatus;
    const matchesShippingStatus = filterShippingStatus === "all" || order.shippingStatus === filterShippingStatus;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesShippingStatus;
  });

  // Calculate order metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

  // Define columns for the data table
  const columns = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
    },
    {
      accessorKey: "items",
      header: "Items",
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => `₹${row.original.totalAmount.toLocaleString('en-IN')}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.status === 'pending' ? 'secondary' :
            row.original.status === 'confirmed' ? 'default' :
            row.original.status === 'processing' ? 'default' :
            row.original.status === 'shipped' ? 'outline' :
            row.original.status === 'delivered' ? 'success' :
            'destructive'
          }
        >
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.paymentStatus === 'paid' ? 'success' :
            row.original.paymentStatus === 'pending' ? 'secondary' :
            'destructive'
          }
        >
          {row.original.paymentStatus.charAt(0).toUpperCase() + row.original.paymentStatus.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "shippingStatus",
      header: "Shipping",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.shippingStatus === 'delivered' ? 'success' :
            row.original.shippingStatus === 'shipped' ? 'outline' :
            row.original.shippingStatus === 'in_transit' ? 'default' :
            row.original.shippingStatus === 'out_for_delivery' ? 'default' :
            'secondary'
          }
        >
          {row.original.shippingStatus.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onOrderView?.(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Orders</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Pending</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Processing</CardDescription>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Shipped</CardDescription>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{shippedOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Delivered</CardDescription>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Cancelled</CardDescription>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledOrders}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Manage and track customer orders</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredOrders} 
            filterColumn="orderNumber"
            placeholder="Filter orders..."
          />
        </CardContent>
      </Card>
      
      {/* Order Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Perform bulk actions on orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center justify-center p-6">
              <PackageCheck className="h-8 w-8 mb-2" />
              <span>Confirm Selected</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center p-6">
              <PackageOpen className="h-8 w-8 mb-2" />
              <span>Process Selected</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center p-6">
              <Truck className="h-8 w-8 mb-2" />
              <span>Ship Selected</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center p-6">
              <PackageX className="h-8 w-8 mb-2" />
              <span>Cancel Selected</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OrderManagement.displayName = "OrderManagement";

export { OrderManagement };