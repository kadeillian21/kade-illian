'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  streak: number;
  wordsLearned: number;
  totalWords: number;
  notLearned: number;
  lessonsCompleted: number;
  totalLessons: number;
}

interface TimeStats {
  day: { minutes: number };
  week: { minutes: number };
  month: { hours: number; minutes: number };
  total: { hours: number; minutes: number };
}

interface CurrentLesson {
  id: string;
  title: string;
  weekNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export default function HebrewHubPage() {
  const [stats, setStats] = useState<Stats>({
    streak: 0,
    wordsLearned: 0,
    totalWords: 0,
    notLearned: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
  });
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CurrentLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch vocab stats
        const setsRes = await fetch('/api/vocab/sets');
        if (setsRes.ok) {
          const sets = await setsRes.json();
          const allWords = sets.flatMap((set: any) =>
            (set.groups || []).flatMap((group: any) => group.words || [])
          );
          const learned = allWords.filter((w: any) => (w.level || 0) >= 1).length;
          const notLearned = allWords.filter((w: any) => !w.level || w.level === 0).length;

          setStats(prev => ({
            ...prev,
            wordsLearned: learned,
            totalWords: allWords.length,
            notLearned,
          }));
        }

        // Fetch streak
        const progressRes = await fetch('/api/vocab/progress');
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setStats(prev => ({
            ...prev,
            streak: progressData.stats?.streak || 0,
          }));
        }

