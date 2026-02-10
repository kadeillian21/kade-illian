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

export default function DashboardPage() {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

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
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthAndLoad();
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

  // Not authenticated — show welcome page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
        <div className="container py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-[#4a5d49]">Learn Biblical Languages</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Study Biblical Hebrew and Koine Greek with structured lessons,
              spaced repetition vocabulary, and an interactive Bible reader.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-medium hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg text-lg"
            >
              Sign In to Get Started
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 text-center">
              <div className="text-4xl mb-4 font-[family-name:var(--font-hebrew)] text-[#4a5d49]">&#1488;</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Biblical Hebrew</h3>
              <p className="text-gray-600 text-sm">14 structured weekly lessons from alphabet to reading Genesis</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 text-center">
              <div className="text-4xl mb-4">&#127183;</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Vocabulary</h3>
              <p className="text-gray-600 text-sm">Spaced repetition flashcards organized by semantic groups</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 text-center">
              <div className="text-4xl mb-4">&#128220;</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Bible Reader</h3>
              <p className="text-gray-600 text-sm">Read Hebrew text with tap-to-translate and morphology</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated — show learning dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Learning Dashboard</h1>
          <p className="text-gray-600 mt-1">Your biblical language learning at a glance</p>
        </div>

        {/* Language Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hebrew Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-[family-name:var(--font-hebrew)] text-[#4a5d49]">&#1506;</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Biblical Hebrew</h2>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-2xl font-bold text-[#4a5d49] flex items-center justify-center gap-1">
                  {stats.streak > 0 && <span className="text-orange-500 text-lg">&#128293;</span>}
                  {stats.streak}
                </div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-2xl font-bold text-[#4a5d49]">
                  {stats.wordsLearned}<span className="text-gray-400 text-sm">/{stats.totalWords}</span>
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div className="text-center p-3 bg-[#f5f1e8] rounded-xl">
                <div className="text-2xl font-bold text-[#4a5d49]">
                  {stats.lessonsCompleted}<span className="text-gray-400 text-sm">/{stats.totalLessons}</span>
                </div>
                <div className="text-xs text-gray-600">Lessons</div>
              </div>
            </div>

            <Link
              href="/hebrew"
              className="block w-full py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white text-center font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              Go to Hebrew
            </Link>
          </div>

          {/* Greek Card (Coming Soon) */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 opacity-60">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl text-gray-400">&#945;</span>
              <div>
                <h2 className="text-xl font-bold text-gray-400">Koine Greek</h2>
                <p className="text-sm text-gray-400">Coming Soon</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center p-3 bg-gray-100 rounded-xl">
                <div className="text-2xl font-bold text-gray-400">-</div>
                <div className="text-xs text-gray-400">Streak</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-xl">
                <div className="text-2xl font-bold text-gray-400">-</div>
                <div className="text-xs text-gray-400">Words</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-xl">
                <div className="text-2xl font-bold text-gray-400">-</div>
                <div className="text-xs text-gray-400">Lessons</div>
              </div>
            </div>

            <div className="w-full py-3 bg-gray-200 text-gray-400 text-center font-semibold rounded-xl cursor-not-allowed">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentLesson && (
              <Link
                href={`/hebrew/lessons/${currentLesson.id}`}
                className="p-4 bg-gradient-to-br from-[#4a5d49] to-[#6b7d6a] rounded-xl text-center text-white hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="text-2xl mb-2">&#128214;</div>
                <div className="font-medium text-sm">
                  {currentLesson.status === 'in_progress' ? 'Continue' : 'Start'} Week {currentLesson.weekNumber}
                </div>
              </Link>
            )}
            {stats.notLearned > 0 && (
              <Link
                href="/hebrew/vocabulary"
                className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-center text-white hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="text-2xl mb-2">&#127183;</div>
                <div className="font-medium text-sm">
                  {stats.notLearned} Words to Learn
                </div>
              </Link>
            )}
            <Link
              href="/hebrew/vocabulary"
              className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors hover:scale-[1.02]"
            >
              <div className="text-2xl mb-2">&#128218;</div>
              <div className="font-medium text-gray-800 text-sm">Vocabulary</div>
            </Link>
            <Link
              href="/hebrew/bible"
              className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors hover:scale-[1.02]"
            >
              <div className="text-2xl mb-2">&#128220;</div>
              <div className="font-medium text-gray-800 text-sm">Bible Reader</div>
            </Link>
            <Link
              href="/hebrew/lessons"
              className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors hover:scale-[1.02]"
            >
              <div className="text-2xl mb-2">&#128209;</div>
              <div className="font-medium text-gray-800 text-sm">All Lessons</div>
            </Link>
            {stats.lessonsCompleted >= 2 && (
              <Link
                href="/hebrew/review"
                className="p-4 bg-[#f5f1e8] rounded-xl text-center hover:bg-[#e8dcc8] transition-colors hover:scale-[1.02]"
              >
                <div className="text-2xl mb-2">&#128221;</div>
                <div className="font-medium text-gray-800 text-sm">Big Review</div>
              </Link>
            )}
          </div>
        </div>

        {/* Study Time */}
        {timeStats && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Study Time</h2>
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
