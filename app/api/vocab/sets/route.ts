/**
 * GET /api/vocab/sets
 *
 * Returns all vocab sets with metadata and user-specific progress
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    // Ensure card_type columns exist (auto-migration)
    try {
      await sql`ALTER TABLE vocab_words ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'vocabulary'`;
      await sql`ALTER TABLE vocab_words ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb`;
      await sql`ALTER TABLE vocab_sets ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'vocabulary'`;
    } catch {
      // Columns may already exist, continue
    }

    // Get all vocab sets
    const setsResult = await sql`
      SELECT
        id,
        title,
        description,
        total_words,
        is_active,
        set_type,
        created_at,
        updated_at
      FROM vocab_sets
      ORDER BY created_at DESC
    `;

    // Get all words for all sets WITH user-specific progress data
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
        vw.set_id,
        vw.group_category,
        vw.group_subcategory,
        vw.card_type,
        vw.extra_data,
        up.level,
        up.next_review,
        up.last_reviewed,
        up.review_count,
        up.correct_count
      FROM vocab_words vw
      LEFT JOIN user_progress up ON vw.id = up.word_id AND up.user_id = ${user.id}
      ORDER BY vw.set_id, vw.group_category, vw.group_subcategory, vw.frequency DESC
    `;

    // Organize into sets with groups
    const sets = setsResult.map(setRow => {
      // Get words for this set
      const setWords = wordsResult.filter(word => word.set_id === setRow.id);

      // Organize into groups
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
          cardType: string;
          extraData: Record<string, unknown>;
          level: number;
          nextReview: string | null;
          lastReviewed: string | null;
          reviewCount: number;
          correctCount: number;
        }>;
      }>();

      setWords.forEach(row => {
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
          cardType: row.card_type,
          extraData: row.extra_data,
          // Include progress data (will be null/0 for new words)
          level: row.level || 0,
          nextReview: row.next_review || null,
          lastReviewed: row.last_reviewed || null,
          reviewCount: row.review_count || 0,
          correctCount: row.correct_count || 0,
        });
      });

      return {
        id: setRow.id,
        title: setRow.title,
        description: setRow.description,
        dateAdded: setRow.created_at,
        totalWords: setRow.total_words,
        isActive: setRow.is_active,
        setType: setRow.set_type || 'vocabulary',
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
