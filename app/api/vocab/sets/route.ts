/**
 * GET /api/vocab/sets
 *
 * Returns all vocab sets with metadata
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();

  try {
    // Get all vocab sets
    const setsResult = await sql`
      SELECT
        id,
        title,
        description,
        total_words,
        is_active,
        created_at,
        updated_at
      FROM vocab_sets
      ORDER BY created_at DESC
    `;

    // Get all words for all sets
    const wordsResult = await sql`
      SELECT
        id,
        hebrew,
        transliteration,
        english,
        type,
        notes,
        semantic_group,
        frequency,
        set_id,
        group_category,
        group_subcategory
      FROM vocab_words
      ORDER BY set_id, group_category, group_subcategory, frequency DESC
    `;

    // Organize into sets with groups
    const sets = setsResult.map(setRow => {
      // Get words for this set
      const setWords = wordsResult.filter(word => word.set_id === setRow.id);

      // Organize into groups
      const groupsMap = new Map();
      setWords.forEach(row => {
        const key = `${row.group_category}|${row.group_subcategory || ''}`;

        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            category: row.group_category,
            subcategory: row.group_subcategory || null,
            words: [],
          });
        }

        groupsMap.get(key).words.push({
          id: row.id,
          hebrew: row.hebrew,
          trans: row.transliteration,
          english: row.english,
          type: row.type,
          notes: row.notes,
          semanticGroup: row.semantic_group,
          frequency: row.frequency,
        });
      });

      return {
        id: setRow.id,
        title: setRow.title,
        description: setRow.description,
        dateAdded: setRow.created_at,
        totalWords: setRow.total_words,
        isActive: setRow.is_active,
        groups: Array.from(groupsMap.values()),
      };
    });

    return NextResponse.json(sets);
  } catch (error) {
    console.error('Error fetching vocab sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocab sets' },
      { status: 500 }
    );
  }
}
