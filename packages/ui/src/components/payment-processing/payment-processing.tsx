import * as React from "react";
import { 
  CreditCard, 
  IndianRupee, 
  Smartphone, 
  Wallet, 
  Banknote, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Input } from "../input";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Badge } from "../badge";

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'upi' | 'net_banking' | 'wallet' | 'cod';
  icon: React.ReactNode;
  description?: string;
}

interface PaymentProcessingProps {
  amount: number;
  orderId: string;
  currency?: string;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  onPaymentFailure: (error: string) => void;
  className?: string;
}

const PaymentProcessing = React.forwardRef<
  HTMLDivElement,
  PaymentProcessingProps
>(({
  amount,
  orderId,
  currency = 'INR',
  onPaymentSuccess,
  onPaymentFailure,
  className
}, ref) => {
  const [selectedMethod, setSelectedMethod] = React.useState<string>('upi');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentResult, setPaymentResult] = React.useState<'success' | 'error' | null>(null);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI',
      type: 'upi',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Pay using UPI ID or QR code'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Visa, Mastercard, Rupay'
    },
    {
      id: 'net_banking',
      name: 'Net Banking',
      type: 'net_banking',
      icon: <Banknote className="h-5 w-5" />,
      description: 'Pay through your bank'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      type: 'wallet',
      icon: <Wallet className="h-5 w-5" />,
      description: 'Paytm, PhonePe, Amazon Pay'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cod',
      icon: <IndianRupee className="h-5 w-5" />,
      description: 'Pay when delivered'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentResult(null);
    setPaymentError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would call the payment gateway API
      // For demo purposes, we'll simulate success after a delay
      if (Math.random() > 0.1) { // 90% success rate for demo
        setPaymentResult('success');
        onPaymentSuccess(`payment_${Date.now()}`, selectedMethod);
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setPaymentResult('error');
      setPaymentError(errorMessage);
      onPaymentFailure(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input id="card-name" placeholder="John Doe" />
            </div>
          </div>
        );
      
      case 'upi':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input id="upi-id" placeholder="yourname@upi" />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Info className="h-4 w-4 inline mr-2" />
                You'll be redirected to your UPI app to complete the payment
              </p>
            </div>
          </div>
        );
      
      case 'net_banking':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Select Bank</Label>
              <select
                id="bank"
                className="w-full p-2 border border-input rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
            </div>
          </div>
        );
      
      case 'wallet':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Wallet</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex flex-col items-center p-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xs font-bold text-yellow-800">P</span>
                  </div>
                  <span className="text-xs">Paytm</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xs font-bold text-green-800">P</span>
                  </div>
                  <span className="text-xs">PhonePe</span>
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'cod':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Cash on delivery selected. Pay when your order is delivered.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delivery-notes">Delivery Instructions (Optional)</Label>
              <textarea
                id="delivery-notes"
                placeholder="Any special delivery instructions..."
                className="w-full p-2 border border-input rounded-md focus:ring-primary focus:border-primary min-h-[80px]"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (paymentResult === 'success') {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment of ₹{amount.toLocaleString('en-IN')} was processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Order ID: {orderId}
          </p>
          <Button onClick={() => window.location.reload()}>
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentResult === 'error') {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Payment Failed</CardTitle>
          <CardDescription>
            {paymentError || 'Your payment could not be processed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => setPaymentResult(null)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={ref} className={cn("w-full max-w-md mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Pay ₹{amount.toLocaleString('en-IN')} for order #{orderId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Payment Methods */}
            <div>
              <h3 className="text-sm font-medium mb-3">Select Payment Method</h3>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="grid gap-3">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id} 
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedMethod === method.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex items-center gap-2">
                        {method.icon}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          {method.description && (
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {method.id === 'cod' && (
                      <Badge variant="secondary" className="text-xs">
                        Free Delivery
                      </Badge>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Payment Form */}
            {renderPaymentForm()}
            
            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            {/* Pay Button */}
            <Button 
              className="w-full" 
              onClick={handlePayment} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${amount.toLocaleString('en-IN')}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PaymentProcessing.displayName = "PaymentProcessing";

export { PaymentProcessing };