/**
 * Vocabulary Organizer V2
 *
 * Creates evenly-sized, learnable groups (5-10 words per group)
 * instead of tiny, fragmented semantic groups.
 */

import { HebrewVocabWord, VocabGroup, WordType, SEMANTIC_GROUPS } from '../data/types';

/**
 * Target group size for optimal learning
 * Based on cognitive load research (5-9 items per chunk)
 */
const TARGET_GROUP_SIZE = 8;
const MIN_GROUP_SIZE = 5;
const MAX_GROUP_SIZE = 10;

/**
 * Organizes words into evenly-sized, learnable groups
 *
 * Strategy:
 * 1. Group by part of speech (keep Nouns, Verbs, etc. separate)
 * 2. Within each part of speech, create even groups of 5-10 words
 * 3. Prefer semantic clustering where possible, but prioritize even sizing
 *
 * @param words - Array of Hebrew vocabulary words
 * @returns Organized array of VocabGroups with even sizing
 */
export function organizeVocabularyV2(words: HebrewVocabWord[]): VocabGroup[] {
  const groups: VocabGroup[] = [];

  // Step 1: Group by part of speech
  const wordsByType = groupByWordType(words);

  // Step 2: For each part of speech, create evenly-sized groups
  for (const [type, wordsOfType] of Object.entries(wordsByType)) {
    const evenGroups = createEvenGroups(wordsOfType, type as WordType);
    groups.push(...evenGroups);
  }

  return groups;
}

/**
 * Groups words by their part of speech (WordType)
 */
function groupByWordType(words: HebrewVocabWord[]): Record<WordType, HebrewVocabWord[]> {
  const grouped: Partial<Record<WordType, HebrewVocabWord[]>> = {};

  for (const word of words) {
    if (!grouped[word.type]) {
      grouped[word.type] = [];
    }
    grouped[word.type]!.push(word);
  }

  return grouped as Record<WordType, HebrewVocabWord[]>;
}

/**
 * Creates evenly-sized groups from a list of words
 * Attempts to preserve semantic clustering within constraints
 */
function createEvenGroups(words: HebrewVocabWord[], type: WordType): VocabGroup[] {
  if (words.length === 0) return [];

  // Sort by frequency (common words first)
  const sorted = [...words].sort((a, b) => {
    const freqA = a.frequency || 10000;
    const freqB = b.frequency || 10000;
    return freqA - freqB;
  });

  // Calculate optimal number of groups
  const numGroups = Math.max(1, Math.round(sorted.length / TARGET_GROUP_SIZE));
  const groupSize = Math.ceil(sorted.length / numGroups);

  // Create groups
  const groups: VocabGroup[] = [];

  for (let i = 0; i < numGroups; i++) {
    const start = i * groupSize;
    const end = Math.min(start + groupSize, sorted.length);
    const groupWords = sorted.slice(start, end);

    if (groupWords.length === 0) continue;

    // Determine subcategory based on dominant semantic group
    const subcategory = getDominantSemanticGroup(groupWords);

    groups.push({
      category: type,
      subcategory: groupWords.length === 1 ? groupWords[0].semanticGroup : subcategory,
      words: groupWords,
    });
  }

  return groups;
}

/**
 * Finds the most common semantic group in a set of words
 */
function getDominantSemanticGroup(words: HebrewVocabWord[]): string {
  const counts: Record<string, number> = {};

  for (const word of words) {
    const semantic = word.semanticGroup || 'Mixed';
    counts[semantic] = (counts[semantic] || 0) + 1;
  }

  // If all words share the same semantic group, use it
  const uniqueGroups = Object.keys(counts);
  if (uniqueGroups.length === 1) {
    return uniqueGroups[0];
  }

  // If multiple semantic groups, return "Mixed" or the most common one
  const sortedGroups = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [mostCommon, count] = sortedGroups[0];

  // If one semantic group is >50% of words, use it
  if (count / words.length > 0.5) {
    return mostCommon;
  }

  return 'Mixed';
}

/**
 * Suggests how many days to spend on a group based on word count and difficulty
 */
export function suggestStudyDays(group: VocabGroup): number {
  const wordCount = group.words.length;

  // Verbs typically take longer to learn
  if (group.category === 'Verb') {
    if (wordCount <= 5) return 2;
    if (wordCount <= 8) return 3;
    return 4;
  }

  // Nouns are easier, can learn more per day
  if (group.category === 'Noun') {
    if (wordCount <= 7) return 2;
    if (wordCount <= 10) return 3;
    return 4;
  }

  // Other categories (Prepositions, Particles, etc.)
  if (wordCount <= 6) return 2;
  if (wordCount <= 10) return 3;
  return 4;
}

/**
 * Generates a learning summary for a vocab set
 */
