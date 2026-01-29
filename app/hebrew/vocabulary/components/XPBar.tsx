'use client';

import { useEffect, useState } from 'react';

interface XPBarProps {
  currentXP: number;
  level: number;
  onLevelUp?: (newLevel: number) => void;
}

// XP required for each level
const XP_PER_LEVEL = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
  20000, 26000, 33000, 41000, 50000,
];

export default function XPBar({ currentXP, level, onLevelUp }: XPBarProps) {
  const [animating, setAnimating] = useState(false);

  const xpForCurrentLevel = XP_PER_LEVEL[level - 1] || 0;
  const xpForNextLevel = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

  useEffect(() => {
    // Trigger animation when XP changes
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentXP]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-white">
            Lv. {level}
          </div>
          <div className="text-sm text-white/70">
            {xpInCurrentLevel} / {xpNeededForLevel} XP
          </div>
        </div>
        <div className={`text-sm font-mono text-white/90 ${animating ? 'animate-pulse' : ''}`}>
          {currentXP.toLocaleString()} XP
        </div>
      </div>

      <div className="relative w-full bg-white/20 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full transition-all duration-500 ${
            animating ? 'animate-pulse' : ''
          }`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
