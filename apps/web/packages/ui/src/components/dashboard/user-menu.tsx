'use client';

import { useState } from 'react';
import { ChevronDown, LogOut, Settings, User, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@kn/lib';

interface UserMenuProps {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'dealer':
        return { label: 'Dealer', color: 'bg-blue-100 text-blue-700' };
      case 'distributor':
        return { label: 'Distributor', color: 'bg-purple-100 text-purple-700' };
      case 'admin':
        return { label: 'Admin', color: 'bg-red-100 text-red-700' };
      default:
        return { label: 'Retailer', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {getInitials()}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.first_name || user.email}
          </p>
          {roleBadge && (
            <span className={`text-xs px-2 py-0.5 rounded ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <p className="font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/dashboard/account/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <Link
                href="/dashboard/account/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/dashboard/orders/payments"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <CreditCard className="h-4 w-4" />
                Payment Methods
              </Link>
            </div>

            {/* Logout */}
            <div className="py-2 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
