'use client';

import { useEffect } from 'react';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-1 animate-scaleIn">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center">
          {/* Animated rays */}
          <div className="absolute inset-0 animate-spin-slow opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <div className="text-6xl font-black text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text mb-4 animate-pulse">
              LEVEL UP!
            </div>
            <div className="text-5xl font-bold text-white mb-4">
              Level {level}
            </div>
            <div className="text-xl text-gray-300">
              You're becoming a Hebrew master! 📚
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
