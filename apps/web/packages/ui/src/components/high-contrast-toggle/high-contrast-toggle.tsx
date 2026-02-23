/**
 * High Contrast Mode Toggle Component
 * 
 * Accessible button to toggle high contrast mode
 * Meets WCAG AAA contrast requirements
 */

'use client';

import { useHighContrast } from '@kn/lib';
import { Button } from '@kn/ui';

export function HighContrastToggle() {
  const { isHighContrast, toggleHighContrast } = useHighContrast();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleHighContrast}
      className="high-contrast-toggle"
      aria-pressed={isHighContrast}
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      title={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
    >
      {isHighContrast ? (
        <>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Normal
        </>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          High Contrast
        </>
      )}
    </Button>
  );
}
