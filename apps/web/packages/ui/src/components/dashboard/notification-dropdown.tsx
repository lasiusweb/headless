'use client';

import { Bell, X } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'promotion';
  read: boolean;
  timestamp: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  // Mock notifications - would come from API in real implementation
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #ORD123456 has been shipped',
      type: 'order',
      read: false,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of ₹5,000 received for order #ORD123450',
      type: 'payment',
      read: false,
      timestamp: '1 day ago',
    },
    {
      id: '3',
      title: 'New Product Launch',
      message: 'Check out our new organic fertilizer range',
      type: 'promotion',
      read: true,
      timestamp: '2 days ago',
    },
  ];

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'payment':
        return '💰';
      case 'system':
        return '⚙️';
      case 'promotion':
        return '🎉';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <button className="text-sm text-green-600 hover:text-green-700">
            Mark all read
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/dashboard/notifications/${notification.id}`}
                onClick={onClose}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="text-sm text-green-600 hover:text-green-700 font-medium text-center block"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
