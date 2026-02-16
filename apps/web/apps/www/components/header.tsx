'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@kn/ui';
import { Menu, X, ShoppingBag } from 'lucide-react';

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
            <Link href="/products" className="text-gray-700 hover:text-green-600">Products</Link>
            <Link href="/dealer/pricing" className="text-gray-700 hover:text-green-600">Wholesale Pricing</Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600">Contact</Link>
          </nav>
          
          <div className="flex items-center">
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-6 w-6" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="ml-2">Login</Button>
            </Link>
            <Link href="/dealer/register">
              <Button className="ml-2 hidden sm:block">Become Dealer</Button>
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
            <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Products</Link>
            <Link href="/dealer/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Wholesale Pricing</Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">About</Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Contact</Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link href="/dealer/register">
                  <Button className="w-full">Become Dealer</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};