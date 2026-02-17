'use client';

import { useCallback, useEffect } from 'react';
import { useSwipeable, SwipeableProps } from 'react-swipeable';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScrollOnSwipe?: boolean;
  trackMouse?: boolean;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventScrollOnSwipe = false,
  trackMouse = true,
}: UseSwipeOptions = {}) {
  const handlers = useSwipeable({
    onSwipedLeft: useCallback(() => {
      onSwipeLeft?.();
    }, [onSwipeLeft]),
    onSwipedRight: useCallback(() => {
      onSwipeRight?.();
    }, [onSwipeRight]),
    onSwipedUp: useCallback(() => {
      onSwipeUp?.();
    }, [onSwipeUp]),
    onSwipedDown: useCallback(() => {
      onSwipeDown?.();
    }, [onSwipeDown]),
    trackMouse,
    preventScrollOnSwipe,
    delta: threshold,
  });

  return handlers;
}

/**
 * Hook for page navigation with swipe gestures
 */
export function useSwipeNavigation(
  routes: { left?: string; right?: string; up?: string; down?: string },
  router: any
) {
  return useSwipe({
    onSwipeLeft: () => routes.left && router.push(routes.left),
    onSwipeRight: () => routes.right && router.push(routes.right),
    onSwipeUp: () => routes.up && router.push(routes.up),
    onSwipeDown: () => routes.down && router.push(routes.down),
    threshold: 50,
  });
}
