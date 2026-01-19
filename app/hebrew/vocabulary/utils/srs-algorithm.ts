/**
 * Spaced Repetition System (SRS) Algorithm
 *
 * Implements a simplified spaced repetition algorithm for vocabulary review.
 * Based on the SuperMemo SM-2 algorithm with modifications for simplicity.
 */

import { HebrewVocabWord, SRS_INTERVALS } from '../data/types';

/**
 * Calculates the next review date for a word based on its current level
 * and whether it was recalled correctly
 *
 * @param word - The vocabulary word
 * @param correct - Whether the user recalled it correctly
 * @returns Updated word with new level and next review date
 */
export function calculateNextReview(
  word: HebrewVocabWord,
  correct: boolean
): HebrewVocabWord {
  const currentLevel = word.level || 0;
  const reviewCount = (word.reviewCount || 0) + 1;
  const correctCount = (word.correctCount || 0) + (correct ? 1 : 0);

  let newLevel = currentLevel;

  if (correct) {
    // Move up to next level (max 6)
    newLevel = Math.min(currentLevel + 1, 6);
  } else {
    // Move back one level (min 1, or 0 if it's a new word)
    newLevel = Math.max(currentLevel > 0 ? currentLevel - 1 : 0, 1);
  }

  const intervalDays = SRS_INTERVALS[newLevel as keyof typeof SRS_INTERVALS];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);

  return {
    ...word,
    level: newLevel,
    lastReviewed: new Date().toISOString(),
    nextReview: nextReview.toISOString(),
    reviewCount,
    correctCount,
  };
}

/**
 * Gets all words that are due for review today
 *
 * @param words - All vocabulary words
 * @returns Words that should be reviewed today
 */
export function getDueWords(words: HebrewVocabWord[]): HebrewVocabWord[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  return words.filter((word) => {
    // New words (level 0) are always due
    if (!word.level || word.level === 0) {
      return true;
    }

    // Words without nextReview are due
    if (!word.nextReview) {
      return true;
    }

    // Check if nextReview date has passed
    const reviewDate = new Date(word.nextReview);
    reviewDate.setHours(0, 0, 0, 0);

    return reviewDate <= today;
  });
}

/**
 * Gets words that are brand new (never reviewed)
 *
 * @param words - All vocabulary words
 * @returns New words that haven't been reviewed yet
 */
export function getNewWords(words: HebrewVocabWord[]): HebrewVocabWord[] {
  return words.filter((word) => !word.level || word.level === 0);
}

/**
 * Gets words that are in review (level 1+)
 *
 * @param words - All vocabulary words
 * @returns Words that have been reviewed at least once
 */
export function getReviewWords(words: HebrewVocabWord[]): HebrewVocabWord[] {
  return words.filter((word) => word.level && word.level > 0);
}

/**
 * Gets words that are mastered (level 5+)
 *
 * @param words - All vocabulary words
 * @returns Mastered words
 */
export function getMasteredWords(words: HebrewVocabWord[]): HebrewVocabWord[] {
  return words.filter((word) => word.level && word.level >= 5);
}

/**
 * Calculates success rate for a word
 *
 * @param word - The vocabulary word
 * @returns Success rate as a percentage (0-100)
 */
export function calculateSuccessRate(word: HebrewVocabWord): number {
  if (!word.reviewCount || word.reviewCount === 0) {
    return 0;
  }

  const correctCount = word.correctCount || 0;
  return Math.round((correctCount / word.reviewCount) * 100);
}

/**
 * Creates a daily study session with new + review words
 *
 * @param words - All available words
 * @param maxNew - Maximum new words per session (default: 5)
 * @param maxReview - Maximum review words per session (default: 10)
 * @returns Array of words for today's session
 */
export function createStudySession(
  words: HebrewVocabWord[],
  maxNew: number = 5,
  maxReview: number = 10
): HebrewVocabWord[] {
  const dueReviewWords = getDueWords(getReviewWords(words));
  const newWords = getNewWords(words);

  // Take up to maxNew new words
  const sessionNew = newWords.slice(0, maxNew);

  // Take up to maxReview due review words
  const sessionReview = dueReviewWords.slice(0, maxReview);

  // Combine and shuffle
  const session = [...sessionNew, ...sessionReview];
  return shuffleArray(session);
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
