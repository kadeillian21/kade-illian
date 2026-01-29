/**
 * GET /api/vocab/sets/[setId]
 *
 * Returns a specific vocab set with all words organized into groups
 * and user-specific progress
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  // Check authentication
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const { setId } = await params;

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

    // 2. Get all words for this set WITH user-specific progress data
    const wordsResult = await sql`
      SELECT
        vw.id,
        vw.hebrew,
        vw.transliteration,
        vw.english,
        vw.type,
        vw.notes,
        vw.semantic_group,
        vw.frequency,
        vw.group_category,
        vw.group_subcategory,
        up.level,
        up.next_review,
        up.last_reviewed,
        up.review_count,
        up.correct_count
      FROM vocab_words vw
      LEFT JOIN user_progress up ON vw.id = up.word_id AND up.user_id = ${user.id}
      WHERE vw.set_id = ${setId}
      ORDER BY vw.group_category, vw.group_subcategory, vw.frequency DESC
    `;

    // 3. Organize words into groups
    const groupsMap = new Map<string, {
      category: string;
      subcategory: string | null;
      words: Array<{
        id: string;
        hebrew: string;
        trans: string;
        english: string;
        type: string;
        notes: string | null;
        semanticGroup: string | null;
        frequency: number | null;
        level: number;
        nextReview: string | null;
        lastReviewed: string | null;
        reviewCount: number;
        correctCount: number;
      }>;
    }>();

    wordsResult.forEach(row => {
      const key = `${row.group_category}|${row.group_subcategory || ''}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          category: row.group_category,
          subcategory: row.group_subcategory || null,
          words: [],
        });
      }

      groupsMap.get(key)!.words.push({
        id: row.id,
        hebrew: row.hebrew,
        trans: row.transliteration,
        english: row.english,
        type: row.type,
        notes: row.notes,
        semanticGroup: row.semantic_group,
        frequency: row.frequency,
        // Include progress data (will be null/0 for new words)
        level: row.level || 0,
        nextReview: row.next_review || null,
        lastReviewed: row.last_reviewed || null,
        reviewCount: row.review_count || 0,
        correctCount: row.correct_count || 0,
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
