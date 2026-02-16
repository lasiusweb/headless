import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface MotionToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  onDismiss?: (id: string) => void;
  className?: string;
}

const MotionToast = React.forwardRef<HTMLDivElement, MotionToastProps>(
  ({ id, title, description, variant = "default", duration = 5000, onDismiss, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onDismiss) {
            onDismiss(id);
          }
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [id, duration, onDismiss]);

    if (!isVisible) return null;

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.5
          }}
          className={cn(
            "flex w-full max-w-sm items-center space-x-4 rounded-md border p-4 shadow-lg pointer-events-auto",
            variant === "destructive" 
              ? "border-destructive bg-destructive/10 text-destructive" 
              : "border-border bg-background text-foreground",
            className
          )}
        >
          <div className="flex-1">
            {title && <p className="font-semibold">{title}</p>}
            {description && <p className="text-sm opacity-80">{description}</p>}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              if (onDismiss) {
                onDismiss(id);
              }
            }}
            className="text-foreground/50 hover:text-foreground"
          >
            ✕
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }
);

MotionToast.displayName = "MotionToast";

interface MotionToastProviderProps {
  children: React.ReactNode;
}

const MotionToastProvider = ({ children }: MotionToastProviderProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {children}
    </div>
  );
};

MotionToastProvider.displayName = "MotionToastProvider";

export { MotionToast, MotionToastProvider };