'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: number;
}

interface SideNavProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'b2b' | 'd2c';
}

export function SideNav({ isOpen = true, onClose, variant = 'b2b' }: SideNavProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    account: true,
    orders: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
      href: '/dashboard/orders',
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
      href: '/dashboard/support',
      children: [
        { title: 'Contact Us', href: '/dashboard/support' },
        { title: 'Helpline', href: '/dashboard/support/helpline' },
      ],
    },
  ];

  const navItems = variant === 'b2b' ? b2bNavItems : d2cNavItems;

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isExpanded = expandedSections[item.title.toLowerCase()];
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title} className={depth === 0 ? 'mb-2' : ''}>
        <button
          onClick={() => hasChildren && toggleSection(item.title.toLowerCase())}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive(item.href)
              ? 'bg-green-50 text-green-700'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
            {typeof item.badge === 'number' && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {item.badge === '🚨' && (
              <span className="text-red-500 animate-pulse">🚨</span>
            )}
          </div>
          {hasChildren && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link
                key={child.title}
                href={child.href!}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(child.href)
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{child.title}</span>
                  {child.badge === '🚨' && (
                    <span className="text-red-500">🚨</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="h-full overflow-y-auto py-4 px-3">
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="px-3 text-xs text-gray-500 space-y-2">
            <Link href="/terms" className="block hover:text-gray-700">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="block hover:text-gray-700">
              Privacy Policy
            </Link>
            <p className="pt-2">© 2024 KN Biosciences</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
