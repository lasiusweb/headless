'use client';

import { useState, useCallback, RefObject } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 100,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0) return;
    
    setStartY(e.touches[0].clientY);
    setIsPulling(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isPulling) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  }, [enabled, isPulling, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [enabled, isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  const attachToElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    attachToElement,
  };
}

/**
 * Hook for global pull-to-refresh (window level)
 */
export function useGlobalPullToRefresh(options: UsePullToRefreshOptions) {
  const { isRefreshing, pullDistance } = usePullToRefresh(options);

  const { enabled = true, threshold = 100, onRefresh } = options;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0) return;
    // Handled by usePullToRefresh
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0) return;
    // Handled by usePullToRefresh
  }, [enabled]);

  return {
    isRefreshing,
    pullDistance,
  };
}
