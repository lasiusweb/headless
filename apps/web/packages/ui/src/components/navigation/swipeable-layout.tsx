'use client';

import { ReactNode, useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

interface SwipeableLayoutProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enableHorizontal?: boolean;
  enableVertical?: boolean;
}

export function SwipeableLayout({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enableHorizontal = true,
  enableVertical = false,
}: SwipeableLayoutProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handlePan = (event: any, info: PanInfo) => {
    if (enableHorizontal) {
      setOffsetX(info.offset.x);
    }
    if (enableVertical) {
      setOffsetY(info.offset.y);
    }
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    setOffsetX(0);
    setOffsetY(0);

    if (enableHorizontal) {
      if (info.offset.x > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    if (enableVertical) {
      if (info.offset.y > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (info.offset.y < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    onSwipedUp: () => onSwipeUp?.(),
    onSwipedDown: () => onSwipeDown?.(),
    trackMouse: true,
    preventScrollOnSwipe: false,
    delta: 50,
  });

  return (
    <motion.div
      {...handlers}
      drag={enableHorizontal ? 'x' : enableVertical ? 'y' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      style={{
        x: enableHorizontal ? offsetX : 0,
        y: enableVertical ? offsetY : 0,
        cursor: enableHorizontal || enableVertical ? 'grab' : 'default',
      }}
      className="touch-none"
    >
      {children}

      {/* Visual feedback during swipe */}
      <AnimatePresence>
        {offsetX > 0 && enableHorizontal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(offsetX / 200, 0.3) }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 left-0 w-2 bg-gradient-to-r from-green-500/20 to-transparent pointer-events-none"
          />
        )}
        {offsetX < 0 && enableHorizontal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(Math.abs(offsetX) / 200, 0.3) }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 right-0 w-2 bg-gradient-to-l from-green-500/20 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
