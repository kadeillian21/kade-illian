'use client';

import { HebrewVocabWord } from '../data/types';
import { calculateStats, formatRelativeTime, LearningStats } from '../utils/stats';

interface ProgressDashboardProps {
  progress: {
    stats: {
      lastStudied: string;
      totalReviews: number;
      wordsLearned: number;
      wordsMastered: number;
      streak: number;
    };
    wordProgress: {
      [wordId: string]: {
        level: number;
        nextReview: string;
        lastReviewed: string;
        reviewCount: number;
        correctCount: number;
      };
    };
  };
  allWords: HebrewVocabWord[];
  onStartStudy: () => void;
}

export default function ProgressDashboard({
  progress,
  allWords,
  onStartStudy,
}: ProgressDashboardProps) {
  // Transform API response format to match what calculateStats expects
  const userProgress = {
    lastStudied: progress.stats.lastStudied,
    totalReviews: progress.stats.totalReviews,
    wordsLearned: progress.stats.wordsLearned,
    wordsMastered: progress.stats.wordsMastered,
    streak: progress.stats.streak,
    wordProgress: progress.wordProgress,
  };

  const stats: LearningStats = calculateStats(userProgress, allWords);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent mb-2">
            Your Learning Progress
          </h1>
          <p className="text-center text-gray-600">
            {stats.lastStudied ? `Last studied ${formatRelativeTime(stats.lastStudied)}` : 'Start studying to track your progress'}
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Streak Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-orange-600">{stats.streak}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.streak === 0 ? 'Start today!' : stats.streak === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div className="text-6xl">🔥</div>
            </div>
          </div>

          {/* Total Words Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Words</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalWords}</p>
                <p className="text-sm text-gray-500 mt-1">in vocabulary</p>
              </div>
              <div className="text-6xl">📊</div>
            </div>
          </div>
        </div>

        {/* Learning Progress Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Learning Progress</h2>

          <div className="space-y-4">
            {/* Mastered */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold text-gray-700">Mastered</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.wordsMastered} ({stats.masteredPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.masteredPercentage}%` }}
                />
              </div>
            </div>

            {/* Learning */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span className="font-semibold text-gray-700">Learning</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats.wordsLearned} ({stats.learnedPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.learnedPercentage}%` }}
                />
              </div>
            </div>

            {/* New */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🆕</span>
                  <span className="font-semibold text-gray-700">New</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {stats.newWords} ({stats.newPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.newPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Performance</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.successRate > 0 ? `${stats.successRate}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalReviews}</p>
            </div>
          </div>

          {stats.totalReviews > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {stats.successRate >= 80 && '🌟 Excellent work! Keep it up!'}
                {stats.successRate >= 60 && stats.successRate < 80 && '👍 Good progress! Keep practicing!'}
                {stats.successRate >= 40 && stats.successRate < 60 && '💪 Keep going! Practice makes perfect!'}
                {stats.successRate < 40 && '📖 Take your time and review regularly!'}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Quick Actions</h2>

          <div className="flex justify-center">
            <button
              onClick={onStartStudy}
              className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-6 px-12 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <div className="text-4xl mb-2">📖</div>
              <div className="text-xl">Study Now</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
