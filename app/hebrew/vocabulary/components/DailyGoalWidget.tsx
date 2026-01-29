'use client';

interface DailyGoalWidgetProps {
  cardsToday: number;
  dailyGoal: number;
}

export default function DailyGoalWidget({ cardsToday, dailyGoal }: DailyGoalWidgetProps) {
  const progress = Math.min((cardsToday / dailyGoal) * 100, 100);
  const isComplete = cardsToday >= dailyGoal;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>Daily Goal</span>
        </div>
        <div className="text-sm text-white/90 font-mono">
          {cardsToday} / {dailyGoal}
        </div>
      </div>

      <div className="relative w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-blue-400 to-cyan-500'
          }`}
          style={{ width: `${progress}%` }}
        >
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>

      {isComplete && (
        <div className="mt-2 text-xs text-center text-green-300 font-semibold animate-pulse">
          ✨ Goal Complete! ✨
        </div>
      )}
    </div>
  );
}
