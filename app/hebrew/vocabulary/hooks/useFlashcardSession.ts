"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { HebrewVocabWord, UserProgress } from '../data/types';
import { calculateNextReview } from '../utils/srs-algorithm';

const AUTO_ADVANCE_DELAY_MS = 500;
const SESSION_END_DELAY_MS = 2000;
const FEEDBACK_DURATION_MS = 1000;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface UseFlashcardSessionProps {
  setProgress: React.Dispatch<React.SetStateAction<UserProgress | null>>;
}

export function useFlashcardSession({ setProgress }: UseFlashcardSessionProps) {
  const [cards, setCards] = useState<HebrewVocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cardsStudiedThisSession, setCardsStudiedThisSession] = useState(0);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Use refs for values accessed in timeouts to avoid stale closures
  const currentIndexRef = useRef(currentIndex);
  const cardsRef = useRef(cards);
  const sessionIdRef = useRef(sessionId);
  const cardsStudiedRef = useRef(cardsStudiedThisSession);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { cardsStudiedRef.current = cardsStudiedThisSession; }, [cardsStudiedThisSession]);

  const currentCard = cards[currentIndex] || null;

  const flipCard = useCallback(() => setIsFlipped(prev => !prev), []);

  const nextCard = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % cardsRef.current.length);
    setIsFlipped(false);
  }, []);

  const previousCard = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + cardsRef.current.length) % cardsRef.current.length);
    setIsFlipped(false);
  }, []);

  const shuffle = useCallback(() => {
    const shuffled = [...cardsRef.current];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const startSession = useCallback(async (setId: string | null) => {
    try {
      const response = await fetch('/api/vocab/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId, mode: 'study' }),
      });
      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setCardsStudiedThisSession(0);
      }
    } catch (err) {
      console.error('Error starting session:', err);
    }
  }, []);

  const endSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    try {
      await fetch('/api/vocab/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          cardsStudied: cardsStudiedRef.current,
        }),
      });
      setSessionId(null);
      setCardsStudiedThisSession(0);
    } catch (err) {
      console.error('Error ending session:', err);
    }
  }, []);

  const initCards = useCallback((words: HebrewVocabWord[]) => {
    setCards(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const handleCardResult = useCallback(async (correct: boolean) => {
    const card = cardsRef.current[currentIndexRef.current];
    if (!card) return;

    // Show feedback
    if (correct) {
      setShowCorrectFeedback(true);
      setTimeout(() => setShowCorrectFeedback(false), FEEDBACK_DURATION_MS);
    } else {
      setShowIncorrectFeedback(true);
      setTimeout(() => setShowIncorrectFeedback(false), FEEDBACK_DURATION_MS);
    }

    // Calculate next review with SRS algorithm
    const updatedWord = calculateNextReview(card, correct);
    setCardsStudiedThisSession(prev => prev + 1);

    // Single API call for all updates
    try {
      const response = await fetch('/api/vocab/card-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: updatedWord.id,
          correct,
          level: updatedWord.level,
          nextReview: updatedWord.nextReview,
          lastReviewed: updatedWord.lastReviewed,
          reviewCount: updatedWord.reviewCount,
          correctCount: updatedWord.correctCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update progress state
        setProgress(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              ...data.stats,
            },
            wordProgress: {
              ...prev.wordProgress,
              [updatedWord.id]: {
                level: updatedWord.level,
                nextReview: updatedWord.nextReview || '',
                lastReviewed: updatedWord.lastReviewed || '',
                reviewCount: updatedWord.reviewCount || 0,
                correctCount: updatedWord.correctCount || 0,
              },
            },
          };
        });

        // Handle level up
        if (data.xp?.leveledUp) {
          setNewLevel(data.xp.newLevel);
          setShowLevelUp(true);
        }

        // Handle achievements
        if (data.unlockedAchievements?.length > 0) {
          setAchievements(prev => [...prev, ...data.unlockedAchievements]);
        }
      }
    } catch (err) {
      console.error('Error updating card result:', err);
    }

    // Update current card in state
    const updatedCards = [...cardsRef.current];
    updatedCards[currentIndexRef.current] = updatedWord;
    setCards(updatedCards);

    // Flip card back to front immediately so the next card doesn't flash the answer
    setIsFlipped(false);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentIndexRef.current < cardsRef.current.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setShowConfetti(true);
        setTimeout(() => endSession(), SESSION_END_DELAY_MS);
      }
    }, AUTO_ADVANCE_DELAY_MS);
  }, [setProgress, endSession]);

  const dismissAchievement = useCallback((index: number) => {
    setAchievements(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (cardsRef.current.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') previousCard();
      if (e.key === ' ') {
        e.preventDefault();
        flipCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, previousCard, flipCard]);

  return {
    cards,
    currentIndex,
    currentCard,
    isFlipped,
    sessionId,
    cardsStudiedThisSession,
    showCorrectFeedback,
    showIncorrectFeedback,
    showLevelUp,
    newLevel,
    achievements,
    showConfetti,
    flipCard,
    nextCard,
    previousCard,
    shuffle,
    startSession,
    endSession,
    initCards,
    handleCardResult,
    dismissAchievement,
    setShowLevelUp,
    setShowConfetti,
  };
}
