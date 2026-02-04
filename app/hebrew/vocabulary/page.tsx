"use client";

// NOTE: Hebrew words should be selectable/copyable so users can look them up
// Avoid using bg-clip-text on Hebrew text as it clips diacritical marks (nikkud)

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HebrewVocabWord, VocabSet, VocabGroup, UserProgress, SetType } from './data/types';
import { getDueWords, getNewWords, getWordsToStudy, calculateNextReview } from './utils/srs-algorithm';
import { suggestStudyDays } from './utils/organizer-v2';
import ProgressDashboard from './components/ProgressDashboard';
import LevelUpModal from './components/LevelUpModal';
import AchievementToast from './components/AchievementToast';
import Confetti from './components/Confetti';
import FlashcardRenderer from './components/FlashcardRenderer';
import LibraryView from './components/LibraryView';
import SetDetailView from './components/SetDetailView';
import FlashcardStudyView from './components/FlashcardStudyView';

type ViewMode = 'library' | 'set-detail' | 'flashcards' | 'review' | 'dashboard';
type FlashcardMode = 'hebrew-to-english' | 'english-to-hebrew';

// Wrapper component to handle Suspense boundary for useSearchParams
export default function VocabularyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#4a5d49]"></div>
          <p className="mt-4 text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    }>
      <VocabularyPageContent />
    </Suspense>
  );
}

function VocabularyPageContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [activeSetId, setActiveSetIdState] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [pendingSetId, setPendingSetId] = useState<string | null>(null);
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
  const [isNotLearnedOnlyMode, setIsNotLearnedOnlyMode] = useState(false);

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

  useEffect(() => {
    loadData();
    // Check for ?set= query parameter
    const setParam = searchParams.get('set');
    if (setParam) {
      setPendingSetId(setParam);
    }
  }, [searchParams]);

  // Handle opening a specific set when data is loaded
  useEffect(() => {
    if (pendingSetId && vocabSets.length > 0 && !isLoading) {
      const targetSet = vocabSets.find(s => s.id === pendingSetId);
      if (targetSet) {
        setSelectedSet(targetSet);
        setViewMode('set-detail');
        setPendingSetId(null);
      }
    }
  }, [pendingSetId, vocabSets, isLoading]);

  // Calculate stats for each vocab set
  const getSetStats = (set: VocabSet) => {
    if (!set.groups || set.groups.length === 0) {
      return { total: 0, notLearned: 0, learned: 0 };
    }

    // Words already have progress data from DB
    const allWords = set.groups.flatMap(g => g.words || []);
    const notLearnedWords = allWords.filter(w => !w.level || w.level === 0);
    const learnedWords = allWords.filter(w => (w.level || 0) >= 1);

    return {
      total: allWords.length,
      notLearned: notLearnedWords.length,
      learned: learnedWords.length,
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

  // Get all words to study (new + due) across all sets
  const getAllWordsToStudy = () => {
    if (!vocabSets || vocabSets.length === 0) return [];

    const allWords = vocabSets.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
    return getWordsToStudy(allWords);
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

  // Get all words to study from active sets (new + due)
  const getWordsToStudyFromActiveSets = () => {
    const activeSets = getActiveSets();
    if (activeSets.length === 0) return getAllWordsToStudy();

    const activeWords = activeSets.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
    return getWordsToStudy(activeWords);
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

  // NOTE: Automatic session time tracking has been REMOVED to prevent double-counting.
  // Time is now tracked solely by HebrewStatsNavbar which saves to study_sessions every 30 seconds.
  // The startSession/endSession functions are kept for tracking cards studied per session,
  // but they no longer record time to the database (that's handled by the navbar timer).

  const startStudying = (group: VocabGroup, mode: FlashcardMode) => {
    setSelectedGroup(group);
    setFlashcardMode(mode);
    // Words already have progress data from DB
    setCards(group.words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('flashcards');
    setIsNotLearnedOnlyMode(false);
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
    setIsNotLearnedOnlyMode(false);
  };

  const studyNewWords = (mode: FlashcardMode) => {
    if (!selectedSet) return;
    setSelectedGroup(null);
    setFlashcardMode(mode);
    // Get only new words (level 0 or undefined)
    const allWords = selectedSet.groups.flatMap(g => g.words);
    const newWords = getNewWords(allWords);
    setCards(newWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('flashcards');
    setIsNotLearnedOnlyMode(true); // This is also "not learned only" mode
  };

  const studyDueWords = (mode: FlashcardMode) => {
    if (!selectedSet) return;
    setSelectedGroup(null);
    setFlashcardMode(mode);
    // Get only due words
    const allWords = selectedSet.groups.flatMap(g => g.words);
    const dueWords = getDueWords(allWords);
    setCards(dueWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('flashcards');
    setIsNotLearnedOnlyMode(false);
  };

  const studyWeakWords = (mode: FlashcardMode) => {
    if (!selectedSet) return;
    setSelectedGroup(null);
    setFlashcardMode(mode);
    // Get weak words (level 0-2) - words you're still learning/struggling with
    const allWords = selectedSet.groups.flatMap(g => g.words);
    const weakWords = allWords.filter(word => (word.level || 0) <= 2);
    setCards(weakWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('flashcards');
    setIsNotLearnedOnlyMode(false);
  };

  const startReviewMode = () => {
    // Get words from active sets
    const activeSets = getActiveSets();
    const activeWords = activeSets.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
    // Only study words at level 0 (not learned)
    const notLearnedWords = activeWords.filter(w => !w.level || w.level === 0);
    setCards(notLearnedWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setFlashcardMode('hebrew-to-english');
    setViewMode('review');
    setIsNotLearnedOnlyMode(true); // Flag that we're in "not learned only" mode
  };

  const returnToLibrary = async () => {
    setViewMode('library');
    setSelectedSet(null);
    setSelectedGroup(null);
    setCards([]);
    setIsNotLearnedOnlyMode(false);

    // Refresh data to get updated progress counts
    await loadData();
  };

  const returnToSetDetail = async () => {
    setViewMode('set-detail');
    setSelectedGroup(null);
    setCards([]);
    setIsNotLearnedOnlyMode(false);

    // Refresh the selected set to get updated progress
    if (selectedSet) {
      try {
        const response = await fetch(`/api/vocab/sets/${selectedSet.id}`);
        const fullSet = await response.json();
        setSelectedSet(fullSet);
      } catch (error) {
        console.error('Error refreshing set:', error);
      }
    }
  };

  const goToDashboard = async () => {
    setViewMode('dashboard');
    // Refresh data to get updated progress
    await loadData();
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
      'foundational': '🏛️',
      'lesson': '📝',
    };
    return iconMap[setType || 'vocabulary'] || '📚';
  };

  const getSetTypeLabel = (setType?: string): string => {
    const labelMap: Record<string, string> = {
      'vocabulary': 'Vocabulary',
      'alphabet': 'Alphabet',
      'syllables': 'Syllables',
      'grammar': 'Grammar',
      'foundational': 'Foundation',
      'lesson': 'Lesson Practice',
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

    // If reviewing "not learned" words only, remove this card since it's now learned
    if (isNotLearnedOnlyMode) {
      // Remove the now-learned card from the session
      const updatedCards = cards.filter((_, idx) => idx !== currentIndex);
      setCards(updatedCards);

      // Auto-advance IMMEDIATELY
      setTimeout(() => {
        if (updatedCards.length === 0) {
          // 🎉 All cards learned! Trigger confetti!
          setShowConfetti(true);
          setTimeout(() => endSession(), 2000);
        } else if (currentIndex >= updatedCards.length) {
          // Was on last card, stay on new last card
          setCurrentIndex(updatedCards.length - 1);
          setIsFlipped(false);
        } else {
          // Stay on same index (which now shows the next card)
          setIsFlipped(false);
        }
      }, 500);
    } else {
      // Regular mode: just update the card in place
      const updatedCards = [...cards];
      updatedCards[currentIndex] = updatedWord;
      setCards(updatedCards);

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
    }

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
  const activeSets = getActiveSets();
  const activeSetsCount = activeSets.length;

  // Get stats for active sets only
  const activeSetWords = activeSets.flatMap(set =>
    (set.groups || []).flatMap(group => group.words || [])
  );
  const totalNotLearned = activeSetWords.filter(w => !w.level || w.level === 0).length;
  const totalLearned = activeSetWords.filter(w => (w.level || 0) >= 1).length;
  const totalActiveWords = activeSetWords.length;

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
      <LibraryView
        vocabSets={vocabSets}
        isLoading={isLoading}
        totalNotLearned={totalNotLearned}
        activeSetsCount={activeSetsCount}
        getSetStats={getSetStats}
        getSetTypeIcon={getSetTypeIcon}
        getSetTypeLabel={getSetTypeLabel}
        onViewSetDetail={viewSetDetail}
        onToggleSetActive={toggleSetActive}
        onStartReviewMode={startReviewMode}
        onGoToDashboard={goToDashboard}
        gamificationUI={gamificationUI}
      />
    );
  }

  // VIEW: Set Detail (Organized Groups)
  if (viewMode === 'set-detail' && selectedSet) {
    const handleStudyNotLearned = (words: HebrewVocabWord[]) => {
      setCards(words);
      setCurrentIndex(0);
      setIsFlipped(false);
      setFlashcardMode('hebrew-to-english');
      setViewMode('flashcards');
      setIsNotLearnedOnlyMode(true);
    };

    return (
      <SetDetailView
        selectedSet={selectedSet}
        onReturnToLibrary={returnToLibrary}
        onStartStudying={startStudying}
        onStudyFullSet={studyFullSet}
        onStudyNotLearned={handleStudyNotLearned}
        getCategoryEmoji={getCategoryEmoji}
        gamificationUI={gamificationUI}
      />
    );
  }

  // VIEW: Flashcards or Review Mode
  return (
    <FlashcardStudyView
      cards={cards}
      currentIndex={currentIndex}
      isFlipped={isFlipped}
      flashcardMode={flashcardMode}
      viewMode={viewMode as 'flashcards' | 'review'}
      isNotLearnedOnlyMode={isNotLearnedOnlyMode}
      selectedGroup={selectedGroup}
      selectedSet={selectedSet}
      onFlipCard={flipCard}
      onNextCard={nextCard}
      onPreviousCard={previousCard}
      onShuffle={shuffle}
      onCorrect={handleCorrect}
      onIncorrect={handleIncorrect}
      onBackToLibrary={returnToLibrary}
      onBackToSetDetail={returnToSetDetail}
      getCategoryEmoji={getCategoryEmoji}
      gamificationUI={gamificationUI}
    />
  );
}
