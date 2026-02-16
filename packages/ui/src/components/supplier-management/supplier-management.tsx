import * as React from "react";
import { 
  Users, 
  UserPlus, 
  Package, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  IndianRupee, 
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Input } from "../input";
import { Label } from "../label";
import { Badge } from "../badge";
import { DataTable } from "../data-table/data-table";

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber: string;
  panNumber: string;
  products: string[]; // Product categories supplied
  rating: number; // Average rating
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'pending_verification' | 'blacklisted';
  createdAt: string;
  lastOrderDate?: string;
}

interface SupplierManagementProps {
  suppliers: Supplier[];
  onAddSupplier?: () => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (id: string) => void;
  className?: string;
}

const SupplierManagement = React.forwardRef<
  HTMLDivElement,
  SupplierManagementProps
>(({
  suppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  className
}, ref) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  // Filter suppliers based on search term and status
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.gstNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && supplier.status === "active") || 
                         (filterStatus === "inactive" && supplier.status === "inactive") ||
                         (filterStatus === "pending" && supplier.status === "pending_verification") ||
                         (filterStatus === "blacklisted" && supplier.status === "blacklisted");
    
    return matchesSearch && matchesStatus;
  });

  // Calculate supplier metrics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length;
  const pendingSuppliers = suppliers.filter(s => s.status === 'pending_verification').length;
  const blacklistedSuppliers = suppliers.filter(s => s.status === 'blacklisted').length;

  // Define columns for the data table
  const columns = [
    {
      accessorKey: "name",
      header: "Supplier Name",
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p>{row.original.phone}</p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div>
          <p>{row.original.address.city}, {row.original.address.state}</p>
          <p className="text-sm text-muted-foreground">{row.original.address.pincode}</p>
        </div>
      ),
    },
    {
      accessorKey: "gstNumber",
      header: "GST Number",
    },
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.products.slice(0, 3).map((product, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {product}
            </Badge>
          ))}
          {row.original.products.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.products.length - 3} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(row.original.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="ml-1 text-sm">({row.original.rating.toFixed(1)})</span>
        </div>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
    },
    {
      accessorKey: "totalSpent",
      header: "Total Value",
      cell: ({ row }) => `₹${row.original.totalSpent.toLocaleString('en-IN')}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.status === 'active' ? 'default' :
            row.original.status === 'inactive' ? 'secondary' :
            row.original.status === 'pending_verification' ? 'outline' :
            'destructive'
          }
        >
          {row.original.status.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "lastOrderDate",
      header: "Last Order",
      cell: ({ row }) => row.original.lastOrderDate ? new Date(row.original.lastOrderDate).toLocaleDateString() : 'N/A',
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditSupplier?.(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteSupplier?.(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
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
      {/* Supplier Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Suppliers</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Suppliers</CardDescription>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Pending</CardDescription>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSuppliers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Inactive</CardDescription>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveSuppliers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Blacklisted</CardDescription>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blacklistedSuppliers}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Supplier Management</CardTitle>
            <CardDescription>Manage your supplier relationships and information</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending Verification</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
            
            <Button onClick={onAddSupplier}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredSuppliers} 
            filterColumn="name"
            placeholder="Filter suppliers..."
          />
        </CardContent>
      </Card>
      
      {/* Supplier Details Card */}
      {suppliers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {supplier.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{supplier.company}</p>
                  </div>
                  <Badge variant={
                    supplier.status === 'active' ? 'default' :
                    supplier.status === 'inactive' ? 'secondary' :
                    supplier.status === 'pending_verification' ? 'outline' :
                    'destructive'
                  }>
                    {supplier.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{supplier.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.address.street}, {supplier.address.city}, {supplier.address.state} {supplier.address.pincode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">GST Number</p>
                      <p className="text-sm text-muted-foreground">{supplier.gstNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Products Supplied</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supplier.products.map((product, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-medium">Rating</p>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < Math.floor(supplier.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-sm">({supplier.rating.toFixed(1)})</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">Total Orders</p>
                      <p className="text-sm">{supplier.totalOrders}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => onEditSupplier?.(supplier)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDeleteSupplier?.(supplier.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});

SupplierManagement.displayName = "SupplierManagement";

export { SupplierManagement };