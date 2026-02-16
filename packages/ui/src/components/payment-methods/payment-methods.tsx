import * as React from "react";
import { CreditCard, Wallet, IndianRupee, Smartphone, Banknote } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'net_banking' | 'upi' | 'cod' | 'wallet';
  icon?: React.ReactNode;
  description?: string;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  onSelect: (methodId: string) => void;
  className?: string;
}

const PaymentMethods = React.forwardRef<
  HTMLDivElement,
  PaymentMethodsProps
>(({
  methods,
  selectedMethod,
  onSelect,
  className
}, ref) => {
  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'net_banking':
        return <Banknote className="h-5 w-5" />;
      case 'upi':
        return <Smartphone className="h-5 w-5" />;
      case 'cod':
        return <IndianRupee className="h-5 w-5" />;
      case 'wallet':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div ref={ref} className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {methods.map((method) => (
        <Button
          key={method.id}
          variant={selectedMethod === method.id ? "default" : "outline"}
          className={cn(
            "h-auto py-4 px-4 justify-start text-left",
            selectedMethod === method.id ? "ring-2 ring-primary" : ""
          )}
          onClick={() => onSelect(method.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {method.icon || getPaymentIcon(method.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{method.name}</div>
              {method.description && (
                <div className="text-sm text-muted-foreground truncate">
                  {method.description}
                </div>
              )}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
});

PaymentMethods.displayName = "PaymentMethods";

export { PaymentMethods };