import * as React from "react";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Badge } from "../badge";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  image?: string;
  badge?: string; // e.g., "Best Seller", "New", "Sale"
  isInStock?: boolean;
  isFavorite?: boolean;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  onQuickView?: () => void;
  className?: string;
  role?: 'customer' | 'dealer' | 'distributor'; // For pricing based on user role
}

const ProductCard = React.forwardRef<
  HTMLDivElement,
  ProductCardProps
>(({
  id,
  name,
  description,
  price,
  mrp,
  discountPercentage,
  rating = 0,
  reviewCount = 0,
  image,
  badge,
  isInStock = true,
  isFavorite = false,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  className,
  role = 'customer'
}, ref) => {
  // Calculate pricing based on role
  const getDisplayPrice = () => {
    if (role === 'dealer') {
      // Example: dealers get 40% off
      return price * 0.6;
    } else if (role === 'distributor') {
      // Example: distributors get 45% off
      return price * 0.55;
    }
    return price;
  };

  const displayPrice = getDisplayPrice();
  const savings = mrp ? mrp - displayPrice : 0;
  const discountPercent = mrp ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;

  return (
    <div 
      ref={ref}
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg",
        !isInStock && "opacity-70",
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-400">No Image</div>
          </div>
        )}
        
        {/* Badges */}
        {badge && (
          <Badge className="absolute top-2 left-2 capitalize">
            {badge}
          </Badge>
        )}
        
        {discountPercent > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            {discountPercent}% OFF
          </Badge>
        )}
        
        {/* Favorite Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-12 bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
        >
          <Heart 
            className={cn(
              "h-4 w-4",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            )} 
          />
        </Button>
        
        {/* Quick View Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-10 right-12 bg-white/80 backdrop-blur-sm hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView?.();
          }}
        >
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
        
        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-16 right-2 bg-white/80 backdrop-blur-sm hover:bg-gray-50 md:hidden"
        >
          <Heart className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
        
        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
        </div>
        
        {/* Pricing */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900">₹{displayPrice.toLocaleString('en-IN')}</span>
          {mrp && mrp !== displayPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">₹{mrp.toLocaleString('en-IN')}</span>
              <span className="text-sm font-medium text-green-600">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
        
        {savings > 0 && (
          <p className="text-xs text-green-600 mt-1">
            You save ₹{savings.toLocaleString('en-IN')} ({discountPercent}%)
          </p>
        )}
        
        {/* Add to Cart Button */}
        <Button 
          className="w-full mt-4" 
          disabled={!isInStock}
          onClick={onAddToCart}
        >
          {isInStock ? (
            <div className="flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </div>
          ) : (
            "Out of Stock"
          )}
        </Button>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export { ProductCard };