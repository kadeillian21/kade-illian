/**
 * Vocabulary Organizer
 *
 * This utility helps organize raw Hebrew vocabulary dumps into logical,
 * learnable groups based on cognitive science principles.
 */

import { HebrewVocabWord, VocabGroup, WordType, SEMANTIC_GROUPS } from '../data/types';

/**
 * Organizes a flat list of Hebrew words into logical learning groups
 *
 * Organization strategy:
 * 1. Group by part of speech (Nouns, Verbs, etc.)
 * 2. Within each part of speech, group by semantic field
 * 3. Order by frequency (common words first)
 *
 * @param words - Array of Hebrew vocabulary words
 * @returns Organized array of VocabGroups
 */
export function organizeVocabulary(words: HebrewVocabWord[]): VocabGroup[] {
  const groups: VocabGroup[] = [];

  // Step 1: Group by part of speech
  const wordsByType = groupByWordType(words);

  // Step 2: Process each part of speech
  for (const [type, wordsOfType] of Object.entries(wordsByType)) {
    const semanticGroups = groupBySemanticField(wordsOfType, type as WordType);
    groups.push(...semanticGroups);
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
 * Groups words by semantic field within their part of speech
 */
function groupBySemanticField(words: HebrewVocabWord[], type: WordType): VocabGroup[] {
  // Group by semantic field
  const semanticMap: Record<string, HebrewVocabWord[]> = {};

  for (const word of words) {
    const semantic = word.semanticGroup || 'Other';
    if (!semanticMap[semantic]) {
      semanticMap[semantic] = [];
    }
    semanticMap[semantic].push(word);
  }

  // Convert to VocabGroup array
  const groups: VocabGroup[] = [];

  for (const [semantic, semanticWords] of Object.entries(semanticMap)) {
    // Sort by frequency (lower = more common)
    const sorted = semanticWords.sort((a, b) => {
      const freqA = a.frequency || 10000;
      const freqB = b.frequency || 10000;
      return freqA - freqB;
    });

    groups.push({
      category: type,
      subcategory: semantic,
      words: sorted,
    });
  }

  return groups;
}

/**
 * Suggests how many days to spend on a group based on word count and difficulty
 */
export function suggestStudyDays(group: VocabGroup): number {
  const wordCount = group.words.length;

  // Verbs typically take longer to learn
  if (group.category === 'Verb') {
    if (wordCount <= 3) return 1;
    if (wordCount <= 6) return 2;
    return 3;
  }

  // Nouns are easier, can learn more per day
  if (group.category === 'Noun') {
    if (wordCount <= 5) return 1;
    if (wordCount <= 10) return 2;
    return 3;
  }

  // Other categories (Prepositions, Particles, etc.)
  if (wordCount <= 5) return 1;
  if (wordCount <= 10) return 2;
  return 3;
}

/**
 * Generates a learning summary for a vocab set
 */
export function generateLearningSummary(groups: VocabGroup[]): string {
  let summary = '📚 Vocabulary Organization:\n\n';

  for (const group of groups) {
    const wordCount = group.words.length;
    const subcategory = group.subcategory ? ` - ${group.subcategory}` : '';
    const suggested = suggestStudyDays(group);

    summary += `${getCategoryEmoji(group.category)} ${group.category}${subcategory}: ${wordCount} word${wordCount !== 1 ? 's' : ''} (suggested: ${suggested} day${suggested !== 1 ? 's' : ''})\n`;
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
