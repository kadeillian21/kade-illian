/**
 * Statistics Calculation Utilities
 *
 * Helper functions for calculating learning statistics and progress metrics
 */

import { UserProgress, HebrewVocabWord } from '../data/types';

export interface LearningStats {
  totalWords: number;
  wordsLearned: number;     // level >= 1
  wordsMastered: number;    // level >= 5
  newWords: number;         // level 0 or not started
  successRate: number;      // 0-100
  totalReviews: number;
  streak: number;
  lastStudied: string;
  learnedPercentage: number;
  masteredPercentage: number;
  newPercentage: number;
}

/**
 * Calculates overall success rate from word progress entries
 */
function calculateOverallSuccessRate(entries: [string, any][]): number {
  let totalReviews = 0;
  let totalCorrect = 0;

  entries.forEach(([_, progress]) => {
    totalReviews += progress.reviewCount || 0;
    totalCorrect += progress.correctCount || 0;
  });

  return totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
}

/**
 * Calculates comprehensive learning statistics
 *
 * @param progress - User progress data from storage
 * @param allWords - All vocabulary words from all sets
 * @returns Learning statistics object
 */
export function calculateStats(progress: UserProgress, allWords: HebrewVocabWord[]): LearningStats {
  const wordProgressEntries = Object.entries(progress.wordProgress);
  const totalWords = allWords.length;

  const wordsLearned = wordProgressEntries.filter(([_, p]) => p.level >= 1).length;
  const wordsMastered = wordProgressEntries.filter(([_, p]) => p.level >= 5).length;
  const newWords = totalWords - wordProgressEntries.length;

  const successRate = calculateOverallSuccessRate(wordProgressEntries);

  // Calculate percentages
  const learnedPercentage = totalWords > 0 ? Math.round((wordsLearned / totalWords) * 100) : 0;
  const masteredPercentage = totalWords > 0 ? Math.round((wordsMastered / totalWords) * 100) : 0;
  const newPercentage = totalWords > 0 ? Math.round((newWords / totalWords) * 100) : 0;

  return {
    totalWords,
    wordsLearned,
    wordsMastered,
    newWords,
    successRate,
    totalReviews: progress.totalReviews,
    streak: progress.streak,
    lastStudied: progress.lastStudied,
    learnedPercentage,
    masteredPercentage,
    newPercentage,
  };
}

/**
 * Gets words grouped by SRS level
 *
 * @param progress - User progress data
 * @param allWords - All vocabulary words
 * @returns Object with words grouped by level (0-6)
 */
export function getWordsByLevel(progress: UserProgress, allWords: HebrewVocabWord[]): Record<number, HebrewVocabWord[]> {
  const wordsByLevel: Record<number, HebrewVocabWord[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  allWords.forEach(word => {
    const wordProgress = progress.wordProgress[word.id];
    const level = wordProgress?.level ?? 0;
    wordsByLevel[level].push(word);
  });

  return wordsByLevel;
}

/**
 * Gets difficult words (success rate < 50%)
 *
 * @param progress - User progress data
 * @param allWords - All vocabulary words
 * @returns Array of difficult words with their stats
 */
export function getDifficultWords(progress: UserProgress, allWords: HebrewVocabWord[]): Array<HebrewVocabWord & { successRate: number }> {
  const difficultWords: Array<HebrewVocabWord & { successRate: number }> = [];

  allWords.forEach(word => {
    const wordProgress = progress.wordProgress[word.id];
    if (wordProgress && wordProgress.reviewCount > 0) {
      const successRate = Math.round((wordProgress.correctCount / wordProgress.reviewCount) * 100);
      if (successRate < 50) {
        difficultWords.push({
          ...word,
          successRate,
        });
      }
    }
  });

  // Sort by success rate (lowest first)
  return difficultWords.sort((a, b) => a.successRate - b.successRate);
}

/**
 * Gets recently mastered words (reached level 5+ in last 7 days)
 *
 * @param progress - User progress data
 * @param allWords - All vocabulary words
 * @returns Array of recently mastered words
 */
export function getRecentlyMasteredWords(progress: UserProgress, allWords: HebrewVocabWord[]): HebrewVocabWord[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentlyMastered: HebrewVocabWord[] = [];

  allWords.forEach(word => {
    const wordProgress = progress.wordProgress[word.id];
    if (wordProgress && wordProgress.level >= 5) {
      const lastReviewed = new Date(wordProgress.lastReviewed);
      if (lastReviewed >= sevenDaysAgo) {
        recentlyMastered.push(word);
      }
    }
  });

  // Sort by most recently reviewed
  return recentlyMastered.sort((a, b) => {
    const aDate = new Date(progress.wordProgress[a.id].lastReviewed).getTime();
    const bDate = new Date(progress.wordProgress[b.id].lastReviewed).getTime();
    return bDate - aDate;
  });
}

/**
 * Formats a date string to relative time (e.g., "2 days ago", "just now")
 *
 * @param dateString - ISO date string
 * @returns Human-readable relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) !== 1 ? 's' : ''} ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) !== 1 ? 's' : ''} ago`;
}
