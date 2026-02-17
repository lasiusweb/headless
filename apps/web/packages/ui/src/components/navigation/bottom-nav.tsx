'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, BookOpen, MessageSquare, User, Package, Phone, Heart } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface BottomNavProps {
  variant?: 'b2b' | 'd2c';
}

export function BottomNav({ variant = 'b2b' }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const b2bNavItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '/dashboard', icon: Home },
    { id: 'orders', label: 'Orders', href: '/dashboard/orders', icon: Package, badge: 3 },
    { id: 'knowledge', label: 'Knowledge', href: '/dashboard/knowledge-centre', icon: BookOpen },
    { id: 'support', label: 'Support', href: '/dashboard/support', icon: MessageSquare },
    { id: 'account', label: 'Account', href: '/dashboard/account', icon: User },
  ];

  const d2cNavItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '/dashboard', icon: Home },
    { id: 'shop', label: 'Shop', href: '/shop', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', href: '/dashboard/orders', icon: Package },
    { id: 'guides', label: 'Guides', href: '/dashboard/knowledge-centre', icon: BookOpen },
    { id: 'help', label: 'Help', href: '/dashboard/support', icon: Phone },
  ];

  const navItems = variant === 'b2b' ? b2bNavItems : d2cNavItems;

  // Handle scroll to hide/show bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center justify-center w-full h-full"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    active ? 'text-green-600' : 'text-gray-400'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  active ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute bottom-1 h-1 w-8 bg-green-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
