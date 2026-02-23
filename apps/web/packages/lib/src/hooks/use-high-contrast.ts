/**
 * High Contrast Mode Hook
 * 
 * Manages high contrast mode for outdoor readability
 * Persists preference in localStorage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseHighContrastReturn {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  enableHighContrast: () => void;
  disableHighContrast: () => void;
}

const STORAGE_KEY = 'kn_high_contrast_mode';

/**
 * Hook to manage high contrast mode
 */
export function useHighContrast(): UseHighContrastReturn {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load preference on mount (SSR-safe)
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      
      if (newValue) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      
      return newValue;
    });
  }, []);

  // Enable high contrast
  const enableHighContrast = useCallback(() => {
    setIsHighContrast(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    document.documentElement.classList.add('high-contrast');
  }, []);

  // Disable high contrast
  const disableHighContrast = useCallback(() => {
    setIsHighContrast(false);
    localStorage.setItem(STORAGE_KEY, 'false');
    document.documentElement.classList.remove('high-contrast');
  }, []);

  // Return default values during SSR to prevent hydration mismatch
  if (!isMounted) {
    return {
      isHighContrast: false,
      toggleHighContrast: () => {},
      enableHighContrast: () => {},
      disableHighContrast: () => {},
    };
  }

  return {
    isHighContrast,
    toggleHighContrast,
    enableHighContrast,
    disableHighContrast,
  };
}
