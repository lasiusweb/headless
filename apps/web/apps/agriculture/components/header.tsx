'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@kn/ui';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">KN Bio</span>
              <span className="text-2xl font-bold text-gray-900">Sciences</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600">Home</Link>
            <Link href="/shop" className="text-gray-700 hover:text-green-600">Shop</Link>
            <Link href="/deals" className="text-gray-700 hover:text-green-600">Special Offers</Link>
            <Link href="/resources" className="text-gray-700 hover:text-green-600">Resources</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600">Contact</Link>
          </nav>
          
          <div className="flex items-center">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="ml-2">
                <ShoppingBag className="h-6 w-6" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="ml-2">Account</Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Home</Link>
            <Link href="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Shop</Link>
            <Link href="/deals" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Special Offers</Link>
            <Link href="/resources" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Resources</Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Contact</Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};