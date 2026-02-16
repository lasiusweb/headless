import * as React from "react";
import { Warehouse, Package, MapPin, Phone, Mail, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Input } from "../input";
import { Label } from "../label";
import { Badge } from "../badge";
import { DataTable } from "../data-table/data-table";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    person: string;
    phone: string;
    email: string;
  };
  capacity: number; // in cubic meters
  utilization: number; // percentage
  isActive: boolean;
  createdAt: string;
}

interface WarehouseManagementProps {
  warehouses: Warehouse[];
  onAddWarehouse?: () => void;
  onEditWarehouse?: (warehouse: Warehouse) => void;
  onDeleteWarehouse?: (id: string) => void;
  className?: string;
}

const WarehouseManagement = React.forwardRef<
  HTMLDivElement,
  WarehouseManagementProps
>(({
  warehouses,
  onAddWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
  className
}, ref) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  // Filter warehouses based on search term and status
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && warehouse.isActive) || 
                         (filterStatus === "inactive" && !warehouse.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Define columns for the data table
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div>
          <p>{row.original.address.street}</p>
          <p>{row.original.address.city}, {row.original.address.state} {row.original.address.pincode}</p>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p>{row.original.contact.person}</p>
          <p>{row.original.contact.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => (
        <div>
          <p>{row.original.capacity} m³</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                row.original.utilization > 80 ? 'bg-red-500' : 
                row.original.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${row.original.utilization}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1">{row.original.utilization}% utilized</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditWarehouse?.(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteWarehouse?.(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Warehouse Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Warehouses</CardDescription>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Warehouses</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.filter(w => w.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Utilization Rate</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.length > 0 
                ? Math.round(warehouses.reduce((sum, w) => sum + w.utilization, 0) / warehouses.length) + '%' 
                : '0%'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Capacity Used</CardDescription>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.reduce((sum, w) => sum + (w.capacity * w.utilization / 100), 0).toFixed(0)} m³
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Warehouse Management</CardTitle>
            <CardDescription>Manage your warehouse locations and capacities</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
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
            </select>
            
            <Button onClick={onAddWarehouse}>
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredWarehouses} 
            filterColumn="name"
            placeholder="Filter warehouses..."
          />
        </CardContent>
      </Card>
      
      {/* Warehouse Details Card */}
      {warehouses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWarehouses.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    {warehouse.name}
                  </CardTitle>
                  <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                    {warehouse.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{warehouse.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{warehouse.address.street}</p>
                      <p>{warehouse.address.city}, {warehouse.address.state} {warehouse.address.pincode}</p>
                      <p>{warehouse.address.country}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{warehouse.contact.person}</p>
                      <p>{warehouse.contact.phone}</p>
                      <p>{warehouse.contact.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Capacity Utilization</span>
                      <span className="text-sm font-medium">{warehouse.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          warehouse.utilization > 80 ? 'bg-red-500' : 
                          warehouse.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${warehouse.utilization}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(warehouse.capacity * warehouse.utilization / 100)}m³ / {warehouse.capacity}m³
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => onEditWarehouse?.(warehouse)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDeleteWarehouse?.(warehouse.id)}>
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

WarehouseManagement.displayName = "WarehouseManagement";

export { WarehouseManagement };