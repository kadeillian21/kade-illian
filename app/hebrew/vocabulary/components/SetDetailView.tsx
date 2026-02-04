"use client";

import { VocabSet, VocabGroup, HebrewVocabWord } from "../data/types";
import { suggestStudyDays } from "../utils/organizer-v2";

interface SetDetailViewProps {
  selectedSet: VocabSet;
  onReturnToLibrary: () => void;
  onStartStudying: (group: VocabGroup, mode: 'hebrew-to-english' | 'english-to-hebrew') => void;
  onStudyFullSet: (mode: 'hebrew-to-english' | 'english-to-hebrew') => void;
  onStudyNotLearned: (words: HebrewVocabWord[]) => void;
  getCategoryEmoji: (category: string) => string;
  gamificationUI: React.ReactNode;
}

export default function SetDetailView({
  selectedSet,
  onReturnToLibrary,
  onStartStudying,
  onStudyFullSet,
  onStudyNotLearned,
  getCategoryEmoji,
  gamificationUI,
}: SetDetailViewProps) {
  const allWords = selectedSet.groups.flatMap(g => g.words);
  const notLearnedWords = allWords.filter(w => !w.level || w.level === 0);
  const totalWords = selectedSet.groups.reduce((sum, g) => sum + g.words.length, 0);

  return (
    <>
      {gamificationUI}
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
        <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onReturnToLibrary}
              className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Library
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                {selectedSet.title}
              </span>
            </h1>
            <p className="text-lg text-gray-600">{selectedSet.description}</p>
          </div>

          {/* Quick Study Options - Not Learned Words */}
          {notLearnedWords.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-orange-900 mb-1">Not Learned</h3>
                    <p className="text-orange-700">
                      {notLearnedWords.length} word{notLearnedWords.length !== 1 ? 's' : ''} you don't know yet
                    </p>
                  </div>
                  <button
                    onClick={() => onStudyNotLearned(notLearnedWords)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Study Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vocab Groups */}
          <div className="space-y-4 mb-8">
            {selectedSet.groups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
                {/* Group Header */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span>{getCategoryEmoji(group.category)}</span>
                      <span>{group.category}</span>
                    </h3>
                    {group.subcategory && (
                      <p className="text-sm text-gray-600 mt-1 ml-8">{group.subcategory}</p>
                    )}
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-lg font-bold text-gray-800">{group.words.length} words</div>
                    <div className="text-xs text-gray-500">~{suggestStudyDays(group)} day{suggestStudyDays(group) !== 1 ? 's' : ''}</div>
                  </div>
                  <button
                    onClick={() => onStartStudying(group, 'hebrew-to-english')}
                    className="px-5 py-2 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Study This Group
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Review Entire Set Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Review All Together</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Study all {totalWords} words from this set in one session
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onStudyFullSet('hebrew-to-english')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Review: Hebrew → English
              </button>
              <button
                onClick={() => onStudyFullSet('english-to-hebrew')}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-purple-300"
              >
                Review: English → Hebrew
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
