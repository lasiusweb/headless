'use client';

import { useState } from 'react';
import { Button } from '@kn/ui';
import Link from 'next/link';

export default function AgricultureHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Premium <span className="text-green-600">Agri Inputs</span> for Modern Farmers
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Access high-quality seeds, fertilizers, pesticides, and other agricultural products 
            at competitive prices with fast delivery to your farm gate.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/shop">
              <Button size="lg">Shop Products</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">Product Name</h3>
                  <p className="text-gray-600 text-sm mb-2">Category • Segment</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">₹499.00</span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/shop">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits for Farmers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                <p className="text-gray-600">
                  All products are carefully selected and tested to ensure they meet high quality standards 
                  for optimal crop yield.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Direct from Manufacturers</h3>
                <p className="text-gray-600">
                  Cut out middlemen and get products directly from trusted manufacturers at competitive prices.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
                <p className="text-gray-600">
                  Access to agricultural experts who can guide you on the right products for your crops.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Timely Delivery</h3>
                <p className="text-gray-600">
                  Fast and reliable delivery to ensure you get your products when you need them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Boost Your Harvest?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of farmers who trust KN Biosciences for quality agri inputs
          </p>
          <Link href="/shop">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}