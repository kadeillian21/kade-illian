"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lesson {
  id: string;
  language_id: string;
  week_number: number;
  month_number: number;
  title: string;
  description: string;
  topics: string[];
  vocabulary_set_ids: string[];
  user_status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  order_index: number;
}

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalVocabWords: number;
  currentWeek: number;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    inProgressLessons: 0,
    totalVocabWords: 0,
    currentWeek: 1
  });

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const response = await fetch('/api/lessons?language=hebrew');
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.lessons)) {
        setLessons(data.lessons);
        calculateStats(data.lessons);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (lessons: Lesson[]) => {
    const completed = lessons.filter(l => l.user_status === 'completed').length;
    const inProgress = lessons.filter(l => l.user_status === 'in_progress').length;
    const currentLesson = lessons.find(l => l.user_status === 'in_progress') ||
                          lessons.find(l => l.user_status === 'not_started');

    // Count total vocab words from all lessons
    const totalVocab = lessons.reduce((sum, lesson) => {
      return sum + (lesson.vocabulary_set_ids?.length || 0) * 30; // Assuming ~30 words per set
    }, 0);

    setStats({
      totalLessons: lessons.length,
      completedLessons: completed,
      inProgressLessons: inProgress,
      totalVocabWords: totalVocab,
      currentWeek: currentLesson?.week_number || 1
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="text-xs px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">
            ✓ Complete
          </div>
        );
      case 'in_progress':
        return (
          <div className="text-xs px-3 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700">
            → Current
          </div>
        );
      default:
        return (
          <div className="text-xs px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
            Upcoming
          </div>
        );
    }
  };

  const getMonthTitle = (monthNumber: number) => {
    switch (monthNumber) {
      case 1:
        return 'MONTH 1: Foundation (Weeks 1-4)';
      case 2:
        return 'MONTH 2: Nouns & Sustained Reading (Weeks 5-8)';
      case 3:
        return 'MONTH 3: Verbs & Complex Sentences (Weeks 9-12)';
      default:
        return `MONTH ${monthNumber}`;
    }
  };

  // Group lessons by month
  const lessonsByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.month_number;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
        <div className="text-white text-xl">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-3">📖 Biblical Hebrew Learning Journey</h1>
          <p className="text-xl opacity-90">Master the Language of Scripture</p>
          <div className="mt-4">
            <Link
              href="/hebrew/vocabulary"
              className="text-white/80 hover:text-white underline text-sm"
            >
              ← Back to Vocabulary
            </Link>
          </div>
        </header>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-[#667eea] mb-2">
                {stats.totalLessons}
              </div>
              <div className="text-gray-600 text-sm">Weeks Available</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-[#667eea] mb-2">
                {stats.completedLessons}
              </div>
              <div className="text-gray-600 text-sm">Lessons Completed</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-[#667eea] mb-2">
                {stats.totalVocabWords}+
              </div>
              <div className="text-gray-600 text-sm">Vocabulary Words</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-[#667eea] mb-2">
                Week {stats.currentWeek}
              </div>
              <div className="text-gray-600 text-sm">Current Week</div>
            </div>
          </div>
        </div>

        {/* Lessons by Month */}
        {Object.keys(lessonsByMonth).sort().map(monthKey => {
          const month = parseInt(monthKey);
          const monthLessons = lessonsByMonth[month];

          return (
            <div key={month}>
              {/* Month Divider */}
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  📅 {getMonthTitle(month)}
                </h3>
              </div>

              {/* Lesson Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {monthLessons.map(lesson => (
                  <Link
                    key={lesson.id}
                    href={`/hebrew/lessons/${lesson.id}`}
                    className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="text-sm font-semibold text-[#667eea] bg-[#e3e8ff] px-4 py-1 rounded-full">
                        WEEK {lesson.week_number}
                      </div>
                      {getStatusBadge(lesson.user_status)}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {lesson.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-5">
                      {lesson.description}
                    </p>

                    {/* Topics */}
                    {lesson.topics && lesson.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {lesson.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Practice Materials */}
                    {lesson.vocabulary_sets && lesson.vocabulary_sets.length > 0 && (
                      <div className="mb-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          📚 Practice Materials
                        </div>
                        <div className="space-y-2">
                          {lesson.vocabulary_sets.map((vocabSet: any) => (
                            <div
                              key={vocabSet.id}
                              className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-purple-600">
                                  {vocabSet.set_type === 'lesson' ? '⚡' : '📖'}
                                </span>
                                <span className="text-gray-700 font-medium">
                                  {vocabSet.title}
                                </span>
                              </div>
                              <span className="text-purple-600 text-xs font-semibold">
                                {vocabSet.total_words || 0} cards
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <div className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-center py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                        {lesson.user_status === 'completed' ? 'Review Lesson' : 'Start Lesson'}
                      </div>
                      {lesson.vocabulary_set_ids && lesson.vocabulary_set_ids.length > 0 && (
                        <div className="flex-1 bg-gray-100 text-gray-700 text-center py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                          Practice Vocab
                        </div>
                      )}
                    </div>

                    {/* Progress indicator for in-progress lessons */}
                    {lesson.user_status === 'in_progress' && lesson.started_at && (
                      <div className="mt-4 text-sm text-gray-500">
                        Started {new Date(lesson.started_at).toLocaleDateString()}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* No lessons state */}
        {lessons.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Lessons Available Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Run the database migration to seed Hebrew lessons
            </p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
              npx tsx scripts/07-create-lessons-schema.ts
            </code>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-white/80 text-sm">
          <p>kadeillian.com • Biblical Hebrew Learning System</p>
        </div>
      </div>
    </div>
  );
}
