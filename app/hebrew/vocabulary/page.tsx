"use client";

// NOTE: Hebrew words should be selectable/copyable so users can look them up
// Avoid using bg-clip-text on Hebrew text as it clips diacritical marks (nikkud)

import { useState, useCallback } from 'react';
import { VocabSet, VocabGroup } from './data/types';
import { useVocabData } from './hooks/useVocabData';
import { useFlashcardSession } from './hooks/useFlashcardSession';
import VocabLibraryView from './components/VocabLibraryView';
import VocabSetDetailView from './components/VocabSetDetailView';
import FlashcardStudyView from './components/FlashcardStudyView';
import ProgressDashboard from './components/ProgressDashboard';
import LevelUpModal from './components/LevelUpModal';
import AchievementToast from './components/AchievementToast';
import Confetti from './components/Confetti';

type ViewMode = 'library' | 'set-detail' | 'flashcards' | 'review' | 'dashboard';
type FlashcardMode = 'hebrew-to-english' | 'english-to-hebrew';

export default function VocabularyPage() {
  return <VocabularyPageContent />;
}

function VocabularyPageContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<VocabGroup | null>(null);
  const [flashcardMode, setFlashcardMode] = useState<FlashcardMode>('hebrew-to-english');

  const {
    vocabSets,
    progress,
    setProgress,
    isLoading,
    error,
    getSetStats,
    activeSets,
    allWords,
    dueWordsFromActiveSets,
    toggleSetActive,
    fetchFullSet,
  } = useVocabData();

  const session = useFlashcardSession({ setProgress });

  // Navigation handlers
  const returnToLibrary = useCallback(() => {
    setViewMode('library');
    setSelectedSet(null);
    setSelectedGroup(null);
  }, []);

  const returnToSetDetail = useCallback(() => {
    setViewMode('set-detail');
    setSelectedGroup(null);
  }, []);

  const viewSetDetail = useCallback(async (set: VocabSet) => {
    const fullSet = await fetchFullSet(set.id);
    setSelectedSet(fullSet || set);
    setViewMode('set-detail');
  }, [fetchFullSet]);

  const startStudying = useCallback((group: VocabGroup, mode: FlashcardMode) => {
    setSelectedGroup(group);
    setFlashcardMode(mode);
    session.initCards(group.words);
    session.startSession(selectedSet?.id || null);
    setViewMode('flashcards');
  }, [session, selectedSet]);

  const studyFullSet = useCallback((mode: FlashcardMode) => {
    if (!selectedSet) return;
    setSelectedGroup(null);
    setFlashcardMode(mode);
    const allWords = selectedSet.groups.flatMap(g => g.words);
    session.initCards(allWords);
    session.startSession(selectedSet.id);
    setViewMode('flashcards');
  }, [session, selectedSet]);

  const startReviewMode = useCallback(() => {
    session.initCards(dueWordsFromActiveSets);
    session.startSession(null);
    setFlashcardMode('hebrew-to-english');
    setViewMode('review');
  }, [session, dueWordsFromActiveSets]);

  // Gamification UI (rendered above everything)
  const gamificationUI = (
    <>
      {session.showLevelUp && (
        <LevelUpModal
          level={session.newLevel}
          onClose={() => session.setShowLevelUp(false)}
        />
      )}
      {session.achievements.map((achievement, index) => (
        <AchievementToast
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => session.dismissAchievement(index)}
        />
      ))}
      <Confetti
        active={session.showConfetti}
        onComplete={() => session.setShowConfetti(false)}
      />
    </>
  );

  // VIEW: Dashboard
  if (viewMode === 'dashboard' && progress) {
    return (
      <>
        {gamificationUI}
        <ProgressDashboard
          progress={progress}
          allWords={allWords}
          onStartStudy={returnToLibrary}
        />
      </>
    );
  }

  // VIEW: Library
  if (viewMode === 'library') {
    return (
      <>
        {gamificationUI}
        <VocabLibraryView
          vocabSets={vocabSets}
          isLoading={isLoading}
          error={error}
          totalDueWords={dueWordsFromActiveSets.length}
          activeSetsCount={activeSets.length}
          getSetStats={getSetStats}
          onViewDashboard={() => setViewMode('dashboard')}
          onViewSetDetail={viewSetDetail}
          onToggleActive={toggleSetActive}
          onStartReview={startReviewMode}
        />
      </>
    );
  }

  // VIEW: Set Detail
  if (viewMode === 'set-detail' && selectedSet) {
    return (
      <>
        {gamificationUI}
        <VocabSetDetailView
          selectedSet={selectedSet}
          onBackToLibrary={returnToLibrary}
          onStartStudying={startStudying}
          onStudyFullSet={studyFullSet}
        />
      </>
    );
  }

  // VIEW: Flashcards or Review
  const isReviewMode = viewMode === 'review';
  const backAction = isReviewMode ? returnToLibrary : returnToSetDetail;

  return (
    <>
      {gamificationUI}
      <FlashcardStudyView
        cards={session.cards}
        currentIndex={session.currentIndex}
        currentCard={session.currentCard}
        isFlipped={session.isFlipped}
        isReviewMode={isReviewMode}
        flashcardMode={flashcardMode}
        selectedGroup={selectedGroup}
        selectedSet={selectedSet}
        showCorrectFeedback={session.showCorrectFeedback}
        showIncorrectFeedback={session.showIncorrectFeedback}
        onFlip={session.flipCard}
        onNext={session.nextCard}
        onPrevious={session.previousCard}
        onShuffle={session.shuffle}
        onCorrect={() => session.handleCardResult(true)}
        onIncorrect={() => session.handleCardResult(false)}
        onBack={backAction}
      />
    </>
  );
}
