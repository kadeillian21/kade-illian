'use client';

import { useState, useEffect } from 'react';
import XPBar from './XPBar';
import DailyGoalWidget from './DailyGoalWidget';

interface PersistentStatsBarProps {
  sessionId: string | null;
  onStartSession: () => void;
  progress: any;
}

export default function PersistentStatsBar({
  sessionId,
  onStartSession,
  progress
}: PersistentStatsBarProps) {
  const [sessionTime, setSessionTime] = useState(0); // seconds
  const [timeStats, setTimeStats] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Timer for current session
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(async () => {
      await fetch('/api/vocab/session/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    };
  }, [sessionId]);

  // Load time stats
  useEffect(() => {
    const loadTimeStats = async () => {
      try {
        const response = await fetch('/api/vocab/stats/time');
        const data = await response.json();
        setTimeStats(data);
      } catch (error) {
        console.error('Error loading time stats:', error);
      }
    };

    loadTimeStats();
    // Refresh every minute
    const interval = setInterval(loadTimeStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const wordsLearned = progress?.stats?.wordsLearned || 0;
  const wordsMastered = progress?.stats?.wordsMastered || 0;
  const streak = progress?.stats?.streak || 0;
  const xp = progress?.stats?.xp || 0;
  const level = progress?.stats?.level || 1;
  const cardsToday = progress?.stats?.cardsToday || 0;
  const dailyGoal = progress?.stats?.dailyGoal || 20;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Left: Timer */}
          <div className="flex items-center gap-4">
            {sessionId ? (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-lg font-mono">
                  {formatTime(sessionTime)}
                </span>
              </div>
            ) : (
              <button
                onClick={onStartSession}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-semibold transition-all"
              >
                ▶ Start Session
              </button>
            )}

            {timeStats && (
              <div className="text-white/90 text-sm">
                Today: <span className="font-bold">{timeStats.day.minutes}m</span>
              </div>
            )}
          </div>

          {/* Center: XP Bar & Daily Goal */}
          <div className="hidden md:flex flex-1 gap-4 max-w-2xl">
            <div className="flex-1">
              <XPBar currentXP={xp} level={level} />
            </div>
            <div className="w-64">
              <DailyGoalWidget cardsToday={cardsToday} dailyGoal={dailyGoal} />
            </div>
          </div>

          {/* Right: Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 text-white transition-all"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Expanded View */}
        {isExpanded && timeStats && (
          <div className="border-t border-white/20 py-4">
            {/* Quick Stats Row */}
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-white/70 text-xs">Learned</div>
                <div className="text-white font-bold text-2xl">{wordsLearned}</div>
              </div>
              <div className="text-center">
                <div className="text-white/70 text-xs">Mastered</div>
                <div className="text-white font-bold text-2xl">{wordsMastered}</div>
              </div>
              <div className="text-center">
                <div className="text-white/70 text-xs">Streak</div>
                <div className="text-white font-bold text-2xl">🔥 {streak}</div>
              </div>
              <div className="text-center">
                <div className="text-white/70 text-xs">Level</div>
                <div className="text-white font-bold text-2xl">Lv. {level}</div>
              </div>
            </div>

            {/* Time Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">This Week</div>
                <div className="text-2xl font-bold">{timeStats.week.minutes}m</div>
                <div className="text-xs text-white/50">{Math.floor(timeStats.week.minutes / 60)}h total</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">This Month</div>
                <div className="text-2xl font-bold">{timeStats.month.hours}h</div>
                <div className="text-xs text-white/50">{timeStats.month.minutes}m total</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">This Year</div>
                <div className="text-2xl font-bold">{timeStats.year.hours}h</div>
                <div className="text-xs text-white/50">{Math.floor(timeStats.year.hours / 24)}d total</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">All Time</div>
                <div className="text-2xl font-bold">{timeStats.total.hours}h</div>
                <div className="text-xs text-white/50">{timeStats.total.minutes}m total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
