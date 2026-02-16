import * as React from "react";
import { cn } from "../lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const DropdownMenu = ({ children, isOpen, onClose, className }: DropdownMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="relative inline-block text-left">
      <div 
        className={cn(
          "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
          className
        )}
      >
        <div className="py-1" role="none">
          {children}
        </div>
      </div>
    </div>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenuItem = ({ children, onClick, className }: DropdownMenuItemProps) => {
  return (
    <button
      className={cn(
        "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

DropdownMenu.displayName = "DropdownMenu";
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuItem };