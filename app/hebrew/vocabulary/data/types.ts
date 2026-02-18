/**
 * Biblical Hebrew Vocabulary Types
 *
 * This file defines the data structures for organizing and tracking
 * Hebrew vocabulary with spaced repetition metadata.
 */

// Card type for different learning content
export type CardType = 'vocabulary' | 'alphabet' | 'syllable' | 'grammar';

// Set type for categorizing vocab sets
export type SetType = 'vocabulary' | 'alphabet' | 'syllables' | 'grammar' | 'foundational' | 'lesson';

// Extra data stored as JSONB for different card types
export interface AlphabetExtraData {
  pronunciation: string;    // How to pronounce the name (e.g., "AH-lef")
  sound: string;            // The sound it makes (e.g., "(silent)")
}

export interface SyllableExtraData {
  syllables: string;        // Syllable breakdown (e.g., "שָׁ־לוֹם")
  pronunciation: string;    // Full pronunciation (e.g., "sha-LOM")
  syllableType: string;     // Type description (e.g., "Open + closed syllables")
}

export interface GrammarExtraData {
  pronunciation: string;    // Pronunciation (e.g., "ha-")
  grammarType: string;      // Specific type (e.g., "Definite Article (with patach)")
  category: string;         // Category (e.g., "Articles")
  explanation: string;      // Detailed explanation
  examples: string[];       // Usage examples
}

export type ExtraData = AlphabetExtraData | SyllableExtraData | GrammarExtraData | Record<string, unknown>;

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

  // Card type metadata
  cardType?: CardType;      // Type of card (vocabulary, alphabet, etc.)
  extraData?: ExtraData;    // Type-specific extra data

  // Spaced repetition metadata (from Postgres via API)
  level?: number;           // 0=new, 1-6=review stages
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
  setType?: SetType;        // Type of set (vocabulary, alphabet, syllables, grammar)
  isActive?: boolean;       // Whether this set is the active study set
}

// Word group within a vocab set
export interface VocabGroup {
  category: string;         // e.g., "Nouns", "Verbs"
  subcategory?: string;     // e.g., "Nature & Elements", "Creation Actions"
  words: HebrewVocabWord[]; // Words in this group
  suggestedDays?: number;   // Optional: suggested days to spend on this group
}

// User progress tracking (stored in Postgres, fetched via /api/vocab/progress)
export interface UserProgress {
  stats: {
    lastStudied: string;
    totalReviews: number;
    wordsLearned: number;
    wordsMastered: number;
    streak: number;
    xp: number;
    level: number;
    cardsToday: number;
  };
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

// Interactive Lesson Step Types

export type StepType = 'objective' | 'concept' | 'adjective-comparison' | 'scripture' | 'vocabulary' | 'quiz' | 'completion';

export interface ObjectiveStepContent {
  title: string;
  objectives: string[];
  estimatedMinutes: number;
  verseReference?: string;
}

export interface ConceptStepContent {
  conceptName: string;
  summary: string;
  visualAid?: {
    type: 'table' | 'diagram' | 'chart';
    data: any;
  };
  examples: {
    hebrew?: string;
    translation?: string;
    highlight?: string;
    explanation: string;
  }[];
  expandableTheory?: {
    title: string;
    content: string; // Markdown
  };
}

export interface ScriptureStepContent {
  reference: string;
  hebrewText: string;
  englishTranslation: string;
  highlights?: {
    wordIndex: number;
    color: string;
    concept: string;
  }[];
  comprehensionPrompt?: string;
  audioUrl?: string;
}

export interface VocabularyStepContent {
  vocabularySetId: string;
  wordIds: string[];
  contextVerse?: string;
  instructions: string;
}

// Adjective pair for side-by-side comparison
export interface AdjectivePair {
  masculine: {
    hebrew: string;
    transliteration: string;
    pronunciation: string;
  };
  feminine: {
    hebrew: string;
    transliteration: string;
    pronunciation: string;
  };
  english: string;
  notes?: string;
  patternType?: 'regular' | 'irregular'; // regular = adds ה, irregular = stem change
}

export interface AdjectiveComparisonStepContent {
  title: string;
  description: string;
  adjectives: AdjectivePair[];
  patternExplanation: {
    title: string;
    rules: string[];
    exceptions?: string[];
  };
  practiceMode?: 'view' | 'quiz'; // view = just display, quiz = interactive
}

export interface CompletionStepContent {
  celebrationMessage: string;
  xpAwarded: number;
  achievements?: string[];
  nextLessonId?: string;
  reviewPrompt?: string;
  referenceLinks?: {
    title: string;
    url: string;
  }[];
}

export type StepContent =
  | ObjectiveStepContent
  | ConceptStepContent
  | AdjectiveComparisonStepContent
  | ScriptureStepContent
  | VocabularyStepContent
  | CompletionStepContent;

export interface LessonStep {
  id: string;
  lessonId: string;
  stepNumber: number;
  stepType: StepType;
  content: StepContent;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'fill_blank' | 'translation';
  correctAnswer: string;
  options?: string[];
  explanation?: string;
  orderIndex: number;
}

export interface QuizAttempt {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}
