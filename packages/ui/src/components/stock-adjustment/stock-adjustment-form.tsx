import * as React from "react";
import { Package, Plus, Minus, AlertCircle, Info } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Input } from "../input";
import { Label } from "../label";
import { Textarea } from "../textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/select";
import { Badge } from "../badge";

interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  warehouseId: string;
  warehouseName: string;
  previousStock: number;
  adjustmentType: 'addition' | 'reduction' | 'damage' | 'theft' | 'transfer';
  quantity: number;
  newStock: number;
  reason: string;
  adjustedBy: string;
  timestamp: string;
}

interface StockAdjustmentFormProps {
  productId?: string;
  variantId?: string;
  warehouseId?: string;
  onSubmit: (adjustment: Omit<StockAdjustment, 'id' | 'timestamp' | 'adjustedBy' | 'newStock'>) => void;
  onCancel: () => void;
  className?: string;
}

const StockAdjustmentForm = React.forwardRef<
  HTMLDivElement,
  StockAdjustmentFormProps
>(({
  productId,
  variantId,
  warehouseId,
  onSubmit,
  onCancel,
  className
}, ref) => {
  const [formData, setFormData] = React.useState({
    productId: productId || '',
    variantId: variantId || '',
    warehouseId: warehouseId || '',
    adjustmentType: 'addition' as const,
    quantity: 0,
    reason: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.variantId) newErrors.variantId = 'Variant is required';
    if (!formData.warehouseId) newErrors.warehouseId = 'Warehouse is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment</CardTitle>
          <CardDescription>Adjust inventory levels for products</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={formData.productId} onValueChange={(value) => handleChange('productId', value)}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product-1">Organic Neem Cake Fertilizer</SelectItem>
                    <SelectItem value="product-2">Bio-Zyme Growth Enhancer</SelectItem>
                    <SelectItem value="product-3">Panchagavya Organic Liquid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-sm text-destructive">{errors.productId}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <Select value={formData.variantId} onValueChange={(value) => handleChange('variantId', value)}>
                  <SelectTrigger id="variant">
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="variant-1">500g Pack</SelectItem>
                    <SelectItem value="variant-2">1kg Pack</SelectItem>
                    <SelectItem value="variant-3">5kg Pack</SelectItem>
                  </SelectContent>
                </Select>
                {errors.variantId && <p className="text-sm text-destructive">{errors.variantId}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select value={formData.warehouseId} onValueChange={(value) => handleChange('warehouseId', value)}>
                  <SelectTrigger id="warehouse">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse-1">Mumbai Central Warehouse</SelectItem>
                    <SelectItem value="warehouse-2">Bangalore Regional Warehouse</SelectItem>
                    <SelectItem value="warehouse-3">Chennai Branch Warehouse</SelectItem>
                  </SelectContent>
                </Select>
                {errors.warehouseId && <p className="text-sm text-destructive">{errors.warehouseId}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adjustment-type">Adjustment Type</Label>
                <Select
                  value={formData.adjustmentType}
                  onValueChange={(value) => handleChange('adjustmentType', value)}
                >
                  <SelectTrigger id="adjustment-type">
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="addition">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" />
                        Addition
                      </div>
                    </SelectItem>
                    <SelectItem value="reduction">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-red-500" />
                        Reduction
                      </div>
                    </SelectItem>
                    <SelectItem value="damage">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Damage/Waste
                      </div>
                    </SelectItem>
                    <SelectItem value="theft">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Theft/Loss
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        Transfer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  className={errors.quantity ? "border-destructive" : ""}
                />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  className={errors.reason ? "border-destructive" : ""}
                />
                {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Provide any additional information about this adjustment..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Adjustment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

StockAdjustmentForm.displayName = "StockAdjustmentForm";

export { StockAdjustmentForm };