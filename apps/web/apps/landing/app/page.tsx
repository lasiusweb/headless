'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@kn/ui';
import Link from 'next/link';
import { useAuth, usePortalPreference } from '@kn/lib';
import { useRouter } from 'next/navigation';

type PortalType = 'b2b' | 'b2c';

// Cookie domain - configurable via environment variable
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.knbiosciences.in';

// Portal URLs
const B2B_URL = process.env.NEXT_PUBLIC_B2B_URL || 'https://www.knbiosciences.in';
const B2C_URL = process.env.NEXT_PUBLIC_B2C_URL || 'https://agriculture.knbiosciences.in';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { setPreference: setPortalPreference } = usePortalPreference();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Track analytics event
  const trackEvent = useCallback((eventName: string, eventData: Record<string, any>) => {
    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }

    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}:`, eventData);
    }
  }, []);

  // Handle portal selection
  const handlePortalSelect = useCallback((portal: PortalType) => {
    setSelectedPortal(portal);

    // Store preference
    setPortalPreference(portal);

    // Track event
    trackEvent('portal_selection', {
      portal,
      user_type: isAuthenticated ? 'authenticated' : 'guest',
      user_role: user?.role || 'none',
    });

    // Redirect based on selection
    const targetUrl = portal === 'b2b' ? B2B_URL : B2C_URL;
    window.location.href = targetUrl;
  }, [isAuthenticated, user, setPortalPreference, trackEvent]);

  // Auto-redirect authenticated users based on role
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const role = user.role;
      let targetUrl: string | null = null;

      // Dealers and distributors go to B2B
      if (role === 'dealer' || role === 'distributor') {
        targetUrl = B2B_URL;
      }
      // Retailers, farmers, customers go to B2C
      else if (role === 'retailer' || role === 'farmer' || role === 'customer') {
        targetUrl = B2C_URL;
      }

      if (targetUrl) {
        // Track auto-redirect
        trackEvent('auto_redirect', {
          from_role: role,
          to_portal: targetUrl === B2B_URL ? 'b2b' : 'b2c',
        });

        window.location.href = targetUrl;
      }
    }
  }, [isAuthenticated, loading, user, trackEvent]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-green-600">🌾 KN Biosciences</h1>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About Us
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
                aria-label="Which portal should I choose?"
              >
                Which Portal?
              </button>
              {isAuthenticated ? (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/about" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">
                About Us
              </Link>
              <Link href="/products" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">
                Products
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">
                Contact
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Empowering <span className="text-green-600">Indian Agriculture</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Your trusted partner for quality agricultural products. Choose your portal below
            to access tailored solutions for your needs.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Quality inputs for every stakeholder in the agricultural value chain
          </p>

          {/* Portal Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" role="region" aria-label="Portal selection">
            {/* B2B Card */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-green-500 transition-all cursor-pointer transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => handlePortalSelect('b2b')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePortalSelect('b2b');
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Select B2B Dealer Portal - Wholesale pricing and bulk ordering for dealers and distributors"
            >
              <div className="text-6xl mb-4" aria-hidden="true">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I&apos;m a Dealer</h2>
              <p className="text-gray-600 mb-6">
                Wholesale pricing, bulk ordering &amp; exclusive benefits for dealers and distributors
              </p>
              <ul className="text-left space-y-2 mb-6 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  40-55% off MRP
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Bulk order tools
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Credit management
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Priority support
                </li>
              </ul>
              <Button size="lg" className="w-full">
                Enter Dealer Portal
              </Button>
            </div>

            {/* B2C Card */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-green-500 transition-all cursor-pointer transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => handlePortalSelect('b2c')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePortalSelect('b2c');
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Select B2C Farmer Portal - Quality farm inputs delivered to your farm gate"
            >
              <div className="text-6xl mb-4" aria-hidden="true">🌱</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I&apos;m a Farmer</h2>
              <p className="text-gray-600 mb-6">
                Farm inputs at competitive prices delivered to your farm gate
              </p>
              <ul className="text-left space-y-2 mb-6 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Quality assured products
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Direct from manufacturers
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Expert guidance
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                  Timely delivery
                </li>
              </ul>
              <Button size="lg" variant="outline" className="w-full">
                Shop Now
              </Button>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-12">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose KN Biosciences?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We&apos;re committed to empowering Indian agriculture with quality products and exceptional service
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                High-quality agricultural inputs sourced directly from trusted manufacturers
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                Best prices in the market with exclusive benefits for dealers and distributors
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Pan-India Delivery</h3>
              <p className="text-gray-600">
                Fast and reliable shipping with real-time tracking across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Thousands</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-gray-600">Happy Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Dealer Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
              <div className="text-gray-600">States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the KN Biosciences network and experience the difference
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register?role=dealer">
              <Button size="lg">Become a Dealer</Button>
            </Link>
            <Link href="/auth/register?role=retailer">
              <Button variant="outline" size="lg">Start Farming</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🌾 KN Biosciences</h3>
              <p className="text-gray-400">
                Empowering Indian agriculture with quality products and exceptional service.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Portals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="https://www.knbiosciences.in" className="hover:text-white">B2B Dealer Portal</Link></li>
                <li><Link href="https://agriculture.knbiosciences.in" className="hover:text-white">B2C Farmer Portal</Link></li>
                <li><Link href="https://admin.knbiosciences.in" className="hover:text-white">Admin Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 +91-123-456-7890</li>
                <li>✉️ info@knbiosciences.in</li>
                <li>📍 India</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} KN Biosciences Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Help Modal - Which Portal? */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelpModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                Which Portal is Right for You?
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-2"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 bg-gray-50 font-semibold">Feature</th>
                      <th className="text-center py-3 px-4 bg-green-50 text-green-700 font-semibold">B2B Dealer Portal</th>
                      <th className="text-center py-3 px-4 bg-blue-50 text-blue-700 font-semibold">B2C Farmer Portal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Who should use?</td>
                      <td className="py-3 px-4 text-center text-sm">Dealers, Distributors, Retailers</td>
                      <td className="py-3 px-4 text-center text-sm">Farmers, Individual buyers</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Pricing</td>
                      <td className="py-3 px-4 text-center text-sm">40-55% off MRP (wholesale)</td>
                      <td className="py-3 px-4 text-center text-sm">Retail pricing with discounts</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Order Size</td>
                      <td className="py-3 px-4 text-center text-sm">Bulk orders, minimum quantities</td>
                      <td className="py-3 px-4 text-center text-sm">Any quantity, no minimum</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Payment Terms</td>
                      <td className="py-3 px-4 text-center text-sm">Credit facilities available</td>
                      <td className="py-3 px-4 text-center text-sm">Online payment, COD</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Approval</td>
                      <td className="py-3 px-4 text-center text-sm">Dealer verification required</td>
                      <td className="py-3 px-4 text-center text-sm">Instant access</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Support</td>
                      <td className="py-3 px-4 text-center text-sm">Dedicated account manager</td>
                      <td className="py-3 px-4 text-center text-sm">Customer support team</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Best for</td>
                      <td className="py-3 px-4 text-center text-sm">Reselling, large-scale operations</td>
                      <td className="py-3 px-4 text-center text-sm">Personal farming, small-scale</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* FAQ Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">
                      Q: Can I switch between portals later?
                    </p>
                    <p className="text-gray-600 text-sm">
                      A: Yes! You can always navigate to the other portal from the footer links. However, pricing and benefits will be based on your registered role.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">
                      Q: I&apos;m a farmer but want dealer prices. Can I register as a dealer?
                    </p>
                    <p className="text-gray-600 text-sm">
                      A: Dealer accounts require verification of business credentials (GST, trade license). If you meet the requirements, you can apply for a dealer account during registration.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">
                      Q: Do both portals have the same products?
                    </p>
                    <p className="text-gray-600 text-sm">
                      A: Yes, the product catalog is the same. The main differences are pricing, minimum order quantities, and available payment methods.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">
                      Q: Is delivery available to both portals?
                    </p>
                    <p className="text-gray-600 text-sm">
                      A: Yes! Both portals offer pan-India delivery with real-time tracking. B2B orders may have different shipping rates based on volume.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    handlePortalSelect('b2b');
                    setShowHelpModal(false);
                  }}
                >
                  Go to B2B Dealer Portal
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handlePortalSelect('b2c');
                    setShowHelpModal(false);
                  }}
                >
                  Go to B2C Farmer Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
