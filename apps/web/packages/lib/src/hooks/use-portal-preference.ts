import { useState, useEffect, useCallback } from 'react';

export type PortalPreference = 'b2b' | 'b2c' | null;

export interface UsePortalPreferenceReturn {
  preference: PortalPreference;
  setPreference: (preference: PortalPreference) => void;
  clearPreference: () => void;
  isLoading: boolean;
}

// Cookie domain - configurable via environment variable
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.knbiosciences.in';

/**
 * Hook to manage user portal preference (B2B vs B2C)
 * Stores preference in both localStorage and cookies for persistence
 */
export function usePortalPreference(): UsePortalPreferenceReturn {
  const [preference, setPreferenceState] = useState<PortalPreference>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('portal_preference');
      if (stored === 'b2b' || stored === 'b2c') {
        setPreferenceState(stored);
      }
      setIsLoading(false);
    }
  }, []);

  // Set preference in both localStorage and cookie
  const setPreference = useCallback((newPreference: PortalPreference) => {
    if (typeof window !== 'undefined') {
      setPreferenceState(newPreference);

      if (newPreference) {
        // Store in localStorage
        localStorage.setItem('portal_preference', newPreference);

        // Store in cookie (30 days expiry)
        document.cookie = `portal_preference=${newPreference}; max-age=${30 * 24 * 60 * 60}; path=/; domain=${COOKIE_DOMAIN}; SameSite=Lax`;
      } else {
        // Clear from localStorage
        localStorage.removeItem('portal_preference');

        // Clear cookie
        document.cookie = `portal_preference=; max-age=0; path=/; domain=${COOKIE_DOMAIN}; SameSite=Lax`;
      }
    }
  }, []);

  // Clear preference
  const clearPreference = useCallback(() => {
    setPreference(null);
  }, [setPreference]);

  return {
    preference,
    setPreference,
    clearPreference,
    isLoading,
  };
}

/**
 * Get portal preference from cookie (server-side compatible)
 * Can be used in Next.js middleware or server components
 */
export function getPortalPreferenceFromCookie(cookieHeader?: string): PortalPreference {
  if (typeof window !== 'undefined') {
    const stored = document.cookie
      .split('; ')
      .find(row => row.startsWith('portal_preference='));
    const value = stored?.split('=')[1];
    return (value === 'b2b' || value === 'b2c') ? value : null;
  }

  // Server-side parsing
  if (cookieHeader) {
    const match = cookieHeader
      .split('; ')
      .find(row => row.startsWith('portal_preference='));
    const value = match?.split('=')[1];
    return (value === 'b2b' || value === 'b2c') ? value : null;
  }

  return null;
}
