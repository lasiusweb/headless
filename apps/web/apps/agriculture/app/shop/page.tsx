'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@kn/ui';
import { api, Product } from '@kn/lib';
import Link from 'next/link';

interface Crop {
  id: string;
  name: string;
  slug: string;
  category: 'food' | 'cash' | 'plantation' | 'vegetable' | 'fruit';
}

interface Problem {
  id: string;
  name: string;
  slug: string;
  category: 'pest' | 'disease' | 'nutrient' | 'weed';
}

export default function AgricultureShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedProblem, setSelectedProblem] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsRes, cropsRes, problemsRes] = await Promise.all([
        api.get<Product[]>('/products?active=true'),
        api.get<Crop[]>('/crops'),
        api.get<Problem[]>('/problems'),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (cropsRes.data) setCrops(cropsRes.data);
      if (problemsRes.data) setProblems(problemsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'all' || 
                       product.crop_ids?.includes(selectedCrop);
    const matchesProblem = selectedProblem === 'all' || 
                          product.problem_ids?.includes(selectedProblem);
    const matchesCategory = selectedCategory === 'all' || 
                           product.category?.slug === selectedCategory;
    
    return matchesSearch && matchesCrop && matchesProblem && matchesCategory;
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">🌾 Shop Agricultural Products</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Quality seeds, fertilizers, and crop protection products delivered to your farm
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Find Products For Your Needs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              className="border rounded-lg px-4 py-2 bg-white"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="all">All Crops</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>{crop.name}</option>
              ))}
            </select>
            
            <select
              className="border rounded-lg px-4 py-2 bg-white"
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
            >
              <option value="all">All Problems</option>
              {problems.map(problem => (
                <option key={problem.id} value={problem.id}>{problem.name}</option>
              ))}
            </select>
            
            <select
              className="border rounded-lg px-4 py-2 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="pesticides">Pesticides</option>
              <option value="seeds">Seeds</option>
              <option value="growth-enhancers">Growth Enhancers</option>
            </select>
          </div>

          {(selectedCrop !== 'all' || selectedProblem !== 'all' || selectedCategory !== 'all' || searchTerm) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filters:</span>
              {selectedCrop !== 'all' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Crop: {crops.find(c => c.id === selectedCrop)?.name}
                </span>
              )}
              {selectedProblem !== 'all' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  Problem: {problems.find(p => p.id === selectedProblem)?.name}
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCrop('all');
                  setSelectedProblem('all');
                  setSelectedCategory('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Selection Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Shop By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CategoryCard
            icon="🌱"
            title="Seeds"
            count={products.filter(p => p.category?.slug === 'seeds').length}
            onClick={() => setSelectedCategory('seeds')}
          />
          <CategoryCard
            icon="🧪"
            title="Fertilizers"
            count={products.filter(p => p.category?.slug === 'fertilizers').length}
            onClick={() => setSelectedCategory('fertilizers')}
          />
          <CategoryCard
            icon="🐛"
            title="Pesticides"
            count={products.filter(p => p.category?.slug === 'pesticides').length}
            onClick={() => setSelectedCategory('pesticides')}
          />
          <CategoryCard
            icon="📈"
            title="Growth Enhancers"
            count={products.filter(p => p.category?.slug === 'growth-enhancers').length}
            onClick={() => setSelectedCategory('growth-enhancers')}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProducts.length} Products Found
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search term
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCrop('all');
              setSelectedProblem('all');
              setSelectedCategory('all');
            }}>Clear All Filters</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                  {product.image_urls?.[0] ? (
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  {/* Crop tags */}
                  {product.crop_ids && product.crop_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.crop_ids.slice(0, 3).map(cropId => {
                        const crop = crops.find(c => c.id === cropId);
                        return crop ? (
                          <span key={cropId} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {crop.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-xs text-gray-500">MRP: </span>
                      <span className="font-bold text-green-600">₹{product.mrp.toFixed(2)}</span>
                    </div>
                    {product.dealer_price && (
                      <div className="text-xs text-gray-500 line-through">
                        ₹{product.dealer_price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/shop/${product.slug}`} className="flex-1">
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

function CategoryCard({ icon, title, count, onClick }: { 
  icon: string; 
  title: string; 
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{count} products</p>
    </button>
  );
}
