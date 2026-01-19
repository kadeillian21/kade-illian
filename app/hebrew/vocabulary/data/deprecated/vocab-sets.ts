/**
 * Vocabulary Sets Registry
 *
 * This file manages all available vocabulary sets.
 * Each set represents a batch of vocab (e.g., from a specific passage or week).
 */

import { VocabSet } from './types';
import genesis115 from './genesis-1-1-5.json';

// Registry of all available vocab sets
export const VOCAB_SETS: VocabSet[] = [
  genesis115 as VocabSet,
  // Future vocab sets will be added here
];

// Mark which vocab set is currently active (this week's focus)
// This is stored in localStorage, but we provide a default
export const DEFAULT_ACTIVE_SET_ID = 'genesis-1-1-5';

/**
 * Get the currently active vocab set ID from localStorage
 */
export function getActiveSetId(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_ACTIVE_SET_ID;
  }

  const stored = localStorage.getItem('hebrew-active-vocab-set');
  return stored || DEFAULT_ACTIVE_SET_ID;
}

/**
 * Set the active vocab set ID in localStorage
 */
export function setActiveSetId(setId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('hebrew-active-vocab-set', setId);
}

/**
 * Get a specific vocab set by ID
 */
export function getVocabSet(setId: string): VocabSet | undefined {
  return VOCAB_SETS.find(set => set.id === setId);
}

/**
 * Get the currently active vocab set
 */
export function getActiveVocabSet(): VocabSet {
  const activeId = getActiveSetId();
  const set = getVocabSet(activeId);

  if (!set) {
    // Fallback to first set if active set not found
    return VOCAB_SETS[0];
  }

  return set;
}

/**
 * Get all words from all vocab sets (for review mode)
 */
export function getAllWords() {
  return VOCAB_SETS.flatMap(set =>
    set.groups.flatMap(group => group.words)
  );
}
