"use client";

// NOTE: Hebrew words should be selectable/copyable so users can look them up
// Avoid using bg-clip-text on Hebrew text as it clips diacritical marks (nikkud)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HebrewVocabWord, VocabSet, VocabGroup, UserProgress, SetType } from './data/types';
import { getDueWords, getNewWords, calculateNextReview } from './utils/srs-algorithm';
import { suggestStudyDays } from './utils/organizer-v2';
import ProgressDashboard from './components/ProgressDashboard';
import LevelUpModal from './components/LevelUpModal';
import AchievementToast from './components/AchievementToast';
import Confetti from './components/Confetti';
import FlashcardRenderer from './components/FlashcardRenderer';

type ViewMode = 'library' | 'set-detail' | 'flashcards' | 'review' | 'dashboard';
type FlashcardMode = 'hebrew-to-english' | 'english-to-hebrew';

export default function VocabularyPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [activeSetId, setActiveSetIdState] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<VocabGroup | null>(null);
  const [flashcardMode, setFlashcardMode] = useState<FlashcardMode>('hebrew-to-english');
  const [cards, setCards] = useState<HebrewVocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cardsStudiedThisSession, setCardsStudiedThisSession] = useState(0);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Helper: Refresh progress data for words after update
  // Words now come from DB with progress already attached, but we need to
  // update them after marking correct/incorrect in the same session
  const refreshWordProgress = (word: HebrewVocabWord, wordId: string) => {
    if (!progress || !progress.wordProgress || !progress.wordProgress[wordId]) {
      return word;
    }

    const updatedProgress = progress.wordProgress[wordId];
    return {
      ...word,
      level: updatedProgress.level,
      nextReview: updatedProgress.nextReview,
      lastReviewed: updatedProgress.lastReviewed,
      reviewCount: updatedProgress.reviewCount,
      correctCount: updatedProgress.correctCount,
    };
  };

  // Load vocab sets and progress from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch vocab sets
        const setsResponse = await fetch('/api/vocab/sets');
        if (!setsResponse.ok) {
          throw new Error('Failed to fetch vocab sets');
        }
        const sets = await setsResponse.json();

        // Validate response is an array
        if (!Array.isArray(sets)) {
          console.error('Invalid vocab sets response:', sets);
          setVocabSets([]);
        } else {
          setVocabSets(sets);

          // Set active set (first active one, or first set)
          const activeSet = sets.find((s: any) => s.isActive) || sets[0];
          if (activeSet) {
            setActiveSetIdState(activeSet.id);
          }
        }

        // Fetch progress
        const progressResponse = await fetch('/api/vocab/progress');
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress');
        }
        const progressData = await progressResponse.json();
        setProgress(progressData);
      } catch (error) {
        console.error('Error loading data:', error);
        setVocabSets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate stats for each vocab set
  const getSetStats = (set: VocabSet) => {
    if (!set.groups || set.groups.length === 0) {
      return { total: 0, new: 0, due: 0 };
    }

    // Words already have progress data from DB
    const allWords = set.groups.flatMap(g => g.words || []);
    const newWords = getNewWords(allWords);
    const dueWords = getDueWords(allWords);

    return {
      total: allWords.length,
      new: newWords.length,
      due: dueWords.length,
    };
  };

  // Get all due words across all sets
  const getAllDueWords = () => {
    if (!vocabSets || vocabSets.length === 0) return [];

    // Words already have progress data from DB
    const allWords = vocabSets.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
    return getDueWords(allWords);
  };

  // Get all words across all sets
  const getAllWords = () => {
    if (!vocabSets || vocabSets.length === 0) return [];

    return vocabSets.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
  };

  // Toggle set active status (allows multiple active sets)
  const toggleSetActive = async (setId: string) => {
    try {
      const response = await fetch('/api/vocab/sets/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update vocabSets state
        setVocabSets(prev => prev.map(s => ({
          ...s,
          isActive: s.id === setId ? data.isActive : s.isActive,
        })));
      }
    } catch (error) {
      console.error('Error toggling set:', error);
    }
  };

  // Get all active sets
  const getActiveSets = () => {
    return vocabSets.filter(set => set.isActive);
  };

  // Get all due words from active sets only
  const getDueWordsFromActiveSets = () => {
    const activeSets = getActiveSets();
    if (activeSets.length === 0) return getAllDueWords();

    const activeWords = activeSets.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
    return getDueWords(activeWords);
  };

  const viewSetDetail = async (set: VocabSet) => {
    try {
      // Fetch full set with all words from database
      const response = await fetch(`/api/vocab/sets/${set.id}`);
      const fullSet = await response.json();
      setSelectedSet(fullSet);
      setViewMode('set-detail');
    } catch (error) {
      console.error('Error loading set:', error);
      // Fallback to using the set as-is
      setSelectedSet(set);
      setViewMode('set-detail');
    }
  };

  // Session management
  const startSession = async () => {
    try {
      const response = await fetch('/api/vocab/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setId: selectedSet?.id || null,
          mode: 'study',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setCardsStudiedThisSession(0);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/vocab/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cardsStudied: cardsStudiedThisSession,
        }),
      });
      setSessionId(null);
      setCardsStudiedThisSession(0);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Auto-start session when entering flashcard mode
  useEffect(() => {
    if ((viewMode === 'flashcards' || viewMode === 'review') && !sessionId) {
      startSession();
    }
  }, [viewMode]);

  // Auto-end session when leaving study mode
  useEffect(() => {
    return () => {
      if (sessionId) {
        endSession();
      }
    };
  }, [sessionId]);

  const startStudying = (group: VocabGroup, mode: FlashcardMode) => {
    setSelectedGroup(group);
    setFlashcardMode(mode);
    // Words already have progress data from DB
    setCards(group.words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('flashcards');
  };

  const studyFullSet = (mode: FlashcardMode) => {
    if (!selectedSet) return;
    setSelectedGroup(null);
    setFlashcardMode(mode);
    // Words already have progress data from DB
    const allWords = selectedSet.groups.flatMap(g => g.words);
    setCards(allWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('flashcards');
  };

  const startReviewMode = () => {
    const dueWords = getDueWordsFromActiveSets();
    setCards(dueWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setFlashcardMode('hebrew-to-english');
    setViewMode('review');
  };

  const returnToLibrary = () => {
    setViewMode('library');
    setSelectedSet(null);
    setSelectedGroup(null);
    setCards([]);
  };

  const returnToSetDetail = () => {
    setViewMode('set-detail');
    setSelectedGroup(null);
    setCards([]);
  };

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      'Noun': '📦',
      'Nouns': '📦',
      'Verb': '⚡',
      'Verbs': '⚡',
      'Adjective': '🎨',
      'Preposition': '🔗',
      'Prepositions': '🔗',
      'Particle': '✨',
      'Particles': '✨',
      'Number': '🔢',
      'Pronoun': '👤',
      'Adverb': '⏩',
      'Conjunction': '➕',
      'Conjunctions': '➕',
      'Articles': '📰',
      'Combined Forms': '🔀',
      'Punctuation': '.',
      'Consonants': 'א',
      'Vowels': '◌ָ',
      'Syllables': '🎯',
    };
    return emojiMap[category] || '📝';
  };

  const getSetTypeIcon = (setType?: string): string => {
    const iconMap: Record<string, string> = {
      'vocabulary': '📚',
      'alphabet': 'א',
      'syllables': '🎯',
      'grammar': '📖',
    };
    return iconMap[setType || 'vocabulary'] || '📚';
  };

  const getSetTypeLabel = (setType?: string): string => {
    const labelMap: Record<string, string> = {
      'vocabulary': 'Vocabulary',
      'alphabet': 'Alphabet',
      'syllables': 'Syllables',
      'grammar': 'Grammar',
    };
    return labelMap[setType || 'vocabulary'] || 'Vocabulary';
  };

  // Flashcard functions
  const flipCard = () => setIsFlipped(!isFlipped);
  const nextCard = () => {
    setCurrentIndex((currentIndex + 1) % cards.length);
    setIsFlipped(false);
  };
  const previousCard = () => {
    setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };
  const shuffle = () => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // SRS Handlers
  const handleCorrect = async () => {
    if (!currentCard) return;

    // Show positive feedback
    setShowCorrectFeedback(true);
    setTimeout(() => setShowCorrectFeedback(false), 1000);

    // Calculate next review with SRS algorithm
    const updatedWord = calculateNextReview(currentCard, true);

    // Increment cards studied counter
    setCardsStudiedThisSession(prev => prev + 1);

    // OPTIMISTIC UPDATE: Update UI state immediately
    const updatedCards = [...cards];
    updatedCards[currentIndex] = updatedWord;
    setCards(updatedCards);

    // Update progress state optimistically
    setProgress((prev: any) => ({
      ...prev,
      wordProgress: {
        ...prev.wordProgress,
        [updatedWord.id]: {
          level: updatedWord.level,
          nextReview: updatedWord.nextReview,
          lastReviewed: updatedWord.lastReviewed,
          reviewCount: updatedWord.reviewCount,
          correctCount: updatedWord.correctCount,
        },
      },
    }));

    // Auto-advance to next card IMMEDIATELY (don't wait for API)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        nextCard();
      } else {
        // 🎉 Last card - session complete! Trigger confetti!
        setShowConfetti(true);
        setTimeout(() => endSession(), 2000);
        setIsFlipped(false);
      }
    }, 500);

    // Make API calls in the background (non-blocking)
    // These happen AFTER the UI has already updated
    (async () => {
      try {
        const response = await fetch('/api/vocab/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordId: updatedWord.id,
            correct: true,
            level: updatedWord.level,
            nextReview: updatedWord.nextReview,
            lastReviewed: updatedWord.lastReviewed,
            reviewCount: updatedWord.reviewCount,
            correctCount: updatedWord.correctCount,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Update stats with DB response
          setProgress((prev: any) => ({
            ...prev,
            stats: data.stats,
          }));

          // 🎉 Award XP for correct answer!
          try {
            const xpResponse = await fetch('/api/vocab/xp/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                xpAmount: 10, // 10 XP per correct card
                reason: 'correct_answer',
              }),
            });

            if (xpResponse.ok) {
              const xpData = await xpResponse.json();

              // Check for level up!
              if (xpData.leveledUp) {
                setNewLevel(xpData.newLevel);
                setShowLevelUp(true);
              }

              // Check for new achievements!
              if (xpData.unlockedAchievements && xpData.unlockedAchievements.length > 0) {
                setAchievements(prev => [...prev, ...xpData.unlockedAchievements]);
              }

              // Update stats with new XP/level
              setProgress((prev: any) => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  xp: xpData.totalXP,
                  level: xpData.level,
                },
              }));
            }
          } catch (xpError) {
            console.error('Error awarding XP:', xpError);
          }

          // Update daily goal progress
          try {
            const goalResponse = await fetch('/api/vocab/daily-goal/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cardsStudied: 1 }),
            });

            if (goalResponse.ok) {
              const goalData = await goalResponse.json();
              setProgress((prev: any) => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  cardsToday: goalData.cardsToday,
                },
              }));
            }
          } catch (goalError) {
            console.error('Error updating daily goal:', goalError);
          }
        }
      } catch (error) {
        console.error('Error updating progress:', error);
        // Could add a toast notification here for failed updates
      }
    })();
  };

  const handleIncorrect = async () => {
    if (!currentCard) return;

    // Show negative feedback
    setShowIncorrectFeedback(true);
    setTimeout(() => setShowIncorrectFeedback(false), 1000);

    // Calculate next review with SRS algorithm (marked incorrect)
    const updatedWord = calculateNextReview(currentCard, false);

    // Increment cards studied counter
    setCardsStudiedThisSession(prev => prev + 1);

    // OPTIMISTIC UPDATE: Update UI state immediately
    const updatedCards = [...cards];
    updatedCards[currentIndex] = updatedWord;
    setCards(updatedCards);

    // Update progress state optimistically
    setProgress((prev: any) => ({
      ...prev,
      wordProgress: {
        ...prev.wordProgress,
        [updatedWord.id]: {
          level: updatedWord.level,
          nextReview: updatedWord.nextReview,
          lastReviewed: updatedWord.lastReviewed,
          reviewCount: updatedWord.reviewCount,
          correctCount: updatedWord.correctCount,
        },
      },
    }));

    // Auto-advance to next card IMMEDIATELY (don't wait for API)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        nextCard();
      } else {
        // 🎉 Last card - session complete! Trigger confetti!
        setShowConfetti(true);
        setTimeout(() => endSession(), 2000);
        setIsFlipped(false);
      }
    }, 500);

    // Make API calls in the background (non-blocking)
    // These happen AFTER the UI has already updated
    (async () => {
      try {
        const response = await fetch('/api/vocab/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordId: updatedWord.id,
            correct: false,
            level: updatedWord.level,
            nextReview: updatedWord.nextReview,
            lastReviewed: updatedWord.lastReviewed,
            reviewCount: updatedWord.reviewCount,
            correctCount: updatedWord.correctCount,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Update stats with DB response
          setProgress((prev: any) => ({
            ...prev,
            stats: data.stats,
          }));

          // Update daily goal progress (even for incorrect - you still studied!)
          try {
            const goalResponse = await fetch('/api/vocab/daily-goal/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cardsStudied: 1 }),
            });

            if (goalResponse.ok) {
              const goalData = await goalResponse.json();
              setProgress((prev: any) => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  cardsToday: goalData.cardsToday,
                },
              }));
            }
          } catch (goalError) {
            console.error('Error updating daily goal:', goalError);
          }
        }
      } catch (error) {
        console.error('Error updating progress:', error);
        // Could add a toast notification here for failed updates
      }
    })();
  };


  // Keyboard navigation
  useEffect(() => {
    if (viewMode !== 'flashcards' && viewMode !== 'review') return;

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
  }, [currentIndex, cards.length, viewMode]);

  const currentCard = cards[currentIndex];
  const totalDueWords = getDueWordsFromActiveSets().length;
  const activeSetsCount = getActiveSets().length;

  // Gamification UI (rendered above everything)
  const gamificationUI = (
    <>
      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          level={newLevel}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {/* Achievement Toasts */}
      {achievements.map((achievement, index) => (
        <AchievementToast
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => {
            setAchievements(prev => prev.filter((_, i) => i !== index));
          }}
        />
      ))}

      {/* Confetti on session complete */}
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </>
  );

  // VIEW: Dashboard (Progress & Stats)
  if (viewMode === 'dashboard' && progress) {
    return (
      <>
        {gamificationUI}
        <ProgressDashboard
          progress={progress}
          allWords={getAllWords()}
          onStartStudy={returnToLibrary}
        />
      </>
    );
  }

  // VIEW: Library (Landing Page)
  if (viewMode === 'library') {
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
              <button
                onClick={() => setViewMode('dashboard')}
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
                      💡 Tip: Mark sets as "Active" to focus your reviews
                    </p>
                  )}
                </div>
                <button
                  onClick={startReviewMode}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Start Review
                </button>
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
                {vocabSets.map((set) => {
                  const stats = getSetStats(set);
                  const isActive = set.isActive;

                return (
                  <div
                    key={set.id}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                      isActive ? 'border-green-400 bg-gradient-to-br from-green-50 to-white' : 'border-white/50'
                    }`}
                  >
                    {/* Active Badge */}
                    {isActive && (
                      <div className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3">
                        ✓ ACTIVE
                      </div>
                    )}

                    {/* Set Type Badge */}
                    {(set as any).setType && (set as any).setType !== 'vocabulary' && (
                      <div className="inline-block px-3 py-1 bg-[#4a5d49]/10 text-[#4a5d49] text-xs font-bold rounded-full mb-3 ml-2">
                        {getSetTypeIcon((set as any).setType)} {getSetTypeLabel((set as any).setType)}
                      </div>
                    )}

                    {/* Set Info */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">{getSetTypeIcon((set as any).setType)}</span>
                      <span>{set.title}</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{set.description}</p>

                    {/* Stats */}
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

                    {/* Actions */}
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => viewSetDetail(set)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        Study
                      </button>
                      <button
                        onClick={() => toggleSetActive(set.id)}
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
      </>
    );
  }

  // VIEW: Set Detail (Organized Groups)
  if (viewMode === 'set-detail' && selectedSet) {
    return (
      <>
        {gamificationUI}
        <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
        <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={returnToLibrary}
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
                    onClick={() => startStudying(group, 'hebrew-to-english')}
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
              Study all {selectedSet.groups.reduce((sum, g) => sum + g.words.length, 0)} words from this set in one session
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => studyFullSet('hebrew-to-english')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Review: Hebrew → English
              </button>
              <button
                onClick={() => studyFullSet('english-to-hebrew')}
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

  // VIEW: Flashcards or Review Mode
  const isReviewMode = viewMode === 'review';
  const backAction = isReviewMode ? returnToLibrary : returnToSetDetail;

  let title = 'Study Session';
  let subtitle = '';

  if (isReviewMode) {
    title = 'Review Session';
    subtitle = 'Words due for review';
  } else if (selectedGroup) {
    title = `${getCategoryEmoji(selectedGroup.category)} ${selectedGroup.category}`;
    subtitle = selectedGroup.subcategory || '';
  } else if (selectedSet) {
    title = `${selectedSet.title} - Full Review`;
    subtitle = `All ${cards.length} words`;
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
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                      <span className="text-2xl">❌</span>
                      <span>Need Practice</span>
                    </button>
                    <button
                      onClick={handleCorrect}
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
