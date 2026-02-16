import * as React from "react";
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, IndianRupee } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";

interface OrderTrackingStep {
  id: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  icon?: React.ReactNode;
}

interface OrderTrackingProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
    carrier?: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  };
  steps: OrderTrackingStep[];
  className?: string;
}

const OrderTracking = React.forwardRef<
  HTMLDivElement,
  OrderTrackingProps
>(({
  order,
  steps,
  className
}, ref) => {
  const currentStepIndex = steps.findIndex(step => step.status === 'in-progress') !== -1 
    ? steps.findIndex(step => step.status === 'in-progress')
    : steps.findIndex(step => step.status === 'completed');

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order #{order.orderNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">Status: {order.status}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Tracking Number: {order.trackingNumber || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Est. Delivery: {order.estimatedDelivery || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tracking Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 -translate-x-1/2"></div>
            
            <div className="space-y-6 pl-8">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Step indicator */}
                  <div className={cn(
                    "absolute left-0 top-1.5 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-2 z-10",
                    step.status === 'completed' && "bg-green-500 border-green-500 text-white",
                    step.status === 'in-progress' && "bg-primary border-primary text-white animate-pulse",
                    step.status === 'pending' && "bg-white border-gray-300 text-gray-400",
                    step.status === 'delayed' && "bg-yellow-500 border-yellow-500 text-white"
                  )}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.status === 'in-progress' ? (
                      <Clock className="h-4 w-4" />
                    ) : step.status === 'delayed' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  
                  {/* Step content */}
                  <div className={cn(
                    "p-4 rounded-lg border",
                    step.status === 'completed' && "bg-green-50 border-green-200",
                    step.status === 'in-progress' && "bg-blue-50 border-blue-200",
                    step.status === 'pending' && "bg-gray-50 border-gray-200",
                    step.status === 'delayed' && "bg-yellow-50 border-yellow-200"
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {(step.date || step.time) && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {step.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {step.date}
                              </span>
                            )}
                            {step.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.time}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Badge variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'in-progress' ? 'secondary' :
                        step.status === 'delayed' ? 'destructive' : 'outline'
                      }>
                        {step.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{order.shipping.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{order.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Carrier Information */}
      {order.carrier && (
        <Card>
          <CardHeader>
            <CardTitle>Carrier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{order.carrier}</p>
                  <p className="text-sm text-muted-foreground">Tracking Number: {order.trackingNumber}</p>
                </div>
              </div>
              <Button variant="outline">Track on Carrier Site</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

OrderTracking.displayName = "OrderTracking";

export { OrderTracking };