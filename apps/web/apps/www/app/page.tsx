'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kn/ui';
import Link from 'next/link';
import { useAuth } from '@kn/lib';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Premium Agri Solutions for <span className="text-green-600">Dealers & Distributors</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Access exclusive wholesale pricing, bulk ordering tools, and comprehensive product catalogs 
            tailored for agricultural professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button size="lg">Login as Dealer</Button>
                </Link>
                <Link href="/dealer/register">
                  <Button variant="outline" size="lg">Become a Dealer</Button>
                </Link>
              </>
            ) : (
              <Link href="/dealer/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose KN Biosciences?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold mb-2">Premium Products</h3>
              <p className="text-gray-600">
                High-quality agricultural inputs sourced directly from manufacturers
              </p>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                Exclusive dealer and distributor pricing with volume discounts
              </p>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Reliable Delivery</h3>
              <p className="text-gray-600">
                Nationwide shipping with real-time tracking and support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of dealers and distributors who trust KN Biosciences
          </p>
          <Link href="/dealer/register">
            <Button size="lg">Apply for Dealer Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}