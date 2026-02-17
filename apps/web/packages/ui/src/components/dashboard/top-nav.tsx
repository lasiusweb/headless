'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@kn/lib';
import Link from 'next/link';
import { Button } from '../button';
import { Input } from '../input';
import { UserMenu } from './user-menu';
import { NotificationDropdown } from './notification-dropdown';

interface TopNavProps {
  logo?: string;
  logoText?: string;
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export function TopNav({ 
  logo = '/logo.png', 
  logoText = 'KN Biosciences',
  onMenuClick,
  isMobileMenuOpen 
}: TopNavProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or trigger search
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">KN</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">{logoText}</span>
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, products, articles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md hover:bg-gray-100 relative"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearchMobile && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, products, articles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
