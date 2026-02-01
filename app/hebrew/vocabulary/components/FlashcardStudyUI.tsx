'use client';

import { useState, useEffect } from 'react';
import { HebrewVocabWord } from '../data/types';
import FlashcardRenderer from './FlashcardRenderer';
import { calculateNextReview } from '../utils/srs-algorithm';

export type FlashcardMode = 'hebrew-to-english' | 'english-to-hebrew';

interface FlashcardStudyUIProps {
  cards: HebrewVocabWord[];
  initialIndex?: number;
  flashcardMode?: FlashcardMode;
  onComplete?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backButtonLabel?: string;
  title?: string;
  subtitle?: string;
  autoAdvanceOnCorrect?: boolean;
  isNotLearnedOnlyMode?: boolean;
}

/**
 * The EXACT flashcard study UI used in the main vocabulary page.
 * This component handles:
 * - Progress bar
 * - Flashcard display (with flip)
 * - SRS marking (Need Practice / Got It!)
 * - Navigation (Previous / Shuffle / Next)
 * - Keyboard shortcuts
 */
export default function FlashcardStudyUI({
  cards,
  initialIndex = 0,
  flashcardMode = 'hebrew-to-english',
  onComplete,
  showBackButton = true,
  onBack,
  backButtonLabel = 'Back',
  title,
  subtitle,
  autoAdvanceOnCorrect = false,
  isNotLearnedOnlyMode = false,
}: FlashcardStudyUIProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<HebrewVocabWord[]>(cards);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);

  const currentCard = studyCards[currentIndex];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        previousCard();
      } else if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === ' ') {
        e.preventDefault();
        flipCard();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, studyCards, isFlipped]);

  const flipCard = () => setIsFlipped(!isFlipped);

  const nextCard = () => {
    setCurrentIndex((currentIndex + 1) % studyCards.length);
    setIsFlipped(false);
  };

  const previousCard = () => {
    setCurrentIndex((currentIndex - 1 + studyCards.length) % studyCards.length);
    setIsFlipped(false);
  };

  const shuffle = () => {
    const shuffled = [...studyCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleCorrect = async () => {
    if (!currentCard) return;

    // Show positive feedback
    setShowCorrectFeedback(true);
    setTimeout(() => setShowCorrectFeedback(false), 1000);

    // Calculate next review with SRS algorithm
    const updatedWord = calculateNextReview(currentCard, true);

    // Update progress in database
    try {
      await fetch('/api/vocab/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: updatedWord.id,
          level: updatedWord.level,
          nextReview: updatedWord.nextReview,
          lastReviewed: updatedWord.lastReviewed,
          reviewCount: updatedWord.reviewCount,
          correctCount: updatedWord.correctCount,
        }),
      });

      // Update local state
      const updatedCards = [...studyCards];
      updatedCards[currentIndex] = updatedWord;

      // If in "not learned only" mode, remove learned cards
      if (isNotLearnedOnlyMode && updatedWord.level > 0) {
        const filteredCards = updatedCards.filter((_, idx) => idx !== currentIndex);
        setStudyCards(filteredCards);

        if (filteredCards.length === 0) {
          // All cards learned!
          setTimeout(() => {
            onComplete?.();
          }, 1000);
        } else if (currentIndex >= filteredCards.length) {
          setCurrentIndex(filteredCards.length - 1);
          setIsFlipped(false);
        } else {
          setIsFlipped(false);
        }
      } else {
        setStudyCards(updatedCards);
        if (autoAdvanceOnCorrect) {
          setTimeout(() => {
            nextCard();
          }, 800);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleIncorrect = async () => {
    if (!currentCard) return;

    // Show negative feedback
    setShowIncorrectFeedback(true);
    setTimeout(() => setShowIncorrectFeedback(false), 1000);

    // Calculate next review with SRS algorithm (marked as incorrect)
    const updatedWord = calculateNextReview(currentCard, false);

    // Update progress in database
    try {
      await fetch('/api/vocab/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: updatedWord.id,
          level: updatedWord.level,
          nextReview: updatedWord.nextReview,
          lastReviewed: updatedWord.lastReviewed,
          reviewCount: updatedWord.reviewCount,
          correctCount: updatedWord.correctCount,
        }),
      });

      // Update local state
      const updatedCards = [...studyCards];
      updatedCards[currentIndex] = updatedWord;
      setStudyCards(updatedCards);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (studyCards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-2xl font-bold text-gray-800 mb-2">All Done!</p>
        <p className="text-lg text-gray-600 mb-6">
          {isNotLearnedOnlyMode ? "You've learned all the words!" : "No more cards to study."}
        </p>
        {onComplete && (
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      {(title || subtitle || showBackButton) && (
        <div className="text-center mb-8">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {backButtonLabel}
            </button>
          )}
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
          )}
          {subtitle && <p className="text-md text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg border border-white/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-semibold bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
            {currentIndex + 1} / {studyCards.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6b7d6a] to-[#8a9a8a] rounded-full transition-all duration-300 shadow-md"
            style={{ width: `${((currentIndex + 1) / studyCards.length) * 100}%` }}
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
              onFlip={flipCard}
            />
          ) : (
            <div
              className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl min-h-[400px] flex items-center justify-center ${
                isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-pink-50 to-purple-50' : 'border-[#d4c5b0]'
              }`}
              onClick={flipCard}
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
                  {currentCard.extraData?.pronunciation && (
                    <div className="text-xl text-purple-600 font-medium mb-4">
                      Pronunciation: {currentCard.extraData.pronunciation}
                    </div>
                  )}
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
              onClick={handleIncorrect}
              disabled={showIncorrectFeedback || showCorrectFeedback}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
            >
              <span className="text-2xl">❌</span>
              <span>Need Practice</span>
            </button>
            <button
              onClick={handleCorrect}
              disabled={showIncorrectFeedback || showCorrectFeedback}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
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
          onClick={previousCard}
          className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
        >
          Previous
        </button>
        <button
          onClick={shuffle}
          className="px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          Shuffle
        </button>
        <button
          onClick={nextCard}
          className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
        >
          Next
        </button>
      </div>

      {/* Feedback overlays */}
      {showCorrectFeedback && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-8xl animate-bounce">✅</div>
        </div>
      )}
      {showIncorrectFeedback && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-8xl animate-bounce">❌</div>
        </div>
      )}
    </div>
  );
}
