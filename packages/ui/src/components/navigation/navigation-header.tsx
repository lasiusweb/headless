import * as React from "react";
import { Menu, Search, ShoppingCart, User, Heart, Globe, IndianRupee } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavigationHeaderProps {
  logo?: string;
  logoText?: string;
  navItems?: NavItem[];
  cartCount?: number;
  wishlistCount?: number;
  user?: {
    name?: string;
    avatar?: string;
  };
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onUserClick?: () => void;
  className?: string;
}

const NavigationHeader = React.forwardRef<
  HTMLDivElement,
  NavigationHeaderProps
>(({
  logo,
  logoText = "KN Biosciences",
  navItems = [],
  cartCount = 0,
  wishlistCount = 0,
  user,
  onSearch,
  onCartClick,
  onWishlistClick,
  onUserClick,
  className
}, ref) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header ref={ref} className={cn("border-b bg-background sticky top-0 z-50", className)}>
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-12 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>India</span>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-4 w-4" />
              <span>INR</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span>{user.name}</span>
              </div>
            ) : (
              <Button variant="link" className="p-0 h-auto" onClick={onUserClick}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center h-16">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4">
                {navItems.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.href} 
                    className="text-sm font-medium hover:underline"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold">{logoText}</span>
            )}
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:ml-10">
            <ul className="flex space-x-8">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    className="text-sm font-medium hover:underline flex items-center"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search and actions */}
          <div className="flex items-center flex-1 justify-end space-x-4">
            <form onSubmit={handleSearch} className="hidden md:block max-w-md w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>

            <Button variant="ghost" size="icon" onClick={onWishlistClick}>
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={onCartClick}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={onUserClick} className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden p-4 border-t">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>
        </div>
      </div>
    </header>
  );
});

NavigationHeader.displayName = "NavigationHeader";

export { NavigationHeader };