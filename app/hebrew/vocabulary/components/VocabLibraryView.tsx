"use client";

import Link from 'next/link';
import { VocabSet } from '../data/types';

interface SetStats {
  total: number;
  new: number;
  due: number;
}

interface VocabLibraryViewProps {
  vocabSets: VocabSet[];
  isLoading: boolean;
  error: string | null;
  totalDueWords: number;
  activeSetsCount: number;
  getSetStats: (set: VocabSet) => SetStats;
  onViewDashboard: () => void;
  onViewSetDetail: (set: VocabSet) => void;
  onToggleActive: (setId: string) => void;
  onStartReview: () => void;
}

const SET_TYPE_ICONS: Record<string, string> = {
  vocabulary: '📚',
  alphabet: 'א',
  syllables: '🎯',
  grammar: '📖',
};

const SET_TYPE_LABELS: Record<string, string> = {
  vocabulary: 'Vocabulary',
  alphabet: 'Alphabet',
  syllables: 'Syllables',
  grammar: 'Grammar',
};

export default function VocabLibraryView({
  vocabSets,
  isLoading,
  error,
  totalDueWords,
  activeSetsCount,
  getSetStats,
  onViewDashboard,
  onViewSetDetail,
  onToggleActive,
  onStartReview,
}: VocabLibraryViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/hebrew"
            className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Hebrew
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
              Hebrew Vocabulary
            </span>
          </h1>
          <p className="text-lg text-gray-600">Your vocabulary sets and review schedule</p>

          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <button
              onClick={onViewDashboard}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <span>📊</span>
              <span>View Progress Dashboard</span>
            </button>
            <Link
              href="/hebrew/vocabulary/manage"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <span>✏️</span>
              <span>Bulk Manage Words</span>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800 font-semibold">Failed to load vocabulary data</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#4a5d49]"></div>
            <p className="mt-4 text-gray-600">Loading vocabulary sets...</p>
          </div>
        )}

        {/* Review Due Card */}
        {totalDueWords > 0 && (
          <div className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-orange-900 mb-1">Review Due</h3>
                <p className="text-orange-700">
                  You have {totalDueWords} word{totalDueWords !== 1 ? 's' : ''} ready for review
                  {activeSetsCount > 0 && (
                    <span className="text-orange-600">
                      {' '}from {activeSetsCount} active set{activeSetsCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                {activeSetsCount === 0 && (
                  <p className="text-orange-600 text-sm mt-1">
                    Tip: Mark sets as &quot;Active&quot; to focus your reviews
                  </p>
                )}
              </div>
              <button
                onClick={onStartReview}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Start Review
              </button>
            </div>
          </div>
        )}

        {/* Vocab Sets */}
        {!isLoading && !error && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Vocabulary Sets</h2>
              {activeSetsCount > 0 && (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-sm">
                  {activeSetsCount} Active Set{activeSetsCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vocabSets.map((set) => {
                const stats = getSetStats(set);
                const isActive = set.isActive;
                const setType = set.setType || 'vocabulary';
                const icon = SET_TYPE_ICONS[setType] || '📚';
                const label = SET_TYPE_LABELS[setType] || 'Vocabulary';

                return (
                  <div
                    key={set.id}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                      isActive ? 'border-green-400 bg-gradient-to-br from-green-50 to-white' : 'border-white/50'
                    }`}
                  >
                    {isActive && (
                      <div className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3">
                        ✓ ACTIVE
                      </div>
                    )}

                    {setType !== 'vocabulary' && (
                      <div className="inline-block px-3 py-1 bg-[#4a5d49]/10 text-[#4a5d49] text-xs font-bold rounded-full mb-3 ml-2">
                        {icon} {label}
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">{icon}</span>
                      <span>{set.title}</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{set.description}</p>

                    <div className="flex gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-gray-800">{stats.total}</span>
                      </div>
                      {stats.new > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">New:</span>
                          <span className="font-bold text-blue-700">{stats.new}</span>
                        </div>
                      )}
                      {stats.due > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600">Due:</span>
                          <span className="font-bold text-orange-700">{stats.due}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => onViewSetDetail(set)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        Study
                      </button>
                      <button
                        onClick={() => onToggleActive(set.id)}
                        className={`px-4 py-2 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 ${
                          isActive
                            ? 'bg-green-500 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {isActive ? '✓ Active' : 'Set Active'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
