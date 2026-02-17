'use client';

import { useState } from 'react';
import { TopNav } from './top-nav';
import { BottomNav } from './navigation/bottom-nav';
import { NavDrawer } from './navigation/nav-drawer';
import { SwipeableLayout } from './navigation/swipeable-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  variant?: 'b2b' | 'd2c';
  logoText?: string;
  showBottomNav?: boolean;
  enableSwipe?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function DashboardLayout({
  children,
  variant = 'b2b',
  logoText = 'KN Biosciences',
  showBottomNav = true,
  enableSwipe = false,
  onSwipeLeft,
  onSwipeRight,
}: DashboardLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Top Navigation */}
      <TopNav
        logoText={logoText}
        onMenuClick={() => setIsDrawerOpen(true)}
        isMobileMenuOpen={isDrawerOpen}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {enableSwipe ? (
          <SwipeableLayout
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            enableHorizontal={true}
            enableVertical={false}
          >
            {children}
          </SwipeableLayout>
        ) : (
          children
        )}
      </main>

      {/* Bottom Navigation (mobile only) */}
      {showBottomNav && <BottomNav variant={variant} />}

      {/* Navigation Drawer (mobile only) */}
      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        variant={variant}
      />
    </div>
  );

  return content;
}