export function generateLearningSummary(groups: VocabGroup[]): string {
  let summary = '📚 Vocabulary Organization:\n\n';

  for (const group of groups) {
    const wordCount = group.words.length;
    const subcategory = group.subcategory && group.subcategory !== 'Mixed' ? ` (${group.subcategory})` : '';
    const suggested = suggestStudyDays(group);

    summary += `${getCategoryEmoji(group.category)} ${group.category}${subcategory}: ${wordCount} word${wordCount !== 1 ? 's' : ''} - ${suggested} day${suggested !== 1 ? 's' : ''}\n`;
  }

  const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
  const totalDays = groups.reduce((sum, g) => sum + suggestStudyDays(g), 0);

  summary += `\n📊 Total: ${totalWords} words over ~${totalDays} days`;

  return summary;
}

/**
 * Gets an emoji for each word category
 */
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Noun': '📦',
    'Verb': '⚡',
    'Adjective': '🎨',
    'Preposition': '🔗',
    'Particle': '✨',
    'Number': '🔢',
    'Pronoun': '👤',
    'Adverb': '⏩',
    'Conjunction': '➕',
  };

  return emojiMap[category] || '📝';
}

/**
 * Auto-detects semantic group based on word meaning and notes
 * Useful when adding new words without explicit semantic group
 */
export function detectSemanticGroup(word: HebrewVocabWord): string {
  const english = word.english.toLowerCase();
  const notes = word.notes.toLowerCase();
  const combined = `${english} ${notes}`;

  // Deity & Divine
  if (/\b(god|lord|divine|holy)\b/.test(combined)) {
    return SEMANTIC_GROUPS.DEITY;
  }

  // Nature & Elements
  if (/\b(heaven|earth|water|light|dark|wind|spirit|sea|mountain|tree|fire|air)\b/.test(combined)) {
    return SEMANTIC_GROUPS.NATURE_ELEMENTS;
  }

  // Time & Periods
  if (/\b(day|night|morning|evening|time|year|month|week|beginning|end)\b/.test(combined)) {
    return SEMANTIC_GROUPS.TIME;
  }

  // Places
  if (/\b(place|city|land|country|house|temple|field|desert)\b/.test(combined)) {
    return SEMANTIC_GROUPS.PLACE;
  }

  // People
  if (/\b(man|woman|person|people|son|daughter|king|prophet|priest)\b/.test(combined)) {
    return SEMANTIC_GROUPS.PEOPLE;
  }

  // Body parts
  if (/\b(hand|eye|face|heart|mouth|ear|foot|head|arm)\b/.test(combined)) {
    return SEMANTIC_GROUPS.BODY_PARTS;
  }

  // Verbs - Creation
  if (word.type === 'Verb' && /\b(create|made|make|form|build)\b/.test(combined)) {
    return SEMANTIC_GROUPS.CREATION;
  }

  // Verbs - Movement
  if (word.type === 'Verb' && /\b(go|come|walk|move|rise|fall|enter|exit)\b/.test(combined)) {
    return SEMANTIC_GROUPS.MOVEMENT;
  }

  // Verbs - Speech
  if (word.type === 'Verb' && /\b(say|said|speak|tell|call|name|word)\b/.test(combined)) {
    return SEMANTIC_GROUPS.SPEECH;
  }

  // Verbs - Perception
  if (word.type === 'Verb' && /\b(see|saw|hear|look|listen)\b/.test(combined)) {
    return SEMANTIC_GROUPS.PERCEPTION;
  }

  // Verbs - State of being
  if (word.type === 'Verb' && /\b(be|was|is|become|exist)\b/.test(combined)) {
    return SEMANTIC_GROUPS.STATE_OF_BEING;
  }

  // Spatial relations
  if (word.type === 'Preposition' && /\b(on|in|under|over|between|above|below|beside)\b/.test(combined)) {
    return SEMANTIC_GROUPS.SPATIAL;
  }

  // Quantity
  if (/\b(number|one|two|three|many|few|all|some)\b/.test(combined)) {
    return SEMANTIC_GROUPS.QUANTITY;
  }

  // Quality
  if (word.type === 'Adjective') {
    return SEMANTIC_GROUPS.QUALITY;
  }

  // Logical relations
  if (word.type === 'Particle' || word.type === 'Conjunction') {
    return SEMANTIC_GROUPS.LOGICAL;
  }

  // Default fallback based on word type
  switch (word.type) {
    case 'Noun':
      return SEMANTIC_GROUPS.OBJECTS;
    case 'Verb':
      return SEMANTIC_GROUPS.ACTION;
    default:
      return 'Other';
  }
}

/**
 * Validates that a word has all required fields
 */
export function validateWord(word: Partial<HebrewVocabWord>): word is HebrewVocabWord {
  return !!(
    word.id &&
    word.hebrew &&
    word.trans &&
    word.english &&
    word.type &&
    word.notes !== undefined &&
    word.semanticGroup
  );
}

/**
 * Creates a unique ID for a word based on its Hebrew text
 */
export function generateWordId(hebrew: string, context: string = 'vocab'): string {
  // Remove nikkud and special characters, keep only base letters
  const baseLetters = hebrew.replace(/[\u0591-\u05C7]/g, '');
  // Create slug-like ID
  const slug = baseLetters.split('').slice(0, 5).join('');
  const timestamp = Date.now().toString(36).slice(-4);
  return `${context}-${slug}-${timestamp}`;
}
