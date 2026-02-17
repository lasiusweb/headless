'use client';

import { useState } from 'react';
import { TopNav } from './top-nav';
import { SideNav } from './side-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  variant?: 'b2b' | 'd2c';
  logoText?: string;
}

export function DashboardLayout({ 
  children, 
  variant = 'b2b',
  logoText = 'KN Biosciences'
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNav
        logoText={logoText}
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex">
        {/* Side Navigation */}
        <SideNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          variant={variant}
        />

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
