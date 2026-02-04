"use client";

import Link from "next/link";
import { VocabSet } from "../data/types";
import VocabSetCard from "./VocabSetCard";

interface SetStats {
  total: number;
  notLearned: number;
  learned: number;
}

interface LibraryViewProps {
  vocabSets: VocabSet[];
  isLoading: boolean;
  totalNotLearned: number;
  activeSetsCount: number;
  getSetStats: (set: VocabSet) => SetStats;
  getSetTypeIcon: (setType?: string) => string;
  getSetTypeLabel: (setType?: string) => string;
  onViewSetDetail: (set: VocabSet) => void;
  onToggleSetActive: (setId: string) => void;
  onStartReviewMode: () => void;
  onGoToDashboard: () => void;
  gamificationUI: React.ReactNode;
}

export default function LibraryView({
  vocabSets,
  isLoading,
  totalNotLearned,
  activeSetsCount,
  getSetStats,
  getSetTypeIcon,
  getSetTypeLabel,
  onViewSetDetail,
  onToggleSetActive,
  onStartReviewMode,
  onGoToDashboard,
  gamificationUI,
}: LibraryViewProps) {
  const foundationalSets = vocabSets.filter(set => (set as any).setType === 'foundational');
  const vocabularySets = vocabSets.filter(set =>
    (set as any).setType !== 'lesson' && (set as any).setType !== 'foundational'
  );

  return (
    <>
      {gamificationUI}
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

            {/* Navigation to Dashboard and Bulk Management */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Link
                href="/hebrew/lessons"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <span>&#128214;</span>
                <span>Lesson Plans</span>
              </Link>
              <button
                onClick={onGoToDashboard}
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

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#4a5d49]"></div>
              <p className="mt-4 text-gray-600">Loading vocabulary sets...</p>
            </div>
          )}

          {/* Not Learned Words Card */}
          {totalNotLearned > 0 && (
            <div className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-orange-900 mb-1">Not Learned</h3>
                  <p className="text-orange-700">
                    You have {totalNotLearned} word{totalNotLearned !== 1 ? 's' : ''} you don't know yet
                    {activeSetsCount > 0 && (
                      <span className="text-orange-600">
                        {' '}from {activeSetsCount} active set{activeSetsCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  {activeSetsCount === 0 && (
                    <p className="text-orange-600 text-sm mt-1">
                      💡 Tip: Mark sets as "Active" to focus your study sessions
                    </p>
                  )}
                </div>
                <button
                  onClick={onStartReviewMode}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Study Now
                </button>
              </div>
            </div>
          )}

          {/* Foundational Sets (Alphabet, Syllables) */}
          {!isLoading && foundationalSets.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏛️</span>
                <h2 className="text-2xl font-bold text-gray-800">Foundations</h2>
              </div>
              <p className="text-gray-600 mb-4">Master these fundamentals before diving into vocabulary</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {foundationalSets.map((set) => (
                  <VocabSetCard
                    key={set.id}
                    set={set}
                    stats={getSetStats(set)}
                    isFoundational={true}
                    onStudy={() => onViewSetDetail(set)}
                    onToggleActive={() => onToggleSetActive(set.id)}
                    getSetTypeIcon={getSetTypeIcon}
                    getSetTypeLabel={getSetTypeLabel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vocab Sets */}
          {!isLoading && (
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
                {vocabularySets.map((set) => (
                  <VocabSetCard
                    key={set.id}
                    set={set}
                    stats={getSetStats(set)}
                    onStudy={() => onViewSetDetail(set)}
                    onToggleActive={() => onToggleSetActive(set.id)}
                    getSetTypeIcon={getSetTypeIcon}
                    getSetTypeLabel={getSetTypeLabel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
