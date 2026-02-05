'use client';

import { useEffect } from 'react';

interface SyncErrorToastProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export default function SyncErrorToast({ message, onRetry, onDismiss }: SyncErrorToastProps) {
  useEffect(() => {
    // Auto-dismiss after 10 seconds if not interacted with
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideInRight">
      <div className="bg-red-600 rounded-xl p-1 shadow-2xl max-w-sm">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-red-400 mb-1">
                Sync Error
              </div>
              <div className="text-sm text-gray-300 mb-3">
                {message}
              </div>
              <div className="flex gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
