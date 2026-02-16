import * as React from "react";
import { cn } from "../lib/utils";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  onDismiss?: (id: string) => void;
}

const Toast = ({ id, title, description, variant = "default", duration = 5000, onDismiss }: ToastProps) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) {
          onDismiss(id);
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-center space-x-4 rounded-md border p-4 shadow-lg",
        variant === "destructive" 
          ? "border-destructive bg-destructive/10 text-destructive" 
          : "border-border bg-background text-foreground",
        "animate-in slide-in-from-top-4 duration-300"
      )}
    >
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          if (onDismiss) {
            onDismiss(id);
          }
        }}
        className="text-foreground/50 hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
};

Toast.displayName = "Toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return <div className="fixed bottom-4 right-4 z-[100] space-y-2">{children}</div>;
};

ToastProvider.displayName = "ToastProvider";

export { Toast, ToastProvider };