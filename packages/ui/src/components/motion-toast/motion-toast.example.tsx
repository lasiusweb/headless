// Example usage of MotionToast component

import React, { useState } from 'react';
import { MotionToast, MotionToastProvider } from '@kn/ui';

const ToastExample = () => {
  const [toasts, setToasts] = useState<Array<{id: string; title: string; description: string; variant: 'default' | 'destructive'}>>([]);

  const addToast = (variant: 'default' | 'destructive' = 'default') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [
      ...prev,
      {
        id,
        title: variant === 'destructive' ? 'Error Occurred' : 'Success!',
        description: variant === 'destructive' 
          ? 'There was an issue processing your request.' 
          : 'Your action was completed successfully.',
        variant
      }
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        <button 
          onClick={() => addToast('default')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Show Success Toast
        </button>
        <button 
          onClick={() => addToast('destructive')}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Show Error Toast
        </button>
      </div>

      <MotionToastProvider>
        {toasts.map((toast) => (
          <MotionToast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={dismissToast}
          />
        ))}
      </MotionToastProvider>
    </div>
  );
};

export default ToastExample;