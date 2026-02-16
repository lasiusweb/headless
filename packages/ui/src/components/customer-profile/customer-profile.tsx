import * as React from "react";
import { User, Mail, Phone, MapPin, Briefcase, Building, IndianRupee, ShieldCheck, Package, ShoppingCart, Star } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";

interface CustomerProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'dealer' | 'distributor' | 'admin';
    company?: string;
    gstNumber?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    profilePicture?: string;
    joinDate: string;
    totalOrders?: number;
    totalSpent?: number;
    rating?: number;
    status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  };
  onEditProfile?: () => void;
  onViewOrders?: () => void;
  onManageAddress?: () => void;
  className?: string;
}

const CustomerProfile = React.forwardRef<
  HTMLDivElement,
  CustomerProfileProps
>(({
  user,
  onEditProfile,
  onViewOrders,
  onManageAddress,
  className
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <Badge 
              className="absolute -bottom-1 -right-1" 
              variant={user.status === 'active' ? 'default' : 'secondary'}
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{user.name}</CardTitle>
              {user.role !== 'customer' && (
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Member since {user.joinDate}</p>
          </div>
          <Button onClick={onEditProfile} variant="outline">
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {user.company && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <span>{user.company}</span>
                </div>
              )}
              
              {user.gstNumber && (
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <span>GST: {user.gstNumber}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {user.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{user.address.street}</p>
                    <p>{user.address.city}, {user.address.state} {user.address.pincode}</p>
                    <p>{user.address.country}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    Total Spent: {user.totalSpent ? `₹${user.totalSpent.toLocaleString('en-IN')}` : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.totalOrders || 0} Orders
                  </p>
                </div>
              </div>
              
              {user.rating !== undefined && (
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{user.rating.toFixed(1)}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(user.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({user.totalOrders || 0} reviews)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button onClick={onViewOrders}>
              <Package className="h-4 w-4 mr-2" />
              View Orders
            </Button>
            <Button onClick={onManageAddress} variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Manage Addresses
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <span className="font-medium">₹1,299.00</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Profile Verified</p>
                  <p className="text-sm text-muted-foreground">1 week ago</p>
                </div>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Address Added</p>
                  <p className="text-sm text-muted-foreground">2 weeks ago</p>
                </div>
              </div>
              <span>New Address</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

CustomerProfile.displayName = "CustomerProfile";

export { CustomerProfile };