        // Fetch lessons
        const lessonsRes = await fetch('/api/lessons?language=hebrew');
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          if (lessonsData.success && Array.isArray(lessonsData.lessons)) {
            const lessons = lessonsData.lessons;
            const completed = lessons.filter((l: any) => l.user_status === 'completed').length;

            setStats(prev => ({
              ...prev,
              lessonsCompleted: completed,
              totalLessons: lessons.length,
            }));

            // Find current lesson (in progress or first not started)
            const inProgress = lessons.find((l: any) => l.user_status === 'in_progress');
            const nextLesson = lessons.find((l: any) => l.user_status === 'not_started');
            const current = inProgress || nextLesson;

            if (current) {
              setCurrentLesson({
                id: current.id,
                title: current.title,
                weekNumber: current.week_number,
                status: current.user_status,
              });
            }
          }
        }

        // Fetch time stats
        const timeRes = await fetch('/api/vocab/stats/time');
        if (timeRes.ok) {
          const timeData = await timeRes.json();
          setTimeStats(timeData);
        }
      } catch (error) {
        console.error('Error loading hub data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const formatTime = (minutes: number, hours?: number): string => {
    if (hours && hours > 0) {
      const remainingMins = minutes % 60;
      if (remainingMins > 0) return `${hours}h ${remainingMins}m`;
      return `${hours}h`;
    }
    if (minutes === 0) return '0m';
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#4a5d49]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3">
            <span className="font-[family-name:var(--font-hebrew)] text-[#4a5d49]">עברית</span>
          </h1>
          <p className="text-xl text-gray-600">Biblical Hebrew Learning</p>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Streak */}
            <div>
              <div className="text-3xl font-bold text-[#4a5d49] flex items-center justify-center gap-2">
                {stats.streak > 0 && <span className="text-orange-500">&#128293;</span>}
                {stats.streak}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>

            {/* Words Learned */}
            <div>
              <div className="text-3xl font-bold text-[#4a5d49]">
                {stats.wordsLearned}<span className="text-gray-400 text-lg">/{stats.totalWords}</span>
              </div>
              <div className="text-sm text-gray-600">Words Learned</div>
            </div>

            {/* Lessons */}
            <div>
              <div className="text-3xl font-bold text-[#4a5d49]">
                {stats.lessonsCompleted}<span className="text-gray-400 text-lg">/{stats.totalLessons}</span>
              </div>
              <div className="text-sm text-gray-600">Lessons Complete</div>
            </div>

            {/* Study Time */}
            <div>
              <div className="text-3xl font-bold text-[#4a5d49]">
                {timeStats ? formatTime(timeStats.total.minutes, timeStats.total.hours) : '0m'}
              </div>
              <div className="text-sm text-gray-600">Total Study Time</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Continue Learning Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Continue Learning</h2>

            {currentLesson ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#f5f1e8] rounded-xl">
                  <div className="text-sm text-[#4a5d49] font-medium mb-1">
                    Week {currentLesson.weekNumber}
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {currentLesson.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {currentLesson.status === 'in_progress' ? 'In Progress' : 'Up Next'}
                  </div>
                </div>
                <Link
                  href={`/hebrew/lessons/${currentLesson.id}`}
                  className="block w-full py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white text-center font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  {currentLesson.status === 'in_progress' ? 'Continue Lesson' : 'Start Lesson'}
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">&#127881;</div>
                <p className="text-gray-600">All lessons completed!</p>
                <Link
                  href="/hebrew/lessons"
                  className="inline-block mt-4 px-6 py-2 bg-[#4a5d49] text-white rounded-xl font-medium hover:bg-[#6b7d6a] transition-colors"
                >
                  Review Lessons
                </Link>
              </div>
            )}
          </div>

          {/* Vocabulary Practice Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vocabulary Practice</h2>

            {stats.notLearned > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">
                    {stats.notLearned} words
                  </div>
                  <div className="text-sm text-orange-600">
                    Not yet learned - ready to study
                  </div>
                </div>
                <Link
                  href="/hebrew/vocabulary"
                  className="block w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  Study Vocabulary
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    All words learned!
                  </div>
                  <div className="text-sm text-green-600">
                    Great job mastering your vocabulary
                  </div>
                </div>
                <Link
                  href="/hebrew/vocabulary"
                  className="block w-full py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white text-center font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  Review Vocabulary
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Foundations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏛️</span>
            <h2 className="text-xl font-bold text-gray-800">Foundations</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/hebrew/vocabulary?set=hebrew-alphabet"
              className="p-4 bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] rounded-xl hover:shadow-md transition-all border border-[#d4c5b0]"
            >
              <div className="text-3xl mb-2 font-[family-name:var(--font-hebrew)] text-[#4a5d49]">א</div>
              <div className="font-semibold text-gray-800">Hebrew Alphabet</div>
              <div className="text-sm text-gray-600">41 characters</div>
            </Link>
            <Link
              href="/hebrew/vocabulary?set=hebrew-syllables"
              className="p-4 bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] rounded-xl hover:shadow-md transition-all border border-[#d4c5b0]"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-800">Syllable Practice</div>
              <div className="text-sm text-gray-600">20 words</div>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/hebrew/lessons"
              className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors"
            >
              <div className="text-2xl mb-2">&#128214;</div>
              <div className="font-medium text-gray-800">All Lessons</div>
            </Link>
            <Link
              href="/hebrew/vocabulary"
              className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors"
            >
              <div className="text-2xl mb-2">&#127183;</div>
              <div className="font-medium text-gray-800">Vocabulary Sets</div>
            </Link>
            {stats.lessonsCompleted >= 2 && (
              <Link
                href="/hebrew/review"
                className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors"
              >
                <div className="text-2xl mb-2">&#128221;</div>
                <div className="font-medium text-gray-800">Big Review</div>
              </Link>
            )}
            <Link
              href="/hebrew/vocabulary"
              onClick={() => {
                // This will be handled by the vocabulary page to go to dashboard
                localStorage.setItem('vocab_view', 'dashboard');
              }}
              className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors"
            >
              <div className="text-2xl mb-2">&#128200;</div>
              <div className="font-medium text-gray-800">Progress Stats</div>
            </Link>
          </div>
        </div>

        {/* Study Time Summary */}
        {timeStats && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Study Time</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-xl font-bold text-[#4a5d49]">
                  {formatTime(timeStats.day.minutes)}
                </div>
                <div className="text-xs text-gray-600">Today</div>
              </div>
              <div className="p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-xl font-bold text-[#4a5d49]">
                  {formatTime(timeStats.week.minutes, timeStats.week.minutes >= 60 ? Math.floor(timeStats.week.minutes / 60) : undefined)}
                </div>
                <div className="text-xs text-gray-600">This Week</div>
              </div>
              <div className="p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-xl font-bold text-[#4a5d49]">
                  {formatTime(timeStats.month.minutes, timeStats.month.hours)}
                </div>
                <div className="text-xs text-gray-600">This Month</div>
              </div>
              <div className="p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-xl font-bold text-[#4a5d49]">
                  {formatTime(timeStats.total.minutes, timeStats.total.hours)}
                </div>
                <div className="text-xs text-gray-600">All Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
