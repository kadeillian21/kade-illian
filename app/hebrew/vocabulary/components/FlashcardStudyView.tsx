"use client";

import { VocabSet, VocabGroup, HebrewVocabWord } from "../data/types";
import FlashcardRenderer from "./FlashcardRenderer";

type FlashcardMode = 'hebrew-to-english' | 'english-to-hebrew';

interface FlashcardStudyViewProps {
  cards: HebrewVocabWord[];
  currentIndex: number;
  isFlipped: boolean;
  flashcardMode: FlashcardMode;
  viewMode: 'flashcards' | 'review';
  isNotLearnedOnlyMode: boolean;
  selectedGroup: VocabGroup | null;
  selectedSet: VocabSet | null;
  onFlipCard: () => void;
  onNextCard: () => void;
  onPreviousCard: () => void;
  onShuffle: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  onBackToLibrary: () => void;
  onBackToSetDetail: () => void;
  getCategoryEmoji: (category: string) => string;
  gamificationUI: React.ReactNode;
}

export default function FlashcardStudyView({
  cards,
  currentIndex,
  isFlipped,
  flashcardMode,
  viewMode,
  isNotLearnedOnlyMode,
  selectedGroup,
  selectedSet,
  onFlipCard,
  onNextCard,
  onPreviousCard,
  onShuffle,
  onCorrect,
  onIncorrect,
  onBackToLibrary,
  onBackToSetDetail,
  getCategoryEmoji,
  gamificationUI,
}: FlashcardStudyViewProps) {
  const isReviewMode = viewMode === 'review';
  const backAction = isReviewMode ? onBackToLibrary : onBackToSetDetail;
  const currentCard = cards[currentIndex];

  let title = 'Study Session';
  let subtitle = '';

  if (isReviewMode) {
    title = isNotLearnedOnlyMode ? 'Learning New Words' : 'Review Session';
    subtitle = isNotLearnedOnlyMode ? `${cards.length} word${cards.length !== 1 ? 's' : ''} to learn` : 'Words due for review';
  } else if (selectedGroup) {
    title = `${getCategoryEmoji(selectedGroup.category)} ${selectedGroup.category}`;
    subtitle = selectedGroup.subcategory || '';
  } else if (selectedSet) {
    title = isNotLearnedOnlyMode ? `${selectedSet.title} - Not Learned` : `${selectedSet.title} - Full Review`;
    subtitle = isNotLearnedOnlyMode ? `${cards.length} word${cards.length !== 1 ? 's' : ''} to learn` : `All ${cards.length} words`;
  }

  return (
    <>
      {gamificationUI}
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
        <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={backAction}
                className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {isReviewMode ? 'Back to Library' : 'Back to Set'}
              </button>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
              {subtitle && (
                <p className="text-md text-gray-600">{subtitle}</p>
              )}
            </div>

            {/* Progress Bar */}
            {cards.length > 0 && (
              <>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                      {currentIndex + 1} / {cards.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6b7d6a] to-[#8a9a8a] rounded-full transition-all duration-300 shadow-md"
                      style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Flashcard */}
                {currentCard && (
                  <div className="mb-6">
                    {/* Use FlashcardRenderer for special card types, or inline for vocab with direction */}
                    {currentCard.cardType && currentCard.cardType !== 'vocabulary' ? (
                      <FlashcardRenderer
                        word={currentCard}
                        isFlipped={isFlipped}
                        onFlip={onFlipCard}
                      />
                    ) : (
                      <div
                        className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl min-h-[400px] flex items-center justify-center ${
                          isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-pink-50 to-purple-50' : 'border-[#d4c5b0]'
                        }`}
                        onClick={onFlipCard}
                      >
                        {!isFlipped ? (
                          // Front of card
                          <div className="p-12 text-center">
                            {flashcardMode === 'hebrew-to-english' ? (
                              <div
                                className="text-7xl md:text-8xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-4 select-text cursor-text"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {currentCard.hebrew}
                              </div>
                            ) : (
                              <div className="text-5xl md:text-6xl font-bold text-gray-900">
                                {currentCard.english}
                              </div>
                            )}
                            <div className="text-gray-400 italic text-lg mt-6">
                              Click to reveal answer
                            </div>
                          </div>
                        ) : (
                          // Back of card
                          <div className="p-12 text-center">
                            <div
                              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 select-text cursor-text"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {flashcardMode === 'hebrew-to-english' ? currentCard.english : (
                                <span className="font-[family-name:var(--font-hebrew)]">{currentCard.hebrew}</span>
                              )}
                            </div>
                            <div className="text-2xl text-gray-600 italic mb-4">
                              ({currentCard.trans})
                            </div>
                            <div className="text-lg text-gray-700 font-medium mb-4">
                              {currentCard.type}
                            </div>
                            <div className="text-base text-gray-600 leading-relaxed">
                              {currentCard.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SRS Buttons (shown when card is flipped) */}
                {isFlipped && currentCard && (
                  <div className="mb-6">
                    <p className="text-center text-lg font-semibold text-gray-700 mb-3">
                      Did you get it right?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={onIncorrect}
                        className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                      >
                        <span className="text-2xl">❌</span>
                        <span>Need Practice</span>
                      </button>
                      <button
                        onClick={onCorrect}
                        className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                      >
                        <span className="text-2xl">✓</span>
                        <span>Got It!</span>
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      This helps track your progress and schedule reviews
                    </p>
                  </div>
                )}

                {/* Hint */}
                <div className="text-center text-sm text-gray-600 mb-6">
                  {isFlipped ? 'Mark your answer above' : 'Click card to flip - Arrow keys to navigate - Space to flip'}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={onPreviousCard}
                    className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={onShuffle}
                    className="px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Shuffle
                  </button>
                  <button
                    onClick={onNextCard}
                    className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {cards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No words to study right now!</p>
                <button
                  onClick={backAction}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Back to {isReviewMode ? 'Library' : 'Vocabulary Set'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
