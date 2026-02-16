import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function for conditional class names
export function cx(...args: ClassValue[]) {
  return cn(args);
}

// Utility function for generating random IDs
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Utility function for formatting currency
export function formatCurrency(amount: number, currency: string = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Utility function for generating unique class names with prefixes
export function prefixedCx(prefix: string, ...args: ClassValue[]): string {
  return args
    .flat()
    .filter(Boolean)
    .map(className => typeof className === 'string' && className.startsWith(prefix) ? className : `${prefix}-${className}`)
    .join(' ');
}