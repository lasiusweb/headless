'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';

interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
  badge?: number;
}

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'b2b' | 'd2c';
}

export function NavDrawer({ isOpen, onClose, variant = 'b2b' }: NavDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const b2bNavItems: NavItem[] = [
    {
      title: 'Account',
      icon: '👤',
      children: [
        { title: 'Profile', href: '/dashboard/account/profile' },
        { title: 'Address Book', href: '/dashboard/account/address-book' },
        { title: 'Settings', href: '/dashboard/account/settings' },
        { title: 'Logout', href: '/auth/logout' },
      ],
    },
    {
      title: 'Orders',
      icon: '📦',
      badge: 3,
      children: [
        { title: 'My Orders', href: '/dashboard/orders' },
        { title: 'Invoices', href: '/dashboard/orders/invoices' },
        { title: 'Payments', href: '/dashboard/orders/payments' },
        { title: 'Tracking', href: '/dashboard/orders/tracking' },
      ],
    },
    {
      title: 'Knowledge Centre',
      icon: '📚',
      children: [
        { title: 'Articles', href: '/dashboard/knowledge-centre/articles' },
        { title: 'FAQs', href: '/dashboard/knowledge-centre/faqs' },
        { title: 'Guides', href: '/dashboard/knowledge-centre/guides' },
        { title: 'Tutorials', href: '/dashboard/knowledge-centre/tutorials' },
      ],
    },
    {
      title: 'Support',
      icon: '💬',
      children: [
        { title: 'Tickets', href: '/dashboard/support/tickets' },
        { title: 'Send Feedback', href: '/dashboard/support/feedback' },
        { title: 'Report Emergency', href: '/dashboard/support/emergency', badge: '🚨' },
        { title: 'Accessibility', href: '/dashboard/support/accessibility' },
      ],
    },
    {
      title: 'Resources',
      icon: '📁',
      children: [
        { title: 'My Documents', href: '/dashboard/resources/documents' },
        { title: 'Wish List', href: '/dashboard/resources/wishlist' },
        { title: 'Invite Code', href: '/dashboard/resources/invite-code' },
        { title: 'Coupons', href: '/dashboard/resources/coupons' },
        { title: 'Reviews', href: '/dashboard/resources/reviews' },
      ],
    },
  ];

  const d2cNavItems: NavItem[] = [
    {
      title: 'Account',
      icon: '👤',
      children: [
        { title: 'Profile', href: '/dashboard/account/profile' },
        { title: 'Addresses', href: '/dashboard/account/address-book' },
        { title: 'Settings', href: '/dashboard/account/settings' },
        { title: 'Logout', href: '/auth/logout' },
      ],
    },
    {
      title: 'My Orders',
      icon: '📦',
      children: [
        { title: 'Order History', href: '/dashboard/orders' },
        { title: 'Track Order', href: '/dashboard/orders/tracking' },
        { title: 'Invoices', href: '/dashboard/orders/invoices' },
      ],
    },
    {
      title: 'Knowledge Centre',
      icon: '🌾',
      children: [
        { title: 'Crop Guides', href: '/dashboard/knowledge-centre/crop-guides' },
        { title: 'FAQs', href: '/dashboard/knowledge-centre/faqs' },
        { title: 'Videos', href: '/dashboard/knowledge-centre/videos' },
      ],
    },
    {
      title: 'Support',
      icon: '💬',
      children: [
        { title: 'Contact Us', href: '/dashboard/support' },
        { title: 'Helpline', href: '/dashboard/support/helpline' },
      ],
    },
  ];

  const navItems = variant === 'b2b' ? b2bNavItems : d2cNavItems;

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  // Swipe to close handler
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onClose,
    trackMouse: true,
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            {...swipeHandlers}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KN</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {variant === 'b2b' ? 'B2B Portal' : 'Agriculture'}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                {navItems.map((item) => {
                  const isExpanded = expandedSections[item.title];
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <div key={item.title} className="mb-2">
                      <button
                        onClick={() => hasChildren && toggleSection(item.title)}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                          item.children?.some(c => c.href && isActive(c.href))
                            ? 'bg-green-50 text-green-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-medium">{item.title}</span>
                          {typeof item.badge === 'number' && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {hasChildren && (
                          <ChevronRight
                            className={`h-5 w-5 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </button>

                      {hasChildren && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 mt-1 space-y-1">
                            {item.children!.map((child) => (
                              <button
                                key={child.title}
                                onClick={() => child.href && handleNavigate(child.href)}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                                  isActive(child.href)
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{child.title}</span>
                                  {child.badge === '🚨' && (
                                    <span className="text-red-500 animate-pulse">🚨</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-2">
                  <a href="/terms" className="block hover:text-gray-700">
                    Terms & Conditions
                  </a>
                  <a href="/privacy" className="block hover:text-gray-700">
                    Privacy Policy
                  </a>
                  <p className="pt-2">© 2024 KN Biosciences</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
