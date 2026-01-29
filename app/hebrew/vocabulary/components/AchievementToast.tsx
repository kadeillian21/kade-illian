'use client';

import { useEffect } from 'react';

interface AchievementToastProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
  };
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-4 z-50 animate-slideInRight">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-1 shadow-2xl max-w-sm">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl animate-bounce">{achievement.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-yellow-400 mb-1 uppercase tracking-wide">
                Achievement Unlocked!
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {achievement.name}
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {achievement.description}
              </div>
              <div className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                <span>+{achievement.xp_reward} XP</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
