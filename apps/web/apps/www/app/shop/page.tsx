'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@kn/ui';
import { api, Product } from '@kn/lib';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await api.get<Product[]>('/products');
    if (data && !error) {
      setProducts(data);
    }
    setLoading(false);
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.slug === selectedCategory;
    const matchesSegment = selectedSegment === 'all' || product.segment?.slug === selectedSegment;
    
    return matchesSearch && matchesCategory && matchesSegment;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shop Products</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="fertilizers">Fertilizers</option>
            <option value="pesticides">Pesticides</option>
            <option value="seeds">Seeds</option>
          </select>
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
          >
            <option value="all">All Segments</option>
            <option value="food-crops">Food Crops</option>
            <option value="cash-crops">Cash Crops</option>
            <option value="vegetables">Vegetables</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  {product.image_urls?.[0] ? (
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-xs text-gray-500">MRP: </span>
                      <span className="font-bold text-green-600">₹{product.mrp.toFixed(2)}</span>
                    </div>
                    {product.dealer_price && (
                      <div className="text-xs text-gray-500">
                        Dealer: ₹{product.dealer_price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/products/${product.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View</Button>
                    </Link>
                    <Button size="sm" className="flex-1">Add to Cart</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
