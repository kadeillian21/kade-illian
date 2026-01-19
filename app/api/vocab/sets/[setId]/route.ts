/**
 * GET /api/vocab/sets/[setId]
 *
 * Returns a specific vocab set with all words organized into groups
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { setId: string } }
) {
  const sql = getDb();

  try {
    const { setId } = params;

    // 1. Get set metadata
    const setResult = await sql`
      SELECT * FROM vocab_sets WHERE id = ${setId}
    `;

    if (setResult.length === 0) {
      return NextResponse.json(
        { error: 'Vocab set not found' },
        { status: 404 }
      );
    }

    const set = setResult[0];

    // 2. Get all words for this set
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
        group_category,
        group_subcategory
      FROM vocab_words
      WHERE set_id = ${setId}
      ORDER BY group_category, group_subcategory, frequency DESC
    `;

    // 3. Organize words into groups
    const groupsMap = new Map();

    wordsResult.forEach(row => {
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

    const groups = Array.from(groupsMap.values());

    // 4. Return formatted response
    return NextResponse.json({
      id: set.id,
      title: set.title,
      description: set.description,
      dateAdded: set.created_at,
      totalWords: set.total_words,
      groups,
    });
  } catch (error) {
    console.error('Error fetching vocab set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocab set' },
      { status: 500 }
    );
  }
}
