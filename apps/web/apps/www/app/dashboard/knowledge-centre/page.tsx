'use client';

import { useState } from 'react';
import { DashboardLayout, Card } from '@kn/ui';
import { Search, BookOpen, HelpCircle, FileText, Video } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeCentrePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'faqs' | 'guides' | 'tutorials'>('all');

  const categories = [
    {
      title: 'Product Information',
      icon: '🧪',
      count: 24,
      items: ['Fertilizers', 'Pesticides', 'Growth Enhancers', 'Organic Products'],
    },
    {
      title: 'Usage Guides',
      icon: '📖',
      count: 18,
      items: ['Application Methods', 'Dosage Guidelines', 'Safety Precautions'],
    },
    {
      title: 'Crop Management',
      icon: '🌾',
      count: 32,
      items: ['Food Crops', 'Cash Crops', 'Vegetables', 'Plantation Crops'],
    },
    {
      title: 'FAQs',
      icon: '❓',
      count: 45,
      items: ['Ordering', 'Shipping', 'Returns', 'Payments'],
    },
  ];

  const featuredArticles = [
    {
      title: 'Understanding NPK Fertilizers: A Complete Guide',
      category: 'Product Information',
      readTime: '8 min read',
      href: '/dashboard/knowledge-centre/articles/npk-fertilizers-guide',
    },
    {
      title: 'Best Practices for Organic Farming',
      category: 'Usage Guides',
      readTime: '12 min read',
      href: '/dashboard/knowledge-centre/articles/organic-farming-practices',
    },
    {
      title: 'Pest Management for Rice Crops',
      category: 'Crop Management',
      readTime: '10 min read',
      href: '/dashboard/knowledge-centre/articles/rice-pest-management',
    },
  ];

  return (
    <DashboardLayout variant="b2b" logoText="KN Biosciences B2B">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Centre</h1>
        <p className="text-gray-600">
          Learn about our products, best practices, and crop management techniques
        </p>
      </div>

      {/* Search */}
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, guides, FAQs, tutorials..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium">
            Search
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {(['all', 'articles', 'faqs', 'guides', 'tutorials'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categories.map((category) => (
          <Card key={category.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">{category.icon}</div>
            <h3 className="font-bold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.count} resources</p>
            <div className="space-y-2">
              {category.items.slice(0, 3).map((item) => (
                <p key={item} className="text-sm text-gray-500">• {item}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Featured Articles */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
          <Link href="/dashboard/knowledge-centre/articles" className="text-green-600 hover:text-green-700 font-medium">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <Link key={article.title} href={article.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">{article.category}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.readTime}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/knowledge-centre/faqs">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="h-8 w-8 text-blue-600" />
              <h3 className="font-bold text-gray-900">FAQs</h3>
            </div>
            <p className="text-gray-600">
              Find answers to commonly asked questions about ordering, shipping, and products
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/knowledge-centre/guides">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-green-600" />
              <h3 className="font-bold text-gray-900">Guides</h3>
            </div>
            <p className="text-gray-600">
              Detailed guides on product usage, application methods, and safety precautions
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/knowledge-centre/tutorials">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Video className="h-8 w-8 text-purple-600" />
              <h3 className="font-bold text-gray-900">Tutorials</h3>
            </div>
            <p className="text-gray-600">
              Video tutorials demonstrating product application and best practices
            </p>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
