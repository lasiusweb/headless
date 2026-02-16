import * as React from "react";
import { BarChart3, Package, ShoppingCart, Users, Settings, Menu, X } from "lucide-react";

import { Button } from "../button";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarContent,
  headerContent,
  title,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const defaultSidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">KN Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="/admin" className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted">
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard</span>
        </a>
        <a href="/admin/products" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted">
          <Package className="h-4 w-4" />
          <span>Products</span>
        </a>
        <a href="/admin/orders" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted">
          <ShoppingCart className="h-4 w-4" />
          <span>Orders</span>
        </a>
        <a href="/admin/users" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted">
          <Users className="h-4 w-4" />
          <span>Users</span>
        </a>
        <a href="/admin/settings" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </a>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent || defaultSidebar}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-background border-r">
        {sidebarContent || defaultSidebar}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            {headerContent}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };