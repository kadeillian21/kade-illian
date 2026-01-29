/**
 * POST /api/vocab/reorganize
 *
 * Reorganizes all existing vocab sets using the new even grouping algorithm
 * This will update group_category and group_subcategory for all words
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { HebrewVocabWord, VocabGroup } from '../../hebrew/vocabulary/data/types';
import { organizeVocabularyV2 } from '../../../hebrew/vocabulary/utils/organizer-v2';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { setId } = body;

    // Get the set (or all sets if no setId provided)
    const setsQuery = setId
      ? sql`SELECT id FROM vocab_sets WHERE id = ${setId}`
      : sql`SELECT id FROM vocab_sets`;

    const sets = await setsQuery;

    if (sets.length === 0) {
      return NextResponse.json(
        { error: 'No vocab sets found' },
        { status: 404 }
      );
    }

    const reorganizedSets = [];

    // Process each set
    for (const set of sets) {
      // 1. Get all words for this set
      const wordsResult = await sql`
        SELECT
          id,
          hebrew,
          transliteration,
          english,
          type,
          notes,
          semantic_group,
          frequency
        FROM vocab_words
        WHERE set_id = ${set.id}
      `;

      // 2. Convert to HebrewVocabWord format
      const words: HebrewVocabWord[] = wordsResult.map(row => ({
        id: row.id,
        hebrew: row.hebrew,
        trans: row.transliteration,
        english: row.english,
        type: row.type,
        notes: row.notes || '',
        semanticGroup: row.semantic_group || 'Other',
        frequency: row.frequency || undefined,
        level: 0,
        reviewCount: 0,
        correctCount: 0,
      }));

      // 3. Reorganize using new algorithm
      const newGroups = organizeVocabularyV2(words);

      // 4. Update database with new groupings
      let updatedCount = 0;

      for (const group of newGroups) {
        for (const word of group.words) {
          await sql`
            UPDATE vocab_words
            SET
              group_category = ${group.category},
              group_subcategory = ${group.subcategory || null},
              updated_at = NOW()
            WHERE id = ${word.id}
          `;
          updatedCount++;
        }
      }

      reorganizedSets.push({
        setId: set.id,
        wordsUpdated: updatedCount,
        numGroups: newGroups.length,
        groups: newGroups.map(g => ({
          category: g.category,
          subcategory: g.subcategory,
          wordCount: g.words.length,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reorganized ${reorganizedSets.length} vocab set(s)`,
      sets: reorganizedSets,
    });
  } catch (error) {
    console.error('Error reorganizing vocab sets:', error);
    return NextResponse.json(
      { error: 'Failed to reorganize vocab sets', details: String(error) },
      { status: 500 }
    );
  }
}
