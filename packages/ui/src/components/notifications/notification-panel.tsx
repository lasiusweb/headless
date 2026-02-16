import * as React from "react";
import { Bell, X, Check, Package, Truck, Calendar, IndianRupee } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Badge } from "../badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'shipment' | 'payment';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onDismiss: (id: string) => void;
  className?: string;
}

const NotificationPanel = React.forwardRef<
  HTMLDivElement,
  NotificationPanelProps
>(({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onNotificationClick,
  onDismiss,
  className
}, ref) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipment':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'payment':
        return <IndianRupee className="h-5 w-5 text-purple-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'order':
        return 'border-blue-200 bg-blue-50';
      case 'shipment':
        return 'border-green-200 bg-green-50';
      case 'payment':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div ref={ref} className={cn("w-full max-w-sm p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </h3>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No notifications yet</p>
          <p className="text-sm">You'll see updates here when they arrive</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                !notification.read && "bg-primary/5 border-primary/30",
                getNotificationColor(notification.type)
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  
                  {notification.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        notification.action?.onClick();
                      }}
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => onDismiss(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {!notification.read && (
                <div className="h-1 w-full bg-primary rounded-full mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

NotificationPanel.displayName = "NotificationPanel";

// Notification Provider Component
interface NotificationProviderProps {
  children: React.ReactNode;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationProvider = ({ children, onNotificationClick }: NotificationProviderProps) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        addNotification, 
        markAsRead, 
        dismissNotification, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export { NotificationPanel, NotificationProvider, useNotifications };