'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingCart, Users, BarChart3, Truck, Tag, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Order Management', href: '/admin/order-management', icon: ShoppingCart },
  { name: 'B2B Approval Workflow', href: '/admin/b2b-approval-workflow', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Dealers', href: '/admin/dealers', icon: Users },
  { name: 'Dealer Registration', href: '/admin/dealer-registration', icon: Users },
  { name: 'Dealer Approval', href: '/admin/dealer-approval', icon: Users },
  { name: 'Pricing Overview', href: '/admin/pricing-overview', icon: Tag },
  { name: 'Pricing Management', href: '/admin/pricing-management', icon: Tag },
  { name: 'Inventory Management', href: '/admin/inventory-management', icon: Package },
  { name: 'Batch & Transaction Tracking', href: '/admin/batch-transaction-tracking', icon: Package },
  { name: 'Payment Management', href: '/admin/payment-management', icon: Tag },
  { name: 'Payment Gateway Integration', href: '/admin/payment-gateway-integration', icon: Tag },
  { name: 'Invoice Management', href: '/admin/invoice-management', icon: Tag },
  { name: 'GST Compliance Reporting', href: '/admin/gst-compliance-reporting', icon: Tag },
  { name: 'Zoho Integration', href: '/admin/zoho-integration', icon: Tag },
  { name: 'POS Device Management', href: '/admin/pos-device-management', icon: Tag },
  { name: 'POS Transaction Analytics', href: '/admin/pos-transaction-analytics', icon: BarChart3 },
  { name: 'POS System Capabilities', href: '/admin/pos-system-capabilities', icon: Tag },
  { name: 'Analytics & Reporting', href: '/admin/analytics-management', icon: BarChart3 },
  { name: 'Advanced Analytics', href: '/admin/advanced-analytics', icon: BarChart3 },
  { name: 'CRM Management', href: '/admin/crm-management', icon: Users },
  { name: 'CRM Dashboard', href: '/admin/crm-dashboard', icon: Users },
  { name: 'Loyalty Program Management', href: '/admin/loyalty-program-management', icon: Tag },
  { name: 'Notification Management', href: '/admin/notification-management', icon: Tag },
  { name: 'Returns & Refunds', href: '/admin/returns-management', icon: Tag },
  { name: 'Shipping Management', href: '/admin/shipping-management', icon: Truck },
  { name: 'Shipping Carrier Integration', href: '/admin/shipping-carrier-integration', icon: Truck },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500">KN Biosciences</p>
      </div>
      
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} KN Biosciences. All rights reserved.
        </div>
      </div>
    </div>
  );
};