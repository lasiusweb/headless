'use client';

import { useState } from 'react';
import { DashboardLayout, Card } from '@kn/ui';
import { FolderOpen, Heart, Tag, Star, Ticket, Download, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<'documents' | 'wishlist' | 'coupons' | 'reviews' | 'invite'>('documents');

  const documents = [
    { id: '1', name: 'Invoice #INV-2024-001', type: 'invoice', date: '2024-01-15', size: '245 KB' },
    { id: '2', name: 'Invoice #INV-2024-002', type: 'invoice', date: '2024-01-20', size: '312 KB' },
    { id: '3', name: 'Product Catalog 2024', type: 'catalog', date: '2024-01-01', size: '5.2 MB' },
    { id: '4', name: 'GST Certificate', type: 'certificate', date: '2023-12-01', size: '180 KB' },
  ];

  const wishlist = [
    { id: '1', name: 'Organic Neem Cake 10kg', price: 450, inStock: true },
    { id: '2', name: 'Bio-Zyme Growth Enhancer 500ml', price: 350, inStock: true },
    { id: '3', name: 'NPK Fertilizer 25kg', price: 1200, inStock: false },
  ];

  const coupons = [
    { code: 'DEALER10', discount: '10% off', minOrder: 5000, expiry: '2024-03-31', used: false },
    { code: 'BULK20', discount: '₹500 off', minOrder: 10000, expiry: '2024-02-28', used: false },
    { code: 'WELCOME100', discount: '₹100 off', minOrder: 2000, expiry: '2024-01-31', used: true },
  ];

  const reviews = [
    { id: '1', product: 'Organic Neem Cake', rating: 5, date: '2024-01-10', status: 'published' },
    { id: '2', product: 'Bio-Zyme Growth Enhancer', rating: 4, date: '2024-01-05', status: 'pending' },
  ];

  return (
    <DashboardLayout variant="b2b" logoText="KN Biosciences B2B">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
        <p className="text-gray-600">
          Access your documents, wishlist, coupons, and reviews
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-200">
        {(['documents', 'wishlist', 'coupons', 'reviews', 'invite'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500 uppercase">{doc.type}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{doc.name}</h3>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{doc.date}</span>
                  <span>{doc.size}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                    Download
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    View
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            <span className="text-gray-600">{wishlist.length} items</span>
          </div>

          <div className="space-y-4">
            {wishlist.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Heart className={`h-6 w-6 ${item.inStock ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className={`text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">₹{item.price}</p>
                    <div className="mt-2 flex gap-2">
                      <button 
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${
                          item.inStock 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!item.inStock}
                      >
                        Add to Cart
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Coupons</h2>
            <Link href="/dashboard/resources/invite-code" className="text-green-600 hover:text-green-700 font-medium">
              Claim Invite Code →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <Card key={coupon.code} className={`p-6 ${coupon.used ? 'opacity-60' : ''}`}>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-lg font-bold text-green-700">{coupon.code}</span>
                    {coupon.used && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">USED</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{coupon.discount}</p>
                  <p className="text-sm text-gray-600">Min order: ₹{coupon.minOrder}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Expires: {coupon.expiry}</span>
                  {!coupon.used && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm">
                      Apply
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
            <Link href="/shop" className="text-green-600 hover:text-green-700 font-medium">
              Write a Review →
            </Link>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{review.product}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Reviewed on {review.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {review.status.toUpperCase()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invite Code Tab */}
      {activeTab === 'invite' && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <Ticket className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Invite Code</h2>
              <p className="text-gray-600">
                Have an invite code from another dealer? Claim it here to unlock exclusive benefits.
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Benefits of Joining</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Access to dealer-only pricing</li>
                  <li>• Priority order processing</li>
                  <li>• Exclusive promotional offers</li>
                  <li>• Dedicated account manager</li>
                </ul>
              </div>

              <div className="flex justify-center gap-4">
                <button type="button" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium">
                  Claim Code
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
