/**
 * Biblical Hebrew Vocabulary Types
 *
 * This file defines the data structures for organizing and tracking
 * Hebrew vocabulary with spaced repetition metadata.
 */

// Core vocabulary word structure
export interface HebrewVocabWord {
  // Basic word data (existing fields)
  hebrew: string;           // Hebrew text with nikkud (vowel points)
  trans: string;            // Transliteration (e.g., "elohim")
  english: string;          // English translation
  type: WordType;           // Part of speech
  notes: string;            // Usage notes, grammar notes, context

  // Organization metadata
  id: string;               // Unique identifier (e.g., "gen1-elohim")
  semanticGroup: string;    // Semantic category (e.g., "deity", "nature-elements")
  frequency?: number;       // Word frequency rank (1 = most common, optional)

  // Spaced repetition metadata (for localStorage tracking)
  level?: number;           // 0=new, 1-5=review stages
  nextReview?: string;      // ISO date string for next review
  lastReviewed?: string;    // ISO date string of last review
  reviewCount?: number;     // Total number of times reviewed
  correctCount?: number;    // Number of correct recalls
}

// Part of speech categories
export type WordType =
  | 'Noun'
  | 'Verb'
  | 'Adjective'
  | 'Preposition'
  | 'Particle'
  | 'Number'
  | 'Pronoun'
  | 'Adverb'
  | 'Conjunction';

// Organized vocabulary set structure
export interface VocabSet {
  id: string;               // Unique set identifier (e.g., "genesis-1-1-5")
  title: string;            // Display title (e.g., "Genesis 1:1-5")
  description: string;      // Brief description
  dateAdded: string;        // ISO date when added
  totalWords: number;       // Total word count
  groups: VocabGroup[];     // Organized word groups
}

// Word group within a vocab set
export interface VocabGroup {
  category: string;         // e.g., "Nouns", "Verbs"
  subcategory?: string;     // e.g., "Nature & Elements", "Creation Actions"
  words: HebrewVocabWord[]; // Words in this group
  suggestedDays?: number;   // Optional: suggested days to spend on this group
}

// User progress tracking (stored in localStorage)
export interface UserProgress {
  lastStudied: string;      // ISO date of last study session
  totalReviews: number;     // Total review sessions completed
  wordsLearned: number;     // Count of words at level 1+
  wordsMastered: number;    // Count of words at level 5
  streak: number;           // Current daily streak
  wordProgress: {
    [wordId: string]: {
      level: number;
      nextReview: string;
      lastReviewed: string;
      reviewCount: number;
      correctCount: number;
    };
  };
}

// Spaced repetition intervals (in days)
export const SRS_INTERVALS = {
  0: 0,    // New word - learn today
  1: 1,    // Review tomorrow
  2: 3,    // Review in 3 days
  3: 7,    // Review in 1 week
  4: 14,   // Review in 2 weeks
  5: 30,   // Review in 1 month
  6: 90    // Mastered - review in 3 months
} as const;

// Semantic group categories for organization
export const SEMANTIC_GROUPS = {
  // Nouns
  DEITY: 'Deity & Divine',
  NATURE_ELEMENTS: 'Nature & Elements',
  TIME: 'Time & Periods',
  PLACE: 'Places & Locations',
  PEOPLE: 'People & Beings',
  ABSTRACT: 'Abstract Concepts',
  BODY_PARTS: 'Body Parts',
  OBJECTS: 'Objects & Things',

  // Verbs
  CREATION: 'Creation & Making',
  MOVEMENT: 'Movement & Motion',
  SPEECH: 'Speech & Communication',
  PERCEPTION: 'Perception (see/hear)',
  STATE_OF_BEING: 'State of Being',
  ACTION: 'Action & Doing',

  // Other
  SPATIAL: 'Spatial Relations',
  QUANTITY: 'Quantity & Number',
  QUALITY: 'Quality & Description',
  LOGICAL: 'Logical Relations'
} as const;
